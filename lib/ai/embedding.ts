import { embed, embedMany } from "ai"
import { fireworks } from "@ai-sdk/fireworks"
import { db } from "../db"
import { cosineDistance, desc, gt, sql } from "drizzle-orm"
import { embeddings } from "../db/schema/embeddings"

const embeddingModel = fireworks.textEmbeddingModel("nomic-ai/nomic-embed-text-v1.5")

const generateChunks = (input: string): string[] => {
  return input
    .trim()
    .split(".")
    .filter((i) => i !== "")
}

export const generateEmbeddings = async (
  value: string
): Promise<Array<{ embedding: number[]; content: string }>> => {
  console.log("generating embeddings")
  const chunks = generateChunks(value)
  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: chunks,
  })
  console.log("embeddings generated", embeddings)
  return embeddings.map((e, i) => ({ content: chunks[i], embedding: e }))
}

export const generateEmbedding = async (value: string): Promise<number[]> => {
  console.log("generating embedding")
  const input = value.replaceAll("\\n", " ")
  const { embedding } = await embed({
    model: embeddingModel,
    value: input,
  })
  console.log("embedding generated")
  return embedding
}

export const findRelevantContent = async (userQuery: string) => {
  try {
    console.log("finding relevant content")
    const userQueryEmbedded = await generateEmbedding(userQuery)
    const similarity = sql<number>`1 - (${cosineDistance(
      embeddings.embedding,
      userQueryEmbedded
    )})`
    const similarGuides = await db
      .select({ name: embeddings.content, similarity })
      .from(embeddings)
      .where(gt(similarity, 0.5))
      .orderBy((t) => desc(t.similarity))
      .limit(4)
    return similarGuides
  } catch (error) {
    console.error("Cannot find relevant content", error)
    return "Sorry, I don't know."
  }
}
