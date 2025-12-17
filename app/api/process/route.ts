import { NextResponse } from "next/server";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { 
  TextractClient, 
  DetectDocumentTextCommand
} from "@aws-sdk/client-textract";
import { writeFile, unlink, readdir } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";

const execAsync = promisify(exec);

// Initialize AWS Clients
const region = process.env.AWS_REGION || "us-east-1";

const bedrock = new BedrockRuntimeClient({ region });
const textract = new TextractClient({ region });

export async function POST(req: Request) {
  const processId = randomUUID();
  const tempDir = tmpdir();
  const inputPdfPath = join(tempDir, `input-${processId}.pdf`);
  const outputPattern = join(tempDir, `output-${processId}-%d.png`);
  
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Write PDF to temp file
    await writeFile(inputPdfPath, buffer);

    console.log(`[${processId}] Converting PDF to images...`);
    // Convert PDF to high-quality PNGs (150 DPI is usually good enough for OCR)
    // IMv7 uses 'magick', older uses 'convert'. We'll try 'convert' as verified.
    // -scene 1 makes numbering start at 1
    await execAsync(`convert -density 150 "${inputPdfPath}" -quality 90 -scene 1 "${outputPattern}"`);
    
    // Find generated images
    const files = await readdir(tempDir);
    const pageFiles = files
        .filter(f => f.startsWith(`output-${processId}-`) && f.endsWith(".png"))
        .sort((a, b) => {
            // Sort by page number to keep text in order
            const numA = parseInt(a.match(/-(\d+)\.png$/)?.[1] || "0");
            const numB = parseInt(b.match(/-(\d+)\.png$/)?.[1] || "0");
            return numA - numB;
        });

    if (pageFiles.length === 0) {
        throw new Error("PDF conversion failed: No images generated.");
    }
    
    console.log(`[${processId}] Processing ${pageFiles.length} pages in parallel...`);

    // Process all pages in parallel using Sync Textract
    const pagePromises = pageFiles.map(async (filename) => {
        const filePath = join(tempDir, filename);
        const imageBuffer = await readFile(filePath);
        
        const command = new DetectDocumentTextCommand({
            Document: { Bytes: imageBuffer }
        });
        
        const response = await textract.send(command);
        
        // Cleanup image immediately
        await unlink(filePath).catch(() => {});
        
        return response.Blocks
            ?.filter(b => b.BlockType === "LINE")
            .map(b => b.Text)
            .join("\n") || "";
    });

    const pageTexts = await Promise.all(pagePromises);
    const fullText = pageTexts.join("\n\n--- Page Break ---\n\n");
    
    console.log(`[${processId}] Extraction complete (${fullText.length} chars).`);

    // Cleanup input PDF
    await unlink(inputPdfPath).catch(() => {});

    // Bedrock logic (Reuse)
    const modelId = "anthropic.claude-3-haiku-20240307-v1:0";

    const prompt = `
      You are an expert procurement agent. Extract line items from the provided RFP content.
      Return ONLY valid JSON with this structure:
      {
        "industry": "string (Infer from content, e.g., Construction, IT, Medical)",
        "items": [
          {
            "id": "string (unique)",
            "name": "string",
            "quantity": number,
            "unitPrice": number (Estimate matching market rates if unknown, or 0),
            "total": number (quantity * unitPrice),
            "status": "match" | "partial" | "mismatch" (Infer availability based on common items),
            "confidence": number (0-100),
            "notes": "string"
          }
        ]
      }
      
      RFP Content:
      "${fullText.substring(0, 20000)}" 
    `;

    const payload = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 3000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
    };

    const bedrockCommand = new InvokeModelCommand({
      contentType: "application/json",
      body: JSON.stringify(payload),
      modelId,
    });

    const response = await bedrock.send(bedrockCommand);
    const decodedBody = new TextDecoder().decode(response.body);
    const parsedBody = JSON.parse(decodedBody);
    const content = parsedBody.content?.[0]?.text;
    
    const jsonStart = content.indexOf("{");
    const jsonEnd = content.lastIndexOf("}") + 1;
    if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error("Bedrock response did not contain valid JSON.");
    }
    const jsonString = content.substring(jsonStart, jsonEnd);
    
    return NextResponse.json(JSON.parse(jsonString));

  } catch (error: any) {
    console.error("Processing Error:", error);
    
    // Attempt cleanup on error
    try {
        await unlink(inputPdfPath).catch(() => {});
        // Cleanup potential images? 
        // A bit complex to find them all securely, OS temp cleaner will handle eventually
        // or we could track created files. For MVP, input file cleanup is key.
    } catch {}

    return NextResponse.json({
      industry: "Processing Failed",
      items: [
        {
          id: "err-1",
          name: "Error processing document",
          quantity: 0,
          unitPrice: 0,
          total: 0,
          status: "failed",
          confidence: 0,
          notes: error.message || "Unknown error occurred.",
        },
      ],
    });
  }
}
