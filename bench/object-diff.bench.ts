import { bench, describe } from 'vitest';
import { diff as zenDiff } from '../src/index'; // Import our diff function

// Dynamically import fast-json-diff only during benchmark execution
// to avoid making it a hard dependency
let fastDiff: Function | null = null;
try {
  const fastJsonDiffModule = await import('fast-json-diff');
  if (fastJsonDiffModule && typeof fastJsonDiffModule.diff === 'function') {
    fastDiff = fastJsonDiffModule.diff;
    // console.log removed
  } else {
    // console.warn removed
  }
} catch (e) {
  // console.warn removed
}

// Helper to conditionally add fastDiff benchmarks
const addFastDiffBench = (name: string, fn: () => void) => {
  if (fastDiff) {
    bench(name, fn);
  } else {
    // Use .skip modifier to skip the benchmark
    bench.skip(name + ' (skipped - fast-json-diff not loaded)', () => {});
  }
};

// --- Test Data ---
const simpleObj1 = { a: 1, b: "hello", c: true };
const simpleObj2 = { a: 1, b: "world", d: false }; // Replace 'b', remove 'c', add 'd'

const nestedObj1 = { a: 1, b: { c: 2, d: [1, 2] }, e: null };
const nestedObj2 = { a: 99, b: { c: 3, d: [1, 3] }, f: {} }; // Replace 'a', nested replace 'c', nested array change, remove 'e', add 'f'

const largeObj1: {[key: string]: number} = {};
const largeObj2: {[key: string]: number} = {};
for (let i = 0; i < 1000; i++) {
  largeObj1[`key${i}`] = i;
  largeObj2[`key${i}`] = i;
}
largeObj2['key500'] = 999; // One change
largeObj2['newKey'] = 1001; // One addition
delete (largeObj1 as any)['key100']; // One removal

// --- Benchmark Cases ---

describe('Object Diff Comparison', () => {
  bench('zenDiff - Simple Objects', () => {
    zenDiff(simpleObj1, simpleObj2);
  });

  addFastDiffBench('fastDiff - Simple Objects', () => {
    fastDiff!(simpleObj1, simpleObj2); // Use non-null assertion as check is done by addFastDiffBench
  });

  bench('zenDiff - Nested Objects', () => {
    zenDiff(nestedObj1, nestedObj2);
  });

  addFastDiffBench('fastDiff - Nested Objects', () => {
    fastDiff!(nestedObj1, nestedObj2);
  });

  bench('zenDiff - Large Objects (1k keys, few changes)', () => {
    zenDiff(largeObj1, largeObj2);
  });

  addFastDiffBench('fastDiff - Large Objects (1k keys, few changes)', () => {
    fastDiff!(largeObj1, largeObj2);
  });

  // Add more cases as needed
});
