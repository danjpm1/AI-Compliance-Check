import { Router, type IRouter } from "express";
import OpenAI from "openai";
import {
  ClassifyAiSystemBody,
  ClassifyAiSystemResponse,
  ExplainClassificationBody,
  ExplainClassificationResponse,
  GetDemoAssessmentParams,
  GetDemoAssessmentResponse,
} from "@workspace/api-zod";
import { classifySystem } from "../lib/classifier.js";
import { generatePdf } from "../lib/pdf-generator.js";
import { getDemoResult } from "../lib/demo-data.js";

if (!process.env.OPENAI_API_KEY) {
  console.warn("WARNING: OPENAI_API_KEY is not set. AI explanations will not work.");
}

const openaiClient = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const router: IRouter = Router();

const explainRateLimit = new Map<string, number>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 5;

router.post("/assessment/classify", async (req, res): Promise<void> => {
  const parsed = ClassifyAiSystemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { systemName, organizationName, systemDescription, ...classificationInput } = parsed.data;

  const classificationResult = classifySystem(classificationInput);

  const result = {
    systemName,
    organizationName,
    systemDescription,
    ...classificationResult,
  };

  res.json(ClassifyAiSystemResponse.parse(result));
});

router.post("/assessment/explain", async (req, res): Promise<void> => {
  try {
    const clientIp = req.ip || "unknown";
    const now = Date.now();
    const windowStart = now - RATE_LIMIT_WINDOW_MS;
    for (const [key, timestamp] of explainRateLimit) {
      if (timestamp < windowStart) explainRateLimit.delete(key);
    }
    const requestCount = Array.from(explainRateLimit.entries()).filter(([key]) => key.startsWith(clientIp)).length;
    if (requestCount >= MAX_REQUESTS_PER_WINDOW) {
      res.status(429).json({ error: "Too many requests. Please try again later." });
      return;
    }
    explainRateLimit.set(`${clientIp}-${now}`, now);

    const parsed = ExplainClassificationBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const { systemName, systemDescription, riskLevel, primaryFunction, sector } = parsed.data;

    if (!openaiClient) {
      res.status(503).json({ error: "AI explanation service is not configured." });
      return;
    }

    const completion = await openaiClient.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 2048,
      messages: [
        {
          role: "system",
          content: `You are an expert in EU AI regulation, specifically the EU Artificial Intelligence Act (Regulation 2024/1689). Provide clear, professional analysis of AI system classifications. Be specific about which articles and annexes apply. Write in a professional but accessible tone suitable for compliance officers and product managers.`,
        },
        {
          role: "user",
          content: `Analyze the following AI system's classification under the EU AI Act:

System Name: ${systemName}
Description: ${systemDescription}
Primary Function: ${primaryFunction}
Sector: ${sector}
Risk Classification: ${riskLevel}

Please provide:
1. A brief explanation of why this system received this risk classification
2. The key regulatory requirements that apply
3. Practical next steps for achieving compliance
4. Any potential areas of concern or ambiguity in the classification

Keep the response focused and actionable, approximately 300-400 words.`,
        },
      ],
    });

    const explanation = completion.choices[0]?.message?.content || "Unable to generate explanation at this time.";

    res.json(ExplainClassificationResponse.parse({ explanation }));
  } catch (error) {
    console.error("Explain endpoint error:", error);
    res.status(500).json({ error: "Failed to generate AI explanation. Please try again." });
  }
});

router.post("/assessment/pdf", async (req, res): Promise<void> => {
  try {
    const { result, explanation } = req.body;

    if (!result) {
      res.status(400).json({ error: "Result data is required" });
      return;
    }

    const pdfBuffer = await generatePdf(result, explanation);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="eu-ai-act-report-${result.systemName?.replace(/\s+/g, "-").toLowerCase() || "report"}.pdf"`,
    );
    res.send(pdfBuffer);
  } catch (error) {
    console.error("PDF generation error:", error);
    res.status(500).json({ error: "Failed to generate PDF report." });
  }
});

router.get("/assessment/demo/:demoType", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.demoType) ? req.params.demoType[0] : req.params.demoType;
  const paramsResult = GetDemoAssessmentParams.safeParse({ demoType: raw });
  if (!paramsResult.success) {
    res.status(400).json({ error: paramsResult.error.message });
    return;
  }

  const result = getDemoResult(paramsResult.data.demoType);
  if (!result) {
    res.status(404).json({ error: "Demo not found" });
    return;
  }

  res.json(GetDemoAssessmentResponse.parse(result));
});

export default router;
