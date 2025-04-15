# Active Context: zen-json-patch

## Current Focus
- Create array diff benchmark file.

## Recent Changes
- Added integration tests based on RFC 6902 examples (`src/rfc6902.spec.ts`). Ran successfully (reflecting naive array diff behavior).
- Committed integration tests.
- Installed benchmarking library (`benchmark`, `@types/benchmark`, `tslib`).
- Created `bench/` directory and initial object diff benchmark (`bench/object-diff.bench.ts`).
- Fixed `tsconfig.json` (`rootDir`) and build issues.
- Ran initial object diff benchmark (slow compared to placeholder).
- Committed benchmark setup.
- Added `bench` script to `package.json` and fixed JSON comments.
- Committed benchmark script addition.


## Next Steps
- Create benchmark file for array diffs (`bench/array-diff.bench.ts`), including cases that highlight naive diff inefficiency.
- Run array diff benchmark.
- Add basic README.md.
- **TODO (Performance):** Revisit and implement a correct and performant array diffing algorithm (e.g., optimized Myers diff) later, replacing the naive version.

## Active Decisions
- **Temporary:** Using a naive element-by-element array diff for initial correctness due to Myers diff implementation issues.
- **Deferred:** Performance optimization of array diffing using Myers/LCS.

## Blockers
- Myers diff implementation proved too complex/error-prone for initial pass; tests were timing out.
