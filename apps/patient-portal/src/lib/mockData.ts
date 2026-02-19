export type RiskLevel = "Toxic" | "Ineffective" | "Adjust Dosage" | "Safe" | "Unknown";
export type Phenotype = "PM" | "IM" | "NM" | "RM" | "UM";
export type ClinicalMode = "doctor" | "patient";

export interface DrugRisk {
  drug: string;
  risk: RiskLevel;
  phenotype: Phenotype;
  gene: string;
  diplotype: string;
  confidence: number;
  variantEvidence: number;
  guidelineMatch: number;
  dataCompleteness: number;
  clinicalNote: string;
  evidence: ("cpic" | "pharmgkb" | "fda")[];
}

export interface MockAnalysisResult {
  primaryDrug: DrugRisk;
  allDrugs: DrugRisk[];
  variants: { rsid: string; gene: string; zygosity: string; effect: string }[];
  vcfMetrics: { totalVariants: number; annotated: number; quality: number; coverage: number };
}

export const SUPPORTED_DRUGS = [
  "CODEINE",
  "WARFARIN",
  "CLOPIDOGREL",
  "SIMVASTATIN",
  "AZATHIOPRINE",
  "FLUOROURACIL",
];

export const mockResult: MockAnalysisResult = {
  primaryDrug: {
    drug: "CODEINE",
    risk: "Toxic",
    phenotype: "PM",
    gene: "CYP2D6",
    diplotype: "*4/*4",
    confidence: 94,
    variantEvidence: 97,
    guidelineMatch: 95,
    dataCompleteness: 89,
    clinicalNote: "Avoid codeine — ultra-rapid or poor metabolizer status creates life-threatening opioid toxicity risk.",
    evidence: ["cpic", "pharmgkb", "fda"],
  },
  allDrugs: [
    {
      drug: "CODEINE",
      risk: "Toxic",
      phenotype: "PM",
      gene: "CYP2D6",
      diplotype: "*4/*4",
      confidence: 94,
      variantEvidence: 97,
      guidelineMatch: 95,
      dataCompleteness: 89,
      clinicalNote: "Avoid standard dosing — increased toxicity risk.",
      evidence: ["cpic", "pharmgkb", "fda"],
    },
    {
      drug: "WARFARIN",
      risk: "Adjust Dosage",
      phenotype: "IM",
      gene: "CYP2C9 / VKORC1",
      diplotype: "*1/*3",
      confidence: 88,
      variantEvidence: 90,
      guidelineMatch: 88,
      dataCompleteness: 85,
      clinicalNote: "Reduce initial warfarin dose by 25–30%; monitor INR closely.",
      evidence: ["cpic", "pharmgkb"],
    },
    {
      drug: "SIMVASTATIN",
      risk: "Safe",
      phenotype: "NM",
      gene: "SLCO1B1",
      diplotype: "*1/*1",
      confidence: 91,
      variantEvidence: 93,
      guidelineMatch: 92,
      dataCompleteness: 88,
      clinicalNote: "Standard simvastatin dosing is appropriate for this patient.",
      evidence: ["cpic", "fda"],
    },
    {
      drug: "CLOPIDOGREL",
      risk: "Ineffective",
      phenotype: "PM",
      gene: "CYP2C19",
      diplotype: "*2/*2",
      confidence: 96,
      variantEvidence: 98,
      guidelineMatch: 97,
      dataCompleteness: 92,
      clinicalNote: "Use alternative antiplatelet agent (e.g., prasugrel or ticagrelor).",
      evidence: ["cpic", "pharmgkb", "fda"],
    },
  ],
  variants: [
    { rsid: "rs3892097", gene: "CYP2D6", zygosity: "Homozygous", effect: "Loss of function" },
    { rsid: "rs1799853", gene: "CYP2C9", zygosity: "Heterozygous", effect: "Reduced function" },
    { rsid: "rs4244285", gene: "CYP2C19", zygosity: "Homozygous", effect: "Loss of function" },
    { rsid: "rs4149056", gene: "SLCO1B1", zygosity: "Wildtype", effect: "Normal function" },
    { rsid: "rs9923231", gene: "VKORC1", zygosity: "Heterozygous", effect: "Reduced sensitivity" },
  ],
  vcfMetrics: {
    totalVariants: 4_218_342,
    annotated: 4_196_881,
    quality: 96,
    coverage: 98,
  },
};

export const mockJsonOutput = {
  analysis_id: "PG-2026-8F42B1C3",
  timestamp: "2026-02-19T14:32:00Z",
  patient_id: "DEMO-001",
  vcf_file: "patient_genome.vcf",
  vcf_version: "VCFv4.2",
  variants_analyzed: 4218342,
  pharmacogenomic_results: [
    {
      drug: "CODEINE",
      gene: "CYP2D6",
      diplotype: "*4/*4",
      phenotype: "Poor Metabolizer (PM)",
      risk_level: "TOXIC",
      confidence: 0.94,
      recommendation: "CONTRAINDICATED — Avoid codeine. Use alternative analgesics (e.g., morphine at reduced doses, tramadol with caution).",
      evidence_sources: ["CPIC Guideline", "PharmGKB Level A", "FDA Pharmacogenomic Label"],
      cpic_guideline: "https://cpicpgx.org/guidelines/guideline-for-codeine-and-cyp2d6/",
    },
    {
      drug: "WARFARIN",
      gene: "CYP2C9/VKORC1",
      diplotype: "*1/*3",
      phenotype: "Intermediate Metabolizer (IM)",
      risk_level: "ADJUST_DOSAGE",
      confidence: 0.88,
      recommendation: "Reduce initial dose by 25-30%. Target INR 2.0-3.0. Check within 3-5 days.",
      evidence_sources: ["CPIC Guideline", "PharmGKB Level A"],
    },
    {
      drug: "SIMVASTATIN",
      gene: "SLCO1B1",
      diplotype: "*1/*1",
      phenotype: "Normal Function (NF)",
      risk_level: "SAFE",
      confidence: 0.91,
      recommendation: "Standard dosing applicable. No pharmacogenomic dose adjustment required.",
      evidence_sources: ["CPIC Guideline", "FDA Pharmacogenomic Label"],
    },
    {
      drug: "CLOPIDOGREL",
      gene: "CYP2C19",
      diplotype: "*2/*2",
      phenotype: "Poor Metabolizer (PM)",
      risk_level: "INEFFECTIVE",
      confidence: 0.96,
      recommendation: "Use alternative antiplatelet therapy (prasugrel or ticagrelor). Clopidogrel will have diminished efficacy.",
      evidence_sources: ["CPIC Guideline", "PharmGKB Level A", "FDA Pharmacogenomic Label"],
    },
  ],
  quality_metrics: {
    vcf_parse_success: true,
    variants_annotated: 4196881,
    annotation_rate: 0.9949,
    mean_coverage: "42x",
    data_completeness: 0.98,
  },
};

export const getRiskColor = (risk: RiskLevel) => {
  switch (risk) {
    case "Safe": return "risk-safe";
    case "Adjust Dosage": return "risk-adjust";
    case "Toxic": return "risk-toxic";
    case "Ineffective": return "risk-toxic";
    case "Unknown": return "risk-unknown";
  }
};

export const getRiskHex = (risk: RiskLevel) => {
  switch (risk) {
    case "Safe": return "#22c55e";
    case "Adjust Dosage": return "#f59e0b";
    case "Toxic": return "#ef4444";
    case "Ineffective": return "#ef4444";
    case "Unknown": return "#6b7280";
  }
};

export const getPhenotypeLabel = (phenotype: Phenotype) => {
  switch (phenotype) {
    case "PM": return "Poor Metabolizer";
    case "IM": return "Intermediate Metabolizer";
    case "NM": return "Normal Metabolizer";
    case "RM": return "Rapid Metabolizer";
    case "UM": return "Ultra-Rapid Metabolizer";
  }
};
