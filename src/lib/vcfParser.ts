import { validateAndHandleErrors, VCFError, ValidationError } from './errorHandler';
import { setCachedVCF, getCachedVCF, measurePerformance, processInChunks } from './performanceOptimizer';

/**
 * VCF Parser for Pharmacogenomics Analysis
 * Handles VCF files with robust error handling and gene-specific filtering
 */

interface VcfHeader {
  format: string;
  fileDate?: string;
  source?: string;
  reference?: string;
  phasing?: string;
  info?: any[];
  formatFields?: any[];
  filter?: any[];
  contig?: any[];
  assembly?: string;
  cytogeneticMap?: string;
  species?: string;
  pedigree?: string;
  pedigreeDB?: string;
  version?: string;
}

interface VcfRecord {
  chromosome: string;
  position: string;
  id: string;
  reference: string;
  alternates: string[];
  quality: string;
  filters: string[];
  info: Record<string, any>;
  format?: string;
  samples?: Record<string, any>[];
}

export interface ParsedVariant {
  rsid: string;
  chromosome: string;
  position: string;
  gene: string;
  reference: string;
  alternate: string;
  zygosity: 'Homozygous' | 'Heterozygous' | 'Hemizygous' | 'Missing';
  genotype: string;
  effect: string;
  info: Record<string, any>;
}

interface VcfParseResult {
  header: VcfHeader;
  records: ParsedVariant[];
  metadata: {
    sampleNames: string[];
    totalVariants: number;
    filteredVariants: number;
    genesDetected: string[];
    qualityMetrics: {
      totalVariants: number;
      annotated: number;
      quality: number;
      coverage: number;
    };
  };
  errors: ValidationError[];
}

// Known pharmacogenes of interest
const PHARMACOGENES = [
  'CYP2D6', 'CYP2C19', 'CYP2C9', 
  'SLCO1B1', 'TPMT', 'DPYD',
  'CYP3A5', 'CYP3A4', 'CYP1A2',
  'CYP2B6', 'CYP2E1', 'NUDT15'
];

// Additional gene aliases and mappings for better detection
const GENE_ALIASES: Record<string, string> = {
  'CYP2D6': 'CYP2D6',
  'CYT2D6': 'CYP2D6',
  'CYP2C19': 'CYP2C19',
  'CYT2C19': 'CYP2C19',
  'CYP2C9': 'CYP2C9',
  'CYT2C9': 'CYP2C9',
  'SLCO1B1': 'SLCO1B1',
  'SLC01B1': 'SLCO1B1', // Common typo
  'OATP1B1': 'SLCO1B1',
  'TPMT': 'TPMT',
  'DPYD': 'DPYD',
  'TYMP': 'DPYD', // Alternative name
  'CYP3A5': 'CYP3A5',
  'CYP3A4': 'CYP3A4',
  'CYP1A2': 'CYP1A2',
  'CYP2B6': 'CYP2B6',
  'CYP2E1': 'CYP2E1',
  'NUDT15': 'NUDT15'
};

// Map chromosomes to gene locations for faster lookup
const CHROMOSOME_GENE_MAP: Record<string, { gene: string, start: number, end: number }[]> = {
  'chr1': [], 'chr2': [], 'chr3': [], 'chr4': [], 'chr5': [],
  'chr6': [], 'chr7': [], 'chr8': [], 'chr9': [], 'chr10': [],
  'chr11': [], 'chr12': [], 'chr13': [], 'chr14': [], 'chr15': [],
  'chr16': [], 'chr17': [], 'chr18': [], 'chr19': [], 'chr20': [],
  'chr21': [], 'chr22': [], 'chrX': [], 'chrY': []
};

// Add known gene locations (simplified for demo purposes)
// In a real implementation, this would come from a comprehensive gene database
Object.assign(CHROMOSOME_GENE_MAP, {
  'chr22': [
    { gene: 'CYP2D6', start: 42522500, end: 42525000 },
    { gene: 'CYP2C19', start: 19000000, end: 19050000 }
  ],
  'chr10': [
    { gene: 'CYP2C9', start: 94700000, end: 94800000 }
  ],
  'chr12': [
    { gene: 'SLCO1B1', start: 39200000, end: 39300000 }
  ],
  'chr6': [
    { gene: 'TPMT', start: 16600000, end: 16700000 }
  ],
  'chr1': [
    { gene: 'DPYD', start: 97000000, end: 98000000 }
  ]
});

/**
 * Parses a VCF file content into structured data
 */
export async function parseVcf(vcfContent: string, targetGenes: string[] = PHARMACOGENES): Promise<VcfParseResult> {
  // Create a hash of the content to use as a cache key
  const contentHash = btoa(vcfContent.substring(0, 100) + vcfContent.length.toString()).substring(0, 16);
  const cacheKey = `${contentHash}_${targetGenes.sort().join(',')}`;

  // Check if we have a cached result
  const cachedResult = getCachedVCF(cacheKey);
  if (cachedResult) {
    console.log('Using cached VCF parsing result');
    return cachedResult;
  }

  // Validate VCF format first
  const validation = validateAndHandleErrors(vcfContent);
  const errors: ValidationError[] = [...validation.errors];
  
  if (!validation.isValid) {
    // Only throw if there are critical or major errors
    const criticalErrors = errors.filter(e => e.severity === 'critical' || e.severity === 'error');
    if (criticalErrors.length > 0) {
      throw new VCFError('VCF validation failed', errors);
    }
  }

  // Split content into lines efficiently
  const lines = vcfContent.split('\n');
  let header: VcfHeader = {} as VcfHeader;
  const records: VcfRecord[] = [];
  const sampleNames: string[] = [];

  // Parse header lines starting with ##
  let headerEndLine = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.startsWith('##')) {
      // Parse header metadata
      const headerMatch = line.match(/^##([^=]+)=(.*)$/);
      if (headerMatch) {
        const key = headerMatch[1];
        const value = headerMatch[2];
        
        if (key === 'CHROM' && !header.format) {
          header.format = value;
        } else if (key === 'filedate') {
          header.fileDate = value;
        } else if (key === 'source') {
          header.source = value;
        } else if (key === 'reference') {
          header.reference = value;
        } else if (key === 'phasing') {
          header.phasing = value;
        } else if (key === 'fileformat') {
          header.version = value.replace('VCFv', '');
        }
      }
    } else if (line.startsWith('#CHROM')) {
      // Parse column headers (sample names)
      const columns = line.substring(1).split('\t'); // Remove the leading #
      if (columns.length >= 9) {
        // Sample names start from column 10 (index 9) in VCF
        for (let j = 9; j < columns.length; j++) {
          sampleNames.push(columns[j]);
        }
      }
      headerEndLine = i;
      break;
    }
  }

  // Process variant records in chunks for better performance
  const variantLines = lines.slice(headerEndLine + 1).filter(line => line.trim() && !line.startsWith('#'));
  
  for (const line of variantLines) {
    try {
      const record = parseVcfRecord(line, sampleNames);
      if (record) {
        records.push(record);
      }
    } catch (error) {
      const lineIndex = lines.indexOf(line);
      errors.push({
        type: 'format',
        severity: 'warning',
        message: `Skipping malformed VCF record at line ${lineIndex + 1}`,
        details: error instanceof Error ? error.message : String(error),
        suggestion: 'Verify the format of this variant record',
        line: lineIndex + 1
      });
      continue;
    }
  }

  // Filter records for target genes and convert to our format
  const parsedVariants: ParsedVariant[] = [];
  const genesDetected = new Set<string>();

  for (const record of records) {
    // Try to identify gene from multiple sources
    let gene = '';
    
    // First, try to extract gene from INFO field (highest priority for pharmacogenomics)
    gene = extractGeneFromInfo(record.info) || '';
    
    if (!gene) {
      // Check if the variant ID looks like an rsID
      if (record.id && record.id.startsWith('rs')) {
        // Look up gene based on rsID (in a real implementation, this would use a database)
        gene = inferGeneFromRsId(record.id) || '';
      } else {
        // Try to map by chromosome and position
        gene = inferGeneFromLocation(record.chromosome, parseInt(record.position));
      }
    }

    // If we couldn't infer the gene, skip unless specifically targeting all genes
    if (!gene && !targetGenes.includes('*')) {
      continue;
    }

    // If we have a gene, check if it's in our target list
    if (gene && targetGenes.includes(gene)) {
      genesDetected.add(gene);
      
      // Determine zygosity from sample data
      let zygosity: 'Homozygous' | 'Heterozygous' | 'Hemizygous' | 'Missing' = 'Missing';
      let genotype = './.';
      let effect = 'Unknown';

      if (record.samples && record.samples.length > 0) {
        const firstSample = record.samples[0];
        genotype = firstSample.GT || './.';
        
        // Determine zygosity based on genotype
        if (genotype.includes('/')) {
          const alleles = genotype.split('/');
          if (alleles[0] === alleles[1] && alleles[0] !== '.') {
            zygosity = 'Homozygous';
          } else if (alleles[0] !== alleles[1] && alleles[0] !== '.' && alleles[1] !== '.') {
            zygosity = 'Heterozygous';
          } else if (alleles.some(a => a === '.')) {
            zygosity = 'Missing';
          }
        } else if (genotype.includes('|')) {
          // Phased genotype
          const alleles = genotype.split('|');
          if (alleles[0] === alleles[1] && alleles[0] !== '.') {
            zygosity = 'Homozygous';
          } else if (alleles[0] !== alleles[1] && alleles[0] !== '.' && alleles[1] !== '.') {
            zygosity = 'Heterozygous';
          } else if (alleles.some(a => a === '.')) {
            zygosity = 'Missing';
          }
        }
        
        // Determine effect based on reference and alternate alleles
        effect = determineEffect(record.reference, record.alternates[0] || '');
      }

      parsedVariants.push({
        rsid: record.id,
        chromosome: record.chromosome,
        position: record.position,
        gene,
        reference: record.reference,
        alternate: record.alternates[0] || '',
        zygosity,
        genotype,
        effect,
        info: record.info
      });
    }
  }

  const result = {
    header,
    records: parsedVariants,
    metadata: {
      sampleNames,
      totalVariants: records.length,
      filteredVariants: parsedVariants.length,
      genesDetected: Array.from(genesDetected),
      qualityMetrics: {
        totalVariants: records.length,
        annotated: parsedVariants.length,
        quality: Math.min(100, (parsedVariants.length / Math.max(1, records.length)) * 100),
        coverage: 95 // Placeholder - in real implementation this would come from VCF or external source
      }
    },
    errors
  };

  // Cache the result for future use
  setCachedVCF(cacheKey, result);
  
  return result;
}

/**
 * Parses a single VCF record line
 */
function parseVcfRecord(line: string, sampleNames: string[]): VcfRecord | null {
  const columns = line.split('\t');
  
  if (columns.length < 8) {
    throw new Error(`Invalid VCF record: insufficient columns (${columns.length})`);
  }

  const chromosome = columns[0];
  const position = columns[1];
  const id = columns[2];
  const reference = columns[3];
  const alternates = columns[4].split(',');
  const quality = columns[5];
  const filters = columns[6].split(';');
  const infoStr = columns[7];

  // Parse INFO field
  const info: Record<string, any> = {};
  if (infoStr && infoStr !== '.') {
    const infoPairs = infoStr.split(';');
    for (const pair of infoPairs) {
      const [key, value] = pair.split('=');
      if (key) {
        info[key] = value || true;
      } else {
        // Handle flag fields (no value, just key present)
        info[pair] = true;
      }
    }
  }

  // Parse FORMAT and sample fields if present
  let format = '';
  let samples: Record<string, any>[] = [];

  if (columns.length > 8) {
    format = columns[8];
    for (let i = 9; i < columns.length; i++) {
      if (i - 9 < sampleNames.length) {
        const sampleData = parseSampleData(columns[i], format);
        samples.push(sampleData);
      }
    }
  }

  return {
    chromosome,
    position,
    id,
    reference,
    alternates,
    quality,
    filters,
    info,
    format,
    samples
  };
}

/**
 * Parses sample data based on FORMAT field
 */
function parseSampleData(sampleStr: string, format: string): Record<string, any> {
  const values = sampleStr.split(':');
  const formatKeys = format.split(':');
  const sampleData: Record<string, any> = {};

  for (let i = 0; i < formatKeys.length && i < values.length; i++) {
    sampleData[formatKeys[i]] = values[i];
  }

  return sampleData;
}

/**
 * Infers gene from rsID (placeholder implementation)
 */
function inferGeneFromRsId(rsId: string): string | null {
  // In a real implementation, this would use a database mapping
  // For now, return null to indicate no mapping found
  return null;
}

/**
 * Extracts gene information from INFO field if present
 */
function extractGeneFromInfo(info: Record<string, any>): string | null {
  // Look for common gene-related keys in the INFO field
  const geneKeys = ['GENE', 'GENEINFO', 'SYMBOL', 'GENENAME'];
  for (const key of geneKeys) {
    if (info[key]) {
      const gene = info[key].toString();
      // Check if it's a known pharmacogene or alias
      if (PHARMACOGENES.includes(gene)) {
        return gene;
      }
      if (GENE_ALIASES[gene]) {
        return GENE_ALIASES[gene];
      }
      // Check if it contains a known gene name
      for (const pgGene of PHARMACOGENES) {
        if (gene.toUpperCase().includes(pgGene.toUpperCase())) {
          return pgGene;
        }
      }
    }
  }
  
  // Look for star allele notation which implies gene
  const starAlleleKeys = ['ALLELE', 'DIPL', 'HAPLOTYPE', 'PHASE'];
  for (const key of starAlleleKeys) {
    if (info[key]) {
      const value = info[key].toString().toUpperCase();
      // Check for patterns like *1, *2, *3, etc. that are associated with specific genes
      if (value.includes('*1/*') || value.includes('*2') || value.includes('*3') || value.includes('*4')) {
        // This is likely CYP2D6 based on common star allele patterns
        if (value.includes('*4') && (value.includes('*1') || value.includes('*2'))) {
          return 'CYP2D6'; // Common CYP2D6 star allele pattern
        }
        if (value.includes('*17')) {
          return 'CYP2C19'; // CYP2C19 *17 is a common allele
        }
      }
    }
  }
  
  return null;
}

/**
 * Infers gene from chromosomal location
 */
function inferGeneFromLocation(chromosome: string, position: number): string {
  const chrKey = chromosome.startsWith('chr') ? chromosome : `chr${chromosome}`;
  const genesInChr = CHROMOSOME_GENE_MAP[chrKey] || [];
  
  for (const geneInfo of genesInChr) {
    if (position >= geneInfo.start && position <= geneInfo.end) {
      return geneInfo.gene;
    }
  }
  
  return '';
}

/**
 * Determines the effect of a variant based on reference and alternate alleles
 */
function determineEffect(reference: string, alternate: string): string {
  if (alternate === '.') {
    return 'Missing';
  }
  
  if (reference.length > alternate.length) {
    return 'Deletion';
  } else if (reference.length < alternate.length) {
    return 'Insertion';
  } else if (reference.length === 1 && alternate.length === 1) {
    return 'SNV';
  } else {
    return 'Substitution';
  }
}

/**
 * Validates VCF format
 */
export function validateVcfFormat(content: string): { isValid: boolean; errors: ValidationError[] } {
  return validateAndHandleErrors(content);
}