import { motion } from "framer-motion";
import { mockResult, getRiskHex, RiskLevel } from "@/lib/mockData";
import { EvidenceBadges } from "@/components/EvidenceBadges";
import { AlertTriangle, TrendingDown, CheckCircle2, HelpCircle, Zap } from "lucide-react";

const riskIcons: Record<RiskLevel, React.ElementType> = {
  Toxic: AlertTriangle,
  Ineffective: TrendingDown,
  "Adjust Dosage": Zap,
  Safe: CheckCircle2,
  Unknown: HelpCircle,
};

export function RiskComparisonTable() {
  return (
    <motion.div
      className="glass-card rounded-2xl p-6 space-y-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
    >
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1">Multi-Drug Comparison</p>
        <h3 className="text-lg font-bold">Risk Overview</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Side-by-side pharmacogenomic risk for all analyzed medications</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {mockResult.allDrugs.map((drug, i) => {
          const hex = getRiskHex(drug.risk);
          const Icon = riskIcons[drug.risk];
          return (
            <motion.div
              key={drug.drug}
              className="rounded-xl p-4 space-y-3 border"
              style={{ background: "hsl(var(--secondary) / 0.6)", borderColor: `${hex}30` }}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.07 }}
            >
              {/* Drug name + risk */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-bold tracking-wider" style={{ color: hex }}>{drug.drug}</p>
                  <p className="text-[11px] text-muted-foreground">{drug.gene}</p>
                </div>
                <div className="flex items-center gap-1 rounded-lg px-2.5 py-1 flex-shrink-0" style={{ background: `${hex}18`, border: `1px solid ${hex}35` }}>
                  <Icon size={12} style={{ color: hex }} />
                  <span className="text-[11px] font-semibold" style={{ color: hex }}>{drug.risk}</span>
                </div>
              </div>

              {/* Phenotype + diplotype */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-border" style={{ background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" }}>
                  {drug.phenotype}
                </span>
                <span className="text-[11px] text-muted-foreground font-mono">{drug.diplotype}</span>
              </div>

              {/* Confidence bar mini */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-muted-foreground">Confidence</span>
                  <span className="font-medium" style={{ color: hex }}>{drug.confidence}%</span>
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ background: "hsl(var(--border))" }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: hex }}
                    initial={{ width: 0 }}
                    animate={{ width: `${drug.confidence}%` }}
                    transition={{ duration: 0.8, delay: 0.2 + i * 0.1, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Clinical note */}
              <p className="text-[11px] text-muted-foreground leading-relaxed">{drug.clinicalNote}</p>

              {/* Evidence mini badges */}
              <EvidenceBadges sources={drug.evidence} size="sm" />
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
