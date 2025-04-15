import Benchmark from 'benchmark';
import { diff as zenDiff } from '../src/index'; // Import our diff function

// Placeholder for fast-json-diff - replace with actual import if installed
// import { diff as fastDiff } from 'fast-json-diff'; // Assuming CJS/ESM compatibility
let fastDiff: Function = (a: any, b: any) => [{op:'replace', path:'', value: b}]; // Default placeholder
try {
    // Attempt to require dynamically, handle if not installed
    const fastJsonDiffModule = require('fast-json-diff');
    if (fastJsonDiffModule && typeof fastJsonDiffModule.diff === 'function') {
        fastDiff = fastJsonDiffModule.diff;
        console.log("Using installed fast-json-diff for comparison.");
    } else {
        console.warn("fast-json-diff not found or 'diff' not exported, using placeholder.");
    }
} catch (e) {
    console.warn("Could not require fast-json-diff, using placeholder.", e);
}


const suite = new Benchmark.Suite('Object Diff Comparison');

// --- Test Data ---
const simpleObj1 = { a: 1, b: "hello", c: true };
const simpleObj2 = { a: 1, b: "world", d: false }; // Replace 'b', remove 'c', add 'd'

const nestedObj1 = { a: 1, b: { c: 2, d: [1, 2] }, e: null };
const nestedObj2 = { a: 99, b: { c: 3, d: [1, 3] }, f: {} }; // Replace 'a', nested replace 'c', nested array change, remove 'e', add 'f'

const largeObj1: {[key: string]: number} = {};
const largeObj2: {[key: string]: number} = {};
for(let i = 0; i < 1000; i++) {
    largeObj1[`key${i}`] = i;
    largeObj2[`key${i}`] = i;
}
largeObj2['key500'] = 999; // One change
largeObj2['newKey'] = 1001; // One addition
delete (largeObj1 as any)['key100']; // One removal


// --- Benchmark Cases ---

suite
  .add('zenDiff - Simple Objects', () => {
    zenDiff(simpleObj1, simpleObj2);
  })
  .add('fastDiff - Simple Objects', () => {
      fastDiff(simpleObj1, simpleObj2);
  })
  .add('zenDiff - Nested Objects', () => {
    zenDiff(nestedObj1, nestedObj2);
  })
  .add('fastDiff - Nested Objects', () => {
      fastDiff(nestedObj1, nestedObj2);
  })
   .add('zenDiff - Large Objects (1k keys, few changes)', () => {
    zenDiff(largeObj1, largeObj2);
  })
  .add('fastDiff - Large Objects (1k keys, few changes)', () => {
      fastDiff(largeObj1, largeObj2);
  })
  // Add more cases as needed

  .on('cycle', (event: Benchmark.Event) => {
    console.log(String(event.target));
  })
  .on('complete', function(this: Benchmark.Suite) {
    console.log('--------------------------------------------------');
    // `this.filter('fastest')` might return multiple if speeds are very close
    const fastest = this.filter('fastest').map('name');
    console.log('Fastest is ' + fastest);
    console.log('--------------------------------------------------');
  })
  .run({ 'async': false }); // Run synchronously
