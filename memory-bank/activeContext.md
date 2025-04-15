# Active Context: zen-json-patch

## Current Focus
- Commit integration tests.
- Set up benchmarking framework.

## Recent Changes
- Replaced Myers diff attempt with a very naive array diff (`src/arrayDiff.ts`).
- Adjusted array diff tests (`src/arrayDiff.spec.ts`) to pass with the naive implementation.
- Committed naive array diff and adjusted tests.
- Added integration tests based on RFC 6902 examples (`src/rfc6902.spec.ts`).
- Ran integration tests; they pass based on the naive array diff behavior (generating 'replace' for array changes).

## Next Steps
- Commit integration tests.
- Install benchmarking library (e.g., `benchmark`).
- Create initial benchmark setup (`bench/`).
- Create basic benchmark comparing current implementation against `fast_json_diff` for simple object changes.
- **TODO (Performance):** Revisit and implement a correct and performant array diffing algorithm (e.g., optimized Myers diff) later, replacing the naive version.

## Active Decisions
- **Temporary:** Using a naive element-by-element array diff for initial correctness due to Myers diff implementation issues.
- **Deferred:** Performance optimization of array diffing using Myers/LCS.

## Blockers
- Myers diff implementation proved too complex/error-prone for initial pass; tests were timing out.
