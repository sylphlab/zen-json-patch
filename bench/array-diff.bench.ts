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
// Grouping each zenDiff vs fastDiff pair in its own describe block
// for direct fastest/slowest comparison on the same task.

describe('Array Diff Benchmarks', () => {

    describe('[Simple Length Change] Add Few End', () => {
        bench('[Naive] zenDiff', () => {
            zenDiff(arrSimple1, arrSimpleAdd);
        });
        addFastDiffBench('[Naive Compare] fastDiff', () => {
            fastDiff!(arrSimple1, arrSimpleAdd);
        });
    });

    describe('[Simple Length Change] Remove Few End', () => {
        bench('[Naive] zenDiff', () => {
            zenDiff(arrSimple1, arrSimpleRemove);
        });
        addFastDiffBench('[Naive Compare] fastDiff', () => {
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
        addFastDiffBench('[Naive Compare] fastDiff', () => { // fast-diff likely smarter
            fastDiff!(arrInternal1, arrInternalShuffle);
        });
    });

    describe('[Large Length Change] Add Many End', () => {
         bench('[Naive] zenDiff', () => {
           zenDiff(largeArr1, largeArr2_AddEnd);
         });
         addFastDiffBench('[Naive Compare] fastDiff', () => {
           fastDiff!(largeArr1, largeArr2_AddEnd);
         });
    });

    describe('[Large Length Change] Remove Many End', () => {
         bench('[Naive] zenDiff', () => {
           zenDiff(largeArr1, largeArr2_RemoveEnd);
         });
         addFastDiffBench('[Naive Compare] fastDiff', () => {
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
        addFastDiffBench('[Naive Compare] fastDiff', () => { // fast-diff likely smarter
            fastDiff!(largeArr1, largeArr2_ShuffleMid);
        });
    });
});
