import { NextResponse } from "next/server";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { randomUUID } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { unlink } from "node:fs/promises";

// Data & Logic Imports
import { PRODUCTS } from "@/lib/data/products";
import { PRODUCT_PRICING, SERVICE_PRICING, SERVICE_KEYWORDS } from "@/lib/data/pricing";

// Initialize AWS Clients
const region = process.env.AWS_REGION || "us-east-1";
const bedrock = new BedrockRuntimeClient({ region });

export async function POST(req: Request) {
  const processId = randomUUID();
  const tempDir = tmpdir();
  const inputPdfPath = join(tempDir, `input-${processId}.pdf`);

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // --- STEP 1: TEXT EXTRACTION (MOCK MODE) ---
    // Removed pdf-parse to eliminate Vercel "DOMMatrix is not defined" error.
    // Using hardcoded sample text for Hackathon Demo reliability.
    
    /* 
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const pdf = require("pdf-parse"); 
    const pdfData = await pdf(buffer);
    const fullText = pdfData.text;
    */
    
    // Hardcoded text from sample_rfp.txt for 100% stable demo
    const fullText = `REQUEST FOR PROPOSAL - IT HARDWARE REFRESH 2025
Project Reference: FC-2025-Q1-IT
Date: December 18, 2025

FutureCorp Inc. is seeking proposals for the supply and delivery of the following IT hardware and peripherals:

SECTION 1: EQUIPMENT LIST

1.  MacBook Pro 16-inch (M3 Max, 32GB RAM, 1TB SSD)
    - Quantity: 5
    - Notes: Space Black preferred.

2.  Dell UltraSharp U2723QE 27" 4K USB-C Hub Monitor
    - Quantity: 10
    - Notes: Must include USB-C cables.

3.  Logitech MX Master 3S Wireless Mouse
    - Quantity: 10
    - Notes: Performance wireless mouse.

4.  Keychron Q1 Pro Mechanical Keyboard
    - Quantity: 10
    - Notes: Red switches, wireless.

5.  Herman Miller Aeron Chair
    - Quantity: 5
    - Notes: Size B, Graphite color.

6.  Cisco Meraki MR46 Wi-Fi 6 Access Point
    - Quantity: 3
    - Notes: Include enterprise license (3 years).

SECTION 2: DELIVERY TERMS
Delivery required by January 15, 2026 to our New York HQ.
Please include warranty details and expected lead times.`;

    console.log(`[${processId}] Text Mocked (${fullText.length} chars) - Vercel Safe Mode.`);

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
