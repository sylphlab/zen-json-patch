# Active Context: zen-json-patch

## Current Focus
- Run initial object diff benchmark.
- Commit benchmark setup.

## Recent Changes
- Adjusted array diff tests (`src/arrayDiff.spec.ts`) to pass with the naive implementation.
- Committed naive array diff and adjusted tests.
- Added integration tests based on RFC 6902 examples (`src/rfc6902.spec.ts`). Ran successfully (reflecting naive array diff behavior).
- Committed integration tests.
- Installed benchmarking library (`benchmark`, `@types/benchmark`).
- Created `bench/` directory.
- Created initial object diff benchmark file (`bench/object-diff.bench.ts`) with basic cases and comparison against `fast-json-diff` (placeholder if not installed).

## Next Steps
- Run the object diff benchmark (`node dist/bench/object-diff.bench.js` after building).
- Commit benchmark setup and initial results/observations.
- Add benchmark script to `package.json`.
- Create benchmark file for array diffs (`bench/array-diff.bench.ts`).
- **TODO (Performance):** Revisit and implement a correct and performant array diffing algorithm (e.g., optimized Myers diff) later, replacing the naive version.

## Active Decisions
- **Temporary:** Using a naive element-by-element array diff for initial correctness due to Myers diff implementation issues.
- **Deferred:** Performance optimization of array diffing using Myers/LCS.

## Blockers
- Myers diff implementation proved too complex/error-prone for initial pass; tests were timing out.
