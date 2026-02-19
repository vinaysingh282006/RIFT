import { motion } from "framer-motion";
import { mockResult, getRiskHex, RiskLevel } from "@/lib/mockData";
import { EvidenceBadges } from "@/components/EvidenceBadges";
import { ConfidenceBar } from "@/components/ConfidenceBar";
import { AlertTriangle, TrendingDown, CheckCircle2, HelpCircle, Zap } from "lucide-react";

const riskIcons: Record<RiskLevel, React.ElementType> = {
  Toxic: AlertTriangle,
  Ineffective: TrendingDown,
  "Adjust Dosage": Zap,
  Safe: CheckCircle2,
  Unknown: HelpCircle,
};

export function RiskAssessmentPanel() {
  const { primaryDrug } = mockResult;
  const Icon = riskIcons[primaryDrug.risk];
  const hex = getRiskHex(primaryDrug.risk);

  return (
    <motion.div
      className="glass-card-primary rounded-2xl p-7 space-y-6 h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1">Risk Assessment</p>
          <h3 className="text-xl font-bold">{primaryDrug.drug}</h3>
          <p className="text-sm text-muted-foreground">Primary drug analysis</p>
        </div>
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${hex}18`, border: `1.5px solid ${hex}40` }}
        >
          <Icon size={26} style={{ color: hex }} />
        </div>
      </div>

      {/* Risk Badge */}
      <div className="flex items-center gap-4">
        <div
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 border"
          style={{ background: `${hex}15`, borderColor: `${hex}40`, color: hex }}
        >
          <Icon size={18} />
          <span className="font-bold text-lg tracking-tight">{primaryDrug.risk}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">Severity</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-4 h-1.5 rounded-full"
                style={{
                  background: primaryDrug.risk === "Toxic" || primaryDrug.risk === "Ineffective"
                    ? i <= 5 ? hex : "hsl(var(--border))"
                    : primaryDrug.risk === "Adjust Dosage"
                    ? i <= 3 ? hex : "hsl(var(--border))"
                    : i <= 1 ? hex : "hsl(var(--border))",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Confidence Bar */}
      <ConfidenceBar
        value={primaryDrug.confidence}
        variantEvidence={primaryDrug.variantEvidence}
        guidelineMatch={primaryDrug.guidelineMatch}
        dataCompleteness={primaryDrug.dataCompleteness}
      />

      {/* Evidence Badges */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Evidence Sources</p>
        <EvidenceBadges sources={primaryDrug.evidence} />
      </div>

      {/* Clinical note */}
      <div className="rounded-xl p-4" style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))" }}>
        <p className="text-xs text-muted-foreground mb-1 font-medium">Clinical Note</p>
        <p className="text-sm text-foreground/90 leading-relaxed">{primaryDrug.clinicalNote}</p>
      </div>
    </motion.div>
  );
}
