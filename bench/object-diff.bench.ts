import { bench, describe } from 'vitest';
import { diff as zenDiff } from '../src/index'; // Import our diff function

// Dynamically import fast-json-diff only during benchmark execution
let fastDiff: Function | null = null;
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
const simpleObj1 = { a: 1, b: "hello", c: true };
const simpleObj2 = { a: 1, b: "world", d: false }; // Replace 'b', remove 'c', add 'd'
const simpleObj3 = { a: 1, b: 'hello', c: true }; // Identical

const nestedObj1 = { a: 1, b: { c: 2, d: [1, 2] }, e: null };
const nestedObj2 = { a: 99, b: { c: 3, d: [1, 3] }, f: {} }; // Replace 'a', nested replace 'c', nested array change, remove 'e', add 'f'
const nestedObj3 = { a: 1, b: { c: 2, d: [1, 2] }, e: null }; // Identical

const largeObj1: { [key: string]: number } = {};
const largeObj2: { [key: string]: number } = {};
const largeObj3: { [key: string]: number } = {}; // Identical copy
for (let i = 0; i < 1000; i++) {
    largeObj1[`key${i}`] = i;
    largeObj2[`key${i}`] = i;
    largeObj3[`key${i}`] = i;
}
largeObj2['key500'] = 999; // One change
largeObj2['newKey'] = 1001; // One addition
delete (largeObj1 as any)['key100']; // One removal in obj1 for diffing vs obj2

// --- Benchmark Structure ---
// Grouping each zenDiff vs fastDiff pair in its own describe block
// for direct fastest/slowest comparison on the same task.

describe('Object Diff Benchmarks', () => {

    describe('[Simple] Changes', () => {
        bench('zenDiff', () => {
            zenDiff(simpleObj1, simpleObj2);
        });
        addFastDiffBench('fastDiff', () => {
            fastDiff!(simpleObj1, simpleObj2);
        });
    });

    describe('[Simple] Identical', () => {
        bench('zenDiff', () => {
            zenDiff(simpleObj1, simpleObj3);
        });
        addFastDiffBench('fastDiff', () => {
            fastDiff!(simpleObj1, simpleObj3);
        });
    });

    describe('[Nested] Changes', () => {
        bench('zenDiff', () => {
            zenDiff(nestedObj1, nestedObj2);
        });
        addFastDiffBench('fastDiff', () => {
            fastDiff!(nestedObj1, nestedObj2);
        });
    });

     describe('[Nested] Identical', () => {
        bench('zenDiff', () => {
            zenDiff(nestedObj1, nestedObj3);
        });
        addFastDiffBench('fastDiff', () => {
            fastDiff!(nestedObj1, nestedObj3);
        });
    });

    describe('[Large] Few Changes', () => {
        bench('zenDiff', () => {
            zenDiff(largeObj1, largeObj2);
        });
        addFastDiffBench('fastDiff', () => {
            fastDiff!(largeObj1, largeObj2);
        });
    });

    describe('[Large] Identical', () => {
        bench('zenDiff', () => {
            zenDiff(largeObj1, largeObj3); // Comparing obj1 with identical obj3
        });
        addFastDiffBench('fastDiff', () => {
            fastDiff!(largeObj1, largeObj3);
        });
    });

});
