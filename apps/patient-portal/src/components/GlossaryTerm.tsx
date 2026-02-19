import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface GlossaryTermProps {
  term: string;
  definition: string;
  children: React.ReactNode;
}

export function GlossaryTerm({ term, definition, children }: GlossaryTermProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1 group cursor-help">
            {children}
            <Info size={12} className="text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div>
            <h4 className="font-semibold">{term}</h4>
            <p className="text-xs mt-1">{definition}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Predefined terms commonly used in pharmacogenomics
export function PGxTerm({ type, children }: { type: 'diplotype' | 'phenotype' | 'metabolizer' | 'allele' | 'genotype' | 'haplotype'; children?: React.ReactNode }) {
  const terms: Record<string, { term: string; definition: string }> = {
    diplotype: {
      term: 'Diplotype',
      definition: 'A combination of two haplotypes (one from each chromosome) that represents the complete genetic makeup for a specific gene, expressed as two allele names separated by a slash (e.g., *1/*3).'
    },
    phenotype: {
      term: 'Phenotype',
      definition: 'The observable characteristics of drug metabolism capacity based on genetic variants, typically classified as Poor, Intermediate, Normal, Rapid, or Ultrarapid Metabolizer.'
    },
    metabolizer: {
      term: 'Metabolizer Status',
      definition: 'Classification of drug metabolism capacity based on genetic variants, indicating how efficiently a person processes specific medications (e.g., Poor vs. Ultrarapid Metabolizer).'
    },
    allele: {
      term: 'Allele',
      definition: 'A specific variant of a gene, designated by star nomenclature (e.g., CYP2D6*1, CYP2D6*4) representing different functional capacities.'
    },
    genotype: {
      term: 'Genotype',
      definition: 'The genetic constitution of an individual, specifically the combination of alleles present at a particular gene locus.'
    },
    haplotype: {
      term: 'Haplotype',
      definition: 'A group of alleles that are inherited together on the same chromosome, representing one of the two copies of a gene.'
    }
  };

  const termInfo = terms[type];
  
  if (children) {
    return (
      <GlossaryTerm term={termInfo.term} definition={termInfo.definition}>
        {children}
      </GlossaryTerm>
    );
  }

  return (
    <GlossaryTerm term={termInfo.term} definition={termInfo.definition}>
      <span className="font-medium text-primary">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
    </GlossaryTerm>
  );
}