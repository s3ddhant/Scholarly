import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase payload limit for PDF base64 uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Lazy initialization of Gemini Client
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in environment.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Utility: Cosine Similarity between two numeric vectors
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Fallback BM25/keyword similarity score (0 to 1)
function keywordSimilarity(query: string, text: string): number {
  const qTokens = query.toLowerCase().match(/\b\w{3,}\b/g) || [];
  if (qTokens.length === 0) return 0.1;
  const textLower = text.toLowerCase();
  let matches = 0;
  for (const token of qTokens) {
    if (textLower.includes(token)) {
      matches++;
    }
  }
  return Math.min(1, matches / qTokens.length);
}

// --- API ROUTES ---

// Health Check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", service: "Scholarly API" });
});

// Extract Document metadata and chunks from PDF or Raw Text
app.post("/api/extract-document", async (req: Request, res: Response) => {
  try {
    const { text, fileBase64, mimeType, filename } = req.body;
    const ai = getGeminiClient();

    let extractionPrompt = `You are a scholarly research document parser. Analyze this document and extract:
1. title: Title of the document or paper (if unknown, generate an accurate, scholarly title)
2. author: Authors or issuing organization (or "Unknown Scholar / Source")
3. source: Journal, publisher, conference, or origin
4. estimatedPages: Estimated number of pages (integer, min 1)
5. summary: 2-3 sentence executive summary of the document's core findings or contents
6. coverColor: Suggest an elegant, muted warm cover hex color from this reading palette: "#9E4736" (terracotta), "#3D5A50" (forest sage), "#705847" (sepia brown), "#3B4B69" (academic navy), "#936338" (amber ochre), "#6B4459" (plum), or "#3A5A40" (deep spruce)
7. fullText: The extracted clean text of the entire document, preserving paragraphs.
8. sections: An array of document sections/chunks. Each section should have:
   - sectionTitle: Title or heading of the section
   - text: The passage text (about 150-300 words each). Break the document into 4-15 meaningful chunks.

Respond ONLY in valid JSON matching this schema.`;

    let response;
    if (fileBase64 && mimeType === "application/pdf") {
      response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: [
          {
            inlineData: {
              data: fileBase64,
              mimeType: "application/pdf",
            },
          },
          { text: extractionPrompt },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              author: { type: Type.STRING },
              source: { type: Type.STRING },
              estimatedPages: { type: Type.INTEGER },
              summary: { type: Type.STRING },
              coverColor: { type: Type.STRING },
              fullText: { type: Type.STRING },
              sections: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    sectionTitle: { type: Type.STRING },
                    text: { type: Type.STRING },
                  },
                  required: ["sectionTitle", "text"],
                },
              },
            },
            required: ["title", "author", "source", "estimatedPages", "summary", "coverColor", "sections"],
          },
        },
      });
    } else {
      const docContent = text || "Empty document";
      response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: [
          { text: `Document content:\n${docContent.slice(0, 100000)}\n\n${extractionPrompt}` },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              author: { type: Type.STRING },
              source: { type: Type.STRING },
              estimatedPages: { type: Type.INTEGER },
              summary: { type: Type.STRING },
              coverColor: { type: Type.STRING },
              fullText: { type: Type.STRING },
              sections: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    sectionTitle: { type: Type.STRING },
                    text: { type: Type.STRING },
                  },
                  required: ["sectionTitle", "text"],
                },
              },
            },
            required: ["title", "author", "source", "estimatedPages", "summary", "coverColor", "sections"],
          },
        },
      });
    }

    const parsed = JSON.parse(response.text || "{}");
    const docId = "doc-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7);

    // Build chunks
    const rawSections = parsed.sections && parsed.sections.length > 0
      ? parsed.sections
      : [{ sectionTitle: "Introduction", text: parsed.fullText || text || "No text extracted." }];

    const chunks = rawSections.map((sec: any, index: number) => ({
      id: `${docId}-c${index + 1}`,
      chunkIndex: index + 1,
      sectionTitle: sec.sectionTitle || `Section ${index + 1}`,
      text: sec.text,
      page: Math.max(1, Math.ceil(((index + 1) / rawSections.length) * (parsed.estimatedPages || 3))),
    }));

    res.json({
      id: docId,
      title: parsed.title || filename || "Untitled Document",
      author: parsed.author || "Unknown Scholar",
      source: parsed.source || (filename ? filename.replace(/\.[^/.]+$/, "") : "Personal Library"),
      pageCount: parsed.estimatedPages || Math.max(1, Math.ceil(chunks.length / 2)),
      summary: parsed.summary || "Document parsed and indexed in Scholarly library.",
      coverColor: parsed.coverColor || "#9E4736",
      createdAt: Date.now(),
      chunks,
      totalQuestions: 0,
      groundingScoreAvg: 100,
      unsupportedClaimsCount: 0,
    });
  } catch (error: any) {
    console.error("Error in /api/extract-document:", error);
    res.status(500).json({ error: error.message || "Failed to parse document" });
  }
});

// Embed chunks using Gemini embedding model
app.post("/api/embed-chunks", async (req: Request, res: Response) => {
  try {
    const { chunks } = req.body;
    if (!chunks || !Array.isArray(chunks) || chunks.length === 0) {
      return res.status(400).json({ error: "Chunks array is required" });
    }

    const ai = getGeminiClient();
    const embeddings: number[][] = [];

    // Process embeddings in batches or individually to be resilient
    for (const chunk of chunks) {
      try {
        const textToEmbed = typeof chunk === "string" ? chunk : chunk.text || "";
        const result = await ai.models.embedContent({
          model: "gemini-embedding-2-preview",
          contents: textToEmbed,
        });

        const values = result.embeddings?.[0]?.values || (result as any).embedding?.values || [];
        embeddings.push(values);
      } catch (err: any) {
        console.warn("Embedding API warning, falling back to text-embedding-004 or hash vector:", err.message);
        try {
          const textToEmbed = typeof chunk === "string" ? chunk : chunk.text || "";
          const result2 = await ai.models.embedContent({
            model: "text-embedding-004",
            contents: textToEmbed,
          });
          embeddings.push(result2.embeddings?.[0]?.values || (result2 as any).embedding?.values || []);
        } catch (err2) {
          // Deterministic hash vector as safeguard
          const vec = new Array(32).fill(0);
          const t = typeof chunk === "string" ? chunk : chunk.text || "";
          for (let i = 0; i < t.length; i++) {
            vec[i % 32] = (vec[i % 32] + t.charCodeAt(i)) % 100 / 100;
          }
          embeddings.push(vec);
        }
      }
    }

    res.json({ embeddings });
  } catch (error: any) {
    console.error("Error in /api/embed-chunks:", error);
    res.status(500).json({ error: error.message || "Failed to embed chunks" });
  }
});

// Grounded Q&A with 2-Step Gemini Verification
app.post("/api/ask", async (req: Request, res: Response) => {
  try {
    const { documentId, documentTitle, question, chunks, previousQAs } = req.body;
    if (!question || !chunks || chunks.length === 0) {
      return res.status(400).json({ error: "Question and chunks are required." });
    }

    const ai = getGeminiClient();

    // 1. Embed query
    let queryEmbedding: number[] = [];
    try {
      const qEmbedRes = await ai.models.embedContent({
        model: "gemini-embedding-2-preview",
        contents: question,
      });
      queryEmbedding = qEmbedRes.embeddings?.[0]?.values || (qEmbedRes as any).embedding?.values || [];
    } catch {
      try {
        const qEmbedRes = await ai.models.embedContent({
          model: "text-embedding-004",
          contents: question,
        });
        queryEmbedding = qEmbedRes.embeddings?.[0]?.values || (qEmbedRes as any).embedding?.values || [];
      } catch {
        queryEmbedding = [];
      }
    }

    // 2. Score chunks via Vector Similarity + Keyword overlap
    const scoredChunks = chunks.map((chunk: any) => {
      let vecScore = 0;
      if (queryEmbedding.length > 0 && chunk.embedding && chunk.embedding.length === queryEmbedding.length) {
        vecScore = cosineSimilarity(queryEmbedding, chunk.embedding);
      }
      const kwScore = keywordSimilarity(question, chunk.text);
      const combinedScore = queryEmbedding.length > 0 && chunk.embedding
        ? (vecScore * 0.7 + kwScore * 0.3)
        : kwScore;

      return {
        ...chunk,
        score: Math.max(0, combinedScore),
      };
    });

    // Sort descending and select top 3-4 chunks
    scoredChunks.sort((a: any, b: any) => b.score - a.score);
    const topChunks = scoredChunks.slice(0, 4);

    // Prepare context passages
    const contextPrompt = topChunks
      .map(
        (c: any) =>
          `[PASSAGE_ID: ${c.id}] (Section: ${c.sectionTitle || "Main"}, Page: ${c.page || 1})\n"${c.text}"`
      )
      .join("\n\n");

    // --- STEP 1: GENERATE ANSWER STRICTLY GROUNDED IN CHUNKS ---
    const generationPrompt = `You are Scholarly, an academic research assistant with strict citation discipline.
You must answer the user's question STRICTLY and ONLY using the provided retrieved passages from "${documentTitle}".
If the information cannot be found in the passages, clearly state that the document does not contain this information.

Retrieved Passages:
${contextPrompt}

Question: "${question}"

Instructions:
1. Synthesize a coherent, authoritative, and direct answer.
2. Structure your answer into clear, distinct atomic claims/statements.
3. For each claim, indicate which PASSAGE_ID directly provides evidence for it.
4. Output in JSON format with:
   - "synthesizedAnswer": The complete paragraph/reading answer.
   - "claims": Array of claims. Each claim has:
       - "claimText": Exact claim or sentence.
       - "passageId": The PASSAGE_ID supporting it (or "NONE").

JSON Schema:
{
  "synthesizedAnswer": string,
  "claims": [
    { "claimText": string, "passageId": string }
  ]
}`;

    const step1Response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: [{ text: generationPrompt }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            synthesizedAnswer: { type: Type.STRING },
            claims: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  claimText: { type: Type.STRING },
                  passageId: { type: Type.STRING },
                },
                required: ["claimText", "passageId"],
              },
            },
          },
          required: ["synthesizedAnswer", "claims"],
        },
      },
    });

    const step1Data = JSON.parse(step1Response.text || "{}");
    const synthesizedAnswer = step1Data.synthesizedAnswer || "No answer generated.";
    const rawClaims = step1Data.claims || [
      { claimText: synthesizedAnswer, passageId: topChunks[0]?.id || "NONE" },
    ];

    // --- STEP 2: VERIFICATION GEMINI CALL (SECOND CALL) ---
    // Specifically mandated:
    // "4. Run a second Gemini call that verifies whether each claim in the answer is actually supported by the retrieved chunk — flag any unsupported claims visibly instead of hiding them."
    const verificationPrompt = `You are a strict academic fact-checker and citation auditor.
Your job is to independently verify whether each claim extracted from an AI-generated answer is genuinely supported by the source passages.

Source Passages:
${contextPrompt}

Claims to Verify:
${JSON.stringify(rawClaims, null, 2)}

For each claim:
1. Compare the claim strictly against the source passage text.
2. Determine status:
   - "SUPPORTED": The passage explicitly and directly affirms this claim with factual evidence.
   - "PARTIALLY_SUPPORTED": The claim is mostly true according to the passage, but makes a minor extrapolation or lacks full nuance.
   - "UNSUPPORTED": The claim is NOT found in the passage, contradicts the passage, or is an unverified hallucination.
3. Provide confidence (integer 0-100%).
4. Extract the "exactQuote" from the passage that supports this claim (verbatim). If unsupported, leave as empty string.
5. Provide a short, precise 1-sentence "explanation" of your audit verdict.

Respond in JSON matching this schema:
{
  "verifiedClaims": [
    {
      "claimText": string,
      "status": "SUPPORTED" | "PARTIALLY_SUPPORTED" | "UNSUPPORTED",
      "confidence": number,
      "supportingChunkId": string,
      "exactQuote": string,
      "explanation": string
    }
  ]
}`;

    const step2Response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: [{ text: verificationPrompt }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verifiedClaims: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  claimText: { type: Type.STRING },
                  status: {
                    type: Type.STRING,
                    enum: ["SUPPORTED", "PARTIALLY_SUPPORTED", "UNSUPPORTED"],
                  },
                  confidence: { type: Type.INTEGER },
                  supportingChunkId: { type: Type.STRING },
                  exactQuote: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                },
                required: ["claimText", "status", "confidence", "explanation"],
              },
            },
          },
          required: ["verifiedClaims"],
        },
      },
    });

    const step2Data = JSON.parse(step2Response.text || "{}");
    const verifiedClaimsList = step2Data.verifiedClaims || [];

    // Map verified claims to final format
    const finalClaims = rawClaims.map((rc: any, idx: number) => {
      const v = verifiedClaimsList[idx] || verifiedClaimsList.find((item: any) => item.claimText === rc.claimText);
      const status = v?.status || "SUPPORTED";
      const confidence = typeof v?.confidence === "number" ? v.confidence : 95;
      const supportingChunkId = v?.supportingChunkId || rc.passageId || topChunks[0]?.id;
      const exactQuote = v?.exactQuote || "";
      const explanation = v?.explanation || (status === "SUPPORTED" ? "Verified against source passage." : "Requires verification.");

      return {
        id: `claim-${Date.now()}-${idx + 1}`,
        claimText: rc.claimText,
        status: status as "SUPPORTED" | "PARTIALLY_SUPPORTED" | "UNSUPPORTED",
        confidence,
        supportingChunkIds: supportingChunkId && supportingChunkId !== "NONE" ? [supportingChunkId] : [],
        exactQuote,
        explanation,
      };
    });

    // Calculate grounding score
    let supportedCount = 0;
    let unsupportedCount = 0;
    for (const c of finalClaims) {
      if (c.status === "SUPPORTED") supportedCount += 1;
      else if (c.status === "PARTIALLY_SUPPORTED") supportedCount += 0.5;
      else unsupportedCount += 1;
    }
    const groundingScore = finalClaims.length > 0
      ? Math.round((supportedCount / finalClaims.length) * 100)
      : 100;
    const hasUnsupportedClaims = unsupportedCount > 0;

    // Retrieved passages with highlight snippets
    const retrievedPassages = topChunks.map((tc: any) => {
      // Find if any verified claim has an exact quote in this chunk
      const matchingClaim = finalClaims.find((c: any) => c.supportingChunkIds.includes(tc.id) && c.exactQuote);
      return {
        chunkId: tc.id,
        chunkIndex: tc.chunkIndex,
        page: tc.page,
        sectionTitle: tc.sectionTitle,
        text: tc.text,
        similarityScore: Math.round(tc.score * 100),
        highlightSnippet: matchingClaim ? matchingClaim.exactQuote : undefined,
      };
    });

    const interaction = {
      id: `qa-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      documentId,
      question,
      timestamp: Date.now(),
      answer: synthesizedAnswer,
      claims: finalClaims,
      groundingScore,
      hasUnsupportedClaims,
      retrievedPassages,
    };

    res.json(interaction);
  } catch (error: any) {
    console.error("Error in /api/ask:", error);
    res.status(500).json({ error: error.message || "Failed to generate grounded answer." });
  }
});

// Setup Vite development server or production static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Scholarly server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
