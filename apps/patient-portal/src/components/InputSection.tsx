import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SUPPORTED_DRUGS } from "@/lib/mockData";

interface InputSectionProps {
  onRunAnalysis: (file: File, drugs: string[]) => void;
  isAnalyzing: boolean;
}

type UploadState = "idle" | "uploading" | "success" | "error";

export function InputSection({ onRunAnalysis, isAnalyzing }: InputSectionProps) {
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedDrugs, setSelectedDrugs] = useState<string[]>([]);
  const [drugInput, setDrugInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const filteredDrugs = SUPPORTED_DRUGS.filter(
    (d) => d.toLowerCase().includes(drugInput.toLowerCase()) && !selectedDrugs.includes(d)
  );

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith(".vcf")) {
      setFileError("Invalid file format. Please upload a .VCF (Variant Call Format v4.2) file.");
      setUploadState("error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFileError("File exceeds 5 MB limit. Please upload a smaller VCF file.");
      setUploadState("error");
      return;
    }
    setFileError(null);
    setUploadState("uploading");
    setFileName(file.name);
    setFile(file);
    setTimeout(() => setUploadState("success"), 800);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const addDrug = (drug: string) => {
    if (!selectedDrugs.includes(drug)) setSelectedDrugs((prev) => [...prev, drug]);
    setDrugInput("");
    setShowSuggestions(false);
  };

  const removeDrug = (drug: string) => setSelectedDrugs((prev) => prev.filter((d) => d !== drug));

  const canRun = uploadState === "success" && selectedDrugs.length > 0;

  return (
    <section id="input-section" className="py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <p className="text-center text-xs uppercase tracking-widest text-muted-foreground mb-3 font-medium">Step 1</p>
          <h2 className="text-3xl font-bold text-center mb-2">Upload & Configure</h2>
          <p className="text-center text-muted-foreground mb-10">Provide genetic data and select medications for pharmacogenomic analysis.</p>
        </motion.div>

        <div className="space-y-6">
          {/* VCF Upload */}
          <motion.div className="glass-card rounded-2xl p-6 space-y-4" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">VCF File Upload</h3>
              <span className="text-[10px] text-muted-foreground px-2 py-0.5 rounded-full border border-border">.VCF v4.2 · Max 5 MB</span>
            </div>

            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-10 flex flex-col items-center gap-3 cursor-pointer transition-all duration-300 ${isDragging ? "border-primary" : uploadState === "success" ? "border-emerald-500/50" : uploadState === "error" ? "border-destructive/50" : "border-border hover:border-primary/50"
                }`}
              style={{ background: isDragging ? "hsl(var(--primary) / 0.05)" : "hsl(var(--secondary) / 0.5)" }}
            >
              <input ref={fileRef} type="file" accept=".vcf" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />

              {uploadState === "success" ? (
                <>
                  <CheckCircle2 size={36} className="text-emerald-400" />
                  <p className="text-sm font-medium text-emerald-400">{fileName}</p>
                  <p className="text-xs text-muted-foreground">File validated successfully</p>
                </>
              ) : uploadState === "error" ? (
                <>
                  <AlertCircle size={36} className="text-destructive" />
                  <p className="text-sm font-medium text-destructive">Upload Failed</p>
                  <p className="text-xs text-muted-foreground text-center max-w-xs">{fileError}</p>
                  <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setUploadState("idle"); setFileError(null); }}>Try Again</Button>
                </>
              ) : uploadState === "uploading" ? (
                <>
                  <motion.div className="w-9 h-9 border-2 border-primary border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} />
                  <p className="text-sm text-muted-foreground">Validating file…</p>
                </>
              ) : (
                <>
                  <Upload size={36} className="text-muted-foreground" />
                  <p className="text-sm font-medium">Drag & drop your VCF file here</p>
                  <p className="text-xs text-muted-foreground">or click to browse</p>
                </>
              )}
            </div>
          </motion.div>

          {/* Drug Selector */}
          <motion.div className="glass-card rounded-2xl p-6 space-y-4" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
            <h3 className="font-semibold text-sm">Drug Selection</h3>
            <p className="text-xs text-muted-foreground">Select one or more medications from the supported list</p>

            {/* Chips */}
            {selectedDrugs.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedDrugs.map((drug) => (
                  <div key={drug} className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full" style={{ background: "hsl(var(--primary) / 0.12)", color: "hsl(var(--primary))", border: "1px solid hsl(var(--primary) / 0.25)" }}>
                    {drug}
                    <button onClick={() => removeDrug(drug)} className="hover:opacity-70 transition-opacity"><X size={12} /></button>
                  </div>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="relative">
              <Input
                placeholder="Search drugs (e.g. WARFARIN)…"
                value={drugInput}
                onChange={(e) => { setDrugInput(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                className="bg-secondary border-border"
              />
              <button onClick={() => setShowSuggestions((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showSuggestions ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              <AnimatePresence>
                {showSuggestions && filteredDrugs.length > 0 && (
                  <motion.div
                    className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-20 border border-border shadow-lg"
                    style={{ background: "hsl(var(--card))" }}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                  >
                    {filteredDrugs.map((drug) => (
                      <button
                        key={drug}
                        onMouseDown={() => addDrug(drug)}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-secondary transition-colors font-medium"
                      >
                        {drug}
                        <span className="ml-2 text-[10px] text-muted-foreground font-normal">Supported</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {selectedDrugs.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Supported: {SUPPORTED_DRUGS.join(", ")}
              </p>
            )}
          </motion.div>

          {/* Run Button */}
          <motion.div className="flex justify-center" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
            <Button
              onClick={() => file && onRunAnalysis(file, selectedDrugs)}
              disabled={!canRun || isAnalyzing}
              size="lg"
              className="px-10 py-6 text-base font-semibold rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{ background: canRun ? "hsl(var(--primary))" : undefined, color: canRun ? "hsl(var(--primary-foreground))" : undefined }}
            >
              {isAnalyzing ? (
                <><motion.div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} /> Analyzing…</>
              ) : "Run Analysis"}
            </Button>
          </motion.div>
          {!canRun && !isAnalyzing && (
            <p className="text-center text-xs text-muted-foreground">Upload a valid VCF file and select at least one drug to continue.</p>
          )}
        </div>
      </div>
    </section>
  );
}
