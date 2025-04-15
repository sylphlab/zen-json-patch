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
const arrSimple1 = [1, 2, 3, 4, 5];
const arrSimpleAdd = [1, 2, 3, 4, 5, 6, 7];
const arrSimpleRemove = [1, 2, 3];
const arrInternal1 = [1, 2, 3, 4, 5];
const arrInternalReplace = [1, 99, 3, 98, 5];
const arrInternalShuffle = [5, 4, 3, 2, 1];
const largeN = 500;
const largeArr1: number[] = Array.from({ length: largeN }, (_, i) => i);
const largeArr2_AddEnd: number[] = [...largeArr1, largeN, largeN + 1];
const largeArr2_RemoveEnd: number[] = largeArr1.slice(0, largeN - 50);
const largeArr2_ReplaceMid: number[] = largeArr1.map((v, i) => i === Math.floor(largeN / 2) ? 9999 : v);
const largeArr2_ShuffleMid: number[] = [...largeArr1];
const midPoint = Math.floor(largeN / 2);
const shuffleRange = 5;
for (let i = midPoint - shuffleRange; i < midPoint + shuffleRange; i++) {
    const j = Math.floor(Math.random() * (shuffleRange * 2)) + (midPoint - shuffleRange);
    if (i >= 0 && i < largeN && j >= 0 && j < largeN) {
        [largeArr2_ShuffleMid[i]!, largeArr2_ShuffleMid[j]!] = [largeArr2_ShuffleMid[j]!, largeArr2_ShuffleMid[i]!];
    }
}

// --- Benchmarks ---
describe('Array Diff Benchmarks', () => {

    describe('[Simple Length Change] Add Few End', () => {
        const args: [any, any] = [arrSimple1, arrSimpleAdd];
        addBenchmark('[Naive] zenDiff', zenDiff, args);
        addBenchmark('fast-json-diff', fastJsonDiffFn, args);
        addBenchmark('just-diff', justDiffFn, args);
        addBenchmark('json-diff', jsonDiffFn, args);
        addBenchmark('fast-json-patch', fastJsonPatchCompareFn, args);
    });

    describe('[Simple Length Change] Remove Few End', () => {
        const args: [any, any] = [arrSimple1, arrSimpleRemove];
        addBenchmark('[Naive] zenDiff', zenDiff, args);
        addBenchmark('fast-json-diff', fastJsonDiffFn, args);
        addBenchmark('just-diff', justDiffFn, args);
        addBenchmark('json-diff', jsonDiffFn, args);
        addBenchmark('fast-json-patch', fastJsonPatchCompareFn, args);
    });

    describe('[Simple Internal] Replace', () => {
        const args: [any, any] = [arrInternal1, arrInternalReplace];
        addBenchmark('zenDiff', zenDiff, args);
        addBenchmark('fast-json-diff', fastJsonDiffFn, args);
        addBenchmark('just-diff', justDiffFn, args);
        addBenchmark('json-diff', jsonDiffFn, args);
        addBenchmark('fast-json-patch', fastJsonPatchCompareFn, args);
    });

    describe('[Simple Internal] Shuffle', () => {
        const args: [any, any] = [arrInternal1, arrInternalShuffle];
        addBenchmark('[Naive] zenDiff', zenDiff, args); // Naive generates many replaces
        addBenchmark('fast-json-diff', fastJsonDiffFn, args);
        addBenchmark('just-diff', justDiffFn, args);
        addBenchmark('json-diff', jsonDiffFn, args);
        addBenchmark('fast-json-patch', fastJsonPatchCompareFn, args);
    });

    describe('[Large Length Change] Add Many End', () => {
        const args: [any, any] = [largeArr1, largeArr2_AddEnd];
        addBenchmark('[Naive] zenDiff', zenDiff, args);
        addBenchmark('fast-json-diff', fastJsonDiffFn, args);
        addBenchmark('just-diff', justDiffFn, args);
        addBenchmark('json-diff', jsonDiffFn, args);
        addBenchmark('fast-json-patch', fastJsonPatchCompareFn, args);
    });

    describe('[Large Length Change] Remove Many End', () => {
        const args: [any, any] = [largeArr1, largeArr2_RemoveEnd];
        addBenchmark('[Naive] zenDiff', zenDiff, args);
        addBenchmark('fast-json-diff', fastJsonDiffFn, args);
        addBenchmark('just-diff', justDiffFn, args);
        addBenchmark('json-diff', jsonDiffFn, args);
        addBenchmark('fast-json-patch', fastJsonPatchCompareFn, args);
    });

    describe('[Large Internal] Replace Middle', () => {
        const args: [any, any] = [largeArr1, largeArr2_ReplaceMid];
        addBenchmark('zenDiff', zenDiff, args);
        addBenchmark('fast-json-diff', fastJsonDiffFn, args);
        addBenchmark('just-diff', justDiffFn, args);
        addBenchmark('json-diff', jsonDiffFn, args);
        addBenchmark('fast-json-patch', fastJsonPatchCompareFn, args);
    });

    describe('[Large Internal] Shuffle Middle', () => {
        const args: [any, any] = [largeArr1, largeArr2_ShuffleMid];
        addBenchmark('[Naive] zenDiff', zenDiff, args); // Naive generates many replaces
        addBenchmark('fast-json-diff', fastJsonDiffFn, args);
        addBenchmark('just-diff', justDiffFn, args);
        addBenchmark('json-diff', jsonDiffFn, args);
        addBenchmark('fast-json-patch', fastJsonPatchCompareFn, args);
    });
});
