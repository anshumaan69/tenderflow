import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const region = process.env.AWS_REGION || "us-east-1";
const bedrock = new BedrockRuntimeClient({ region });

// Cache embeddings in memory to save API calls during hackathon
const embeddingCache = new Map<string, number[]>();

export async function getEmbedding(text: string): Promise<number[]> {
  const cleanText = text.trim().toLowerCase();
  
  if (embeddingCache.has(cleanText)) {
    return embeddingCache.get(cleanText)!;
  }

  try {
    const response = await bedrock.send(
      new InvokeModelCommand({
        modelId: "amazon.titan-embed-text-v1",
        contentType: "application/json",
        body: JSON.stringify({
          inputText: cleanText,
        }),
      })
    );

    const decoded = new TextDecoder().decode(response.body);
    const json = JSON.parse(decoded);
    const vector = json.embedding;

    embeddingCache.set(cleanText, vector);
    return vector;
  } catch (error) {
    console.error("Embedding Error:", error);
    // Return zero vector if fails, so app doesn't crash
    return new Array(1536).fill(0); 
  }
}

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magA * magB);
}
