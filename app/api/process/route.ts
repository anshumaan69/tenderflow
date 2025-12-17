import { NextResponse } from "next/server";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { TextractClient, DetectDocumentTextCommand } from "@aws-sdk/client-textract";

const bedrock = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const textract = new TextractClient({
  region: process.env.AWS_REGION || "us-east-1",
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Extract Text using AWS Textract
    // Basic "DetectDocumentText" is cheaper and faster for simple text extraction.
    const textractCommand = new DetectDocumentTextCommand({
      Document: {
        Bytes: buffer,
      },
    });

    const textractResponse = await textract.send(textractCommand);
    
    // Concatenate all LINE blocks to get the full text
    const extractedText = textractResponse.Blocks
      ?.filter((block) => block.BlockType === "LINE")
      .map((block) => block.Text)
      .join("\n");

    if (!extractedText) {
      throw new Error("Textract failed to extract text from the document.");
    }

    // 2. Process with Bedrock (Claude 3 Haiku)
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
      "${extractedText.substring(0, 15000)}" 
    `;

    const payload = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 2000,
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
    const jsonString = content.substring(jsonStart, jsonEnd);
    
    const resultData = JSON.parse(jsonString);

    return NextResponse.json(resultData);

  } catch (error) {
    console.error("Processing Error:", error);
    
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
          notes: "Ensure AWS Textract is enabled on your account.",
        },
      ],
    });
  }
}
