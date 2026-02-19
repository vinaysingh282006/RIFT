import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClinicalMode, DrugRisk } from "@/lib/mockData";
import { ChevronDown, ChevronUp, Stethoscope, User } from "lucide-react";
import { AIService } from "@/lib/aiService";

interface AIExplanationProps {
  mode: ClinicalMode;
  onToggleMode: () => void;
  results?: { vcf: any; risks: DrugRisk[] };
}

export function AIExplanation({ mode, onToggleMode, results }: AIExplanationProps) {
  const [expanded, setExpanded] = useState(false);
  const [explanation, setExplanation] = useState<string>("");
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const generateExplanation = async () => {
      setLoading(true);
      
      try {
        if (results && results.risks && results.risks.length > 0) {
          // Combine explanations for all drug risks
          const explanations = [];
          
          for (const drugRisk of results.risks) {
            const aiPrompt = {
              variant: { rsid: "example", chromosome: "1", position: 123456, ref: "A", alt: "G", info: {} } as any,
              drug: drugRisk.drug,
              gene: drugRisk.gene,
              diplotype: drugRisk.diplotype,
              phenotype: drugRisk.phenotype,
              clinicalMode: mode as 'doctor' | 'patient',
              evidenceSources: drugRisk.evidence,
              variantImpactScore: drugRisk.variantImpactScore,
              severityScore: drugRisk.severityScore,
              guidelineMatchPercentage: drugRisk.guidelineMatchPercentage,
              variantEvidence: drugRisk.variantEvidence,
              guidelineMatch: drugRisk.guidelineMatch,
              dataCompleteness: drugRisk.dataCompleteness
            };
            
            const aiResponse = await AIService.generateExplanation(aiPrompt);
            explanations.push(`${drugRisk.drug} (${drugRisk.gene}): ${aiResponse.explanation}`);
          }
          
          setExplanation(explanations.join('\n\n'));
        } else {
          // Fallback to original text if no results
          const fallbackText = mode === "doctor" 
            ? `CYP2D6 encodes a cytochrome P450 enzyme responsible for the oxidative metabolism of approximately 25% of clinically used drugs. The *4/*4 diplotype confers a Poor Metabolizer (PM) phenotype due to complete absence of functional enzyme activity (activity score = 0).

For codeine, which requires CYP2D6-mediated O-demethylation to its active metabolite morphine, PM status results in negligible analgesic effect and accumulation of the parent compound. This contrasts with ultra-rapid metabolizers, who produce toxic morphine concentrations.

For warfarin (CYP2C9 *1/*3), reduced S-warfarin hydroxylation increases anticoagulant exposure. Combined with the VKORC1 variant identified in this sample, initial dose reduction of 25–30% is recommended with close INR monitoring.

The CYP2C19 *2/*2 genotype results in absent enzyme activity, rendering clopidogrel's hepatic bioactivation pathway nonfunctional. Alternative P2Y12 inhibitors not requiring CYP2C19 metabolism (e.g., prasugrel, ticagrelor) are recommended.`
            : `Your DNA test shows that your body processes medications differently from most people. This happens because of a gene called CYP2D6, which acts like a "processing factory" for certain drugs.

Your genetic result means this factory isn't working at full capacity. For some medicines like codeine (a pain reliever), this means the medicine can't be converted into the form your body needs — so it either doesn't work well, or can cause unexpected side effects.

Your doctor has all this information and can choose medicines that will work safely and effectively with your specific genetics. This is what "precision medicine" means — tailoring your treatment to your unique genetic makeup.

The good news: there are plenty of alternative medications that will work well for you, and your doctor now has the information needed to prescribe them confidently.`;
          
          setExplanation(fallbackText);
        }
      } catch (error) {
        console.error("Error generating AI explanation:", error);
        const fallbackText = mode === "doctor" 
          ? "Unable to generate detailed explanation. Please review the pharmacogenomic results and consult clinical guidelines."
          : "There was an issue generating your personalized explanation. Please discuss your results with your healthcare provider.";
        setExplanation(fallbackText);
      } finally {
        setLoading(false);
      }
    };

    generateExplanation();
  }, [mode, results]);

  return (
    <motion.div
      className="glass-card rounded-2xl p-6 space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1">AI Explanation</p>
          <h3 className="text-base font-bold">Clinical Interpretation</h3>
        </div>

        {/* Mode toggle */}
        <div className="flex items-center rounded-full p-0.5 gap-0.5 flex-shrink-0" style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))" }}>
          <button
            onClick={() => mode !== "doctor" && onToggleMode()}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-300 ${mode === "doctor" ? "text-primary-foreground" : "text-muted-foreground"}`}
            style={mode === "doctor" ? { background: "hsl(var(--primary))" } : undefined}
          >
            <Stethoscope size={11} /> Doctor
          </button>
          <button
            onClick={() => mode !== "patient" && onToggleMode()}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-300 ${mode === "patient" ? "text-primary-foreground" : "text-muted-foreground"}`}
            style={mode === "patient" ? { background: "hsl(var(--primary))" } : undefined}
          >
            <User size={11} /> Patient
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="rounded-xl p-4 border border-border"
          style={{ background: "hsl(var(--secondary))" }}
        >
          {loading ? (
            <p className="text-sm leading-relaxed text-foreground/85">Generating explanation...</p>
          ) : (
            <p className="text-sm leading-relaxed text-foreground/85 whitespace-pre-line">
              {expanded ? explanation : explanation.split("\n")[0]}
            </p>
          )}
        </motion.div>
      </AnimatePresence>

      {!loading && (
        <button
          onClick={() => setExpanded((s) => !s)}
          className="flex items-center gap-1.5 text-xs text-primary hover:opacity-80 transition-opacity font-medium"
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {expanded ? "Collapse" : "Read full explanation"}
        </button>
      )}
    </motion.div>
  );
}
