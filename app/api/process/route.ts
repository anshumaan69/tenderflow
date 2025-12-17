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

// Data & Logic Imports
import { PRODUCTS } from "@/lib/data/products";
import { PRODUCT_PRICING, SERVICE_PRICING, SERVICE_KEYWORDS } from "@/lib/data/pricing";
import { getEmbedding, cosineSimilarity } from "@/lib/embeddings";

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

    // --- STEP 1: FAST TEXTRACT (INPUT PROCESSING) ---
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(inputPdfPath, buffer);

    console.log(`[${processId}] Converting PDF to images...`);
    await execAsync(`convert -density 150 "${inputPdfPath}" -quality 90 -scene 1 "${outputPattern}"`);

    const files = await readdir(tempDir);
    const pageFiles = files
        .filter(f => f.startsWith(`output-${processId}-`) && f.endsWith(".png"))
        .sort((a, b) => {
            const numA = parseInt(a.match(/-(\d+)\.png$/)?.[1] || "0");
            const numB = parseInt(b.match(/-(\d+)\.png$/)?.[1] || "0");
            return numA - numB;
        });

    if (pageFiles.length === 0) throw new Error("PDF conversion failed.");
    console.log(`[${processId}] Processing ${pageFiles.length} pages...`);

    const pagePromises = pageFiles.map(async (filename) => {
        const filePath = join(tempDir, filename);
        const imageBuffer = await readFile(filePath);
        const command = new DetectDocumentTextCommand({ Document: { Bytes: imageBuffer } });
        const response = await textract.send(command);
        await unlink(filePath).catch(() => {});
        return response.Blocks?.filter(b => b.BlockType === "LINE").map(b => b.Text).join("\n") || "";
    });

    const pageTexts = await Promise.all(pagePromises);
    const fullText = pageTexts.join("\n\n");
    await unlink(inputPdfPath).catch(() => {});

    console.log(`[${processId}] Text Extracted (${fullText.length} chars).`);

    // --- STEP 2: TECHNICAL AGENT (EXTRACTION) ---
    // Extract raw requirements first
    const modelId = "amazon.titan-text-express-v1";
    const prompt = `User: Extract the procurement items from this RFP.
      Instructions:
      1. List every item requested.
      2. For each, extract the Name, Quantity, and Key Technical Specs (Voltage, Material, Type).
      3. Output JSON only.

      Structure:
      {
        "company": "string",
        "requirements": [
          { "name": "string", "quantity": number, "specs": "string" }
        ]
      }

      Content: "${fullText.substring(0, 15000)}"
      Bot: {`;

    const payload = {
      inputText: prompt,
      textGenerationConfig: { maxTokenCount: 2000, stopSequences: ["User:"], temperature: 0, topP: 1 },
    };

    const bedrockRes = await bedrock.send(new InvokeModelCommand({
        contentType: "application/json", body: JSON.stringify(payload), modelId
    }));

    let rawJson = JSON.parse(new TextDecoder().decode(bedrockRes.body)).results[0].outputText;
    rawJson = "{" + rawJson; // Pre-fill fix
    const extractedData = JSON.parse(rawJson.substring(rawJson.indexOf("{"), rawJson.lastIndexOf("}") + 1));


    // --- STEP 3: TECHNICAL AGENT (MATCHING) ---
    // Match extracted requirements against our Inventory (RAG)
    console.log(`[${processId}] Matching products...`);

    // Pre-calculate/Cache inventory embeddings
    const inventoryEmbeddings = await Promise.all(PRODUCTS.map((p) => getEmbedding(`${p.name} ${p.description} ${JSON.stringify(p.specs)}`)));

    const matchedItems = await Promise.all(extractedData.requirements.map(async (req: any, index: number) => {
        const reqString = `${req.name} ${req.specs}`;
        const reqVector = await getEmbedding(reqString);

        // Find best match
        let bestMatch = null;
        let maxScore = -1;

        for (let i = 0; i < PRODUCTS.length; i++) {
            const score = cosineSimilarity(reqVector, inventoryEmbeddings[i]);
            if (score > maxScore) {
                maxScore = score;
                bestMatch = PRODUCTS[i];
            }
        }

        // --- STEP 4: PRICING AGENT (COSTING) ---
        let unitPrice = 0;
        let notes = "No match found";
        let status = "mismatch";

        if (bestMatch && maxScore > 0.6) { // Threshold
             unitPrice = PRODUCT_PRICING[bestMatch.id] || 0;
             notes = `Matched: ${bestMatch.name} (${bestMatch.id})`;
             status = maxScore > 0.85 ? "match" : "partial";
        }

        return {
            id: bestMatch?.id || `REQ-${index}`,
            name: req.name, // Keep original requested name for display
            matchedName: bestMatch?.name,
            quantity: req.quantity,
            unitPrice: unitPrice,
            total: req.quantity * unitPrice,
            status: status,
            confidence: Math.round(maxScore * 100),
            notes: notes
        };
    }));


    // --- STEP 5: PRICING AGENT (SERVICES) ---
    // Check if RFP mentions specific tests
    const serviceItems = [];
    const lowerText = fullText.toLowerCase();

    for (const [serviceId, kws] of Object.entries(SERVICE_KEYWORDS)) {
        const keywords = kws as string[];
        if (keywords.some(k => lowerText.includes(k))) {
            serviceItems.push({
                id: serviceId,
                name: `Service: ${serviceId}`,
                quantity: 1, // Usually 1 lot
                unitPrice: SERVICE_PRICING[serviceId],
                total: SERVICE_PRICING[serviceId],
                status: "match",
                confidence: 100,
                notes: "Requirement identified in RFP terms"
            });
        }
    }

    return NextResponse.json({
      industry: extractedData.company || "Unknown",
      items: [...matchedItems, ...serviceItems]
    });

  } catch (error: any) {
    console.error("Processing Error:", error);
    try { await unlink(inputPdfPath).catch(() => {}); } catch {}

    return NextResponse.json({
      industry: "Processing Failed",
      items: [{ id: "err", name: error.message, quantity: 0, unitPrice: 0, total: 0, status: "failed", confidence: 0, notes: "" }]
    });
  }
}
