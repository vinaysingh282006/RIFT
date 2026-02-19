import { ParsedVariant } from "./vcfParser";

interface AIPromptParams {
  variant: ParsedVariant;
  drug: string;
  gene: string;
  diplotype: string;
  phenotype: string;
  clinicalMode: 'doctor' | 'patient';
  evidenceSources: ('cpic' | 'pharmgkb' | 'fda')[];
}

interface AIExplanationResponse {
  explanation: string;
  confidence: number;
  supportingEvidence: string[];
  clinicalRelevance: string;
  dosingImplications: string;
  safetyConsiderations: string;
}

// Mock AI service for demonstration purposes
// In a production app, this would connect to an actual AI service
export class AIService {
  static async generateExplanation(params: AIPromptParams): Promise<AIExplanationResponse> {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Generate structured prompt based on parameters
    const prompt = this.buildPrompt(params);
    
    // Return mock response based on clinical mode
    if (params.clinicalMode === 'doctor') {
      return this.generateDoctorModeResponse(params);
    } else {
      return this.generatePatientModeResponse(params);
    }
  }
  
  private static buildPrompt(params: AIPromptParams): string {
    const { variant, drug, gene, diplotype, phenotype, evidenceSources } = params;
    
    return `
      Variant detected: ${variant.rsid}
      Gene: ${gene}
      Drug: ${drug}
      Diplotype: ${diplotype}
      Phenotype: ${phenotype}
      Evidence sources: ${evidenceSources.join(', ')}
      
      Provide detailed pharmacogenomic interpretation following this structure:
      1. Molecular mechanism
      2. Clinical implications
      3. Dosing recommendations
      4. Safety considerations
    `;
  }
  
  private static generateDoctorModeResponse(params: AIPromptParams): AIExplanationResponse {
    const { variant, drug, gene, diplotype, phenotype, evidenceSources } = params;
    
    // Doctor mode explanations with technical terminology
    const explanations: Record<string, Record<string, string>> = {
      CYP2D6: {
        CODEINE: `CYP2D6 encodes a cytochrome P450 enzyme responsible for the oxidative metabolism of approximately 25% of clinically used drugs. The ${diplotype} diplotype confers a ${phenotype} phenotype due to complete absence of functional enzyme activity (activity score = 0).

For codeine, which requires CYP2D6-mediated O-demethylation to its active metabolite morphine, PM status results in negligible analgesic effect and accumulation of the parent compound. This contrasts with ultra-rapid metabolizers, who produce toxic morphine concentrations.

Clinical significance: Contraindicated in PMs due to lack of analgesic efficacy and potential for codeine accumulation.`, 
        
        TAMOXIFEN: `CYP2D6 mediates bioactivation of tamoxifen to its primary active metabolite endoxifen. The ${diplotype} genotype (${phenotype}) results in impaired formation of endoxifen, leading to subtherapeutic levels and potentially reduced oncologic outcomes.`
      },
      
      CYP2C9: {
        WARFARIN: `CYP2C9 encodes the primary enzyme responsible for S-warfarin hydroxylation, accounting for ~95% of warfarin metabolism. The ${diplotype} genotype (${phenotype}) demonstrates reduced enzymatic activity, resulting in decreased clearance and increased anticoagulant exposure.

Pharmacokinetic impact: S-warfarin half-life increases proportionally to CYP2C9 activity score, with *3/*3 individuals having ~3-fold higher exposure compared to *1/*1.

Clinical management: Initiate warfarin at 25-30% reduced dose. Monitor INR more frequently during induction phase. Consider VKORC1 genotype for additional dose refinement.`
      },
      
      CYP2C19: {
        CLOPIDOGREL: `CYP2C19 mediates hepatic bioactivation of clopidogrel's prodrug to its active metabolite. The ${diplotype} genotype (${phenotype}) results in absent or reduced formation of active thiol derivative, impairing platelet aggregation inhibition.

Therapeutic implications: Significantly increased risk of adverse cardiovascular events (stent thrombosis, MI) in PMs receiving standard clopidogrel dosing. Alternative P2Y12 inhibitors not requiring CYP2C19 metabolism (prasugrel, ticagrelor) demonstrate superior efficacy.`
      }
    };
    
    const explanation = explanations[gene]?.[drug.toUpperCase()] || 
      `The ${variant.rsid} variant in ${gene} affects ${drug} metabolism. The ${diplotype} diplotype (${phenotype}) alters pharmacokinetics/pharmacodynamics with clinical implications for dosing optimization and safety monitoring. Evidence sources: ${evidenceSources.join(', ')}.`;
    
    return {
      explanation,
      confidence: 85 + Math.floor(Math.random() * 15), // 85-100%
      supportingEvidence: [
        `CPIC Guideline for ${gene}`,
        `PharmGKB Evidence Level A for ${drug}`,
        `FDA Labeling for ${drug}`
      ],
      clinicalRelevance: 'High clinical significance - dosing adjustment required',
      dosingImplications: 'Dose modification needed based on genotype',
      safetyConsiderations: 'Monitor for adverse effects based on metabolic phenotype'
    };
  }
  
  private static generatePatientModeResponse(params: AIPromptParams): AIExplanationResponse {
    const { variant, drug, gene, diplotype, phenotype, evidenceSources } = params;
    
    // Patient-friendly explanations
    const explanations: Record<string, Record<string, string>> = {
      CYP2D6: {
        CODEINE: `Your genetic makeup affects how your body processes codeine. The results show you have ${phenotype} status for the CYP2D6 gene (${diplotype}). This means codeine may not work effectively for pain relief and could potentially cause harmful side effects.

Instead of codeine, your healthcare provider may recommend alternative pain medications that don't rely on this metabolic pathway.`,
        
        TAMOXIFEN: `Your CYP2D6 genes (${diplotype}, ${phenotype}) affect how well your body can activate tamoxifen. This may impact the medication's effectiveness for cancer treatment. Your doctor may consider alternative treatments or adjust the dose based on this information.`
      },
      
      CYP2C9: {
        WARFARIN: `Your CYP2C9 genes (${diplotype}, ${phenotype}) affect how quickly your body breaks down warfarin. You may need a lower starting dose to achieve the right balance between preventing clots and avoiding bleeding complications. Your INR levels will need careful monitoring.`
      },
      
      CYP2C19: {
        CLOPIDOGREL: `Your CYP2C19 genes (${diplotype}, ${phenotype}) affect how well your body converts clopidogrel to its active form. This means the medication may be less effective at preventing blood clots. Your doctor may recommend an alternative medication that works better for your genetic profile.`
      }
    };
    
    const explanation = explanations[gene]?.[drug.toUpperCase()] || 
      `Your genetic variation (${variant.rsid}) in the ${gene} gene affects how your body processes ${drug}. Your healthcare provider will consider this information when prescribing medications to ensure optimal safety and effectiveness. Evidence sources: ${evidenceSources.join(', ')}.`;
    
    return {
      explanation,
      confidence: 85 + Math.floor(Math.random() * 15), // 85-100%
      supportingEvidence: [
        `CPIC Guideline`,
        `PharmGKB Research`,
        `FDA Information`
      ],
      clinicalRelevance: 'Important for medication safety and effectiveness',
      dosingImplications: 'Medication dose may need adjustment',
      safetyConsiderations: 'Potential for different side effects based on genetics'
    };
  }
  
  // Cache for storing AI explanations to improve performance
  private static cache = new Map<string, AIExplanationResponse>();
  
  static async getCachedExplanation(params: AIPromptParams): Promise<AIExplanationResponse> {
    const cacheKey = `${params.variant.rsid}-${params.drug}-${params.clinicalMode}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }
    
    const result = await this.generateExplanation(params);
    this.cache.set(cacheKey, result);
    
    return result;
  }
  
  static clearCache(): void {
    this.cache.clear();
  }
}