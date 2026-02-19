import { ClinicalMode } from "@/lib/mockData";
import { Stethoscope, User } from "lucide-react";

interface NavbarProps {
  clinicalMode: ClinicalMode;
  onToggleMode: () => void;
}

export function Navbar({ clinicalMode, onToggleMode }: NavbarProps) {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50" style={{ background: "hsl(var(--background) / 0.85)", backdropFilter: "blur(16px)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "hsl(var(--primary) / 0.15)", border: "1px solid hsl(var(--primary) / 0.3)" }}>
            <span className="text-primary text-sm font-bold">Rx</span>
          </div>
          <span className="font-bold text-foreground tracking-tight">
            Pharma<span className="text-primary">Guard</span>
          </span>
        </div>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-6">
          {[
            { label: "Analyze", id: "input-section" },
            { label: "Results", id: "results-section" },
            { label: "Documentation", id: "docs" },
            { label: "About", id: "about" },
          ].map(({ label, id }) => (
            <button
              key={label}
              onClick={() => scrollTo(id)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {label}
            </button>
          ))}
        </nav>

        {/* Clinical Mode Toggle */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center rounded-full p-1 gap-1" style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))" }}>
            <button
              onClick={() => clinicalMode !== "doctor" && onToggleMode()}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${clinicalMode === "doctor" ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              style={clinicalMode === "doctor" ? { background: "hsl(var(--primary))" } : undefined}
            >
              <Stethoscope size={12} />
              Doctor
            </button>
            <button
              onClick={() => clinicalMode !== "patient" && onToggleMode()}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${clinicalMode === "patient" ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              style={clinicalMode === "patient" ? { background: "hsl(var(--primary))" } : undefined}
            >
              <User size={12} />
              Patient
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
