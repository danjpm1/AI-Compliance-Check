import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "@/components/Layout";
import { Button, Card, Input, Label, Textarea } from "@/components/ui";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useClassifyAiSystem } from "@workspace/api-client-react";
import { useAssessmentStore } from "@/store/assessment";

const schema = z.object({
  systemName: z.string().min(2, "System name is required"),
  organizationName: z.string().optional(),
  systemDescription: z.string().min(10, "Please provide a detailed description"),
  primaryFunction: z.string().min(2, "Please select a primary function"),
  sector: z.string().min(2, "Please provide the sector"),
  dataTypes: z.array(z.string()).min(1, "Select at least one data type"),
  autonomyLevel: z.enum(["fully-autonomous", "semi-autonomous", "human-in-the-loop", "advisory-only"]),
  targetUsers: z.enum(["general-public", "specific-professionals", "internal-employees", "government-authorities"]),
  decisionImpact: z.enum(["critical-life-safety", "significant-rights", "moderate-economic", "limited-convenience"]),
  additionalContext: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const SECTORS = [
  { value: "healthcare", label: "Healthcare" },
  { value: "financial", label: "Finance" },
  { value: "education", label: "Education" },
  { value: "law-enforcement", label: "Law Enforcement" },
  { value: "employment", label: "Human Resources" },
  { value: "customer-service", label: "Customer Service" },
  { value: "critical-infrastructure", label: "Critical Infrastructure" },
  { value: "government", label: "Public Sector" },
  { value: "technology", label: "Technology" },
];
const FUNCTIONS = [
  { value: "biometric-identification", label: "Biometric Identification" },
  { value: "cv-screening", label: "CV / Resume Screening" },
  { value: "credit-scoring", label: "Credit Scoring" },
  { value: "medical-diagnosis", label: "Medical Diagnosis" },
  { value: "chatbot", label: "Chatbot / Virtual Assistant" },
  { value: "content-generation-text", label: "Content Generation" },
  { value: "sentiment-analysis", label: "Sentiment Analysis" },
  { value: "recommendation-system", label: "Recommendation System" },
  { value: "spam-detection", label: "Spam / Fraud Detection" },
  { value: "process-automation", label: "Process Automation" },
  { value: "critical-infrastructure-management", label: "Infrastructure Management" },
  { value: "law-enforcement-risk", label: "Law Enforcement Risk Assessment" },
];
const DATA_TYPES = [
  { value: "personal-identifiers", label: "Personal Identifiers (PII)" },
  { value: "biometric", label: "Biometric Data" },
  { value: "health", label: "Health / Medical Data" },
  { value: "financial", label: "Financial Data" },
  { value: "criminal-records", label: "Criminal Records" },
  { value: "children", label: "Children's Data" },
  { value: "behavioral", label: "Behavioral Data" },
  { value: "communication-metadata", label: "Communication Metadata" },
];

const AUTONOMY_OPTIONS = [
  { value: "fully-autonomous", label: "Fully Autonomous", desc: "Operates without human intervention" },
  { value: "semi-autonomous", label: "Semi-Autonomous", desc: "Requires occasional human oversight" },
  { value: "human-in-the-loop", label: "Human-in-the-loop", desc: "Requires human action for final decisions" },
  { value: "advisory-only", label: "Advisory Only", desc: "Provides recommendations to human deciders" },
];

const TARGET_USERS = [
  { value: "general-public", label: "General Public", desc: "Any individual or consumer" },
  { value: "specific-professionals", label: "Specific Professionals", desc: "Doctors, judges, specialized workers" },
  { value: "internal-employees", label: "Internal Employees", desc: "Used only within your organization" },
  { value: "government-authorities", label: "Government/Law Enforcement", desc: "Used by public authorities" },
];

const IMPACTS = [
  { value: "critical-life-safety", label: "Critical", desc: "Impact on life, health, or physical safety" },
  { value: "significant-rights", label: "Significant", desc: "Impact on fundamental rights (e.g., bias, fairness)" },
  { value: "moderate-economic", label: "Moderate", desc: "Economic or operational impact" },
  { value: "limited-convenience", label: "Limited", desc: "Convenience, personalization, or minimal impact" },
];

export function Assessment() {
  const [, setLocation] = useLocation();
  const { setRequest, setResult } = useAssessmentStore();
  const { mutate: classify, isPending } = useClassifyAiSystem();
  
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const { register, handleSubmit, watch, setValue, formState: { errors }, trigger } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      dataTypes: [],
      autonomyLevel: "human-in-the-loop",
      targetUsers: "internal-employees",
      decisionImpact: "limited-convenience",
    },
  });

  const nextStep = async () => {
    let fieldsToValidate: any[] = [];
    if (step === 1) fieldsToValidate = ["systemName", "systemDescription"];
    if (step === 2) fieldsToValidate = ["primaryFunction", "sector"];
    if (step === 3) fieldsToValidate = ["dataTypes"];

    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) setStep((s) => Math.min(s + 1, totalSteps));
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const onSubmit = (data: FormData) => {
    // Save request to store for PDF/Explanation later
    setRequest(data as any);
    
    classify({ data: data as any }, {
      onSuccess: (result) => {
        setResult(result);
        setLocation("/results");
      },
      onError: (err) => {
        console.error("Classification failed", err);
        alert("Failed to process assessment. Please try again.");
      }
    });
  };

  const watchedDataTypes = watch("dataTypes");
  const toggleDataType = (type: string) => {
    const current = new Set(watchedDataTypes);
    if (current.has(type)) current.delete(type);
    else current.add(type);
    setValue("dataTypes", Array.from(current), { shouldValidate: true });
  };

  const formVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <Layout>
      <div className="container mx-auto max-w-3xl px-4 py-12 md:py-24">
        
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">System Assessment</h1>
            <span className="text-sm font-medium text-muted-foreground">Step {step} of {totalSteps}</span>
          </div>
          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-out" 
              style={{ width: `${(step / totalSteps) * 100}%` }} 
            />
          </div>
        </div>

        <Card className="p-6 md:p-10 relative overflow-hidden">
          <form onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              
              {/* STEP 1: BASIC INFO */}
              {step === 1 && (
                <motion.div key="step1" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                  <h2 className="text-xl font-bold border-b border-border/50 pb-4 mb-6">Basic Information</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="systemName">System Name *</Label>
                      <Input id="systemName" placeholder="e.g., ResumeScreener Pro" {...register("systemName")} className="mt-2" />
                      {errors.systemName && <p className="text-sm text-destructive mt-1">{errors.systemName.message}</p>}
                    </div>

                    <div>
                      <Label htmlFor="organizationName">Organization Name</Label>
                      <Input id="organizationName" placeholder="Your Company Ltd" {...register("organizationName")} className="mt-2" />
                    </div>

                    <div>
                      <Label htmlFor="systemDescription">System Description *</Label>
                      <Textarea 
                        id="systemDescription" 
                        placeholder="Describe what the AI system does, how it works, and its primary goal..." 
                        {...register("systemDescription")} 
                        className="mt-2" 
                      />
                      {errors.systemDescription && <p className="text-sm text-destructive mt-1">{errors.systemDescription.message}</p>}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: CONTEXT */}
              {step === 2 && (
                <motion.div key="step2" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                  <h2 className="text-xl font-bold border-b border-border/50 pb-4 mb-6">Deployment Context</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <Label className="mb-2 block">Primary Function *</Label>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {FUNCTIONS.map(func => (
                          <label key={func.value} className={cn(
                            "flex items-center p-4 border rounded-xl cursor-pointer transition-all",
                            watch("primaryFunction") === func.value ? "bg-primary/10 border-primary" : "border-border hover:border-primary/50"
                          )}>
                            <input type="radio" value={func.value} {...register("primaryFunction")} className="hidden" />
                            <span className="font-medium">{func.label}</span>
                            {watch("primaryFunction") === func.value && <CheckCircle2 className="ml-auto w-5 h-5 text-primary" />}
                          </label>
                        ))}
                      </div>
                      {errors.primaryFunction && <p className="text-sm text-destructive mt-2">{errors.primaryFunction.message}</p>}
                    </div>

                    <div>
                      <Label className="mb-2 block">Sector *</Label>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {SECTORS.map(sec => (
                          <label key={sec.value} className={cn(
                            "flex items-center p-3 border rounded-xl cursor-pointer transition-all text-sm",
                            watch("sector") === sec.value ? "bg-primary/10 border-primary" : "border-border hover:border-primary/50"
                          )}>
                            <input type="radio" value={sec.value} {...register("sector")} className="hidden" />
                            <span className="font-medium">{sec.label}</span>
                          </label>
                        ))}
                      </div>
                      {errors.sector && <p className="text-sm text-destructive mt-2">{errors.sector.message}</p>}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: DATA & AUTONOMY */}
              {step === 3 && (
                <motion.div key="step3" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                  <h2 className="text-xl font-bold border-b border-border/50 pb-4 mb-6">Data & Autonomy</h2>

                  <div>
                    <Label className="mb-3 block">Data Types Processed *</Label>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {DATA_TYPES.map(type => {
                        const isSelected = watchedDataTypes.includes(type.value);
                        return (
                          <label key={type.value} className={cn(
                            "flex items-center p-3 border rounded-xl cursor-pointer transition-all text-sm",
                            isSelected ? "bg-primary/10 border-primary" : "border-border hover:border-primary/50"
                          )}>
                            <input 
                              type="checkbox" 
                              className="hidden"
                              checked={isSelected}
                              onChange={() => toggleDataType(type.value)}
                            />
                            <div className={cn("w-4 h-4 rounded-sm border mr-3 flex items-center justify-center transition-colors", isSelected ? "bg-primary border-primary" : "border-muted-foreground")}>
                              {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                            </div>
                            <span className="font-medium leading-tight">{type.label}</span>
                          </label>
                        )
                      })}
                    </div>
                    {errors.dataTypes && <p className="text-sm text-destructive mt-2">{errors.dataTypes.message}</p>}
                  </div>

                  <div>
                    <Label className="mb-3 block">Level of Autonomy</Label>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {AUTONOMY_OPTIONS.map(opt => (
                         <label key={opt.value} className={cn(
                          "flex flex-col p-4 border rounded-xl cursor-pointer transition-all",
                          watch("autonomyLevel") === opt.value ? "bg-primary/10 border-primary" : "border-border hover:border-primary/50"
                        )}>
                          <input type="radio" value={opt.value} {...register("autonomyLevel")} className="hidden" />
                          <span className="font-semibold">{opt.label}</span>
                          <span className="text-xs text-muted-foreground mt-1">{opt.desc}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="mb-3 block">Target Users</Label>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {TARGET_USERS.map(opt => (
                         <label key={opt.value} className={cn(
                          "flex flex-col p-4 border rounded-xl cursor-pointer transition-all",
                          watch("targetUsers") === opt.value ? "bg-primary/10 border-primary" : "border-border hover:border-primary/50"
                        )}>
                          <input type="radio" value={opt.value} {...register("targetUsers")} className="hidden" />
                          <span className="font-semibold">{opt.label}</span>
                          <span className="text-xs text-muted-foreground mt-1">{opt.desc}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                </motion.div>
              )}

              {/* STEP 4: IMPACT */}
              {step === 4 && (
                <motion.div key="step4" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                  <h2 className="text-xl font-bold border-b border-border/50 pb-4 mb-6">Impact Assessment</h2>

                  <div>
                    <Label className="mb-3 block">Potential Impact of Decisions</Label>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {IMPACTS.map(opt => (
                         <label key={opt.value} className={cn(
                          "flex flex-col p-4 border rounded-xl cursor-pointer transition-all",
                          watch("decisionImpact") === opt.value ? "bg-primary/10 border-primary" : "border-border hover:border-primary/50"
                        )}>
                          <input type="radio" value={opt.value} {...register("decisionImpact")} className="hidden" />
                          <span className="font-semibold">{opt.label}</span>
                          <span className="text-xs text-muted-foreground mt-1">{opt.desc}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="additionalContext">Additional Context (Optional)</Label>
                    <Textarea 
                      id="additionalContext" 
                      placeholder="Any other relevant details about how the system mitigates risks..." 
                      {...register("additionalContext")} 
                      className="mt-2" 
                    />
                  </div>

                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-10 pt-6 border-t border-border flex justify-between">
              <Button type="button" variant="outline" onClick={prevStep} disabled={step === 1}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              
              {step < totalSteps ? (
                <Button type="button" onClick={nextStep}>
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit" isLoading={isPending}>
                  Get Classification <CheckCircle2 className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
}
