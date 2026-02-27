import { motion } from "framer-motion";
import { mockResult } from "@/lib/mockData";
import { CheckCircle2, AlertCircle } from "lucide-react";

export function QualityMetrics() {
  const { vcfMetrics } = mockResult;

  const metrics = [
    { label: "Total Variants", value: vcfMetrics.totalVariants.toLocaleString(), note: "Parsed from VCF" },
    { label: "Annotated Variants", value: vcfMetrics.annotated.toLocaleString(), note: `${((vcfMetrics.annotated / vcfMetrics.totalVariants) * 100).toFixed(1)}% annotation rate` },
    { label: "Mean Coverage", value: "42x", note: "Sufficient for PGx analysis" },
    { label: "Data Quality Score", value: `${vcfMetrics.quality}%`, note: "Excellent" },
  ];

  const bars = [
    { label: "Data Completeness", value: vcfMetrics.coverage },
    { label: "Annotation Rate", value: Math.round((vcfMetrics.annotated / vcfMetrics.totalVariants) * 100) },
    { label: "VCF Quality Score", value: vcfMetrics.quality },
  ];

  return (
    <motion.div
      className="glass-card rounded-2xl p-6 space-y-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1">Quality Metrics</p>
        <h3 className="text-base font-bold">VCF Analysis Summary</h3>
      </div>

      {/* Parse status */}
      <div className="flex items-center gap-2 rounded-xl px-4 py-3 border" style={{ background: "hsl(var(--risk-safe-bg))", borderColor: "hsl(var(--risk-safe) / 0.3)" }}>
        <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
        <p className="text-sm font-medium text-emerald-400">VCF Parsing Successful</p>
        <span className="ml-auto text-[11px] text-muted-foreground">VCFv4.2</span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {metrics.map(({ label, value, note }) => (
          <div key={label} className="rounded-xl p-3 border border-border" style={{ background: "hsl(var(--secondary))" }}>
            <p className="text-[10px] text-muted-foreground mb-0.5 uppercase tracking-wider">{label}</p>
            <p className="text-sm font-bold font-mono text-foreground">{value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{note}</p>
          </div>
        ))}
      </div>

      {/* Progress bars */}
      <div className="space-y-3">
        {bars.map(({ label, value }, i) => (
          <div key={label} className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-medium text-foreground">{value}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "hsl(var(--border))" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: "hsl(var(--primary))" }}
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 0.8, delay: 0.2 + i * 0.1, ease: "easeOut" }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
