import { describe, it, expect } from 'vitest';
import { diff } from './index.js'; // Test array diff via the main diff function
import { Operation } from './types.js';

// Helper to sort operations for comparison (important for add/remove order)
// Sort primarily by path length, then path string, then op type ('remove' before 'add').
// Removals need descending index order to be applied correctly, adds need ascending.
// However, the diff output order should already be correct if the algorithm is right.
// Let's sort by path for stable comparison, and assume algorithm handles index logic.
const sortOps = (ops: Operation[]) => {
  return [...ops].sort((a, b) => {
    if (a.path < b.path) return -1;
    if (a.path > b.path) return 1;
    // For same path, removals might need specific ordering relative to adds,
    // but RFC6902 doesn't strictly define order for simultaneous ops at same effective location.
    // Let's sort by op type for consistency in tests.
    if (a.op < b.op) return -1; // add, copy, move, remove, replace, test
    if (a.op > b.op) return 1;
    return 0;
  });
};

// Helper to filter out operations not related to a specific base path
const filterOpsByPath = (ops: Operation[], basePath: string): Operation[] => {
    return ops.filter(op => op.path.startsWith(basePath));
};

describe('diff function (Array Comparison Focus - Myers Diff)', () => {
  it('should return empty array for identical primitive arrays', () => {
    const obj1 = { items: [1, 2, 3] };
    const obj2 = { items: [1, 2, 3] };
    expect(diff(obj1, obj2)).toEqual([]);
  });

  it('should return empty array for identical arrays with objects', () => {
    const obj1 = { items: [{id:1}, {id:2}] };
    const obj2 = { items: [{id:1}, {id:2}] };
    expect(diff(obj1, obj2)).toEqual([]);
  });

  it('should handle addition at the end', () => {
    const obj1 = { items: [1, 2] };
    const obj2 = { items: [1, 2, 3, 4] };
    const expected: Operation[] = [
      { op: 'add', path: '/items/2', value: 3 },
      { op: 'add', path: '/items/3', value: 4 }
    ];
    // Filter ops to only focus on the array being tested
    const actualOps = filterOpsByPath(diff(obj1, obj2), '/items');
    expect(sortOps(actualOps)).toEqual(sortOps(expected));
  });

  it('should handle addition at the beginning', () => {
    const obj1 = { items: [3, 4] };
    const obj2 = { items: [1, 2, 3, 4] };
    const expected: Operation[] = [
      { op: 'add', path: '/items/0', value: 1 },
      { op: 'add', path: '/items/1', value: 2 }
    ];
    const actualOps = filterOpsByPath(diff(obj1, obj2), '/items');
    // Note: The Myers diff might generate removes/adds differently but achieve the same result.
    // The key is that applying the patch transforms obj1 to obj2.
    // Let's test the expected output based on common Myers behavior.
    expect(sortOps(actualOps)).toEqual(sortOps(expected));
  });

  it('should handle addition in the middle', () => {
    const obj1 = { items: [1, 4] };
    const obj2 = { items: [1, 2, 3, 4] };
    const expected: Operation[] = [
      { op: 'add', path: '/items/1', value: 2 },
      { op: 'add', path: '/items/2', value: 3 }
    ];
    const actualOps = filterOpsByPath(diff(obj1, obj2), '/items');
    expect(sortOps(actualOps)).toEqual(sortOps(expected));
  });

  it('should handle removal from the end', () => {
    const obj1 = { items: [1, 2, 3, 4] };
    const obj2 = { items: [1, 2] };
    // Removals MUST be in descending index order for correct application
    const expected: Operation[] = [
      { op: 'remove', path: '/items/3' }, // Remove index 3 first
      { op: 'remove', path: '/items/2' }  // Then remove original index 2
    ];
     // Don't sort expected removals, the order matters. Compare exact sequence.
     const actualOps = filterOpsByPath(diff(obj1, obj2), '/items');
     // Sort actual ops only if necessary for comparison stability, but removal order is crucial.
     // The backtracking should generate removals in the correct order (descending index).
     // Let's test the exact output sequence.
    expect(actualOps).toEqual(expected);
  });

   it('should handle removal from the beginning', () => {
    const obj1 = { items: [1, 2, 3, 4] };
    const obj2 = { items: [3, 4] };
    const expected: Operation[] = [
      { op: 'remove', path: '/items/1' }, // Remove original index 1 (value 2)
      { op: 'remove', path: '/items/0' }  // Remove original index 0 (value 1)
    ];
    const actualOps = filterOpsByPath(diff(obj1, obj2), '/items');
    expect(actualOps).toEqual(expected); // Check exact sequence
  });

  it('should handle removal from the middle', () => {
    const obj1 = { items: [1, 2, 3, 4] };
    const obj2 = { items: [1, 4] };
    const expected: Operation[] = [
      { op: 'remove', path: '/items/2' }, // Remove original index 2 (value 3)
      { op: 'remove', path: '/items/1' }  // Remove original index 1 (value 2)
    ];
    const actualOps = filterOpsByPath(diff(obj1, obj2), '/items');
    expect(actualOps).toEqual(expected); // Check exact sequence
  });

  // --- Tests for same-length arrays (element comparison) ---

  it('should detect primitive replacements within the array (same length)', () => {
    const obj1 = { items: [1, 'old', 3] };
    const obj2 = { items: [1, 'new', 3] };
     // Myers diff identifies 1 and 3 as common. compareValues handles the replace at index 1.
     const expected: Operation[] = [
         { op: 'replace', path: '/items/1', value: 'new' }
     ];
    const actualOps = filterOpsByPath(diff(obj1, obj2), '/items');
    expect(sortOps(actualOps)).toEqual(sortOps(expected));
  });

   it('should handle deep replacement of object within array (same length)', () => {
    const obj1 = { items: [1, { id: 'a', val: 10 }, 3] };
    const obj2 = { items: [1, { id: 'a', val: 20 }, 3] };
     // Myers identifies outer elements and object structure as common. compareValues handles the nested 'val' replace.
     const expected: Operation[] = [
         { op: 'replace', path: '/items/1/val', value: 20 }
     ];
     const actualOps = filterOpsByPath(diff(obj1, obj2), '/items');
    expect(sortOps(actualOps)).toEqual(sortOps(expected));
  });

   it('should handle complete object replacement within array (same length)', () => {
    const obj1 = { items: [1, { id: 'a', val: 10 }, 3] };
    const obj2 = { items: [1, { id: 'b', val: 20 }, 3] };
     // Myers identifies 1 and 3 as common. compareValues sees objects at index 1 are different.
     const expected: Operation[] = [
         { op: 'replace', path: '/items/1', value: { id: 'b', val: 20 } }
     ];
     const actualOps = filterOpsByPath(diff(obj1, obj2), '/items');
    expect(sortOps(actualOps)).toEqual(sortOps(expected));
  });

  // --- More Complex Scenarios ---

  it('should handle basic swap correctly (add/remove)', () => {
    const obj1 = { items: [1, 2, 3, 4] };
    const obj2 = { items: [1, 3, 2, 4] }; // Swap 2 and 3
    // Expected output might vary depending on Myers implementation tie-breaking.
    // This represents one possible minimal set of operations.
    const expected: Operation[] = [
        { op: 'remove', path: '/items/2' }, // remove 3 at original index 2
        { op: 'remove', path: '/items/1' }, // remove 2 at original index 1
        { op: 'add', path: '/items/1', value: 3 }, // add 3 at index 1
        { op: 'add', path: '/items/2', value: 2 }  // add 2 at index 2
    ];
    const actualOps = filterOpsByPath(diff(obj1, obj2), '/items');
    // The exact sequence of ops from Myers can vary, but this is a plausible minimal set.
    // Let's test for *a* valid sequence. Apply the patch to check correctness.
    // For now, compare against a likely sequence, sorting might obscure index issues.
    // A more robust test would apply the patch. Let's stick to comparing output for now.
    // Use sorted comparison for stability, acknowledging exact op order might differ slightly
    // but should result in the same final state.
    expect(sortOps(actualOps)).toEqual(sortOps(expected));
    // TODO: Consider adding a patch application test helper.
  });

  it('should handle additions and removals mixed', () => {
    const obj1 = { items: ['a', 'b', 'c', 'd', 'e'] };
    const obj2 = { items: ['a', 'x', 'c', 'y', 'e'] }; // remove b, d; add x, y
    const expected: Operation[] = [
        { op: 'remove', path: '/items/3' }, // remove d at original index 3
        { op: 'remove', path: '/items/1' }, // remove b at original index 1
        { op: 'add', path: '/items/1', value: 'x' }, // add x at index 1
        { op: 'add', path: '/items/3', value: 'y' }  // add y at index 3
    ];
    const actualOps = filterOpsByPath(diff(obj1, obj2), '/items');
    expect(sortOps(actualOps)).toEqual(sortOps(expected)); // Sort for stability
  });

  it('should handle shift/rotation', () => {
    const obj1 = { items: [1, 2, 3, 4] };
    const obj2 = { items: [4, 1, 2, 3] };
    const expected: Operation[] = [
      { op: 'remove', path: '/items/3' }, // remove 4 from end
      { op: 'add', path: '/items/0', value: 4 }   // add 4 at beginning
    ];
    const actualOps = filterOpsByPath(diff(obj1, obj2), '/items');
    // Check exact sequence as remove affects add index
    expect(actualOps).toEqual(expected);
  });

  it('should handle empty source array', () => {
    const obj1 = { items: [] };
    const obj2 = { items: [1, 2] };
    const expected: Operation[] = [
      { op: 'add', path: '/items/0', value: 1 },
      { op: 'add', path: '/items/1', value: 2 }
    ];
    const actualOps = filterOpsByPath(diff(obj1, obj2), '/items');
    expect(sortOps(actualOps)).toEqual(sortOps(expected));
  });

  it('should handle empty target array', () => {
    const obj1 = { items: [1, 2] };
    const obj2 = { items: [] };
    const expected: Operation[] = [
      { op: 'remove', path: '/items/1' }, // remove index 1 first
      { op: 'remove', path: '/items/0' }  // remove index 0
    ];
     const actualOps = filterOpsByPath(diff(obj1, obj2), '/items');
    expect(actualOps).toEqual(expected); // Check exact sequence
  });

  it('should handle nested changes within common array elements', () => {
    const obj1 = { items: [ { id: 1, value: 'a' }, { id: 2, value: 'b' } ] };
    const obj2 = { items: [ { id: 1, value: 'a' }, { id: 2, value: 'c' } ] };
    const expected: Operation[] = [
      { op: 'replace', path: '/items/1/value', value: 'c' }
    ];
     const actualOps = filterOpsByPath(diff(obj1, obj2), '/items');
    expect(sortOps(actualOps)).toEqual(sortOps(expected));
  });

  it('should handle complex mix of add, remove, and nested changes', () => {
    const obj1 = { data: [ { id: 1, name: 'A' }, { id: 2, name: 'B' }, { id: 3, name: 'C' } ] };
    const obj2 = { data: [ { id: 4, name: 'D' }, { id: 2, name: 'B-mod' }, { id: 3, name: 'C' } ] };
    // Expected: remove id:1, add id:4, replace name in id:2
    const expected: Operation[] = [
      { op: 'remove', path: '/data/0' },          // Remove {id:1, name:'A'}
      { op: 'add', path: '/data/0', value: { id: 4, name: 'D'} }, // Add {id:4, name:'D'} at index 0
      { op: 'replace', path: '/data/1/name', value: 'B-mod' } // Replace name in {id:2} (now at index 1)
    ];
     const actualOps = filterOpsByPath(diff(obj1, obj2), '/data');
    expect(sortOps(actualOps)).toEqual(sortOps(expected));
  });

});
