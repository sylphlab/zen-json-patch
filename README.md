# zen-json-patch

[![npm version](https://badge.fury.io/js/zen-json-patch.svg)](https://badge.fury.io/js/zen-json-patch)

A monstrously fast TypeScript library for generating JSON Patch (RFC 6902) diffs between two JSON objects.

## Goal

The primary goal is to provide significantly faster diff generation compared to existing libraries, especially for large or complex objects.

## Installation

```bash
npm install zen-json-patch
# or
yarn add zen-json-patch
# or
pnpm add zen-json-patch
```

## Basic Usage

```typescript
import { diff } from 'zen-json-patch';

const obj1 = { a: 1, b: "hello" };
const obj2 = { a: 2, c: "world" };

const operations = diff(obj1, obj2);

console.log(operations);
// Expected output (order might vary slightly depending on internal details):
// [
//   { op: 'remove', path: '/b' },
//   { op: 'replace', path: '/a', value: 2 },
//   { op: 'add', path: '/c', value: 'world' }
// ]
```

## Current Status & Limitations

- **Array Diffing:** Currently uses a **naive** element-wise comparison for arrays. This is correct but potentially less performant than optimized algorithms (like Myers diff) for certain array changes (e.g., large insertions/deletions near the beginning, element moves). A performant array diff implementation is planned for a future release.
- **Operations Generated:** Primarily generates `add`, `remove`, and `replace` operations. `move` and `copy` operations are not currently generated as optimizations.

## Development

- **Testing:** `npm test`
- **Benchmarking:** `npm run bench` (requires dev dependencies)
- **Building:** `npm run build`

## License

[MIT](LICENSE) (To be added)
