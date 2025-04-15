import { bench, describe } from 'vitest';
import { diff as zenDiff } from '../src/index.js'; // Import our diff function

// --- Test Data ---
const simpleObj1 = { a: 1, b: 'hello', c: true };
const simpleObj2 = { a: 2, b: 'world', c: false, d: 'new' }; // Changed, added 'd'
const simpleObj3 = { a: 1, b: 'hello', c: true }; // Identical


// Attempt to dynamically import fast-json-diff using top-level await
let fastDiff: ((a: any, b: any) => any[]) | null = null;
let fastDiffLoadError = false;
try {
    // @ts-ignore - Suppress module resolution error due to potential fast-json-diff export/typing issue
    const module = await import('fast-json-diff');
    if (module && typeof module.diff === 'function') {
        fastDiff = module.diff;
    } else {
        console.warn("fast-json-diff loaded but 'diff' function not found.");
        fastDiffLoadError = true;
    }
} catch (e) {
    console.warn("fast-json-diff not found or failed to load. Skipping its benchmarks.");
    fastDiffLoadError = true;
}

// Helper to conditionally add fastDiff benchmarks
const addFastDiffBench = (name: string, fn: () => void) => {
    if (fastDiff) {
        bench(name, fn);
    } else {
        const reason = fastDiffLoadError ? 'load error' : 'not loaded';
        bench.skip(`${name} (skipped - fast-json-diff ${reason})`, () => { });
    }
};


// --- Benchmarks ---
describe('Object Diff - Simple Objects', () => {
    bench('zenDiff - Simple Changes', () => {
        zenDiff(simpleObj1, simpleObj2);
    });
    addFastDiffBench('fastDiff - Simple Changes', () => {
        fastDiff!(simpleObj1, simpleObj2); // Use non-null assertion - guarded by addFastDiffBench
    });

    bench('zenDiff - Simple Identical', () => {
        zenDiff(simpleObj1, simpleObj3);
    });
    addFastDiffBench('fastDiff - Simple Identical', () => {
        fastDiff!(simpleObj1, simpleObj3); // Use non-null assertion - guarded by addFastDiffBench
    });
});
