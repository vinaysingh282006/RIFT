import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

interface ConfidenceBarProps {
  value: number;
  variantEvidence: number;
  guidelineMatch: number;
  dataCompleteness: number;
}

export function ConfidenceBar({ value, variantEvidence, guidelineMatch, dataCompleteness }: ConfidenceBarProps) {
  const getColor = (v: number) =>
    v >= 90 ? "hsl(var(--risk-safe))" : v >= 75 ? "hsl(var(--risk-adjust))" : "hsl(var(--risk-toxic))";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-foreground/80">Confidence Score</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-muted-foreground hover:text-primary transition-colors">
                <Info size={14} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="w-72 p-4 space-y-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Based on variant evidence strength, guideline agreement, and data completeness.
              </p>
              <div className="space-y-2.5">
                {[
                  { label: "Variant Evidence", value: variantEvidence },
                  { label: "Guideline Match", value: guidelineMatch },
                  { label: "Data Completeness", value: dataCompleteness },
                ].map(({ label, value: v }) => (
                  <div key={label} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium" style={{ color: getColor(v) }}>{v}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${v}%`, background: getColor(v) }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
        <span className="text-lg font-bold" style={{ color: getColor(value) }}>{value}%</span>
      </div>

      <div className="relative h-3 rounded-full bg-secondary overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, hsl(var(--primary)), ${getColor(value)})` }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
        />
      </div>
    </div>
  );
}
