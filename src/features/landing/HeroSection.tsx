import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowDown, Dna, ShieldCheck, Zap } from "lucide-react";

interface HeroSectionProps {
  onStartAnalysis: () => void;
}

export function HeroSection({ onStartAnalysis }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: "hsl(var(--primary))" }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-8 blur-3xl" style={{ background: "hsl(200 85% 55%)" }} />
      </div>

      <motion.div
        className="relative z-10 max-w-4xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Pill label */}
        <motion.div
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium mb-6 border"
          style={{ background: "hsl(var(--primary) / 0.08)", borderColor: "hsl(var(--primary) / 0.25)", color: "hsl(var(--primary))" }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Dna size={12} />
          RIFT 2026 · Precision Medicine Track
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Pharma
          <span style={{ color: "hsl(var(--primary))" }}>Guard</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-lg sm:text-xl font-medium text-foreground/80 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          AI-Powered Precision Medicine Using Pharmacogenomics
        </motion.p>

        {/* Description */}
        <motion.p
          className="text-base text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Upload your patient's VCF genetic file and specify medications to receive evidence-based pharmacogenomic risk predictions — powered by CPIC guidelines and PharmGKB variant data.
        </motion.p>

        {/* Feature chips */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {[
            { icon: ShieldCheck, text: "CPIC Guideline Backed" },
            { icon: Dna, text: "CYP450 Gene Analysis" },
            { icon: Zap, text: "Real-time Risk Scoring" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-1.5 text-xs text-muted-foreground rounded-full px-3 py-1.5" style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))" }}>
              <Icon size={12} className="text-primary" />
              {text}
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Button
            onClick={onStartAnalysis}
            size="lg"
            className="text-base px-8 py-6 font-semibold rounded-xl transition-all duration-300 hover:scale-105"
            style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
          >
            Start Analysis
            <ArrowDown size={18} className="ml-2 animate-bounce" />
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
