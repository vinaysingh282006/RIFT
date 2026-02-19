export interface ValidationError {
  type: 'format' | 'validation' | 'missing_data' | 'unsupported_feature' | 'corruption';
  severity: 'warning' | 'error' | 'critical';
  message: string;
  details?: string;
  suggestion?: string;
  line?: number;
}

export class VCFError extends Error {
  public errors: ValidationError[];

  constructor(message: string, errors: ValidationError[] = []) {
    super(message);
    this.name = 'VCFError';
    this.errors = errors;
  }
}

export function validateAndHandleErrors(content: string): { isValid: boolean; errors: ValidationError[] } {
  const errors: ValidationError[] = [];
  
  // Check for empty file
  if (!content.trim()) {
    errors.push({
      type: 'validation',
      severity: 'critical',
      message: 'VCF file is empty',
      suggestion: 'Upload a valid VCF file with genetic data'
    });
    return { isValid: false, errors };
  }

  const lines = content.split('\n');
  
  // Check for mandatory header
  let hasFileFormat = false;
  let hasColumnHeader = false;
  let sampleNames: string[] = [];
  
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i].trim();
    
    if (line.startsWith('##fileformat=')) {
      hasFileFormat = true;
      // Validate format version
      if (!line.includes('VCFv4.')) {
        errors.push({
          type: 'format',
          severity: 'warning',
          message: 'Unexpected VCF format version',
          details: `Found: ${line.replace('##fileformat=', '')}. Expected: VCFv4.x`,
          suggestion: 'Ensure VCF file follows VCFv4.x specification'
        });
      }
    } else if (line.startsWith('#CHROM')) {
      hasColumnHeader = true;
      const columns = line.substring(1).split('\t'); // Remove the leading #
      if (columns.length >= 9) {
        // Sample names start from column 10 (index 9) in VCF
        for (let j = 9; j < columns.length; j++) {
          sampleNames.push(columns[j]);
        }
      }
    }
  }
  
  if (!hasFileFormat) {
    errors.push({
      type: 'format',
      severity: 'critical',
      message: 'Missing mandatory ##fileformat header',
      suggestion: 'Ensure VCF file includes proper ##fileformat=VCFv4.x header'
    });
  }
  
  if (!hasColumnHeader) {
    errors.push({
      type: 'format',
      severity: 'critical',
      message: 'Missing mandatory column header (#CHROM\\tPOS\\tID\\tREF\\tALT\\tQUAL\\tFILTER\\tINFO)',
      suggestion: 'Ensure VCF file includes proper column header line starting with #CHROM'
    });
  }

  // Check for basic content validity
  let variantLines = 0;
  let malformedLines = 0;
  let missingInfoTags = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('#')) continue;
    
    variantLines++;
    
    // Basic validation: check for minimum number of columns
    const columns = line.split('\t');
    if (columns.length < 8) {
      malformedLines++;
      errors.push({
        type: 'format',
        severity: 'error',
        message: `Malformed variant record at line ${i + 1}`,
        details: `Expected at least 8 columns, got ${columns.length}`,
        suggestion: 'Ensure each variant record has CHROM, POS, ID, REF, ALT, QUAL, FILTER, INFO columns',
        line: i + 1
      });
    } else {
      // Validate specific column formats
      const [chrom, pos, id, ref, alt, qual, filter, info] = columns;
      
      // Validate position is numeric
      if (isNaN(Number(pos))) {
        errors.push({
          type: 'validation',
          severity: 'error',
          message: `Invalid position at line ${i + 1}`,
          details: `Position must be numeric, got "${pos}"`,
          suggestion: 'Ensure position column contains valid numeric values',
          line: i + 1
        });
      }
      
      // Validate reference/alternate alleles aren't empty
      if (!ref || ref === '.') {
        errors.push({
          type: 'validation',
          severity: 'error',
          message: `Missing reference allele at line ${i + 1}`,
          details: `REF column cannot be empty or "."`,
          suggestion: 'Ensure REF column contains valid nucleotide sequence',
          line: i + 1
        });
      }
      
      if (!alt || alt === '.') {
        errors.push({
          type: 'validation',
          severity: 'warning',
          message: `Missing alternate allele at line ${i + 1}`,
          details: `ALT column is empty or "."`,
          suggestion: 'Consider if this is intentional or if variants are missing',
          line: i + 1
        });
      }
      
      // Validate INFO field for pharmacogenomic tags
      if (info && info !== '.') {
        const infoFields = info.split(';');
        let hasGeneTag = false;
        let hasStarAlleleTag = false;
        let hasRsidTag = false;
        
        for (const field of infoFields) {
          if (field.includes('GENE') || field.includes('GENE=')) {
            hasGeneTag = true;
          }
          if (field.includes('STAR') || field.includes('ALLELE') || field.includes('DIPL')) {
            hasStarAlleleTag = true;
          }
          if (field.includes('RSID') || field.startsWith('RS') || field.includes('rs')) {
            hasRsidTag = true;
          }
        }
        
        // For pharmacogenomic analysis, we expect at least some of these tags
        if (!hasGeneTag && !hasStarAlleleTag && !hasRsidTag) {
          missingInfoTags++;
          if (missingInfoTags <= 5) { // Limit to first 5 to avoid too many errors
            errors.push({
              type: 'validation',
              severity: 'warning',
              message: `Missing pharmacogenomic INFO tags at line ${i + 1}`,
              details: 'INFO field should include GENE, STAR allele, or RSID annotations for pharmacogenomic analysis',
              suggestion: 'Ensure VCF file includes pharmacogenomic annotations in INFO field (GENE, STAR allele, RSID)',
              line: i + 1
            });
          }
        }
      }
    }
  }
  
  // Check for reasonable amount of data
  if (variantLines === 0) {
    errors.push({
      type: 'missing_data',
      severity: 'warning',
      message: 'No variant records found in VCF file',
      details: 'File contains headers but no variant data',
      suggestion: 'Verify the VCF file contains genetic variant data'
    });
  }
  
  // Report statistics
  if (malformedLines > 0) {
    const percentage = ((malformedLines / variantLines) * 100).toFixed(2);
    errors.push({
      type: 'format',
      severity: 'warning',
      message: `${malformedLines} malformed records found (${percentage}% of total)`,
      details: `Out of ${variantLines} total records`,
      suggestion: 'Review and correct malformed variant records'
    });
  }
  
  return {
    isValid: errors.filter(e => e.severity === 'critical' || e.severity === 'error').length === 0,
    errors
  };
}

export function formatErrorMessages(errors: ValidationError[]): string[] {
  return errors.map(error => {
    const severityPrefix = error.severity.toUpperCase();
    const message = `[${severityPrefix}] ${error.message}`;
    
    if (error.details) {
      return `${message}\nDetails: ${error.details}`;
    }
    
    return message;
  });
}

export function handleUnsupportedDrug(drugName: string): ValidationError {
  return {
    type: 'unsupported_feature',
    severity: 'warning',
    message: `Unsupported drug: ${drugName}`,
    details: 'This medication is not currently supported for pharmacogenomic analysis',
    suggestion: 'Select from the list of supported medications or contact support for additional drug coverage'
  };
}