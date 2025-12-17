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
    const prompt = `User: Extract the procurement items and testing requirements from this RFP.
      Instructions:
      1. List every item requested in "requirements".
      2. For each item, extract the Name, Quantity, and a dictionary of Specs (Voltage, Material, Core, Insulation, Rating).
      3. Extract specific testing/acceptance requirements (e.g., "Type Test", "Factory Acceptance Test") into "testing_requirements".
      4. Output JSON only.

      Structure:
      {
        "company": "string",
        "requirements": [
          { 
            "name": "string", 
            "quantity": number, 
            "specs": { "voltage": "val", "material": "val", "core": "val", "insulation": "val" } 
          }
        ],
        "testing_requirements": ["test_name_1", "test_name_2"]
      }

      Content: "${fullText.substring(0, 15000)}"
      Bot: {`;

    const payload = {
      inputText: prompt,
      textGenerationConfig: { maxTokenCount: 3000, stopSequences: ["User:"], temperature: 0, topP: 1 },
    };

    const bedrockRes = await bedrock.send(new InvokeModelCommand({
        contentType: "application/json", body: JSON.stringify(payload), modelId
    }));

    let rawJson = JSON.parse(new TextDecoder().decode(bedrockRes.body)).results[0].outputText;
    rawJson = "{" + rawJson; // Pre-fill fix
    const extractedData = JSON.parse(rawJson.substring(rawJson.indexOf("{"), rawJson.lastIndexOf("}") + 1));


    // --- STEP 3: TECHNICAL AGENT (MATCHING) ---
    // Match extracted requirements against our Inventory (Deterministic)
    console.log(`[${processId}] Matching products via Spec Match Metric...`);

    const matchedItems = await Promise.all(extractedData.requirements.map(async (req: any, index: number) => {
        
        // Calculate Spec Match % for ALL products
        const scoredProducts = PRODUCTS.map(p => {
             let matchCount = 0;
             let totalParams = 0;
             const reqSpecs = req.specs || {};
             
             // Compare key attributes
             const keysToCheck = ["voltage", "material", "core", "insulation", "rating"];
             keysToCheck.forEach(key => {
                 if (reqSpecs[key] && p.specs && (p.specs as any)[key]) {
                     totalParams++;
                     // Loose matching (case-insensitive string match)
                     if (p.specs[key as keyof typeof p.specs]?.toString().toLowerCase().includes(reqSpecs[key].toString().toLowerCase())) {
                         matchCount++;
                     }
                 }
             });
             
             // Base Match: Name similarity (Cosine) fallback if no specs
             // For strict Hackathon rule: "all required specs have equal weightage" -> (Match / Total) * 100
             let specScore = totalParams > 0 ? (matchCount / totalParams) * 100 : 0;
             
             return { product: p, score: specScore };
        });

        // Top 3 Recommendations
        const top3 = scoredProducts
             .sort((a, b) => b.score - a.score)
             .slice(0, 3);

        const bestMatch = top3[0];

        // --- STEP 4: PRICING AGENT (COSTING) ---
        let materialPrice = 0;
        let notes = "No suitable match found";
        let status = "mismatch";

        if (bestMatch && bestMatch.score > 40) { // Threshold
             materialPrice = PRODUCT_PRICING[bestMatch.product.id] || 0;
             notes = `Best Match: ${bestMatch.product.name} (${bestMatch.score.toFixed(0)}% Spec Match)`;
             status = bestMatch.score === 100 ? "match" : "partial";
        }

        return {
            id: bestMatch?.product.id || `REQ-${index}`,
            name: req.name, 
            matchedName: bestMatch?.product.name,
            quantity: req.quantity,
            unitPrice: materialPrice,
            total: req.quantity * materialPrice,
            status: status,
            confidence: Math.round(bestMatch?.score || 0),
            notes: notes,
            top3: top3.map(t => ({ // Pass Top 3 for UI Comparison
                id: t.product.id,
                name: t.product.name,
                score: Math.round(t.score),
                specs: t.product.specs
            })),
            reqSpecs: req.specs // Pass extracted specs for UI Comparison
        };
    }));


    // --- STEP 5: PRICING AGENT (SERVICES) ---
    // Calculate Service Costs based on extracted "testing_requirements"
    const serviceItems = [];
    const requestedTests = (extractedData.testing_requirements || []).map((t: string) => t.toLowerCase());

    for (const [serviceId, kws] of Object.entries(SERVICE_KEYWORDS)) {
        // Check if ANY keyword matches ANY requested test string
        const isRequired = kws.some(k => requestedTests.some((rt: string) => rt.includes(k)));
        
        if (isRequired) {
            serviceItems.push({
                id: serviceId,
                name: `Service: ${serviceId.replace("TEST-", "").replace("INSP-", "")}`,
                quantity: 1, 
                unitPrice: SERVICE_PRICING[serviceId],
                total: SERVICE_PRICING[serviceId],
                status: "match",
                confidence: 100,
                notes: "Mandatory per RFP Section 3"
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
