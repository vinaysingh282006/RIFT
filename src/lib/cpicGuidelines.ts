// CPIC Guideline References for Pharmacogenomic Recommendations

export interface CPICGuideline {
  drug: string;
  gene: string;
  guidelineUrl: string;
  recommendation: string;
  strength: 'A' | 'B' | 'C' | 'D'; // A = Strong, B = Moderate, C = Weak, D = Very weak
  population: string;
  dosageAdjustment?: string;
  alternativeTherapy?: string;
  monitoringRecommendations?: string;
}

export const CPIC_GUIDELINES: Record<string, CPICGuideline> = {
  'CYP2D6-CODEINE': {
    drug: 'Codeine',
    gene: 'CYP2D6',
    guidelineUrl: 'https://cpicpgx.org/guidelines/guideline-for-codeine-and-cyp2d6/',
    recommendation: 'Avoid codeine in CYP2D6 PMs due to lack of analgesic efficacy. Avoid in UMs due to risk of morphine overdose.',
    strength: 'A',
    population: 'General population',
    dosageAdjustment: 'Alternative analgesic recommended',
    alternativeTherapy: 'Morphine, oxycodone, or other non-CYP2D6-dependent opioids',
    monitoringRecommendations: 'None required for alternative therapy'
  },
  
  'CYP2C19-CLOPIDOGREL': {
    drug: 'Clopidogrel',
    gene: 'CYP2C19',
    guidelineUrl: 'https://cpicpgx.org/guidelines/guideline-for-clopidogrel-and-cyp2c19/',
    recommendation: 'Use alternative antiplatelet therapy (prasugrel/ticagrelor) in CYP2C19 PMs due to increased cardiovascular risk.',
    strength: 'A',
    population: 'Patients undergoing PCI',
    dosageAdjustment: 'Not recommended - use alternative therapy',
    alternativeTherapy: 'Prasugrel or Ticagrelor',
    monitoringRecommendations: 'Platelet function testing may be considered'
  },
  
  'CYP2C9-WARFARIN': {
    drug: 'Warfarin',
    gene: 'CYP2C9',
    guidelineUrl: 'https://cpicpgx.org/guidelines/guideline-for-warfarin-and-cyp2c9-and-vkorc1/',
    recommendation: 'Initiate warfarin at reduced dose and/or decrease maintenance dose based on CYP2C9 genotype.',
    strength: 'A',
    population: 'Anticoagulation candidates',
    dosageAdjustment: 'Reduce initial dose by 15-25% for *1/*2, 30-40% for *1/*3, 40-60% for *2/*2, *2/*3, *3/*3',
    alternativeTherapy: 'Direct oral anticoagulants (DOACs)',
    monitoringRecommendations: 'More frequent INR monitoring initially'
  },
  
  'SLCO1B1-SIMVASTATIN': {
    drug: 'Simvastatin',
    gene: 'SLCO1B1',
    guidelineUrl: 'https://cpicpgx.org/guidelines/guideline-for-statins-and-slc-o1b1/',
    recommendation: 'Avoid simvastatin ≥40mg daily in patients with one or more decreased function alleles.',
    strength: 'A',
    population: 'Dyslipidemia patients',
    dosageAdjustment: 'Use lower dose simvastatin (<20mg) or alternative statin',
    alternativeTherapy: 'Pravastatin, rosuvastatin, fluvastatin, pitavastatin',
    monitoringRecommendations: 'Monitor for muscle symptoms and CK levels'
  },
  
  'TPMT-AZATHIOPRINE': {
    drug: 'Azathioprine',
    gene: 'TPMT',
    guidelineUrl: 'https://cpicpgx.org/guidelines/guideline-for-thiopurines-and-tpmt/',
    recommendation: 'Reduce azathioprine dose by 30-70% in intermediate metabolizers; avoid in poor metabolizers.',
    strength: 'A',
    population: 'All patients prior to thiopurine therapy',
    dosageAdjustment: 'Reduce dose by 30-70% for IMs, avoid in PMs',
    alternativeTherapy: 'Methotrexate, mycophenolate mofetil',
    monitoringRecommendations: 'Frequent CBC monitoring during initiation'
  },
  
  'DPYD-FLUOROURACIL': {
    drug: 'Fluorouracil',
    gene: 'DPYD',
    guidelineUrl: 'https://cpicpgx.org/guidelines/guideline-for-fluoropyrimidines-and-dpyd/',
    recommendation: 'Avoid fluoropyrimidines in patients with two decreased function alleles; consider dose reduction for one decreased function allele.',
    strength: 'A',
    population: 'Cancer patients',
    dosageAdjustment: 'Avoid in PMs, consider 50% dose reduction in IMs',
    alternativeTherapy: 'Capecitabine with caution, alternative chemotherapy regimens',
    monitoringRecommendations: 'Intensive monitoring for toxicity, early intervention'
  }
};

export function getCPICGuideline(drug: string, gene: string): CPICGuideline | undefined {
  const key = `${gene.toUpperCase()}-${drug.toUpperCase()}`;
  return CPIC_GUIDELINES[key];
}

export function getCPICRecommendation(drug: string, gene: string, phenotype: string): string {
  const guideline = getCPICGuideline(drug, gene);
  
  if (!guideline) {
    return `No specific CPIC guideline available for ${drug} and ${gene}. Use standard dosing with clinical judgment.`;
  }
  
  // Customize recommendation based on phenotype
  switch (phenotype) {
    case 'PM': // Poor Metabolizer
      if (drug.toUpperCase() === 'CODEINE') {
        return 'AVOID codeine due to risk of inadequate analgesia. Consider alternative analgesics.';
      } else if (drug.toUpperCase() === 'CLOPIDOGREL') {
        return 'AVOID clopidogrel. Use alternative antiplatelet therapy (prasugrel or ticagrelor).';
      } else if (drug.toUpperCase() === 'WARFARIN') {
        return 'Reduce warfarin dose by 40-60% based on genotype. Monitor INR closely.';
      } else if (drug.toUpperCase() === 'AZATHIOPRINE') {
        return 'AVOID azathioprine or significantly reduce dose. Monitor CBC frequently.';
      } else if (drug.toUpperCase() === 'FLUOROURACIL') {
        return 'AVOID fluorouracil due to high risk of severe toxicity. Consider alternative chemotherapy.';
      }
      break;
      
    case 'IM': // Intermediate Metabolizer
      if (drug.toUpperCase() === 'WARFARIN') {
        return 'Reduce warfarin dose by 15-25% based on genotype. Monitor INR closely.';
      } else if (drug.toUpperCase() === 'AZATHIOPRINE') {
        return 'Consider 30-50% dose reduction. Monitor CBC frequently.';
      } else if (drug.toUpperCase() === 'FLUOROURACIL') {
        return 'Consider 50% dose reduction. Monitor closely for toxicity.';
      }
      break;
      
    case 'UM': // Ultra-rapid Metabolizer
      if (drug.toUpperCase() === 'CODEINE') {
        return 'AVOID codeine due to risk of morphine overdose. Consider alternative analgesics.';
      }
      break;
      
    case 'RM': // Rapid Metabolizer
      if (drug.toUpperCase() === 'CYP2C19') {
        return 'May require closer monitoring but standard dosing is typically appropriate.';
      }
      break;
      
    default:
      // NM (Normal Metabolizer) - standard dosing
      return 'Standard dosing appropriate based on clinical factors.';
  }
  
  return guideline.recommendation;
}