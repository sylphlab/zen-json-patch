import { bench, describe } from 'vitest';
import { diff as zenDiff } from '../src/index.js'; // Added .js extension
import type { Operation } from '../src/types.js'; // Added .js extension

// --- Dynamic Imports ---
let fastJsonDiffFn: ((a: any, b: any) => Operation[]) | null = null;
let justDiffFn: ((a: any, b: any) => Operation[]) | null = null;
let jsonDiffFn: ((a: any, b: any) => Operation[]) | null = null;
let fastJsonPatchCompareFn: ((a: any, b: any) => Operation[]) | null = null;

try {
    // @ts-ignore
    const fastJsonDiffModule = await import('fast-json-diff');
    if (fastJsonDiffModule?.diff) fastJsonDiffFn = fastJsonDiffModule.diff as any;
} catch { console.warn("Could not load 'fast-json-diff'."); }

try {
    // @ts-ignore
    const justDiffModule = await import('just-diff');
    if (justDiffModule?.diff) justDiffFn = justDiffModule.diff as any;
} catch { console.warn("Could not load 'just-diff'."); }

try {
    // @ts-ignore
    const jsonDiffModule = await import('json-diff');
     // json-diff's diff function might need specific handling/options, assuming basic usage
    if (jsonDiffModule?.diff) jsonDiffFn = jsonDiffModule.diff as any;
} catch { console.warn("Could not load 'json-diff'."); }

try {
    // @ts-ignore
    const fastJsonPatchModule = await import('fast-json-patch');
    if (fastJsonPatchModule?.compare) fastJsonPatchCompareFn = fastJsonPatchModule.compare as any;
} catch { console.warn("Could not load 'fast-json-patch'."); }


// --- Helper ---
const addBenchmark = (libName: string, diffFn: Function | null, args: [any, any]) => {
    if (diffFn) {
        bench(libName, () => {
            diffFn(args[0], args[1]);
        });
    } else {
        bench.skip(`${libName} (skipped - library not loaded)`, () => {});
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

// --- Benchmarks ---
describe('Object Diff Benchmarks', () => {

    describe('[Simple] Changes', () => {
        const args: [any, any] = [simpleObj1, simpleObj2];
        addBenchmark('zenDiff', zenDiff, args);
        addBenchmark('fast-json-diff', fastJsonDiffFn, args);
        addBenchmark('just-diff', justDiffFn, args);
        addBenchmark('json-diff', jsonDiffFn, args);
        addBenchmark('fast-json-patch', fastJsonPatchCompareFn, args);
    });

    describe('[Simple] Identical', () => {
        const args: [any, any] = [simpleObj1, simpleObj3];
        addBenchmark('zenDiff', zenDiff, args);
        addBenchmark('fast-json-diff', fastJsonDiffFn, args);
        addBenchmark('just-diff', justDiffFn, args);
        addBenchmark('json-diff', jsonDiffFn, args);
        addBenchmark('fast-json-patch', fastJsonPatchCompareFn, args);
    });

    describe('[Nested] Changes', () => {
        const args: [any, any] = [nestedObj1, nestedObj2];
        addBenchmark('zenDiff', zenDiff, args);
        addBenchmark('fast-json-diff', fastJsonDiffFn, args);
        addBenchmark('just-diff', justDiffFn, args);
        addBenchmark('json-diff', jsonDiffFn, args);
        addBenchmark('fast-json-patch', fastJsonPatchCompareFn, args);
    });

     describe('[Nested] Identical', () => {
        const args: [any, any] = [nestedObj1, nestedObj3];
        addBenchmark('zenDiff', zenDiff, args);
        addBenchmark('fast-json-diff', fastJsonDiffFn, args);
        addBenchmark('just-diff', justDiffFn, args);
        addBenchmark('json-diff', jsonDiffFn, args);
        addBenchmark('fast-json-patch', fastJsonPatchCompareFn, args);
    });

    describe('[Large] Few Changes', () => {
        const args: [any, any] = [largeObj1, largeObj2];
        addBenchmark('zenDiff', zenDiff, args);
        addBenchmark('fast-json-diff', fastJsonDiffFn, args);
        addBenchmark('just-diff', justDiffFn, args);
        addBenchmark('json-diff', jsonDiffFn, args);
        addBenchmark('fast-json-patch', fastJsonPatchCompareFn, args);
    });

    describe('[Large] Identical', () => {
        const args: [any, any] = [largeObj1, largeObj3];
        addBenchmark('zenDiff', zenDiff, args);
        addBenchmark('fast-json-diff', fastJsonDiffFn, args);
        addBenchmark('just-diff', justDiffFn, args);
        addBenchmark('json-diff', jsonDiffFn, args);
        addBenchmark('fast-json-patch', fastJsonPatchCompareFn, args);
    });

});
