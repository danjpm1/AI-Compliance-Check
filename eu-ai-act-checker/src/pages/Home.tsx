import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Layout } from "@/components/Layout";
import { Button, Card, Badge } from "@/components/ui";
import { ArrowRight, CheckCircle2, Shield, Scale, FileText, Bot, Briefcase, Mail, Sparkles, Quote } from "lucide-react";
import { useState } from "react";
import { getDemoAssessment } from "@workspace/api-client-react";
import { useAssessmentStore } from "@/store/assessment";

export function Home() {
  const [, setLocation] = useLocation();
  const { setResult } = useAssessmentStore();
  const [loadingDemo, setIsLoadingDemo] = useState<string | null>(null);

  const handleDemoClick = async (type: "hr-screening" | "customer-chatbot" | "spam-filter") => {
    setIsLoadingDemo(type);
    try {
      const res = await getDemoAssessment(type);
      setResult(res);
      setLocation('/results');
    } catch (err) {
      console.error("Failed to load demo", err);
    } finally {
      setIsLoadingDemo(null);
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 lg:pt-36 lg:pb-40 px-4">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <img 
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
            alt="Abstract Background" 
            className="w-full h-full object-cover opacity-40 mix-blend-screen"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/80 to-background" />
        </div>
        
        <div className="container mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
              <Badge variant="outline" className="bg-background/50 backdrop-blur-md">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Updated for EU AI Act Requirements
                </span>
              </Badge>
              <Badge variant="outline" className="bg-gradient-to-r from-violet-500/20 to-blue-500/20 border-violet-500/30 backdrop-blur-md">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                  <span className="bg-gradient-to-r from-violet-300 to-blue-300 bg-clip-text text-transparent font-semibold">AI-Powered Analysis</span>
                </span>
              </Badge>
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight mb-8 leading-tight">
              Is Your AI System Compliant with the <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">EU AI Act?</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
              Instantly classify your AI system's risk level, understand your legal obligations, 
              and generate a comprehensive compliance checklist in minutes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/assessment" className="w-full sm:w-auto">
                <Button size="lg" className="w-full group">
                  Start Free Assessment
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <a href="#demos" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full">
                  View Demo Reports
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-24 bg-card/30 border-y border-border/50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 border border-blue-500/20">
                <Scale className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Instant Classification</h3>
              <p className="text-muted-foreground leading-relaxed">
                Determine whether your system falls under Unacceptable, High, Limited, or Minimal risk categories based on official criteria.
              </p>
            </Card>
            <Card className="p-8 hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-6 border border-indigo-500/20">
                <Shield className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Clear Obligations</h3>
              <p className="text-muted-foreground leading-relaxed">
                Get a prioritized checklist of your specific legal requirements, complete with references to the relevant EU AI Act articles.
              </p>
            </Card>
            <Card className="p-8 hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center mb-6 border border-cyan-500/20">
                <FileText className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Exportable Report</h3>
              <p className="text-muted-foreground leading-relaxed">
                Generate and download a professional PDF compliance summary to share with your legal team or stakeholders.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Interactive Demos */}
      <section id="demos" className="py-24 px-4 relative">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Explore Example Scenarios</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              See how different AI systems are classified under the act without filling out the form.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="flex flex-col p-6 hover:shadow-2xl hover:border-primary/50 transition-all cursor-pointer overflow-hidden group relative">
              <div className="absolute top-3 right-3">
                <span className="flex items-center gap-1 text-[10px] font-semibold text-violet-300 bg-violet-500/15 border border-violet-500/25 rounded-full px-2 py-0.5">
                  <Sparkles className="w-2.5 h-2.5" /> AI
                </span>
              </div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-orange-500/10 rounded-xl border border-orange-500/20">
                  <Briefcase className="w-6 h-6 text-orange-400" />
                </div>
                <Badge variant="warning">High-Risk</Badge>
              </div>
              <h3 className="text-xl font-bold mb-2">HR Resume Screening</h3>
              <p className="text-sm text-muted-foreground flex-1 mb-6">
                An AI tool used to automatically rank and filter job applicant resumes based on historical hiring data.
              </p>
              <Button 
                variant="secondary" 
                className="w-full group-hover:bg-primary group-hover:text-primary-foreground"
                isLoading={loadingDemo === 'hr-screening'}
                onClick={() => handleDemoClick('hr-screening')}
              >
                View Report
              </Button>
            </Card>

            <Card className="flex flex-col p-6 hover:shadow-2xl hover:border-primary/50 transition-all cursor-pointer overflow-hidden group relative">
              <div className="absolute top-3 right-3">
                <span className="flex items-center gap-1 text-[10px] font-semibold text-violet-300 bg-violet-500/15 border border-violet-500/25 rounded-full px-2 py-0.5">
                  <Sparkles className="w-2.5 h-2.5" /> AI
                </span>
              </div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                  <Bot className="w-6 h-6 text-yellow-400" />
                </div>
                <Badge variant="outline" className="text-yellow-500 border-yellow-500/30 bg-yellow-500/10">Limited Risk</Badge>
              </div>
              <h3 className="text-xl font-bold mb-2">Customer Chatbot</h3>
              <p className="text-sm text-muted-foreground flex-1 mb-6">
                A customer service bot that answers basic FAQs and routes complex issues to human agents.
              </p>
              <Button 
                variant="secondary" 
                className="w-full group-hover:bg-primary group-hover:text-primary-foreground"
                isLoading={loadingDemo === 'customer-chatbot'}
                onClick={() => handleDemoClick('customer-chatbot')}
              >
                View Report
              </Button>
            </Card>

            <Card className="flex flex-col p-6 hover:shadow-2xl hover:border-primary/50 transition-all cursor-pointer overflow-hidden group relative">
              <div className="absolute top-3 right-3">
                <span className="flex items-center gap-1 text-[10px] font-semibold text-violet-300 bg-violet-500/15 border border-violet-500/25 rounded-full px-2 py-0.5">
                  <Sparkles className="w-2.5 h-2.5" /> AI
                </span>
              </div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                  <Mail className="w-6 h-6 text-green-400" />
                </div>
                <Badge variant="success">Minimal Risk</Badge>
              </div>
              <h3 className="text-xl font-bold mb-2">Email Spam Filter</h3>
              <p className="text-sm text-muted-foreground flex-1 mb-6">
                A standard machine learning model that classifies incoming emails as spam or legitimate.
              </p>
              <Button 
                variant="secondary" 
                className="w-full group-hover:bg-primary group-hover:text-primary-foreground"
                isLoading={loadingDemo === 'spam-filter'}
                onClick={() => handleDemoClick('spam-filter')}
              >
                View Report
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* AI Analysis Preview */}
      <section className="py-24 bg-card/30 border-t border-border/50 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-violet-400" />
              <span className="text-sm font-semibold uppercase tracking-wider text-violet-400">OpenAI-Powered</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">See AI-Powered Analysis in Action</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Every assessment includes a deep AI analysis that translates complex regulation into clear, actionable guidance.
            </p>
          </div>

          <Card className="relative overflow-hidden p-8 md:p-10 bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border-blue-500/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
                  <Bot className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-blue-300">AI Legal Synthesis</span>
                  <span className="text-xs text-muted-foreground ml-2">for HelpBot Customer Assistant</span>
                </div>
              </div>
              <div className="space-y-4 text-sm md:text-base text-blue-100/80 leading-relaxed">
                <div className="flex gap-3">
                  <Quote className="w-8 h-8 text-blue-500/40 shrink-0 mt-0.5" />
                  <div className="space-y-3 italic">
                    <p>
                      HelpBot falls under <span className="text-foreground font-medium not-italic">Limited Risk (Article 50)</span> because it is a chatbot that interacts directly with users. 
                      The EU AI Act requires that individuals be clearly informed when they are communicating with an AI system rather than a human.
                    </p>
                    <p>
                      Key compliance steps: implement a clear disclosure mechanism at the start of each conversation, 
                      ensure AI-generated responses are labeled in machine-readable format per <span className="text-foreground font-medium not-italic">Article 50(2)</span>, 
                      and maintain documentation of system capabilities and limitations for user reference.
                    </p>
                  </div>
                </div>
              </div>
              <p className="mt-6 text-sm text-muted-foreground border-t border-blue-500/20 pt-6">
                Our AI explains exactly why your system received its classification, which specific articles apply, and practical next steps — in plain language.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-secondary/30 border-t border-border/50">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-16">How the Assessment Works</h2>
          <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
            {[
              { title: "Input System Details", desc: "Provide basic information about what your AI system does and who built it." },
              { title: "Define Purpose & Sector", desc: "Select the primary function and the industry sector where the AI will be deployed." },
              { title: "Data & Autonomy", desc: "Specify the types of data processed and the level of human oversight maintained." },
              { title: "Evaluate Impact", desc: "Assess the potential impact on fundamental rights, safety, and economic factors to get your final classification." }
            ].map((step, i) => (
              <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-primary text-primary-foreground font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  {i + 1}
                </div>
                <Card className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-6">
                  <h4 className="text-lg font-bold mb-2 flex items-center gap-2">
                    {step.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* About EU AI Act */}
      <section id="about-eu-ai-act" className="py-24 px-4 border-t border-border/50">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">About the EU AI Act</h2>
          <div className="space-y-6 text-muted-foreground leading-relaxed">
            <p>
              The EU Artificial Intelligence Act (Regulation 2024/1689) is the world's first comprehensive legal framework for artificial intelligence. 
              It establishes a risk-based approach that classifies AI systems into four tiers: 
              <span className="text-red-400 font-semibold"> Unacceptable Risk</span> (banned outright), 
              <span className="text-orange-400 font-semibold"> High Risk</span> (strict obligations including conformity assessments, human oversight, and technical documentation), 
              <span className="text-yellow-400 font-semibold"> Limited Risk</span> (transparency requirements), and 
              <span className="text-green-400 font-semibold"> Minimal Risk</span> (voluntary codes of conduct).
            </p>
            <p>
              The regulation applies to any AI system placed on the EU market or whose output is used within the EU — regardless of where the provider is based. 
              This means companies worldwide must comply if their AI products serve European users. High-risk use cases explicitly listed in Annex III include 
              credit scoring, recruitment tools, medical diagnostics, biometric identification, judicial systems, and education assessment.
            </p>
            <p className="text-sm text-muted-foreground/80">
              Key deadlines: prohibited AI practices were banned as of <span className="text-foreground font-medium">February 2025</span>. 
              Full high-risk obligations, including conformity assessments and EU database registration, take effect in <span className="text-foreground font-medium">August 2026</span>.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
