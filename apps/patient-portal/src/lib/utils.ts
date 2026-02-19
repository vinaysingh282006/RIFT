import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Biological explanation generation functions
export function generateBiologicalExplanation(variant: {
  rsid: string;
  gene: string;
  zygosity: string;
  genotype: string;
  effect: string;
}, drug: string): string {
  // Define biological pathways for key gene-drug interactions
  const pathways: Record<string, Record<string, string>> = {
    CYP2D6: {
      CODEINE: `Variant ${variant.rsid} in CYP2D6 gene affects enzyme activity. CYP2D6 normally converts codeine to morphine via O-demethylation. The ${variant.effect} variant results in ${variant.zygosity} status, leading to altered enzyme function. Poor metabolizers have negligible conversion to active morphine, resulting in inadequate analgesia, while Ultra-rapid metabolizers produce excessive morphine causing potential toxicity.`,
      TAMOXIFEN: `CYP2D6 mediates conversion of tamoxifen to its active metabolite endoxifen. This variant impairs activation, reducing therapeutic efficacy in heterozygotes and near-complete loss in homozygotes.`
    },
    CYP2C9: {
      WARFARIN: `Variant in CYP2C9 affects S-warfarin metabolism. The enzyme normally catalyzes hydroxylation of S-warfarin, the more potent enantiomer. Reduced function leads to decreased clearance and prolonged anticoagulant effect, increasing bleeding risk at standard doses.`
    },
    CYP2C19: {
      CLOPIDOGREL: `CYP2C19 activates clopidogrel from prodrug to active metabolite. The loss-of-function variant results in reduced formation of active thiol derivative, impairing platelet inhibition and increasing cardiovascular event risk.`
    },
    SLCO1B1: {
      SIMVASTATIN: `SLCO1B1 encodes an organic anion transporting polypeptide that mediates hepatic uptake of statins. The variant reduces transporter activity, increasing systemic exposure and myopathy/myositis risk with high-dose statin therapy.`
    },
    TPMT: {
      AZATHIOPRINE: `TPMT inactivates thiopurines via S-methylation. Reduced function variants increase levels of active thioguanine nucleotides, predisposing to severe myelotoxicity including leukopenia and pancytopenia.`
    },
    DPYD: {
      FLUOROURACIL: `DPYD catabolizes 5-fluorouracil and capecitabine. Loss-of-function variants decrease drug clearance, leading to excessive exposure and severe toxicity including neutropenia, thrombocytopenia, and neurotoxicity.`
    }
  };

  const genePathway = pathways[variant.gene];
  if (genePathway && genePathway[drug.toUpperCase()]) {
    return genePathway[drug.toUpperCase()];
  }

  // Fallback explanation
  return `The ${variant.rsid} variant in ${variant.gene} gene affects protein function. This impacts ${drug} metabolism through altered enzyme activity, leading to modified clinical effects. The ${variant.zygosity} genotype (${variant.genotype}) results in ${variant.effect} with clinical implications for dosing and safety.`;
}

export function getPhenotypePrediction(gene: string, diplotype: string): string {
  // Define diplotype to phenotype mappings
  const phenotypeRules: Record<string, Record<string, string>> = {
    CYP2D6: {
      '*4/*4': 'Poor Metabolizer (PM)',
      '*4/*5': 'Poor Metabolizer (PM)',
      '*5/*5': 'Poor Metabolizer (PM)',
      '*1/*1': 'Normal Metabolizer (NM)',
      '*1/*2': 'Normal Metabolizer (NM)',
      '*1/*3': 'Intermediate Metabolizer (IM)',
      '*1/*4': 'Intermediate Metabolizer (IM)',
      '*1/*5': 'Normal Metabolizer (NM)',
      '*2/*2': 'Normal Metabolizer (NM)',
      '*2/*3': 'Intermediate Metabolizer (IM)',
      '*2/*4': 'Intermediate Metabolizer (IM)',
      '*2/*5': 'Normal Metabolizer (NM)',
      '*3/*3': 'Poor Metabolizer (PM)',
      '*3/*4': 'Poor Metabolizer (PM)',
      '*3/*5': 'Intermediate Metabolizer (IM)',
      '*4/*10': 'Intermediate Metabolizer (IM)',
      '*5/*xN': 'Poor Metabolizer (PM)',
      '*1/*xN': 'Ultrarapid Metabolizer (UM)',
      '*xN/*xN': 'Ultrarapid Metabolizer (UM)'
    },
    CYP2C19: {
      '*1/*1': 'Normal Metabolizer (NM)',
      '*1/*2': 'Intermediate Metabolizer (IM)',
      '*1/*3': 'Poor Metabolizer (PM)',
      '*2/*2': 'Poor Metabolizer (PM)',
      '*2/*3': 'Poor Metabolizer (PM)',
      '*3/*3': 'Poor Metabolizer (PM)',
      '*1/*17': 'Rapid Metabolizer (RM)',
      '*17/*17': 'Ultrarapid Metabolizer (UM)',
      '*1/*xN': 'Rapid Metabolizer (RM)',
      '*xN/*xN': 'Ultrarapid Metabolizer (UM)'
    },
    CYP2C9: {
      '*1/*1': 'Normal Metabolizer (NM)',
      '*1/*2': 'Intermediate Metabolizer (IM)',
      '*1/*3': 'Intermediate Metabolizer (IM)',
      '*2/*2': 'Intermediate Metabolizer (IM)',
      '*2/*3': 'Poor Metabolizer (PM)',
      '*3/*3': 'Poor Metabolizer (PM)'
    }
  };

  if (phenotypeRules[gene] && phenotypeRules[gene][diplotype]) {
    return phenotypeRules[gene][diplotype];
  }

  return 'Indeterminate';
}

export function getConfidenceScore(variantCount: number, annotationQuality: number, guidelineAvailability: number): number {
  // Calculate confidence based on multiple factors
  const variantFactor = Math.min(100, (variantCount / 5) * 20); // Up to 100 for 5+ variants
  const annotationFactor = annotationQuality;
  const guidelineFactor = guidelineAvailability * 100;
  
  // Weighted average with emphasis on annotation and guidelines
  return Math.round((variantFactor * 0.2) + (annotationFactor * 0.4) + (guidelineFactor * 0.4));
}

export interface PhenotypeReasoning {
  variantCoverage: number;
  confidenceJustification: string;
  annotationReliability: number;
  completenessScore: number;
}

export function calculatePhenotypeReasoning(
  gene: string,
  variants: { rsid: string; gene: string; zygosity: string }[],
  expectedVariants: number
): PhenotypeReasoning {
  // Calculate variant coverage
  const detectedVariants = variants.filter(v => v.gene === gene).length;
  const variantCoverage = Math.min(100, (detectedVariants / expectedVariants) * 100);

  // Calculate annotation reliability (based on zygosity patterns and known variants)
  let reliableAnnotations = 0;
  variants.forEach(v => {
    if (v.zygosity !== 'Missing') {
      reliableAnnotations++;
    }
  });
  const annotationReliability = variants.length > 0 
    ? Math.round((reliableAnnotations / variants.length) * 100) 
    : 0;

  // Generate confidence justification
  let justification = '';
  if (variantCoverage >= 90) {
    justification = 'High variant coverage with comprehensive genotyping';
  } else if (variantCoverage >= 70) {
    justification = 'Moderate variant coverage with acceptable genotyping completeness';
  } else if (variantCoverage >= 50) {
    justification = 'Partial variant coverage - phenotype prediction may be limited';
  } else {
    justification = 'Low variant coverage - phenotype prediction uncertain';
  }

  // Calculate overall completeness score
  const completenessScore = Math.round((variantCoverage * 0.6) + (annotationReliability * 0.4));

  return {
    variantCoverage: Math.round(variantCoverage),
    confidenceJustification: justification,
    annotationReliability,
    completenessScore
  };
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}