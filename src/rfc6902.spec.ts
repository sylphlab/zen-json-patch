import { describe, it, expect } from 'vitest';
import { diff } from './index';
import { Operation } from './types';

// Helper to sort operations for reliable comparison
const sortOps = (ops: Operation[]) => {
  return [...ops].sort((a, b) => {
    if (a.path < b.path) return -1;
    if (a.path > b.path) return 1;
    // Define consistent order for ops at the same path if needed
    if (a.op === 'remove' && b.op !== 'remove') return -1;
    if (a.op !== 'remove' && b.op === 'remove') return 1;
     // For move ops, sort by 'from' path as a secondary factor
     if (a.op === 'move' && b.op === 'move' && 'from' in a && 'from' in b) {
        if (a.from < b.from) return -1;
        if (a.from > b.from) return 1;
    }
    return 0;
  });
};

// Test cases from RFC 6902 Appendix A (https://tools.ietf.org/html/rfc6902#appendix-A)
// These tests now expect the IDEAL/OPTIMAL output (e.g., single add/remove, move)
describe('RFC 6902 Appendix A Examples (Ideal Expectations)', () => {

  // A.1. Adding an Object Member
  it('A.1. Adding an Object Member', () => {
    const doc = { "foo": "bar" };
    const target = { "foo": "bar", "baz": "qux" };
    const expectedPatch: Operation[] = [
      { "op": "add", "path": "/baz", "value": "qux" }
    ];
    expect(sortOps(diff(doc, target))).toEqual(sortOps(expectedPatch));
  });

  // A.2. Adding an Array Element
  it('A.2. Adding an Array Element', () => {
      const doc = { "foo": [ "bar", "baz" ] };
      const target = { "foo": [ "bar", "qux", "baz" ] };
      // Ideal output is a single add
      const expectedPatch: Operation[] = [
         { "op": "add", "path": "/foo/1", "value": "qux" }
      ];
      expect(sortOps(diff(doc, target)), '[Expecting optimal add op]').toEqual(sortOps(expectedPatch));
  });

  // A.3. Removing an Object Member
  it('A.3. Removing an Object Member', () => {
    const doc = { "baz": "qux", "foo": "bar" };
    const target = { "foo": "bar" };
    const expectedPatch: Operation[] = [
      { "op": "remove", "path": "/baz" }
    ];
    expect(sortOps(diff(doc, target))).toEqual(sortOps(expectedPatch));
  });

  // A.4. Removing an Array Element
  it('A.4. Removing an Array Element', () => {
      const doc = { "foo": [ "bar", "qux", "baz" ] };
      const target = { "foo": [ "bar", "baz" ] };
       // Ideal output is a single remove
       const expectedPatch: Operation[] = [
        { "op": "remove", "path": "/foo/1" }
      ];
      expect(sortOps(diff(doc, target)), '[Expecting optimal remove op]').toEqual(sortOps(expectedPatch));
  });

  // A.5. Replacing a Value
  it('A.5. Replacing a Value', () => {
    const doc = { "baz": "qux", "foo": "bar" };
    const target = { "baz": "boo", "foo": "bar" };
    const expectedPatch: Operation[] = [
      { "op": "replace", "path": "/baz", "value": "boo" }
    ];
    expect(sortOps(diff(doc, target))).toEqual(sortOps(expectedPatch));
  });

  // A.6. Moving a Value
  it('A.6. Moving a Value', () => {
    const doc = { "foo": { "bar": "baz", "waldo": "fred" }, "qux": { "corge": "grault" } };
    const target = { "foo": { "waldo": "fred" }, "qux": { "corge": "grault", "thud": "baz" } };
    // Correct expected patch (move operation)
    const expectedPatch: Operation[] = [
       { "op": "move", "from": "/foo/bar", "path": "/qux/thud" }
    ];
    expect(sortOps(diff(doc, target)), '[Expecting optimal move op]').toEqual(sortOps(expectedPatch));
  });

  // A.7. Moving an Array Element
  it('A.7. Moving an Array Element', () => {
    const doc = { "foo": [ "all", "grass", "cows", "eat" ] };
    const target = { "foo": [ "all", "cows", "eat", "grass" ] };
    // Correct expected patch (move operation)
    const expectedPatch: Operation[] = [
      { "op": "move", "from": "/foo/1", "path": "/foo/3" }
    ];
    expect(sortOps(diff(doc, target)), '[Expecting optimal move op]').toEqual(sortOps(expectedPatch));
  });

  // A.8. Testing a Value: Success (Diff generators typically don't produce 'test')
  // A.9. Testing a Value: Error (Diff generators typically don't produce 'test')

  // A.10. Adding a Nested Member Object
  it('A.10. Adding a Nested Member Object', () => {
    const doc = { "foo": "bar" };
    const target = { "foo": "bar", "child": { "grandchild": { } } };
    const expectedPatch: Operation[] = [
      { "op": "add", "path": "/child", "value": { "grandchild": { } } }
    ];
    expect(sortOps(diff(doc, target))).toEqual(sortOps(expectedPatch));
  });

  // A.11. Ignoring Addition of Information

  // A.12. Adding ~ and / Characters
   it('A.12. Adding ~ and / Characters', () => {
      const doc = { "foo": ["bar"] };
      const target = { "foo": ["bar", "baz/~1"] };
      const expectedPatch: Operation[] = [
        { "op": "add", "path": "/foo/1", "value": "baz/~1" }
      ];
      expect(sortOps(diff(doc, target))).toEqual(sortOps(expectedPatch));
   });

   // A.13. Adding an Array Value using "-" (Append)
    it('A.13. Adding an Array Value using "-" (Append)', () => {
        const doc = { "foo": ["bar"] };
        const target = { "foo": ["bar", "baz"] };
        const expectedPatch: Operation[] = [
        { "op": "add", "path": "/foo/1", "value": "baz" }
        ];
        expect(sortOps(diff(doc, target))).toEqual(sortOps(expectedPatch));
    });

});
