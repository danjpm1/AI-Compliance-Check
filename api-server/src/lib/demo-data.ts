import { classifySystem } from "./classifier.js";

const DEMOS: Record<
  string,
  {
    systemName: string;
    organizationName: string;
    systemDescription: string;
    primaryFunction: string;
    sector: string;
    dataTypes: string[];
    autonomyLevel: "fully-autonomous" | "semi-autonomous" | "human-in-the-loop" | "advisory-only";
    targetUsers: "general-public" | "specific-professionals" | "internal-employees" | "government-authorities";
    decisionImpact: "critical-life-safety" | "significant-rights" | "moderate-economic" | "limited-convenience";
  }
> = {
  "hr-screening": {
    systemName: "SmartRecruit Pro",
    organizationName: "Acme Corp",
    systemDescription:
      "An AI-powered recruitment tool that automatically screens job applications, analyzes resumes using NLP, ranks candidates based on qualification matching, and provides shortlisting recommendations to HR teams.",
    primaryFunction: "cv-screening",
    sector: "employment",
    dataTypes: ["personal-identifiers", "professional", "behavioral"],
    autonomyLevel: "semi-autonomous",
    targetUsers: "internal-employees",
    decisionImpact: "significant-rights",
  },
  "customer-chatbot": {
    systemName: "HelpBot AI",
    organizationName: "ServiceNow Inc",
    systemDescription:
      "A customer-facing conversational AI chatbot that handles support queries, provides product information, processes basic requests, and escalates complex issues to human agents.",
    primaryFunction: "chatbot",
    sector: "customer-service",
    dataTypes: ["personal-identifiers", "transactional"],
    autonomyLevel: "semi-autonomous",
    targetUsers: "general-public",
    decisionImpact: "limited-convenience",
  },
  "spam-filter": {
    systemName: "CleanInbox",
    organizationName: "MailGuard Ltd",
    systemDescription:
      "An AI email filtering system that classifies incoming emails as spam or legitimate using machine learning, automatically routing suspected spam to a separate folder for user review.",
    primaryFunction: "spam-detection",
    sector: "technology",
    dataTypes: ["communication-metadata"],
    autonomyLevel: "fully-autonomous",
    targetUsers: "general-public",
    decisionImpact: "limited-convenience",
  },
};

export function getDemoResult(demoType: string) {
  const demo = DEMOS[demoType];
  if (!demo) return null;

  const classificationResult = classifySystem({
    primaryFunction: demo.primaryFunction,
    sector: demo.sector,
    dataTypes: demo.dataTypes,
    autonomyLevel: demo.autonomyLevel,
    targetUsers: demo.targetUsers,
    decisionImpact: demo.decisionImpact,
  });

  return {
    systemName: demo.systemName,
    organizationName: demo.organizationName,
    systemDescription: demo.systemDescription,
    ...classificationResult,
  };
}
