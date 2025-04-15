import { bench, describe } from 'vitest';
import { diff as zenDiff } from '../src/index.js'; // Added .js extension
import type { Operation } from '../src/types.js'; // Added .js extension

// Dynamically import fast-json-diff using top-level await
let fastDiff: ((a: any, b: any) => Operation[]) | null = null;
try {
    // @ts-ignore - Keep ignoring persistent type resolution issue
    const module = await import('fast-json-diff');
    if (module && typeof module.diff === 'function') {
        fastDiff = module.diff as (a: any, b: any) => Operation[];
    }
} catch (e) {
    console.warn("Could not load 'fast-json-diff' for comparison. Benchmarks requiring it will be skipped.", e);
    fastDiff = null; // Ensure it's null on failure
}


// Helper to conditionally add fastDiff benchmarks
const addFastDiffBench = (name: string, fn: () => void) => {
    if (fastDiff) {
        bench(name, fn);
    } else {
        bench.skip(name + ' (skipped - fast-json-diff not loaded)', () => { });
    }
};

// --- Test Data ---

// Simple Add/Remove (Length Change -> Naive Replace Expected)
const arrSimple1 = [1, 2, 3, 4, 5];
const arrSimpleAdd = [1, 2, 3, 4, 5, 6, 7];
const arrSimpleRemove = [1, 2, 3];

// Same Length, Internal Changes
const arrInternal1 = [1, 2, 3, 4, 5];
const arrInternalReplace = [1, 99, 3, 98, 5]; // Simple replacements
const arrInternalShuffle = [5, 4, 3, 2, 1]; // Reversed

// Larger Arrays
const largeN = 500;
const largeArr1: number[] = [];
const largeArr2_AddEnd: number[] = [];
const largeArr2_RemoveEnd: number[] = [];
const largeArr2_ReplaceMid: number[] = [];
const largeArr2_ShuffleMid: number[] = []; // Renamed from largeArr2_ShuffleSmall

for (let i = 0; i < largeN; i++) {
    largeArr1.push(i);
    largeArr2_AddEnd.push(i);
    if (i < largeN - 50) { // Remove last 50
        largeArr2_RemoveEnd.push(i);
    }
    largeArr2_ReplaceMid.push(i === Math.floor(largeN / 2) ? 9999 : i);
    largeArr2_ShuffleMid.push(i);
}
largeArr2_AddEnd.push(largeN, largeN + 1); // Add 2 at end

// Shuffle middle 10 elements more realistically
const midPoint = Math.floor(largeN / 2);
const shuffleRange = 5;
for (let i = midPoint - shuffleRange; i < midPoint + shuffleRange; i++) {
    const j = Math.floor(Math.random() * (shuffleRange * 2)) + (midPoint - shuffleRange);
    // Add bounds check before swapping
    if (i >= 0 && i < largeN && j >= 0 && j < largeN) {
         // Use non-null assertion since bounds are checked
        [largeArr2_ShuffleMid[i]!, largeArr2_ShuffleMid[j]!] = [largeArr2_ShuffleMid[j]!, largeArr2_ShuffleMid[i]!];
    }
}

// --- Benchmark Structure ---
// Grouping each zenDiff vs fastDiff pair in its own describe block
// for direct fastest/slowest comparison on the same task.

describe('Array Diff Benchmarks', () => {

    describe('[Simple Length Change] Add Few End', () => {
        bench('[Naive] zenDiff', () => {
            zenDiff(arrSimple1, arrSimpleAdd);
        });
        addFastDiffBench('fastDiff', () => { // Removed '[Naive Compare]' as it's now a direct comparison
            fastDiff!(arrSimple1, arrSimpleAdd);
        });
    });

    describe('[Simple Length Change] Remove Few End', () => {
        bench('[Naive] zenDiff', () => {
            zenDiff(arrSimple1, arrSimpleRemove);
        });
        addFastDiffBench('fastDiff', () => { // Removed '[Naive Compare]'
            fastDiff!(arrSimple1, arrSimpleRemove);
        });
    });

    describe('[Simple Internal] Replace', () => {
        bench('zenDiff', () => {
            zenDiff(arrInternal1, arrInternalReplace);
        });
        addFastDiffBench('fastDiff', () => {
            fastDiff!(arrInternal1, arrInternalReplace);
        });
    });

    describe('[Simple Internal] Shuffle', () => {
        bench('[Naive] zenDiff', () => { // Naive generates many replaces
            zenDiff(arrInternal1, arrInternalShuffle);
        });
        addFastDiffBench('fastDiff', () => { // Removed '[Naive Compare]', fast-diff likely smarter
            fastDiff!(arrInternal1, arrInternalShuffle);
        });
    });

    describe('[Large Length Change] Add Many End', () => {
         bench('[Naive] zenDiff', () => {
           zenDiff(largeArr1, largeArr2_AddEnd);
         });
         addFastDiffBench('fastDiff', () => { // Removed '[Naive Compare]'
           fastDiff!(largeArr1, largeArr2_AddEnd);
         });
    });

    describe('[Large Length Change] Remove Many End', () => {
         bench('[Naive] zenDiff', () => {
           zenDiff(largeArr1, largeArr2_RemoveEnd);
         });
         addFastDiffBench('fastDiff', () => { // Removed '[Naive Compare]'
           fastDiff!(largeArr1, largeArr2_RemoveEnd);
         });
    });

     describe('[Large Internal] Replace Middle', () => {
        bench('zenDiff', () => {
            zenDiff(largeArr1, largeArr2_ReplaceMid);
        });
        addFastDiffBench('fastDiff', () => {
            fastDiff!(largeArr1, largeArr2_ReplaceMid);
        });
    });

    describe('[Large Internal] Shuffle Middle', () => {
        bench('[Naive] zenDiff', () => { // Naive generates many replaces
            zenDiff(largeArr1, largeArr2_ShuffleMid);
        });
        addFastDiffBench('fastDiff', () => { // Removed '[Naive Compare]', fast-diff likely smarter
            fastDiff!(largeArr1, largeArr2_ShuffleMid);
        });
    });
});
