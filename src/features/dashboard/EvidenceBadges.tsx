import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BookOpen, Database, ShieldCheck } from "lucide-react";

interface EvidenceBadgesProps {
  sources: ("cpic" | "pharmgkb" | "fda")[];
  size?: "default" | "sm";
}

export function EvidenceBadges({ sources, size = "default" }: EvidenceBadgesProps) {
  const evidenceInfo = {
    cpic: {
      label: "CPIC",
      icon: BookOpen,
      description: "Clinical Pharmacogenetics Implementation Consortium Guideline",
      color: "bg-blue-500/10 text-blue-600 border-blue-500/30",
    },
    pharmgkb: {
      label: "PharmGKB",
      icon: Database,
      description: "Pharmacogenomics Knowledge Base Evidence Level",
      color: "bg-purple-500/10 text-purple-600 border-purple-500/30",
    },
    fda: {
      label: "FDA",
      icon: ShieldCheck,
      description: "US Food and Drug Administration Pharmacogenomic Labeling",
      color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
    },
  };

  return (
    <div className="flex items-center gap-1">
      {sources.map((type) => {
        const Info = evidenceInfo[type];
        const Icon = Info.icon;
        
        return (
          <TooltipProvider key={type} delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                    Info.color
                  } ${size === "sm" ? "text-xs px-2 py-0.5" : "text-xs px-2.5 py-1"}`}
                >
                  <Icon size={size === "sm" ? 12 : 14} className="mr-1" />
                  {Info.label}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{Info.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );
}