import { bench, describe } from 'vitest';
import { diff as zenDiff } from '../src/index'; // Import our diff function

// Dynamically import fast-json-diff only during benchmark execution
let fastDiff: ((a: any, b: any) => any[]) | null = null; // Use specific type
// @ts-ignore - Suppress module resolution error due to potential fast-json-diff export/typing issue
import('fast-json-diff').then((module: { diff?: (a: any, b: any) => any[] }) => {
    if (module && typeof module.diff === 'function') {
        fastDiff = module.diff;
    }
}).catch(e => {
    // Silent failure if fast-json-diff not installed
});

// Helper to conditionally add fastDiff benchmarks
const addFastDiffBench = (name: string, fn: () => void) => {
    if (fastDiff) {
        bench(name, fn);
    } else {
        bench.skip(name + ' (skipped - fast-json-diff not loaded)', () => { });
    }
};

// --- Test Data ---
const simpleObj1 = { a: 1, b: 'hello', c: true };
const simpleObj2 = { a: 2, b: 'world', c: false, d: 'new' }; // Changed, added 'd'
const simpleObj3 = { a: 1, b: 'hello', c: true }; // Identical

// --- Benchmarks ---
describe('Object Diff - Simple Objects', () => {
    bench('zenDiff - Simple Changes', () => {
        zenDiff(simpleObj1, simpleObj2);
    });
    addFastDiffBench('fastDiff - Simple Changes', () => {
        fastDiff!(simpleObj1, simpleObj2);
    });

    bench('zenDiff - Simple Identical', () => {
        zenDiff(simpleObj1, simpleObj3);
    });
    addFastDiffBench('fastDiff - Simple Identical', () => {
        fastDiff!(simpleObj1, simpleObj3);
    });
});
