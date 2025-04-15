import { bench, describe } from 'vitest';
import { diff as zenDiff } from '../src/index'; // Import our diff function

// Dynamically import fast-json-diff only during benchmark execution
let fastDiff: ((a: any, b: any) => any[]) | null = null; // More specific type
// @ts-ignore - Suppress module resolution error due to potential fast-json-diff export/typing issue
import('fast-json-diff').then((module: { diff?: (a: any, b: any) => any[] }) => {
    if (module && typeof module.diff === 'function') {
        fastDiff = module.diff;
    }
}).catch(e => {
    // Silent failure if fast-json-diff not installed
    // console.warn("Could not load fast-json-diff for comparison:", e); // Optional logging
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
// Grouping benchmarks by scenario type for meaningful comparisons.
// NOTE: Current zenDiff array implementation is naive. Benchmarks tagged [Naive]
//       reflect this expectation. `fastDiff` comparisons tagged [Naive Compare]
//       are included to see how a non-naive algo handles the same input,
//       even though zenDiff's *current* approach differs fundamentally.

describe('Array Diff Comparison', () => {

    describe('Scenario: Simple Length Changes (Naive Replace Expected)', () => {
        bench('[Naive] zenDiff - Add Few End', () => {
            zenDiff(arrSimple1, arrSimpleAdd);
        });
        addFastDiffBench('[Naive Compare] fastDiff - Add Few End', () => {
            fastDiff!(arrSimple1, arrSimpleAdd);
        });

        bench('[Naive] zenDiff - Remove Few End', () => {
            zenDiff(arrSimple1, arrSimpleRemove);
        });
        addFastDiffBench('[Naive Compare] fastDiff - Remove Few End', () => {
            fastDiff!(arrSimple1, arrSimpleRemove);
        });
    });

    describe('Scenario: Internal Changes (Same Length)', () => {
        bench('zenDiff - Simple Replace', () => {
            zenDiff(arrInternal1, arrInternalReplace);
        });
        addFastDiffBench('fastDiff - Simple Replace', () => {
            fastDiff!(arrInternal1, arrInternalReplace);
        });

        bench('[Naive] zenDiff - Simple Shuffle', () => { // Naive generates many replaces
            zenDiff(arrInternal1, arrInternalShuffle);
        });
        addFastDiffBench('[Naive Compare] fastDiff - Simple Shuffle', () => { // fast-diff likely smarter
            fastDiff!(arrInternal1, arrInternalShuffle);
        });
    });

    describe('Scenario: Large Array - Length Changes (Naive Replace Expected)', () => {
        bench('[Naive] zenDiff - Add Many End', () => {
            zenDiff(largeArr1, largeArr2_AddEnd);
        });
        addFastDiffBench('[Naive Compare] fastDiff - Add Many End', () => {
            fastDiff!(largeArr1, largeArr2_AddEnd);
        });

        bench('[Naive] zenDiff - Remove Many End', () => {
            zenDiff(largeArr1, largeArr2_RemoveEnd);
        });
        addFastDiffBench('[Naive Compare] fastDiff - Remove Many End', () => {
            fastDiff!(largeArr1, largeArr2_RemoveEnd);
        });
    });

    describe('Scenario: Large Array - Internal Changes (Same Length)', () => {
        bench('zenDiff - Replace Middle', () => {
            zenDiff(largeArr1, largeArr2_ReplaceMid);
        });
        addFastDiffBench('fastDiff - Replace Middle', () => {
            fastDiff!(largeArr1, largeArr2_ReplaceMid);
        });

        bench('[Naive] zenDiff - Shuffle Middle', () => { // Naive generates many replaces
            zenDiff(largeArr1, largeArr2_ShuffleMid);
        });
        addFastDiffBench('[Naive Compare] fastDiff - Shuffle Middle', () => { // fast-diff likely smarter
            fastDiff!(largeArr1, largeArr2_ShuffleMid);
        });
    });
});
