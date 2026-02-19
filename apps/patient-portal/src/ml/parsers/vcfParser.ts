
export interface VCFVariant {
    chrom: string;
    pos: number;
    id: string; // rsID
    ref: string;
    alt: string;
    qual: string;
    filter: string;
    info: Record<string, string>;
}

export interface ParsedVCF {
    metadata: string[];
    variants: VCFVariant[];
    variantCount: number;
}

/**
 * Parses a VCF file content (string) into structured data.
 * Optimized for browser performance by only processing relevant lines if needed.
 */
export const parseVCFContent = (content: string): ParsedVCF => {
    const lines = content.split('\n');
    const metadata: string[] = [];
    const variants: VCFVariant[] = [];

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        if (trimmed.startsWith('#')) {
            metadata.push(trimmed);
            continue;
        }

        // Parse data line
        // CHROM POS ID REF ALT QUAL FILTER INFO ...
        const parts = trimmed.split(/\t+/);
        if (parts.length < 8) continue;

        const infoString = parts[7] || "";
        const infoMap: Record<string, string> = {};

        // Parse INFO column (key=value;key2=value2)
        infoString.split(';').forEach(item => {
            const [key, val] = item.split('=');
            if (key) infoMap[key] = val || "true";
        });

        variants.push({
            chrom: parts[0],
            pos: parseInt(parts[1], 10),
            id: parts[2],
            ref: parts[3],
            alt: parts[4],
            qual: parts[5],
            filter: parts[6],
            info: infoMap
        });
    }

    return {
        metadata,
        variants,
        variantCount: variants.length
    };
};

/**
 * Reads a File object and returns parsed VCF data.
 */
export const parseVCFFile = async (file: File): Promise<ParsedVCF> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const parsed = parseVCFContent(text);
                resolve(parsed);
            } catch (err) {
                reject(new Error("Failed to parse VCF content: " + err));
            }
        };
        reader.onerror = () => reject(new Error("Error reading file"));
        reader.readAsText(file);
    });
};
