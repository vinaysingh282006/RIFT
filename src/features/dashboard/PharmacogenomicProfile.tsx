import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClinicalMode, mockResult } from "@/lib/mockData";
import { ChevronDown, ChevronUp } from "lucide-react";

interface PharmacogenomicProfileProps {
  mode: ClinicalMode;
}

const doctorVariantInfo = {
  intro: "CYP2D6 *4/*4 homozygous loss-of-function diplotype. Complete absence of functional CYP2D6 enzyme activity (activity score: 0). Phenotype classification: Poor Metabolizer (PM) per CPIC Activity Score Table.",
  extra: "The *4 allele (rs3892097, c.1846G>A) results in defective mRNA splicing, generating a nonfunctional protein. Frequency: ~7% in European populations. Clinically significant interactions with >25% of commonly prescribed drugs.",
};

const patientVariantInfo = {
  intro: "Your DNA has a change in the CYP2D6 gene that means your body processes certain medications more slowly than normal — or not at all for some drugs.",
  extra: "This is a naturally occurring genetic difference shared by about 7 in 100 people. It's not harmful by itself, but it means some medications need to be adjusted or avoided for your safety.",
};

export function PharmacogenomicProfile({ mode }: PharmacogenomicProfileProps) {
  const [expanded, setExpanded] = useState(false);
  const { primaryDrug, variants } = mockResult;
  const info = mode === "doctor" ? doctorVariantInfo : patientVariantInfo;

  return (
    <motion.div
      className="glass-card rounded-2xl p-6 space-y-5 h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1">Pharmacogenomic Profile</p>
        <h3 className="text-lg font-bold">Gene Analysis</h3>
      </div>

      {/* Gene cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Gene", value: primaryDrug.gene },
          { label: "Diplotype", value: primaryDrug.diplotype },
          { label: "Phenotype", value: primaryDrug.phenotype },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl p-3 text-center border border-border" style={{ background: "hsl(var(--secondary))" }}>
            <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider">{label}</p>
            <p className="text-sm font-bold font-mono text-foreground">{value}</p>
          </div>
        ))}
      </div>

      {/* Interpretation */}
      <div className="rounded-xl p-4 border border-border" style={{ background: "hsl(var(--secondary))" }}>
        <p className="text-xs text-muted-foreground mb-1.5 font-medium">
          {mode === "doctor" ? "Clinical Interpretation" : "What this means for you"}
        </p>
        <p className="text-sm leading-relaxed text-foreground/85">{info.intro}</p>
      </div>

      {/* Variants table */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Detected Variants</p>
        <div className="rounded-xl overflow-hidden border border-border">
          {variants.slice(0, 3).map((v, i) => (
            <div key={v.rsid} className={`flex items-center gap-3 px-4 py-2.5 text-xs ${i > 0 ? "border-t border-border" : ""}`} style={{ background: i % 2 === 0 ? "hsl(var(--secondary))" : "transparent" }}>
              <span className="font-mono text-primary w-24 flex-shrink-0">{v.rsid}</span>
              <span className="text-muted-foreground flex-1">{v.gene}</span>
              <span className="text-foreground/70">{mode === "doctor" ? v.effect : v.zygosity}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Expandable */}
      <button
        onClick={() => setExpanded((s) => !s)}
        className="flex items-center gap-1.5 text-xs text-primary hover:opacity-80 transition-opacity font-medium"
      >
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        {expanded ? "Show less" : "View full technical details"}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            className="rounded-xl p-4 border border-border text-sm leading-relaxed text-foreground/80"
            style={{ background: "hsl(var(--secondary))" }}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {info.extra}
            {mode === "doctor" && (
              <div className="mt-3 space-y-1">
                {variants.slice(3).map((v) => (
                  <div key={v.rsid} className="flex gap-3 text-xs text-muted-foreground">
                    <span className="font-mono text-primary">{v.rsid}</span>
                    <span>{v.gene}</span>
                    <span>{v.effect}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
