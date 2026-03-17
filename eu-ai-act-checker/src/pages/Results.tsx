import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { useAssessmentStore } from "@/store/assessment";
import { Button, Card, Badge } from "@/components/ui";
import { 
  AlertTriangle, ShieldX, Info, CheckCircle, Download, BookOpen, 
  ListChecks, AlertCircle, Bot, Zap 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useExplainClassification } from "@workspace/api-client-react";

export function Results() {
  const [, setLocation] = useLocation();
  const { result, request, explanation, setExplanation } = useAssessmentStore();
  
  const { mutate: explain, isPending: isExplaining } = useExplainClassification();

  const isDemo = !request;
  const [activeTab, setActiveTab] = useState<"obligations" | "checklist" | "explanation">(
    isDemo ? "explanation" : "obligations"
  );

  useEffect(() => {
    if (!result) {
      setLocation("/");
      return;
    }

    if (isDemo && !explanation && !isExplaining) {
      explain({
        data: {
          systemName: result.systemName,
          systemDescription: result.systemDescription,
          riskLevel: result.riskLevel,
          primaryFunction: result.riskLevel,
          sector: "general"
        }
      }, {
        onSuccess: (res) => {
          setExplanation(res.explanation);
        }
      });
    }
  }, [result, setLocation]);

  if (!result) return null;

  const getRiskConfig = (level: string) => {
    switch (level) {
      case 'unacceptable':
        return { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: ShieldX, label: 'Unacceptable Risk', gradient: 'from-red-500/20 to-transparent' };
      case 'high-risk':
        return { color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20', icon: AlertTriangle, label: 'High Risk', gradient: 'from-orange-500/20 to-transparent' };
      case 'limited':
        return { color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', icon: AlertCircle, label: 'Limited Risk', gradient: 'from-yellow-500/20 to-transparent' };
      case 'minimal':
      default:
        return { color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20', icon: CheckCircle, label: 'Minimal Risk', gradient: 'from-green-500/20 to-transparent' };
    }
  };

  const config = getRiskConfig(result.riskLevel);
  const RiskIcon = config.icon;

  const handleExplain = () => {
    if (explanation) {
      setActiveTab("explanation");
      return;
    }
    
    explain({
      data: {
        systemName: result.systemName,
        systemDescription: result.systemDescription,
        riskLevel: result.riskLevel,
        primaryFunction: request?.primaryFunction || result.riskLevel,
        sector: request?.sector || "general"
      }
    }, {
      onSuccess: (res) => {
        setExplanation(res.explanation);
        setActiveTab("explanation");
      }
    });
  };

  const [isDownloading, setIsDownloading] = useState(false);
  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}api/assessment/pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ result, explanation: explanation || undefined }),
      });
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `compliance-report-${result.systemName.replace(/\s+/g, "-").toLowerCase()}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF download failed", err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto max-w-6xl px-4 py-8 md:py-12 space-y-8">
        
        {/* Header Hero */}
        <Card className="relative overflow-hidden border-0 bg-card">
          <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50", config.gradient)} />
          <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className={cn("p-3 rounded-2xl border backdrop-blur-xl", config.bg, config.border)}>
                  <RiskIcon className={cn("w-8 h-8", config.color)} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">Classification</span>
                  <span className={cn("text-2xl font-bold", config.color)}>{config.label}</span>
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold mb-3">{result.systemName}</h1>
              <p className="text-muted-foreground text-lg max-w-2xl">{result.summary}</p>
            </div>
            <div className="flex flex-col gap-3 w-full md:w-auto shrink-0">
              <Button size="lg" className="w-full shadow-xl shadow-primary/20" onClick={handleDownloadPdf} isLoading={isDownloading}>
                <Download className="w-5 h-5 mr-2" /> Download Report
              </Button>
              <Button size="lg" variant="secondary" className="w-full" onClick={handleExplain} isLoading={isExplaining}>
                <Bot className="w-5 h-5 mr-2" /> Deep AI Analysis
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Left Column: Classification Reason & Articles */}
          <div className="md:col-span-1 space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" /> Reasoning
              </h3>
              <p className="text-sm text-foreground/90 leading-relaxed mb-6">
                {result.classification.reasoning}
              </p>
              
              <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Key Articles</h4>
              <div className="space-y-3">
                {result.keyArticles.map((ref, i) => (
                  <div key={i} className="p-3 rounded-xl bg-secondary/50 border border-border/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-primary text-sm">{ref.article}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{ref.title}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column: Tabs for Obligations, Checklist, AI Analysis */}
          <div className="md:col-span-2">
            <Card className="flex flex-col h-full min-h-[500px]">
              <div className="flex items-center border-b border-border/50 px-2 pt-2 overflow-x-auto no-scrollbar">
                <button 
                  onClick={() => setActiveTab("obligations")}
                  className={cn("px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap", activeTab === "obligations" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}
                >
                  <div className="flex items-center gap-2"><BookOpen className="w-4 h-4"/> Obligations</div>
                </button>
                <button 
                  onClick={() => setActiveTab("checklist")}
                  className={cn("px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap", activeTab === "checklist" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}
                >
                  <div className="flex items-center gap-2"><ListChecks className="w-4 h-4"/> Checklist</div>
                </button>
                <button 
                  onClick={() => setActiveTab("explanation")}
                  disabled={!explanation && !isExplaining}
                  className={cn("px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap disabled:opacity-50", activeTab === "explanation" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}
                >
                  <div className="flex items-center gap-2"><Bot className="w-4 h-4"/> AI Deep Dive</div>
                </button>
              </div>

              <div className="p-6 flex-1">
                
                {/* OBLIGATIONS TAB */}
                {activeTab === "obligations" && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {result.obligations.map((ob) => (
                      <div key={ob.id} className="p-5 rounded-xl border border-border/50 bg-background/30 hover:bg-secondary/30 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                          <h4 className="font-bold text-lg">{ob.title}</h4>
                          <div className="flex gap-2 shrink-0">
                            <Badge variant={ob.priority === 'critical' ? 'danger' : ob.priority === 'high' ? 'warning' : 'outline'}>
                              {ob.priority.toUpperCase()}
                            </Badge>
                            <Badge variant="outline" className="bg-secondary text-secondary-foreground">{ob.articleRef}</Badge>
                          </div>
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed">{ob.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* CHECKLIST TAB */}
                {activeTab === "checklist" && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {/* Group by category */}
                    {Array.from(new Set(result.checklist.map(c => c.category))).map(category => (
                      <div key={category} className="space-y-3">
                        <h4 className="font-semibold text-primary uppercase tracking-wider text-sm">{category}</h4>
                        {result.checklist.filter(c => c.category === category).map(item => (
                          <label key={item.id} className="flex items-start gap-4 p-4 rounded-xl border border-border/50 bg-background/30 cursor-pointer hover:border-primary/50 transition-colors group">
                            <input type="checkbox" className="mt-1 w-5 h-5 rounded border-muted-foreground text-primary focus:ring-primary bg-background" />
                            <div>
                              <div className="font-medium text-foreground group-hover:text-primary transition-colors">{item.requirement}</div>
                              <div className="text-sm text-muted-foreground mt-1">{item.description}</div>
                              <div className="text-xs text-muted-foreground mt-2 font-mono bg-secondary/50 inline-block px-2 py-1 rounded">{item.articleRef}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                {/* EXPLANATION TAB */}
                {activeTab === "explanation" && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 h-full">
                    {isExplaining ? (
                      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                        <Bot className="w-12 h-12 mb-4 animate-bounce text-primary" />
                        <p className="text-lg font-medium">AI is analyzing your system...</p>
                        <p className="text-sm">Synthesizing EU AI Act legal requirements.</p>
                      </div>
                    ) : explanation ? (
                      <div className="prose prose-invert prose-blue max-w-none">
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-900/10 to-indigo-900/10 border border-blue-500/20">
                          <div className="flex items-center gap-3 mb-6 border-b border-blue-500/20 pb-4">
                            <Bot className="w-6 h-6 text-blue-400" />
                            <h3 className="text-xl font-bold text-blue-100 m-0">AI Legal Synthesis</h3>
                          </div>
                          <div className="text-blue-100/90 whitespace-pre-wrap leading-relaxed text-sm md:text-base font-medium">
                            {explanation}
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}

              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
