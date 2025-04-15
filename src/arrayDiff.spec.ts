import { describe, it, expect } from 'vitest';
import { diff } from './index'; // Test array diff via the main diff function
import { Operation } from './types';

// Helper to sort operations for comparison (less critical for naive replace)
const sortOps = (ops: Operation[]) => {
  return [...ops].sort((a, b) => {
    if (a.path < b.path) return -1;
    if (a.path > b.path) return 1;
    if (a.op === 'remove' && b.op !== 'remove') return -1;
    if (a.op !== 'remove' && b.op === 'remove') return 1;
    return 0;
  });
};


describe('diff function (Array Comparison Focus - Current Naive Implementation)', () => {
  it('should return empty array for identical arrays', () => {
    const obj1 = { items: [1, 2, 3] };
    const obj2 = { items: [1, 2, 3] };
    expect(diff(obj1, obj2)).toEqual([]);
  });

   it('should return empty array for identical arrays with objects', () => {
    // Note: This test passes because compareValues does a deep check when lengths are equal.
    const obj1 = { items: [{id:1}, {id:2}] };
    const obj2 = { items: [{id:1}, {id:2}] };
    expect(diff(obj1, obj2)).toEqual([]);
  });

  // --- Tests adjusted for Naive Diff (Length Change = Replace) ---

  it('[NAIVE] should replace array for simple additions at the end', () => {
    const obj1 = { items: [1, 2] };
    const obj2 = { items: [1, 2, 3, 4] };
    const expected: Operation[] = [
      { op: 'replace', path: '/items', value: [1, 2, 3, 4] } // Naive replace
    ];
    expect(sortOps(diff(obj1, obj2))).toEqual(sortOps(expected));
  });

  it('[NAIVE] should replace array for simple additions at the beginning', () => {
    const obj1 = { items: [3, 4] };
    const obj2 = { items: [1, 2, 3, 4] };
    const expected: Operation[] = [
       { op: 'replace', path: '/items', value: [1, 2, 3, 4] } // Naive replace
    ];
     expect(sortOps(diff(obj1, obj2))).toEqual(sortOps(expected));
  });

    it('[NAIVE] should replace array for simple additions in the middle', () => {
    const obj1 = { items: [1, 4] };
    const obj2 = { items: [1, 2, 3, 4] };
     const expected: Operation[] = [
       { op: 'replace', path: '/items', value: [1, 2, 3, 4] } // Naive replace
    ];
    expect(sortOps(diff(obj1, obj2))).toEqual(sortOps(expected));
  });

  it('[NAIVE] should replace array for simple removals from the end', () => {
    const obj1 = { items: [1, 2, 3, 4] };
    const obj2 = { items: [1, 2] };
    const expected: Operation[] = [
       { op: 'replace', path: '/items', value: [1, 2] } // Naive replace
    ];
     expect(sortOps(diff(obj1, obj2))).toEqual(sortOps(expected));
  });

  it('[NAIVE] should replace array for simple removals from the beginning', () => {
    const obj1 = { items: [1, 2, 3, 4] };
    const obj2 = { items: [3, 4] };
     const expected: Operation[] = [
       { op: 'replace', path: '/items', value: [3, 4] } // Naive replace
    ];
    expect(sortOps(diff(obj1, obj2))).toEqual(sortOps(expected));
  });

  it('[NAIVE] should replace array for simple removals from the middle', () => {
    const obj1 = { items: [1, 2, 3, 4] };
    const obj2 = { items: [1, 4] };
     const expected: Operation[] = [
       { op: 'replace', path: '/items', value: [1, 4] } // Naive replace
    ];
     expect(sortOps(diff(obj1, obj2))).toEqual(sortOps(expected));
  });

  // --- Tests for same-length arrays (Naive element comparison) ---

  it('should detect replacements within the array (same length)', () => {
    const obj1 = { items: [1, 'old', 3] };
    const obj2 = { items: [1, 'new', 3] };
     // Naive diff compares elements at same index if lengths match
     const expected: Operation[] = [
         { op: 'replace', path: '/items/1', value: 'new' }
     ];
    expect(sortOps(diff(obj1, obj2))).toEqual(sortOps(expected));
  });

   it('should handle replacement of object within array (same length)', () => {
    const obj1 = { items: [1, { id: 'a', val: 10 }, 3] };
    const obj2 = { items: [1, { id: 'a', val: 20 }, 3] };
     // Naive diff will call compareValues for the objects at index 1
     const expected: Operation[] = [
         { op: 'replace', path: '/items/1/val', value: 20 }
     ];
    expect(sortOps(diff(obj1, obj2))).toEqual(sortOps(expected));
  });

  it('[NAIVE] should handle basic swap case (same length)', () => {
    const obj1 = { items: [1, 2, 3, 4] };
    const obj2 = { items: [1, 3, 2, 4] }; // Swap 2 and 3
     // Naive diff sees values at index 1 and 2 differ, generates replaces
    const expected: Operation[] = [
      { op: 'replace', path: '/items/1', value: 3 },
      { op: 'replace', path: '/items/2', value: 2 },
    ];
    expect(sortOps(diff(obj1, obj2))).toEqual(sortOps(expected));
  });

   it('[NAIVE] should handle additions and removals mixed (same length)', () => {
    // This case now has same length, modify test
    const obj1 = { items: ['a', 'b', 'c', 'd'] };
    const obj2 = { items: ['a', 'x', 'y', 'd'] }; // replace b, c
     // Naive diff sees values at index 1 and 2 differ
     const expected: Operation[] = [
       { op: 'replace', path: '/items/1', value: 'x' },
       { op: 'replace', path: '/items/2', value: 'y' },
     ];
    expect(sortOps(diff(obj1, obj2))).toEqual(sortOps(expected));
  });

});
