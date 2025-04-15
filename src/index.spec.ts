import { describe, it, expect } from 'vitest';
import { diff } from './index'; // Assuming compareObjects logic is tested via diff
import { Operation } from './types';

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

  // Placeholder for array tests - will be moved to arrayDiff.spec.ts
  // it('should delegate array changes correctly (placeholder)', () => {
  //   const obj1 = { items: [1, 2] };
  //   const obj2 = { items: [1, 3] };
  //   // Expected result depends heavily on arrayDiff implementation
  //   // For now, using the naive replace fallback in arrayDiff.ts
  //   const expected: Operation[] = [{ op: 'replace', path: '/items', value: [1, 3] }];
  //   expect(diff(obj1, obj2)).toEqual(expected);
  // });
});
