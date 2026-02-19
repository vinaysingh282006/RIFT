import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { mockJsonOutput } from "@/lib/mockData";
import { Copy, Download, ChevronDown, ChevronUp, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function JsonOutputPanel() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const jsonString = JSON.stringify(mockJsonOutput, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pharmaguard-analysis.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      className="glass-card rounded-2xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-0.5">JSON Output</p>
          <h3 className="text-base font-bold">Downloadable Analysis Report</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="text-xs gap-1.5 border-border"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            {copied ? "Copied!" : "Copy"}
          </Button>
          <Button
            size="sm"
            onClick={handleDownload}
            className="text-xs gap-1.5"
            style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
          >
            <Download size={13} />
            Download JSON
          </Button>
          <button
            onClick={() => setOpen((s) => !s)}
            className="text-muted-foreground hover:text-foreground transition-colors ml-1"
          >
            {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* Collapsible JSON viewer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <pre
              className="p-6 overflow-x-auto text-xs leading-relaxed font-mono"
              style={{ background: "hsl(222 47% 4%)", color: "hsl(210 40% 85%)", maxHeight: "480px", overflowY: "auto" }}
            >
              <JsonHighlight json={jsonString} />
            </pre>
          </motion.div>
        )}
      </AnimatePresence>

      {!open && (
        <div className="px-6 py-3 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Analysis ID: <span className="font-mono text-foreground/70">{mockJsonOutput.analysis_id}</span></span>
          <span className="text-border mx-2">·</span>
          <span className="text-xs text-muted-foreground">{mockJsonOutput.pharmacogenomic_results.length} drugs analyzed</span>
          <button onClick={() => setOpen(true)} className="ml-auto text-xs text-primary hover:opacity-80 transition-opacity font-medium">View JSON →</button>
        </div>
      )}
    </motion.div>
  );
}

function JsonHighlight({ json }: { json: string }) {
  const parts = json.split(/("(?:[^"\\]|\\.)*":\s?|"(?:[^"\\]|\\.)*"|true|false|null|-?\d+\.?\d*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (/"[^"]*":\s?$/.test(part) || /"[^"]*":$/.test(part.trim())) {
          return <span key={i} style={{ color: "hsl(200 85% 65%)" }}>{part}</span>;
        } else if (/^"[^"]*"$/.test(part)) {
          return <span key={i} style={{ color: "hsl(142 71% 55%)" }}>{part}</span>;
        } else if (/^(true|false)$/.test(part)) {
          return <span key={i} style={{ color: "hsl(28 90% 65%)" }}>{part}</span>;
        } else if (/^-?\d+\.?\d*$/.test(part)) {
          return <span key={i} style={{ color: "hsl(38 92% 65%)" }}>{part}</span>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
