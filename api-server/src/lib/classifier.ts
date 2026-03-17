interface ClassificationInput {
  primaryFunction: string;
  sector: string;
  dataTypes: string[];
  autonomyLevel: string;
  targetUsers: string;
  decisionImpact: string;
}

interface ClassificationOutput {
  riskLevel: "unacceptable" | "high-risk" | "limited" | "minimal";
  riskScore: number;
  classification: {
    title: string;
    description: string;
    reasoning: string;
  };
  obligations: Array<{
    id: string;
    title: string;
    description: string;
    priority: "critical" | "high" | "medium" | "low";
    articleRef: string;
  }>;
  checklist: Array<{
    id: string;
    category: string;
    requirement: string;
    description: string;
    articleRef: string;
    completed: boolean;
  }>;
  keyArticles: Array<{
    article: string;
    title: string;
    relevance: string;
  }>;
  summary: string;
}

const UNACCEPTABLE_FUNCTIONS = [
  "social-scoring",
  "real-time-biometric-public",
  "subliminal-manipulation",
  "exploitation-vulnerable",
  "predictive-policing-individual",
  "emotion-recognition-workplace-education",
  "untargeted-facial-scraping",
];

const HIGH_RISK_FUNCTIONS = [
  "biometric-identification",
  "biometric-categorization",
  "cv-screening",
  "job-application-filtering",
  "employee-evaluation",
  "employee-monitoring",
  "credit-scoring",
  "insurance-risk",
  "critical-infrastructure-management",
  "critical-infrastructure-safety",
  "educational-assessment",
  "student-admission",
  "law-enforcement-risk",
  "evidence-analysis",
  "border-control",
  "migration-assessment",
  "judicial-research",
  "judicial-sentencing",
  "medical-diagnosis",
  "surgical-assistance",
  "patient-triage",
  "government-benefit-allocation",
  "election-administration",
  "emergency-dispatch",
];

const LIMITED_RISK_FUNCTIONS = [
  "chatbot",
  "virtual-assistant",
  "content-generation-text",
  "content-generation-image",
  "content-generation-video",
  "content-generation-audio",
  "deepfake-detection",
  "emotion-recognition-other",
  "sentiment-analysis",
];

function calculateRiskScore(input: ClassificationInput): number {
  let score = 0;

  if (UNACCEPTABLE_FUNCTIONS.includes(input.primaryFunction)) return 100;
  if (HIGH_RISK_FUNCTIONS.includes(input.primaryFunction)) score += 60;
  else if (LIMITED_RISK_FUNCTIONS.includes(input.primaryFunction)) score += 30;
  else score += 10;

  const highRiskSectors = [
    "law-enforcement",
    "justice",
    "healthcare",
    "critical-infrastructure",
    "education",
    "employment",
    "government",
  ];
  if (highRiskSectors.includes(input.sector)) score += 15;

  const sensitiveData = [
    "biometric",
    "health",
    "criminal-records",
    "children",
    "genetic",
    "political-opinions",
    "religious-beliefs",
  ];
  const sensitiveCount = input.dataTypes.filter((d) =>
    sensitiveData.includes(d),
  ).length;
  score += sensitiveCount * 5;

  if (input.autonomyLevel === "fully-autonomous") score += 10;
  else if (input.autonomyLevel === "semi-autonomous") score += 5;

  if (input.targetUsers === "general-public") score += 5;
  else if (input.targetUsers === "government-authorities") score += 5;

  if (input.decisionImpact === "critical-life-safety") score += 15;
  else if (input.decisionImpact === "significant-rights") score += 10;
  else if (input.decisionImpact === "moderate-economic") score += 5;

  return Math.min(score, 100);
}

const ANNEX_III_KEYWORDS = [
  "credit", "loan", "insurance",
  "recruitment", "hiring", "cv", "resume", "employee",
  "medical", "diagnosis",
  "biometric", "facial", "emotion",
  "education", "exam", "student", "grading",
  "law_enforcement", "police", "crime",
  "border", "immigration", "asylum",
  "judicial", "legal", "sentencing",
];

function isAnnexIIIMatch(primaryFunction: string): boolean {
  if (HIGH_RISK_FUNCTIONS.includes(primaryFunction)) return true;
  const normalized = primaryFunction.toLowerCase().replace(/-/g, "_");
  return ANNEX_III_KEYWORDS.some((kw) => normalized.includes(kw));
}

function getRiskLevel(
  score: number,
  primaryFunction: string,
): "unacceptable" | "high-risk" | "limited" | "minimal" {
  if (UNACCEPTABLE_FUNCTIONS.includes(primaryFunction)) return "unacceptable";
  if (isAnnexIIIMatch(primaryFunction)) return "high-risk";
  if (score >= 65) return "high-risk";
  if (score >= 30) return "limited";
  return "minimal";
}

const OBLIGATIONS_DB: Record<
  string,
  Array<{
    id: string;
    title: string;
    description: string;
    priority: "critical" | "high" | "medium" | "low";
    articleRef: string;
  }>
> = {
  unacceptable: [
    {
      id: "u1",
      title: "Immediate Prohibition",
      description:
        "This AI system falls under prohibited practices and cannot be placed on the EU market or used within the EU.",
      priority: "critical",
      articleRef: "Article 5",
    },
    {
      id: "u2",
      title: "Cease Operations",
      description:
        "All deployment and development of this system for EU use must cease immediately.",
      priority: "critical",
      articleRef: "Article 5",
    },
  ],
  "high-risk": [
    {
      id: "h1",
      title: "Risk Management System",
      description:
        "Establish, implement, document and maintain a risk management system throughout the AI system's lifecycle.",
      priority: "critical",
      articleRef: "Article 9",
    },
    {
      id: "h2",
      title: "Data Governance",
      description:
        "Training, validation and testing datasets must meet quality criteria including representativeness, accuracy, and completeness.",
      priority: "critical",
      articleRef: "Article 10",
    },
    {
      id: "h3",
      title: "Technical Documentation",
      description:
        "Prepare comprehensive technical documentation demonstrating compliance before the system is placed on the market.",
      priority: "high",
      articleRef: "Article 11",
    },
    {
      id: "h4",
      title: "Record-Keeping / Logging",
      description:
        "Implement automatic logging capabilities to ensure traceability of the AI system's functioning.",
      priority: "high",
      articleRef: "Article 12",
    },
    {
      id: "h5",
      title: "Transparency & User Information",
      description:
        "Provide clear and adequate information to deployers about the system's capabilities, limitations, and intended purpose.",
      priority: "high",
      articleRef: "Article 13",
    },
    {
      id: "h6",
      title: "Human Oversight",
      description:
        "Design the system to enable effective oversight by natural persons during use.",
      priority: "critical",
      articleRef: "Article 14",
    },
    {
      id: "h7",
      title: "Accuracy, Robustness & Cybersecurity",
      description:
        "Ensure appropriate levels of accuracy, robustness and cybersecurity throughout the system's lifecycle.",
      priority: "high",
      articleRef: "Article 15",
    },
    {
      id: "h8",
      title: "Conformity Assessment",
      description:
        "Undergo the appropriate conformity assessment procedure before placing the system on the market.",
      priority: "critical",
      articleRef: "Article 43",
    },
    {
      id: "h9",
      title: "EU Declaration of Conformity",
      description:
        "Draw up and keep an EU declaration of conformity for the AI system.",
      priority: "high",
      articleRef: "Article 47",
    },
    {
      id: "h10",
      title: "CE Marking",
      description:
        "Affix the CE marking to the AI system to indicate conformity.",
      priority: "medium",
      articleRef: "Article 48",
    },
    {
      id: "h11",
      title: "Registration",
      description:
        "Register the high-risk AI system in the EU database before placing it on the market.",
      priority: "high",
      articleRef: "Article 49",
    },
    {
      id: "h12",
      title: "Post-Market Monitoring",
      description:
        "Establish a post-market monitoring system proportionate to the nature and risks of the AI system.",
      priority: "medium",
      articleRef: "Article 72",
    },
  ],
  limited: [
    {
      id: "l1",
      title: "Transparency Obligations",
      description:
        "Ensure that persons interacting with the AI system are informed that they are interacting with AI, unless obvious from the context.",
      priority: "high",
      articleRef: "Article 50(1)",
    },
    {
      id: "l2",
      title: "Content Marking",
      description:
        "AI-generated content (text, audio, image, video) must be marked as artificially generated or manipulated in a machine-readable format.",
      priority: "medium",
      articleRef: "Article 50(2)",
    },
    {
      id: "l3",
      title: "Deepfake Disclosure",
      description:
        "When generating deep fake content, disclose that the content has been artificially generated or manipulated.",
      priority: "high",
      articleRef: "Article 50(4)",
    },
  ],
  minimal: [
    {
      id: "m1",
      title: "Voluntary Codes of Conduct",
      description:
        "While not legally required, consider adopting voluntary codes of conduct for responsible AI practices.",
      priority: "low",
      articleRef: "Article 95",
    },
    {
      id: "m2",
      title: "AI Literacy",
      description:
        "Promote AI literacy among staff and users in accordance with the general obligations.",
      priority: "low",
      articleRef: "Article 4",
    },
  ],
};

function getChecklist(
  riskLevel: string,
): Array<{
  id: string;
  category: string;
  requirement: string;
  description: string;
  articleRef: string;
  completed: boolean;
}> {
  const checklists: Record<
    string,
    Array<{
      id: string;
      category: string;
      requirement: string;
      description: string;
      articleRef: string;
      completed: boolean;
    }>
  > = {
    "high-risk": [
      {
        id: "c1",
        category: "Risk Management",
        requirement: "Establish risk management system",
        description:
          "Identify, analyze, and evaluate known and foreseeable risks. Adopt suitable risk management measures.",
        articleRef: "Art. 9(2)",
        completed: false,
      },
      {
        id: "c2",
        category: "Risk Management",
        requirement: "Test against risk management measures",
        description:
          "Test the system to identify the most appropriate risk management measures.",
        articleRef: "Art. 9(6)",
        completed: false,
      },
      {
        id: "c3",
        category: "Data Governance",
        requirement: "Define data governance practices",
        description:
          "Establish data governance and management practices for training, validation, and testing datasets.",
        articleRef: "Art. 10(2)",
        completed: false,
      },
      {
        id: "c4",
        category: "Data Governance",
        requirement: "Assess dataset representativeness",
        description:
          "Ensure datasets are relevant, sufficiently representative, free of errors, and complete.",
        articleRef: "Art. 10(3)",
        completed: false,
      },
      {
        id: "c5",
        category: "Documentation",
        requirement: "Prepare technical documentation",
        description:
          "Create documentation covering general description, design, development process, and monitoring.",
        articleRef: "Art. 11, Annex IV",
        completed: false,
      },
      {
        id: "c6",
        category: "Logging",
        requirement: "Implement automatic event logging",
        description:
          "Enable recording of events relevant for identifying risks and substantial modifications.",
        articleRef: "Art. 12(1)",
        completed: false,
      },
      {
        id: "c7",
        category: "Transparency",
        requirement: "Provide instructions for use",
        description:
          "Include information about provider, system characteristics, performance, and human oversight measures.",
        articleRef: "Art. 13(3)",
        completed: false,
      },
      {
        id: "c8",
        category: "Human Oversight",
        requirement: "Design for human oversight",
        description:
          "Build in tools for human overseers to understand, monitor, and intervene in system operation.",
        articleRef: "Art. 14(4)",
        completed: false,
      },
      {
        id: "c9",
        category: "Accuracy & Robustness",
        requirement: "Define accuracy metrics",
        description:
          "Declare accuracy levels and metrics in documentation and instructions for use.",
        articleRef: "Art. 15(2)",
        completed: false,
      },
      {
        id: "c10",
        category: "Accuracy & Robustness",
        requirement: "Implement cybersecurity measures",
        description:
          "Protect against unauthorized access, data poisoning, and adversarial attacks.",
        articleRef: "Art. 15(5)",
        completed: false,
      },
      {
        id: "c11",
        category: "Conformity",
        requirement: "Complete conformity assessment",
        description:
          "Undergo internal control or third-party assessment before market placement.",
        articleRef: "Art. 43",
        completed: false,
      },
      {
        id: "c12",
        category: "Registration",
        requirement: "Register in EU database",
        description:
          "Enter information about the high-risk AI system in the EU database.",
        articleRef: "Art. 49",
        completed: false,
      },
    ],
    limited: [
      {
        id: "c1",
        category: "Transparency",
        requirement: "Implement AI interaction disclosure",
        description:
          "Inform users they are interacting with an AI system before or at the start of interaction.",
        articleRef: "Art. 50(1)",
        completed: false,
      },
      {
        id: "c2",
        category: "Content Marking",
        requirement: "Mark AI-generated content",
        description:
          "Label outputs as AI-generated in a machine-readable format where technically feasible.",
        articleRef: "Art. 50(2)",
        completed: false,
      },
      {
        id: "c3",
        category: "Transparency",
        requirement: "Document AI system capabilities",
        description:
          "Maintain documentation of system capabilities and limitations for user reference.",
        articleRef: "Art. 50(1)",
        completed: false,
      },
    ],
    minimal: [
      {
        id: "c1",
        category: "Best Practices",
        requirement: "Consider voluntary code of conduct",
        description:
          "Evaluate adoption of voluntary codes of conduct aligned with EU AI Act principles.",
        articleRef: "Art. 95",
        completed: false,
      },
      {
        id: "c2",
        category: "AI Literacy",
        requirement: "Promote AI literacy",
        description:
          "Ensure staff and users have sufficient AI literacy for informed AI system usage.",
        articleRef: "Art. 4",
        completed: false,
      },
    ],
    unacceptable: [
      {
        id: "c1",
        category: "Prohibition",
        requirement: "System cannot be deployed in the EU",
        description:
          "This AI practice is prohibited under Article 5. No compliance checklist applies — the system must not be marketed or used.",
        articleRef: "Art. 5",
        completed: false,
      },
    ],
  };
  return checklists[riskLevel] || [];
}

function getKeyArticles(
  riskLevel: string,
): Array<{ article: string; title: string; relevance: string }> {
  const articles: Record<
    string,
    Array<{ article: string; title: string; relevance: string }>
  > = {
    unacceptable: [
      {
        article: "Article 5",
        title: "Prohibited AI Practices",
        relevance:
          "Defines the AI practices that are completely banned under the EU AI Act.",
      },
      {
        article: "Article 99",
        title: "Penalties",
        relevance:
          "Fines up to €35 million or 7% of global annual turnover for prohibited practices.",
      },
    ],
    "high-risk": [
      {
        article: "Article 6",
        title: "Classification Rules for High-Risk AI Systems",
        relevance: "Defines criteria for high-risk AI classification.",
      },
      {
        article: "Article 9",
        title: "Risk Management System",
        relevance:
          "Core requirement for establishing continuous risk management.",
      },
      {
        article: "Article 10",
        title: "Data and Data Governance",
        relevance: "Requirements for training and testing data quality.",
      },
      {
        article: "Article 13",
        title: "Transparency and Information to Deployers",
        relevance:
          "Transparency requirements for high-risk system documentation.",
      },
      {
        article: "Article 14",
        title: "Human Oversight",
        relevance: "Requirements for enabling human oversight capabilities.",
      },
      {
        article: "Annex III",
        title: "High-Risk AI Systems (List)",
        relevance:
          "Enumerates the specific areas and use cases classified as high-risk.",
      },
    ],
    limited: [
      {
        article: "Article 50",
        title: "Transparency Obligations for Certain AI Systems",
        relevance:
          "Defines transparency requirements including AI interaction disclosure.",
      },
      {
        article: "Article 52",
        title: "Transparency for Generative AI",
        relevance:
          "Additional transparency requirements for AI-generated content.",
      },
    ],
    minimal: [
      {
        article: "Article 4",
        title: "AI Literacy",
        relevance:
          "General obligation to promote AI literacy among staff and users.",
      },
      {
        article: "Article 95",
        title: "Codes of Conduct",
        relevance:
          "Encourages voluntary adoption of responsible AI practices.",
      },
    ],
  };
  return articles[riskLevel] || [];
}

const CLASSIFICATION_DETAILS: Record<
  string,
  { title: string; description: string }
> = {
  unacceptable: {
    title: "Unacceptable Risk — Prohibited",
    description:
      "This AI system falls under practices explicitly prohibited by the EU AI Act (Article 5). These include social scoring, real-time biometric identification in public spaces, subliminal manipulation, exploitation of vulnerabilities, and certain forms of predictive policing. Such systems cannot be developed, placed on the market, or used within the EU.",
  },
  "high-risk": {
    title: "High-Risk AI System",
    description:
      "This AI system is classified as high-risk under Annex III of the EU AI Act. High-risk systems are subject to extensive requirements including risk management, data governance, technical documentation, transparency, human oversight, accuracy, robustness, and cybersecurity. A conformity assessment must be completed before the system can be placed on the EU market.",
  },
  limited: {
    title: "Limited Risk — Transparency Obligations",
    description:
      "This AI system has specific transparency obligations under Article 50. Users must be informed they are interacting with AI, and AI-generated content must be appropriately marked. While not subject to the full high-risk requirements, these transparency measures are legally binding.",
  },
  minimal: {
    title: "Minimal Risk",
    description:
      "This AI system falls under the minimal risk category. The EU AI Act does not impose specific mandatory requirements beyond general AI literacy obligations (Article 4). However, voluntary codes of conduct (Article 95) are encouraged to promote responsible AI development and deployment.",
  },
};

export function classifySystem(input: ClassificationInput): ClassificationOutput {
  const riskScore = calculateRiskScore(input);
  const riskLevel = getRiskLevel(riskScore, input.primaryFunction);
  const detail = CLASSIFICATION_DETAILS[riskLevel];
  const obligations = OBLIGATIONS_DB[riskLevel] || [];
  const checklist = getChecklist(riskLevel);
  const keyArticles = getKeyArticles(riskLevel);

  const reasoning = buildReasoning(input, riskLevel, riskScore);

  return {
    riskLevel,
    riskScore,
    classification: {
      title: detail.title,
      description: detail.description,
      reasoning,
    },
    obligations,
    checklist,
    keyArticles,
    summary: `Your AI system has been classified as ${detail.title}. ${riskLevel === "unacceptable" ? "This system is prohibited under the EU AI Act." : `You have ${obligations.length} legal obligations and ${checklist.length} compliance items to address.`}`,
  };
}

function buildReasoning(
  input: ClassificationInput,
  riskLevel: string,
  riskScore: number,
): string {
  const reasons: string[] = [];

  if (UNACCEPTABLE_FUNCTIONS.includes(input.primaryFunction)) {
    reasons.push(
      `The primary function "${formatFunction(input.primaryFunction)}" is explicitly listed as a prohibited AI practice under Article 5 of the EU AI Act.`,
    );
    return reasons.join(" ");
  }

  if (HIGH_RISK_FUNCTIONS.includes(input.primaryFunction)) {
    reasons.push(
      `The primary function "${formatFunction(input.primaryFunction)}" is listed in Annex III as a high-risk use case.`,
    );
  } else if (LIMITED_RISK_FUNCTIONS.includes(input.primaryFunction)) {
    reasons.push(
      `The primary function "${formatFunction(input.primaryFunction)}" falls under transparency-obligated AI systems (Article 50).`,
    );
  } else {
    reasons.push(
      `The primary function "${formatFunction(input.primaryFunction)}" does not fall under explicitly regulated categories.`,
    );
  }

  if (input.decisionImpact === "critical-life-safety") {
    reasons.push(
      "The system's decisions have critical life/safety impact, significantly increasing the risk assessment.",
    );
  } else if (input.decisionImpact === "significant-rights") {
    reasons.push(
      "The system affects significant rights of individuals, contributing to a higher risk classification.",
    );
  }

  if (input.autonomyLevel === "fully-autonomous") {
    reasons.push(
      "Fully autonomous operation without human oversight raises additional risk concerns.",
    );
  }

  const sensitiveData = input.dataTypes.filter((d) =>
    [
      "biometric",
      "health",
      "criminal-records",
      "children",
      "genetic",
      "political-opinions",
      "religious-beliefs",
    ].includes(d),
  );
  if (sensitiveData.length > 0) {
    reasons.push(
      `Processing of sensitive data categories (${sensitiveData.map(formatFunction).join(", ")}) increases the risk level.`,
    );
  }

  reasons.push(
    `Overall risk score: ${riskScore}/100, resulting in ${riskLevel.replace("-", " ")} classification.`,
  );

  return reasons.join(" ");
}

function formatFunction(fn: string): string {
  return fn
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
