import { motion } from "framer-motion";
import { ClinicalMode } from "@/lib/mockData";
import { RiskAssessmentPanel } from "@/components/RiskAssessmentPanel";
import { ClinicalRecommendation } from "@/components/ClinicalRecommendation";
import { RiskComparisonTable } from "@/components/RiskComparisonTable";
import { PharmacogenomicProfile } from "@/components/PharmacogenomicProfile";
import { AIExplanation } from "@/components/AIExplanation";
import { QualityMetrics } from "@/components/QualityMetrics";
import { JsonOutputPanel } from "@/components/JsonOutputPanel";

import { ParsedVCF } from "@/ml/parsers/vcfParser";
import { DrugRisk } from "@/lib/mockData";

interface ResultsDashboardProps {
  mode: ClinicalMode;
  onToggleMode: () => void;
  results: { vcf: ParsedVCF; risks: DrugRisk[] } | null;
}

export function ResultsDashboard({ mode, onToggleMode, results }: ResultsDashboardProps) {
  return (
    <section id="results-section" className="py-10 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Section header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-2">Analysis Complete</p>
          <h2 className="text-3xl font-bold">Pharmacogenomic Results</h2>
          <p className="text-muted-foreground mt-2 text-sm">Evidence-based risk predictions for your patient's genetic profile</p>
        </motion.div>

        {/* TIER 1 — Primary Focus: full width 2-col grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <RiskAssessmentPanel drugRisk={results?.risks[0]} />
          <ClinicalRecommendation mode={mode} />
        </div>

        {/* TIER 2 — Multi-drug comparison (full width) */}
        <RiskComparisonTable />

        {/* TIER 2b — Profile + AI side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <PharmacogenomicProfile mode={mode} />
          <div className="space-y-5">
            <AIExplanation mode={mode} onToggleMode={onToggleMode} />
            <QualityMetrics />
          </div>
        </div>

        {/* TIER 3 — JSON Output (full width, collapsible) */}
        <JsonOutputPanel results={results} />
      </div>
    </section>
  );
}
