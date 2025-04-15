import { describe, it, expect } from 'vitest';
import { diff } from './index.js';
import { Operation } from './types.js';

const sortOps = (ops: Operation[]) => {
  // Sort by path primarily for grouping, then op for determinism if paths are same
  // This helps compare sets of operations regardless of minor order variations from diff.
  return [...ops].sort((a, b) => {
    if (a.path < b.path) return -1;
    if (a.path > b.path) return 1;
    if (a.op < b.op) return -1;
    if (a.op > b.op) return 1;
    // For move ops, sort by 'from' path as a secondary factor
    if (a.op === 'move' && b.op === 'move') {
        // Ensure 'from' exists before comparing
        const fromA = (a as any).from ?? '';
        const fromB = (b as any).from ?? '';
        if (fromA < fromB) return -1;
        if (fromA > fromB) return 1;
    }
    return 0;
  });
};

// Helper to filter out operations not related to a specific base path
const filterOpsByPath = (ops: Operation[], basePath: string): Operation[] => {
    // Ensure basePath ends with '/' unless it's the root ""
    const adjustedBasePath = basePath === '' ? '' : (basePath.endsWith('/') ? basePath : basePath + '/');
    return ops.filter(op => {
        if(basePath === '') return true; // Include all if base path is root
        // Check if op.path starts with basePath/ or is exactly basePath (for root level array itself)
        return op.path.startsWith(adjustedBasePath) || op.path === basePath.substring(0, basePath.length -1);
         // Also include 'move' operations where 'from' starts with the basePath
         // || (op.op === 'move' && op.from.startsWith(adjustedBasePath)); // Disabled for now, focus on output path
    });
};


describe('diff function (Array Comparison - Ideal Output)', () => {

  // --- Basic Add/Remove (Should be correct even with naive) ---
  it('should handle addition at the end', () => {
    const obj1 = { items: [1, 2] };
    const obj2 = { items: [1, 2, 3, 4] };
    const expected: Operation[] = [
      { op: 'add', path: '/items/2', value: 3 },
      { op: 'add', path: '/items/3', value: 4 }
    ];
    const actualOps = filterOpsByPath(diff(obj1, obj2), '/items');
    expect(sortOps(actualOps)).toEqual(sortOps(expected));
  });

   it('should handle removal from the end', () => {
    const obj1 = { items: [1, 2, 3, 4] };
    const obj2 = { items: [1, 2] };
    // Remove ops should be ordered by index descending
    const expected: Operation[] = [
      { op: 'remove', path: '/items/3' },
      { op: 'remove', path: '/items/2' }
    ];
     const actualOps = filterOpsByPath(diff(obj1, obj2), '/items');
    // For remove, order matters for application, test exact sequence
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
      { op: 'remove', path: '/items/1' },
      { op: 'remove', path: '/items/0' }
    ];
     const actualOps = filterOpsByPath(diff(obj1, obj2), '/items');
    expect(actualOps).toEqual(expected); // Order matters
  });


  // --- Element Replacements ---
  it('should detect primitive replacements', () => {
    const obj1 = { items: [1, 'old', 3] };
    const obj2 = { items: [1, 'new', 3] };
     const expected: Operation[] = [
         { op: 'replace', path: '/items/1', value: 'new' }
     ];
    const actualOps = filterOpsByPath(diff(obj1, obj2), '/items');
    expect(sortOps(actualOps)).toEqual(sortOps(expected));
  });

   it('should handle nested changes within common array elements (Ideal: nested replace)', () => {
    const obj1 = { items: [ { id: 1, value: 'a' }, { id: 2, value: 'b' } ] };
    const obj2 = { items: [ { id: 1, value: 'a' }, { id: 2, value: 'c' } ] };
    const expected: Operation[] = [
      { op: 'replace', path: '/items/1/value', value: 'c' } // Ideal targets nested path
    ];
     const actualOps = filterOpsByPath(diff(obj1, obj2), '/items');
    expect(sortOps(actualOps)).toEqual(sortOps(expected));
  });

   it('should handle complete object replacement (Ideal: single replace)', () => {
    const obj1 = { items: [1, { id: 'a', val: 10 }, 3] };
    const obj2 = { items: [1, { id: 'b', val: 20 }, 3] };
     const expected: Operation[] = [
         { op: 'replace', path: '/items/1', value: { id: 'b', val: 20 } } // Ideal replaces whole object
     ];
     const actualOps = filterOpsByPath(diff(obj1, obj2), '/items');
    expect(sortOps(actualOps)).toEqual(sortOps(expected));
  });

  // --- Move/Swap Operations (Ideal: 'move' op) ---
   it('should handle adjacent swap (Ideal: move)', () => {
    const obj1 = { items: [1, 2, 3, 4] };
    const obj2 = { items: [1, 3, 2, 4] }; // Swap 2 and 3
    const expected: Operation[] = [
        { op: 'move', from: '/items/2', path: '/items/1' }, // Move 3 from index 2 to 1
        // Note: element originally at 1 (value 2) shifts to index 2 automatically
    ];
    const actualOps = filterOpsByPath(diff(obj1, obj2), '/items');
    expect(sortOps(actualOps)).toEqual(sortOps(expected));
  });

  it('should handle non-adjacent swap (Ideal: move)', () => {
    const obj1 = { items: [1, 2, 3, 4, 5] };
    const obj2 = { items: [1, 4, 3, 2, 5] }; // Swap 2 and 4
    const expected: Operation[] = [
        { op: 'move', from: '/items/3', path: '/items/1' }, // Move 4 from index 3 to 1
        { op: 'move', from: '/items/2', path: '/items/3' }  // Move 2 from original index 2 (now 3 after first move) to 3
    ];
     const expectedAlt: Operation[] = [
        { op: 'move', from: '/items/1', path: '/items/3' },
        { op: 'move', from: '/items/3', path: '/items/1' }
     ];
    const actualOps = filterOpsByPath(diff(obj1, obj2), '/items');
     expect(sortOps(actualOps)).toEqual(sortOps(expectedAlt)); // Testing against the second plausible sequence
  });

  it('should handle move element to end (Ideal: move)', () => {
    const obj1 = { items: [1, 2, 3, 4] };
    const obj2 = { items: [1, 3, 4, 2] }; // Move 2 to end
    const expected: Operation[] = [
      { op: 'move', from: '/items/1', path: '/items/3' }
    ];
    const actualOps = filterOpsByPath(diff(obj1, obj2), '/items');
    expect(sortOps(actualOps)).toEqual(sortOps(expected));
  });

  it('should handle move element to beginning (Ideal: move)', () => {
    const obj1 = { items: [1, 2, 3, 4] };
    const obj2 = { items: [4, 1, 2, 3] }; // Move 4 to beginning (shift/rotation)
    const expected: Operation[] = [
      { op: 'move', from: '/items/3', path: '/items/0' }
    ];
    const actualOps = filterOpsByPath(diff(obj1, obj2), '/items');
    expect(sortOps(actualOps)).toEqual(sortOps(expected));
  });

    it('should handle move block of elements (Ideal: multiple moves or remove/add)', () => {
    const obj1 = { items: [1, 2, 3, 4, 5, 6] };
    const obj2 = { items: [1, 4, 5, 2, 3, 6] }; // Move [2, 3] after 5
    const expected: Operation[] = [
      { op: 'move', from: '/items/1', path: '/items/3' },
      { op: 'move', from: '/items/2', path: '/items/4' }
    ];
     const expectedAlt: Operation[] = [
         { op: 'move', from: '/items/3', path: '/items/1' },
         { op: 'move', from: '/items/4', path: '/items/2' },
     ];
    const actualOps = filterOpsByPath(diff(obj1, obj2), '/items');
    expect(sortOps(actualOps)).toEqual(sortOps(expectedAlt)); // Test against the second sequence
  });

  // --- Mixed Operations ---
  it('should handle add, remove, replace, and potential move', () => {
      const obj1 = { items: ['a', 'b', 'c', 'd', 'e', 'f', 'g'] };
      const obj2 = { items: ['a', 'X', 'c', 'e', 'f', 'Y', 'b'] };
      // Ideal: Expect 'move' for 'b', 'replace' for 'b'->'X' is less ideal but simpler for now.
      const expected: Operation[] = [
          { op: 'replace', path: '/items/1', value: 'X' },
          { op: 'remove', path: '/items/6' }, // g @ original 6
          { op: 'remove', path: '/items/3' }, // d @ original 3
          { op: 'add', path: '/items/5', value: 'Y' },
          { op: 'add', path: '/items/6', value: 'b' }, // Add b at the end

      ];
      const actualOps = filterOpsByPath(diff(obj1, obj2), '/items');
      expect(sortOps(actualOps)).toEqual(sortOps(expected));
  }), // <<< Correct comma placement after closing parenthesis and brace

   // --- Edge cases ---
    it('should diff arrays with duplicate elements correctly (simple replace)', () => {
        const obj1 = { items: [1, 2, 2, 3] };
        const obj2 = { items: [1, 2, 4, 3] };
        const expected: Operation[] = [
            { op: 'replace', path: '/items/2', value: 4 }
        ];
        const actualOps = filterOpsByPath(diff(obj1, obj2), '/items');
        expect(sortOps(actualOps)).toEqual(sortOps(expected));
    });

     it('should diff arrays with duplicate elements correctly (add/remove)', () => {
        const obj1 = { items: [1, 2, 2, 3] };
        const obj2 = { items: [1, 2, 3] };
        const expected: Operation[] = [
            { op: 'remove', path: '/items/2' } // Remove one of the '2's
        ];
        const actualOps = filterOpsByPath(diff(obj1, obj2), '/items');
        expect(sortOps(actualOps)).toEqual(sortOps(expected));
    });

     it('should diff arrays with duplicate elements correctly (move/swap)', () => {
        const obj1 = { items: [1, 2, 3, 2, 4] };
        const obj2 = { items: [1, 2, 2, 3, 4] }; // Move 3 after the second 2
        const expected: Operation[] = [
            { op: 'move', from: '/items/2', path: '/items/3' }
        ];
        const actualOps = filterOpsByPath(diff(obj1, obj2), '/items');
        expect(sortOps(actualOps)).toEqual(sortOps(expected));
    });

});
