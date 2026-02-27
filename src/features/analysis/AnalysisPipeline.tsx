import { useState } from "react";
import { motion } from "framer-motion";
import { Dna, FlaskConical, FileText, Pill, ClipboardList, CheckCircle2, Loader2 } from "lucide-react";

const STEPS = [
  { id: 1, icon: FileText, label: "VCF Upload", sub: "File validation" },
  { id: 2, icon: FlaskConical, label: "Variant Detection", sub: "SNP/indel calling" },
  { id: 3, icon: Dna, label: "Gene Interpretation", sub: "Diplotype assignment" },
  { id: 4, icon: Pill, label: "Drug Risk Scoring", sub: "PGx lookup" },
  { id: 5, icon: ClipboardList, label: "Recommendation", sub: "Guideline match" },
];

interface AnalysisPipelineProps {
  activeStep: number; // 0 = idle, 1-5 = step
}

export function AnalysisPipeline({ activeStep }: AnalysisPipelineProps) {
  return (
    <div className="py-8 px-4">
      <p className="text-center text-xs uppercase tracking-widest text-muted-foreground mb-8 font-medium">
        Analysis Pipeline
      </p>

      {/* Desktop horizontal */}
      <div className="hidden md:flex items-center justify-center gap-0">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const isComplete = activeStep > step.id;
          const isActive = activeStep === step.id;
          const isPending = activeStep < step.id;

          return (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center gap-2 w-32">
                {/* Node */}
                <div className="relative">
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ background: "hsl(var(--primary) / 0.2)" }}
                      animate={{ scale: [1, 1.6, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                  <div
                    className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                      isComplete
                        ? "bg-emerald-950/60 border-emerald-500 text-emerald-400"
                        : isActive
                        ? "border-primary text-primary teal-glow"
                        : "bg-secondary border-border text-muted-foreground"
                    }`}
                    style={isActive ? { background: "hsl(var(--primary) / 0.1)" } : undefined}
                  >
                    {isComplete ? (
                      <CheckCircle2 size={22} className="text-emerald-400" />
                    ) : isActive ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      >
                        <Loader2 size={20} className="text-primary" />
                      </motion.div>
                    ) : (
                      <Icon size={20} />
                    )}
                  </div>
                </div>

                {/* Label */}
                <div className="text-center">
                  <p className={`text-xs font-semibold transition-colors duration-300 ${isComplete || isActive ? "text-foreground" : "text-muted-foreground"}`}>
                    {step.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{step.sub}</p>
                </div>
              </div>

              {/* Connecting line */}
              {i < STEPS.length - 1 && (
                <div className="relative w-8 h-0.5 bg-border mx-1 -mt-8">
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ background: "hsl(var(--primary))" }}
                    initial={{ width: 0 }}
                    animate={{ width: isComplete ? "100%" : "0%" }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile vertical */}
      <div className="flex md:hidden flex-col gap-0 items-start max-w-xs mx-auto">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const isComplete = activeStep > step.id;
          const isActive = activeStep === step.id;

          return (
            <div key={step.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-500 flex-shrink-0 ${
                  isComplete ? "bg-emerald-950/60 border-emerald-500 text-emerald-400" : isActive ? "border-primary text-primary" : "bg-secondary border-border text-muted-foreground"
                }`}>
                  {isComplete ? <CheckCircle2 size={16} /> : isActive ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2 size={14} className="text-primary" />
                    </motion.div>
                  ) : <Icon size={16} />}
                </div>
                {i < STEPS.length - 1 && (
                  <div className="w-0.5 h-8 bg-border relative overflow-hidden">
                    <motion.div className="absolute inset-x-0 top-0 bg-primary" initial={{ height: 0 }} animate={{ height: isComplete ? "100%" : "0%" }} transition={{ duration: 0.4 }} />
                  </div>
                )}
              </div>
              <div className="pb-6">
                <p className={`text-xs font-semibold mt-2 ${isComplete || isActive ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</p>
                <p className="text-[10px] text-muted-foreground">{step.sub}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}