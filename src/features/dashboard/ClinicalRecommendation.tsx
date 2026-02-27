import { motion } from "framer-motion";
import { ClinicalMode, mockResult } from "@/lib/mockData";
import { EvidenceBadges } from "@/features/dashboard/EvidenceBadges";
import { FileText, Pill, ArrowRight } from "lucide-react";

interface ClinicalRecommendationProps {
  mode: ClinicalMode;
}

const doctorContent = {
  title: "Pharmacogenomic Prescribing Recommendation",
  primary: "CONTRAINDICATED: Avoid codeine administration in CYP2D6 Poor Metabolizer (*4/*4 genotype). Patient is at significant risk for opioid toxicity due to absent CYP2D6 enzymatic activity.",
  alternative: "Alternative: Consider tramadol (use with caution — partial CYP2D6 dependency), morphine (standard dosing, no CYP2D6 metabolism), or non-opioid analgesics (NSAIDs, acetaminophen) as clinically appropriate.",
  warfarin: "For warfarin (CYP2C9 *1/*3): Initiate at 25–30% reduced dose. Target INR 2.0–3.0. Recheck coagulation status within 3–5 days of initiation. Consider VKORC1 genotype in final dose calculation.",
  note: "Reference: CPIC Guideline for Codeine and CYP2D6 (2014, updated 2022). Evidence Level: A.",
};

const patientContent = {
  title: "Your Medication Safety Summary",
  primary: "Based on your DNA results, codeine (a common pain medication) could be dangerous for you. Your body cannot process it properly, which may cause serious side effects.",
  alternative: "Safer options: Your doctor should consider different pain medications that work better with your genetic makeup. Please do not take codeine without first talking to your doctor.",
  warfarin: "For your blood thinner (warfarin): You may need a lower starting dose than average. Your doctor will check how your blood is responding within a few days of starting.",
  note: "This report is based on internationally recognized medical guidelines. Always consult your healthcare provider before changing any medications.",
};

export function ClinicalRecommendation({ mode }: ClinicalRecommendationProps) {
  const content = mode === "doctor" ? doctorContent : patientContent;

  return (
    <motion.div
      className="glass-card rounded-2xl p-7 space-y-5 h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1">Clinical Recommendation</p>
          <h3 className="text-lg font-bold leading-tight">{content.title}</h3>
        </div>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "hsl(var(--primary) / 0.1)", border: "1px solid hsl(var(--primary) / 0.25)" }}>
          <FileText size={20} className="text-primary" />
        </div>
      </div>

      <div className="space-y-3">
        {/* Primary rec */}
        <div className="rounded-xl p-4 border" style={{ background: "hsl(var(--risk-toxic-bg))", borderColor: "hsl(var(--risk-toxic) / 0.3)" }}>
          <div className="flex gap-2 items-start">
            <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: "hsl(var(--risk-toxic))" }} />
            <p className="text-sm leading-relaxed text-foreground/90">{content.primary}</p>
          </div>
        </div>

        {/* Alternative */}
        <div className="rounded-xl p-4 border border-border" style={{ background: "hsl(var(--secondary))" }}>
          <div className="flex items-start gap-2">
            <Pill size={14} className="text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm leading-relaxed text-foreground/80">{content.alternative}</p>
          </div>
        </div>

        {/* Warfarin note */}
        <div className="rounded-xl p-4 border border-border" style={{ background: "hsl(var(--secondary))" }}>
          <div className="flex items-start gap-2">
            <ArrowRight size={14} className="text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-sm leading-relaxed text-foreground/80">{content.warfarin}</p>
          </div>
        </div>
      </div>

      {/* Footer note */}
      <p className="text-[11px] text-muted-foreground italic leading-relaxed border-t border-border pt-4">
        {content.note}
      </p>

      {mode === "doctor" && (
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Evidence Sources</p>
          <EvidenceBadges sources={mockResult.primaryDrug.evidence} size="sm" />
        </div>
      )}
    </motion.div>
  );
}
