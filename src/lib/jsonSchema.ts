// Define the JSON output schema for pharmacogenomic results
export interface PGxAnalysisResult {
  analysis_id: string;
  timestamp: string;
  patient_id: string;
  vcf_file: string;
  vcf_version: string;
  variants_analyzed: number;
  pharmacogenomic_results: DrugPGxResult[];
  quality_metrics: QualityMetrics;
  variant_details?: VariantDetail[];
}

export interface DrugPGxResult {
  drug: string;
  gene: string;
  diplotype: string;
  phenotype: string;
  risk_level: 'TOXIC' | 'INEFFECTIVE' | 'ADJUST_DOSAGE' | 'SAFE' | 'UNKNOWN';
  confidence: number; // 0.0 - 1.0
  recommendation: string;
  evidence_sources: string[];
  cpic_guideline?: string;
  fda_label?: string;
  variant_impact?: string;
  clinical_annotation?: string;
}

export interface QualityMetrics {
  vcf_parse_success: boolean;
  variants_annotated: number;
  annotation_rate: number; // 0.0 - 1.0
  mean_coverage?: string;
  data_completeness: number; // 0.0 - 1.0
  confidence_metrics?: {
    variant_evidence: number;
    guideline_match: number;
    data_completeness: number;
  };
}

export interface VariantDetail {
  rsid: string;
  chromosome: string;
  position: string;
  gene: string;
  reference: string;
  alternate: string;
  zygosity: 'HOMOZYGOUS' | 'HETEROZYGOUS' | 'HEMIZYGOUS' | 'MISSING';
  genotype: string;
  effect: string;
  clinical_significance: string;
  phenotype_association: string;
}

// Validation functions
export function validatePGxResult(result: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validate required top-level fields
  if (typeof result.analysis_id !== 'string' || !result.analysis_id) {
    errors.push('Missing or invalid analysis_id (must be a non-empty string)');
  }
  
  if (typeof result.timestamp !== 'string' || !isValidISODateString(result.timestamp)) {
    errors.push('Missing or invalid timestamp (must be a valid ISO date string)');
  }
  
  if (typeof result.patient_id !== 'string' || !result.patient_id) {
    errors.push('Missing or invalid patient_id (must be a non-empty string)');
  }
  
  if (typeof result.vcf_file !== 'string' || !result.vcf_file) {
    errors.push('Missing or invalid vcf_file (must be a non-empty string)');
  }
  
  if (typeof result.vcf_version !== 'string' || !result.vcf_version) {
    errors.push('Missing or invalid vcf_version (must be a non-empty string)');
  }
  
  if (typeof result.variants_analyzed !== 'number' || result.variants_analyzed < 0) {
    errors.push('Missing or invalid variants_analyzed (must be a non-negative number)');
  }
  
  // Validate pharmacogenomic_results array
  if (!Array.isArray(result.pharmacogenomic_results)) {
    errors.push('Missing or invalid pharmacogenomic_results (must be an array)');
  } else {
    result.pharmacogenomic_results.forEach((drugResult: any, index: number) => {
      validateDrugResult(drugResult, `pharmacogenomic_results[${index}]`).errors.forEach(err => errors.push(err));
    });
  }
  
  // Validate quality_metrics
  if (!result.quality_metrics) {
    errors.push('Missing quality_metrics object');
  } else {
    validateQualityMetrics(result.quality_metrics, 'quality_metrics').errors.forEach(err => errors.push(err));
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

function validateDrugResult(result: any, path: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (typeof result.drug !== 'string' || !result.drug) {
    errors.push(`${path}.drug: Missing or invalid drug name (must be a non-empty string)`);
  }
  
  if (typeof result.gene !== 'string' || !result.gene) {
    errors.push(`${path}.gene: Missing or invalid gene name (must be a non-empty string)`);
  }
  
  if (typeof result.diplotype !== 'string' || !result.diplotype) {
    errors.push(`${path}.diplotype: Missing or invalid diplotype (must be a non-empty string)`);
  }
  
  if (typeof result.phenotype !== 'string' || !result.phenotype) {
    errors.push(`${path}.phenotype: Missing or invalid phenotype (must be a non-empty string)`);
  }
  
  const validRiskLevels = ['TOXIC', 'INEFFECTIVE', 'ADJUST_DOSAGE', 'SAFE', 'UNKNOWN'];
  if (!validRiskLevels.includes(result.risk_level)) {
    errors.push(`${path}.risk_level: Invalid risk level (must be one of: ${validRiskLevels.join(', ')})`);
  }
  
  if (typeof result.confidence !== 'number' || result.confidence < 0 || result.confidence > 1) {
    errors.push(`${path}.confidence: Invalid confidence value (must be a number between 0 and 1)`);
  }
  
  if (typeof result.recommendation !== 'string' || !result.recommendation) {
    errors.push(`${path}.recommendation: Missing or invalid recommendation (must be a non-empty string)`);
  }
  
  if (!Array.isArray(result.evidence_sources)) {
    errors.push(`${path}.evidence_sources: Invalid evidence_sources (must be an array of strings)`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

function validateQualityMetrics(metrics: any, path: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (typeof metrics.vcf_parse_success !== 'boolean') {
    errors.push(`${path}.vcf_parse_success: Missing or invalid vcf_parse_success (must be a boolean)`);
  }
  
  if (typeof metrics.variants_annotated !== 'number' || metrics.variants_annotated < 0) {
    errors.push(`${path}.variants_annotated: Invalid variants_annotated (must be a non-negative number)`);
  }
  
  if (typeof metrics.annotation_rate !== 'number' || metrics.annotation_rate < 0 || metrics.annotation_rate > 1) {
    errors.push(`${path}.annotation_rate: Invalid annotation_rate (must be a number between 0 and 1)`);
  }
  
  if (typeof metrics.data_completeness !== 'number' || metrics.data_completeness < 0 || metrics.data_completeness > 1) {
    errors.push(`${path}.data_completeness: Invalid data_completeness (must be a number between 0 and 1)`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

function isValidISODateString(dateString: string): boolean {
  try {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  } catch {
    return false;
  }
}

// Function to transform internal results to compliant JSON output
export function transformToCompliantJSON(
  internalResult: any,
  patientId: string = 'DEMO-001',
  vcfFilename: string = 'patient_genome.vcf'
): PGxAnalysisResult {
  const timestamp = new Date().toISOString();
  
  // Generate a random analysis ID
  const analysisId = `PG-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  
  // Transform pharmacogenomic results
  const pharmacogenomicResults: DrugPGxResult[] = internalResult.allDrugs?.map((drug: any) => ({
    drug: drug.drug,
    gene: drug.gene,
    diplotype: drug.diplotype,
    phenotype: drug.phenotype,
    risk_level: drug.risk?.toUpperCase().replace(/\s+/g, '_') as any,
    confidence: drug.confidence / 100, // Convert percentage to decimal
    recommendation: drug.clinicalNote,
    evidence_sources: drug.evidence?.map((e: any) => {
      switch(e) {
        case 'cpic': return 'CPIC Guideline';
        case 'pharmgkb': return 'PharmGKB Evidence';
        case 'fda': return 'FDA Pharmacogenomic Label';
        default: return e;
      }
    }) || [],
    ...(drug.cpicGuidelineUrl && { cpic_guideline: drug.cpicGuidelineUrl }),
    fda_label: `FDA Pharmacogenomic Label for ${drug.drug}`,
    variant_impact: `Impact of ${drug.gene} variant on ${drug.drug} metabolism`,
    clinical_annotation: drug.clinicalNote
  })) || [];
  
  // Transform quality metrics
  const qualityMetrics: QualityMetrics = {
    vcf_parse_success: true,
    variants_annotated: internalResult.variants?.length || 0,
    annotation_rate: internalResult.vcfMetrics?.annotated ? 
      parseFloat((internalResult.vcfMetrics.annotated / internalResult.vcfMetrics.totalVariants).toFixed(2)) : 0,
    data_completeness: parseFloat((internalResult.vcfMetrics?.coverage / 100 || 0).toFixed(2)),
    confidence_metrics: {
      variant_evidence: parseFloat(((internalResult.primaryDrug?.variantEvidence || 0) / 100).toFixed(2)),
      guideline_match: parseFloat(((internalResult.primaryDrug?.guidelineMatch || 0) / 100).toFixed(2)),
      data_completeness: parseFloat(((internalResult.primaryDrug?.dataCompleteness || 0) / 100).toFixed(2))
    }
  };
  
  // Transform variant details if available
  const variantDetails: VariantDetail[] | undefined = internalResult.variants?.map((v: any) => ({
    rsid: v.rsid,
    chromosome: v.gene.includes('chr') ? v.gene : `chr${v.gene}`,
    position: v.position || 'N/A',
    gene: v.gene,
    reference: v.reference || 'N/A',
    alternate: v.alternate || 'N/A',
    zygosity: v.zygosity?.toUpperCase().replace(/\s+/g, '_') as any,
    genotype: v.genotype || 'N/A',
    effect: v.effect || 'Unknown',
    clinical_significance: 'Not specified',
    phenotype_association: 'Not specified'
  }));
  
  return {
    analysis_id: analysisId,
    timestamp,
    patient_id: patientId,
    vcf_file: vcfFilename,
    vcf_version: 'VCFv4.2',
    variants_analyzed: internalResult.vcfMetrics?.totalVariants || 0,
    pharmacogenomic_results: pharmacogenomicResults,
    quality_metrics: qualityMetrics,
    ...(variantDetails && { variant_details: variantDetails })
  };
}