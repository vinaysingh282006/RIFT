import { describe, it, expect } from 'vitest';
import { parseVCFContent } from '../ml/parsers/vcfParser';
import { analyzeRisk } from '../ml/engine/riskModel';

describe('ML Pipeline', () => {
    it('should parse VCF content and extract target genes', () => {
        const mockVcf = `##fileformat=VCFv4.2\n#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO\n22\t42522501\trs3892097\tC\tT\t100\tPASS\tDP=100\n`;
        const parsed = parseVCFContent(mockVcf);
        expect(parsed.variants.length).toBeGreaterThan(0);
        expect(parsed.variants[0].id).toBe('rs3892097');
    });

    it('should predict Ineffective risk for Codeine with PM (*4 variants)', async () => {
        const mockVcf = `##fileformat=VCFv4.2\n#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO\n22\t42522501\trs3892097\tC\tT\t100\tPASS\tDP=100\n22\t42523943\trs1065852\tC\tT\t100\tPASS\tDP=100\n`;
        const parsed = parseVCFContent(mockVcf);
        const risks = await analyzeRisk(parsed, ['CODEINE']);
        const codeineRisk = risks.find(r => r.drug === 'CODEINE');
        expect(codeineRisk).toBeDefined();
        expect(codeineRisk?.phenotype).toBe('PM');
        expect(codeineRisk?.risk).toBe('Ineffective');
    });
});
