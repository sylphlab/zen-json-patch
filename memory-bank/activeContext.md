# Active Context: zen-json-patch

## Current Focus
- Commit naive array diff implementation and adjusted tests.
- Add integration tests based on RFC 6902 examples.

## Recent Changes
- Installed testing framework (`vitest`).
- Configured `package.json` scripts and metadata.
- Added unit tests for path helpers (`src/path.spec.ts`) and ran successfully.
- Added unit tests for object comparison (`src/index.spec.ts`) and ran successfully.
- Attempted to implement Myers diff, encountered issues, reverted to a very naive array diff (`src/arrayDiff.ts`).
- Adjusted array diff tests (`src/arrayDiff.spec.ts`) to pass with the naive implementation.

## Next Steps
- Commit naive array diff implementation and adjusted tests.
- Add integration tests using RFC 6902 examples (`src/rfc6902.spec.ts`).
- **TODO (Performance):** Revisit and implement a correct and performant array diffing algorithm (e.g., optimized Myers diff) later, replacing the naive version.

## Active Decisions
- **Temporary:** Using a naive element-by-element array diff for initial correctness due to Myers diff implementation issues.
- **Deferred:** Performance optimization of array diffing using Myers/LCS.

## Blockers
- Myers diff implementation proved too complex/error-prone for initial pass; tests were timing out.
