import { useState, useEffect, useRef } from "react";
import { ClinicalMode } from "@/lib/mockData";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { InputSection } from "@/components/InputSection";
import { AnalysisPipeline } from "@/components/AnalysisPipeline";
import { ResultsDashboard } from "@/components/ResultsDashboard";
import { Footer } from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { parseVCFFile, ParsedVCF } from "@/ml/parsers/vcfParser";
import { analyzeRisk } from "@/ml/engine/riskModel";
import { DrugRisk } from "@/lib/mockData";

const PIPELINE_STEPS = 5;
const STEP_DELAY = 600; // ms per step

const Index = () => {
  const [clinicalMode, setClinicalMode] = useState<ClinicalMode>("doctor");
  const [analysisState, setAnalysisState] = useState<"idle" | "pipeline" | "results">("idle");
  const [analysisResults, setAnalysisResults] = useState<{ vcf: ParsedVCF; risks: DrugRisk[] } | null>(null);
  const [pipelineStep, setPipelineStep] = useState(0);
  const resultsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);

  const handleStartAnalysis = () => {
    inputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleRunAnalysis = async (file: File, drugs: string[]) => {
    setAnalysisState("pipeline");
    setPipelineStep(0);
    window.scrollTo({ top: document.body.scrollHeight / 2, behavior: "smooth" });

    try {
      // Step 1: Parse
      setPipelineStep(1);
      const vcf = await parseVCFFile(file);

      // Step 2: Analyze
      setTimeout(() => setPipelineStep(2), 500);
      const risks = await analyzeRisk(vcf, drugs);

      // Step 3-5: Artificial delay for UX (showing the pipeline steps)
      setTimeout(() => setPipelineStep(3), 1500);
      setTimeout(() => setPipelineStep(4), 2500);

      setTimeout(() => {
        setAnalysisResults({ vcf, risks });
        setAnalysisState("results");
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 200);
      }, 3500);

    } catch (err) {
      console.error(err);
      alert("Analysis failed: " + err);
      setAnalysisState("idle");
    }
  };

  const toggleMode = () => setClinicalMode((m) => (m === "doctor" ? "patient" : "doctor"));

  return (
    <div className="min-h-screen bg-background">
      <Navbar clinicalMode={clinicalMode} onToggleMode={toggleMode} />

      <main>
        {/* Hero */}
        <HeroSection onStartAnalysis={handleStartAnalysis} />

        {/* Input */}
        <div ref={inputRef}>
          <InputSection onRunAnalysis={handleRunAnalysis} isAnalyzing={analysisState === "pipeline"} />
        </div>

        {/* Pipeline animation */}
        <AnimatePresence>
          {(analysisState === "pipeline" || analysisState === "results") && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="py-4 px-4 max-w-5xl mx-auto"
            >
              <div className="glass-card rounded-2xl">
                <AnalysisPipeline activeStep={pipelineStep} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {analysisState === "results" && (
            <motion.div
              ref={resultsRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <ResultsDashboard
                mode={clinicalMode}
                onToggleMode={toggleMode}
                results={analysisResults}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
