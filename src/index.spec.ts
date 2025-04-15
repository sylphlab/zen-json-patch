import { describe, it, expect } from 'vitest';
import { diff } from './index'; // Assuming compareObjects logic is tested via diff
import { Operation } from './types';

// Helper to sort operations for reliable comparison (copied from other spec files)
const sortOps = (ops: Operation[]) => {
  return [...ops].sort((a, b) => {
    if (a.path < b.path) return -1;
    if (a.path > b.path) return 1;
    if (a.op < b.op) return -1;
    if (a.op > b.op) return 1;
    // For move ops, sort by 'from' path as a secondary factor
    if (a.op === 'move' && b.op === 'move' && 'from' in a && 'from' in b) {
        const fromA = (a as any).from ?? '';
        const fromB = (b as any).from ?? '';
        if (fromA < fromB) return -1;
        if (fromA > fromB) return 1;
    }
    return 0;
  });
};


describe('diff function (Object Comparison Focus)', () => {
  it('should return empty array for identical objects', () => {
    const obj1 = { a: 1, b: 'hello' };
    const obj2 = { a: 1, b: 'hello' };
    expect(diff(obj1, obj2)).toEqual([]);
  });

  it('should detect added properties', () => {
    const obj1 = { a: 1 };
    const obj2 = { a: 1, b: 'new' };
    const expected: Operation[] = [{ op: 'add', path: '/b', value: 'new' }];
    expect(diff(obj1, obj2)).toEqual(expected);
  });

  it('should detect removed properties', () => {
    const obj1 = { a: 1, b: 'old' };
    const obj2 = { a: 1 };
    const expected: Operation[] = [{ op: 'remove', path: '/b' }];
    expect(diff(obj1, obj2)).toEqual(expected);
  });

  it('should detect replaced properties (different values)', () => {
    const obj1 = { a: 1, b: 'old' };
    const obj2 = { a: 1, b: 'new' };
    const expected: Operation[] = [{ op: 'replace', path: '/b', value: 'new' }];
    expect(diff(obj1, obj2)).toEqual(expected);
  });

  it('should detect replaced properties (different types)', () => {
    const obj1 = { a: 1, b: 'string' };
    const obj2 = { a: 1, b: 123 };
    const expected: Operation[] = [{ op: 'replace', path: '/b', value: 123 }];
    expect(diff(obj1, obj2)).toEqual(expected);
  });

   it('should handle null values correctly (replace)', () => {
    const obj1 = { a: 1, b: 'not null' };
    const obj2 = { a: 1, b: null };
    const expected: Operation[] = [{ op: 'replace', path: '/b', value: null }];
    expect(diff(obj1, obj2)).toEqual(expected);
  });

   it('should handle null values correctly (add)', () => {
    const obj1 = { a: 1 };
    const obj2 = { a: 1, b: null };
    const expected: Operation[] = [{ op: 'add', path: '/b', value: null }];
    expect(diff(obj1, obj2)).toEqual(expected);
  });

    it('should handle null values correctly (remove)', () => {
    const obj1 = { a: 1, b: null };
    const obj2 = { a: 1 };
    const expected: Operation[] = [{ op: 'remove', path: '/b' }];
    expect(diff(obj1, obj2)).toEqual(expected);
  });

  it('should handle nested object changes (add)', () => {
    const obj1 = { a: { b: 1 } };
    const obj2 = { a: { b: 1, c: 2 } };
    const expected: Operation[] = [{ op: 'add', path: '/a/c', value: 2 }];
    expect(diff(obj1, obj2)).toEqual(expected);
  });

  it('should handle nested object changes (remove)', () => {
    const obj1 = { a: { b: 1, c: 2 } };
    const obj2 = { a: { b: 1 } };
    const expected: Operation[] = [{ op: 'remove', path: '/a/c' }];
    expect(diff(obj1, obj2)).toEqual(expected);
  });

   it('should handle nested object changes (replace)', () => {
    const obj1 = { a: { b: 1 } };
    const obj2 = { a: { b: 99 } };
    const expected: Operation[] = [{ op: 'replace', path: '/a/b', value: 99 }];
    expect(diff(obj1, obj2)).toEqual(expected);
  });

   it('should handle replacing a value with an object', () => {
    const obj1 = { a: 1 };
    const obj2 = { a: { b: 2 } };
    const expected: Operation[] = [{ op: 'replace', path: '/a', value: { b: 2 } }];
    expect(diff(obj1, obj2)).toEqual(expected);
  });

   it('should handle replacing an object with a value', () => {
    const obj1 = { a: { b: 2 } };
    const obj2 = { a: 1 };
    const expected: Operation[] = [{ op: 'replace', path: '/a', value: 1 }];
    expect(diff(obj1, obj2)).toEqual(expected);
  });

   it('should handle keys with special characters', () => {
    const obj1 = { 'a/b': 1 };
    const obj2 = { 'a/b': 2 };
    const expected: Operation[] = [{ op: 'replace', path: '/a~1b', value: 2 }];
    expect(diff(obj1, obj2)).toEqual(expected);

    const obj3 = {};
    const obj4 = { '~c': 3 };
    const expected2: Operation[] = [{ op: 'add', path: '/~0c', value: 3 }];
    expect(diff(obj3, obj4)).toEqual(expected2);

     const obj5 = { 'd/e~f': 4 };
     const obj6 = {};
     const expected3: Operation[] = [{ op: 'remove', path: '/d~1e~0f' }];
      expect(diff(obj5, obj6)).toEqual(expected3);
   });

   it('should handle replacing an object with an array', () => {
       const obj1 = { a: { b: 1 } };
       const obj2 = { a: [1, 2] };
       const expected: Operation[] = [{ op: 'replace', path: '/a', value: [1, 2] }];
       expect(diff(obj1, obj2)).toEqual(expected);
   });

   it('should handle replacing an array with an object', () => {
       const obj1 = { a: [1, 2] };
       const obj2 = { a: { b: 1 } };
       const expected: Operation[] = [{ op: 'replace', path: '/a', value: { b: 1 } }];
       expect(diff(obj1, obj2)).toEqual(expected);
   });

    it('should handle replacing the root object', () => {
       const obj1 = { a: 1 };
       const obj2 = { b: 2 };
       // RFC6902 implies replacing the root requires specific handling if allowed,
       // but typically diff libraries might return add/remove for all keys.
       // A single 'replace' at path "" is another interpretation.
       // Let's expect add/remove as it reflects comparing keys.
       const expected: Operation[] = [
           { op: 'remove', path: '/a' },
           { op: 'add', path: '/b', value: 2 }
       ];
       // Sorting helps compare the set regardless of order
       expect(sortOps(diff(obj1, obj2))).toEqual(sortOps(expected));
   });

    it('should handle deeply nested changes', () => {
       const obj1 = { a: { b: { c: { d: 1, e: 'old' } } } };
       const obj2 = { a: { b: { c: { d: 2, f: 'new' } } } };
       const expected: Operation[] = [
           { op: 'remove', path: '/a/b/c/e' },
           { op: 'replace', path: '/a/b/c/d', value: 2 },
           { op: 'add', path: '/a/b/c/f', value: 'new' }
       ];
       expect(sortOps(diff(obj1, obj2))).toEqual(sortOps(expected));
   });

    // --- Ideal Move/Copy Tests (Expected to fail with current implementation) ---

    it('should ideally generate "move" for object property value move', () => {
        const obj1 = { a: 1, b: { c: 2 } };
        const obj2 = { a: 1, d: { c: 2 } }; // Value of 'b' moved to 'd'
        const expected: Operation[] = [
            { op: 'move', from: '/b', path: '/d' }
        ];
        expect(sortOps(diff(obj1, obj2)), '[Expecting optimal move op]').toEqual(sortOps(expected));
    });

    // JSON Patch doesn't have a standard diff algorithm requirement to detect 'copy'.
    // Generating 'copy' usually requires explicit intent or complex heuristics.
    // We'll define the test but acknowledge 'add' is the likely non-optimal output.
    it('should ideally generate "copy" (or add) for object property value copy', () => {
        const obj1 = { a: { b: 1 } };
        const obj2 = { a: { b: 1 }, c: { b: 1 } }; // Value of 'a' copied to 'c'
        const expected: Operation[] = [
            // { op: 'copy', from: '/a', path: '/c' } // Ideal (but unlikely from generic diff)
             { op: 'add', path: '/c', value: { b: 1 } } // More likely output
        ];
        expect(sortOps(diff(obj1, obj2)), '[Expecting add op as copy detection is complex]').toEqual(sortOps(expected));
    });


   // Placeholder for array tests - now covered in arrayDiff.spec.ts
   // it('should delegate array changes correctly (placeholder)', () => {
  //   const obj1 = { items: [1, 2] };
  //   const obj2 = { items: [1, 3] };
  //   // Expected result depends heavily on arrayDiff implementation
  //   // For now, using the naive replace fallback in arrayDiff.ts
  //   const expected: Operation[] = [{ op: 'replace', path: '/items', value: [1, 3] }];
  //   expect(diff(obj1, obj2)).toEqual(expected);
  // });
});
