import PDFDocument from "pdfkit";

interface AssessmentResult {
  systemName: string;
  organizationName?: string;
  systemDescription: string;
  riskLevel: string;
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
    priority: string;
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

const RISK_COLORS: Record<string, [number, number, number]> = {
  unacceptable: [220, 38, 38],
  "high-risk": [249, 115, 22],
  limited: [234, 179, 8],
  minimal: [34, 197, 94],
};

export function generatePdf(
  result: AssessmentResult,
  explanation?: string,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const riskColor = RISK_COLORS[result.riskLevel] || [100, 100, 100];

    doc
      .fontSize(24)
      .font("Helvetica-Bold")
      .text("EU AI Act Compliance Report", { align: "center" });

    doc.moveDown(0.5);
    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#666666")
      .text(
        `Generated on ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`,
        { align: "center" },
      );
    doc.text("Based on EU Regulation 2024/1689 (EU Artificial Intelligence Act)", {
      align: "center",
    });

    doc.moveDown(1);
    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .strokeColor("#cccccc")
      .stroke();
    doc.moveDown(1);

    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .fillColor("#000000")
      .text("System Information");
    doc.moveDown(0.5);
    doc.fontSize(10).font("Helvetica");
    doc.text(`System Name: ${result.systemName}`);
    if (result.organizationName) {
      doc.text(`Organization: ${result.organizationName}`);
    }
    doc.moveDown(0.3);
    doc.text(`Description: ${result.systemDescription}`);

    doc.moveDown(1);

    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .fillColor("#000000")
      .text("Risk Classification");
    doc.moveDown(0.5);

    const badgeY = doc.y;
    doc
      .roundedRect(50, badgeY, 200, 30, 5)
      .fill(riskColor);
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .fillColor("#ffffff")
      .text(result.classification.title, 55, badgeY + 8, {
        width: 190,
        align: "center",
      });

    doc.y = badgeY + 40;
    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#000000")
      .text(`Risk Score: ${result.riskScore}/100`);
    doc.moveDown(0.5);
    doc.text(result.classification.description);
    doc.moveDown(0.3);
    doc
      .font("Helvetica-Oblique")
      .text(`Reasoning: ${result.classification.reasoning}`);

    if (explanation) {
      doc.moveDown(1);
      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .fillColor("#000000")
        .text("AI-Generated Analysis");
      doc.moveDown(0.5);
      doc.fontSize(10).font("Helvetica").text(explanation);
    }

    doc.addPage();

    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .fillColor("#000000")
      .text("Legal Obligations");
    doc.moveDown(0.5);

    for (const obligation of result.obligations) {
      if (doc.y > 700) doc.addPage();
      doc
        .fontSize(11)
        .font("Helvetica-Bold")
        .text(`${obligation.title} [${obligation.articleRef}]`);
      doc
        .fontSize(10)
        .font("Helvetica")
        .text(obligation.description);
      doc
        .fontSize(9)
        .fillColor("#666666")
        .text(`Priority: ${obligation.priority.toUpperCase()}`);
      doc.fillColor("#000000");
      doc.moveDown(0.5);
    }

    doc.moveDown(1);
    if (doc.y > 600) doc.addPage();

    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("Compliance Checklist");
    doc.moveDown(0.5);

    for (const item of result.checklist) {
      if (doc.y > 700) doc.addPage();
      doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .text(`☐ ${item.requirement} [${item.articleRef}]`);
      doc.font("Helvetica").text(`   Category: ${item.category}`);
      doc.text(`   ${item.description}`);
      doc.moveDown(0.3);
    }

    if (result.keyArticles.length > 0) {
      if (doc.y > 600) doc.addPage();
      doc.moveDown(1);
      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .text("Key Article References");
      doc.moveDown(0.5);

      for (const article of result.keyArticles) {
        doc
          .fontSize(10)
          .font("Helvetica-Bold")
          .text(`${article.article}: ${article.title}`);
        doc.font("Helvetica").text(article.relevance);
        doc.moveDown(0.3);
      }
    }

    doc.moveDown(2);
    doc
      .fontSize(8)
      .font("Helvetica-Oblique")
      .fillColor("#999999")
      .text(
        "Disclaimer: This report provides informational guidance only and does not constitute legal advice. For definitive compliance guidance, consult a qualified legal professional specializing in EU AI regulation.",
        { align: "center" },
      );

    doc.end();
  });
}
