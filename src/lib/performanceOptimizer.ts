// Performance optimization utilities for PharmaGuard

// Cache for parsed VCF files
const vcfCache = new Map<string, any>();
const MAX_CACHE_SIZE = 100;

export function getVCFCacheSize(): number {
  return vcfCache.size;
}

export function clearVCFCache(): void {
  vcfCache.clear();
}

export function getCachedVCF(key: string): any | undefined {
  return vcfCache.get(key);
}

export function setCachedVCF(key: string, data: any): void {
  // Implement LRU eviction if cache gets too large
  if (vcfCache.size >= MAX_CACHE_SIZE) {
    // Remove oldest entry (first in Map iteration)
    const firstKey = vcfCache.keys().next().value;
    if (firstKey) {
      vcfCache.delete(firstKey);
    }
  }
  vcfCache.set(key, data);
}

// Memoization decorator utility
export function memoize(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;
  const cache = new Map();

  descriptor.value = function (...args: any[]) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = method.apply(this, args);
    cache.set(key, result);
    return result;
  };

  return descriptor;
}

// Debouncing utility for UI interactions
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>): void => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttling utility for performance-critical operations
export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>): void => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Asynchronous processing utility for heavy computations
export async function processInChunks<T, R>(
  items: T[], 
  processor: (item: T) => R, 
  chunkSize: number = 100
): Promise<R[]> {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const chunkResults = chunk.map(processor);
    results.push(...chunkResults);
    
    // Yield control back to the event loop to prevent blocking
    if (i + chunkSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
  
  return results;
}

// Performance measurement utility
export function measurePerformance<T>(fn: () => T, operationName: string): { result: T, duration: number } {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  const duration = end - start;
  
  console.log(`${operationName} took ${duration.toFixed(2)} milliseconds`);
  
  return { result, duration };
}

// Efficient gene lookup using Map for O(1) access
export class GeneLookupTable {
  private geneMap: Map<string, any>;
  
  constructor(geneData: any[]) {
    this.geneMap = new Map();
    geneData.forEach(gene => {
      this.geneMap.set(gene.symbol, gene);
      // Add aliases as well
      if (gene.aliases) {
        gene.aliases.forEach((alias: string) => {
          this.geneMap.set(alias, gene);
        });
      }
    });
  }
  
  getGene(symbol: string): any | undefined {
    return this.geneMap.get(symbol);
  }
  
  hasGene(symbol: string): boolean {
    return this.geneMap.has(symbol);
  }
  
  getAllGenes(): any[] {
    return Array.from(this.geneMap.values());
  }
}

// Optimized variant filtering function
export function filterVariantsByGenes(variants: any[], geneSymbols: string[]): any[] {
  // Use Set for O(1) gene symbol lookup
  const geneSet = new Set(geneSymbols.map(g => g.toUpperCase()));
  
  return variants.filter(variant => {
    // Check multiple possible gene location fields
    const geneInfo = variant.gene || variant.info?.GENE || variant.info?.SYMBOL || '';
    return geneSet.has(geneInfo.toUpperCase());
  });
}

// Parallel processing helper (simulated since JS is single-threaded)
export async function parallelProcess<T, R>(
  items: T[], 
  processor: (item: T) => R | Promise<R>,
  concurrency: number = 4
): Promise<R[]> {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchPromises = batch.map(item => Promise.resolve(processor(item)));
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }
  
  return results;
}