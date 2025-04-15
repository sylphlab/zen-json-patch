import { describe, it, expect } from 'vitest';
import { escapePathComponent, joinPath, appendPath } from './path';

describe('JSON Pointer Path Helpers', () => {
  describe('escapePathComponent', () => {
    it('should not change segments without special characters', () => {
      expect(escapePathComponent('foo')).toBe('foo');
      expect(escapePathComponent('bar123')).toBe('bar123');
      expect(escapePathComponent(123)).toBe('123'); // Numbers become strings
      expect(escapePathComponent(0)).toBe('0');
    });

    it('should escape "~" to "~0"', () => {
      expect(escapePathComponent('~foo')).toBe('~0foo');
      expect(escapePathComponent('foo~bar')).toBe('foo~0bar');
      expect(escapePathComponent('foo~')).toBe('foo~0');
      expect(escapePathComponent('~')).toBe('~0');
    });

    it('should escape "/" to "~1"', () => {
      expect(escapePathComponent('/foo')).toBe('~1foo');
      expect(escapePathComponent('foo/bar')).toBe('foo~1bar');
      expect(escapePathComponent('foo/')).toBe('foo~1');
      expect(escapePathComponent('/')).toBe('~1');
    });

    it('should escape both "~" and "/" correctly', () => {
      expect(escapePathComponent('~/foo/bar~')).toBe('~0~1foo~1bar~0');
      expect(escapePathComponent('a/~b/c~d')).toBe('a~1~0b~1c~0d');
    });
  });

  describe('joinPath', () => {
    it('should return "" for an empty array', () => {
      expect(joinPath([])).toBe('');
    });

    it('should join segments with "/"', () => {
      expect(joinPath(['foo', 'bar'])).toBe('/foo/bar');
      expect(joinPath([0, 'baz', 1])).toBe('/0/baz/1');
    });

    it('should escape segments before joining', () => {
      expect(joinPath(['a/b', 'c~d'])).toBe('/a~1b/c~0d');
      expect(joinPath(['~', '/'])).toBe('/~0/~1');
    });
  });

  describe('appendPath', () => {
    it('should append to the root path "" correctly', () => {
      expect(appendPath('', 'foo')).toBe('/foo');
      expect(appendPath('', 0)).toBe('/0');
      expect(appendPath('', 'a/b')).toBe('/a~1b');
      expect(appendPath('', '~c')).toBe('/~0c');
    });

    it('should append to an existing path', () => {
      expect(appendPath('/foo', 'bar')).toBe('/foo/bar');
      expect(appendPath('/a/b', 0)).toBe('/a/b/0');
    });

    it('should escape the appended segment', () => {
      expect(appendPath('/foo', 'a/b')).toBe('/foo/a~1b');
      expect(appendPath('/a~1b', 'c~d')).toBe('/a~1b/c~0d');
      expect(appendPath('/~0', '/')).toBe('/~0/~1');
    });
  });
});
