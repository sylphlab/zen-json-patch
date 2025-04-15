# Progress Tracker: zen-json-patch

## Current Status
- Core diffing logic implemented (object comparison, Myers array diff).
- Preparing for testing phase.

## What Works
- Initial project structure set up (npm, TS, Git).
- Memory Bank initialized.
- Core diffing logic structure (`diff`, `compareValues`, `compareObjects` in `src/index.ts`).
- JSON Pointer path helpers (`src/path.ts`).
- Myers diff algorithm for arrays (`src/arrayDiff.ts`) implemented.

## What's Left (High Level)
- Develop comprehensive test suite (unit, integration, RFC vectors). Start with unit tests.
- Develop benchmarking suite.
- Write README documentation.
- Benchmark against `fast_json_diff`.
- Iterate on performance optimizations based on benchmarking.

## Known Issues / Blockers
- Myers diff implementation in `src/arrayDiff.ts` is complex and requires thorough testing.

## Immediate Next Steps (from activeContext.md)
- Commit Myers diff implementation.
- Install a testing framework (e.g., `vitest`).
- Add basic unit tests for path helpers (`src/path.ts`).
- Add basic unit tests for object comparison (`src/index.ts`).
- Add basic unit tests for array comparison (`src/arrayDiff.ts`), starting with simple cases.
