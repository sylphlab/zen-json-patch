# Active Context: zen-json-patch

## Current Focus
- **Prepare Comprehensive Test Suite:** Write extensive test cases in `src/arrayDiff.spec.ts` and adjust RFC examples in `src/rfc6902.spec.ts` to define the **ideal** expected output (e.g., using `move` operations), regardless of the current naive implementation's capabilities. The goal is to have a complete target for future algorithm development.

## Recent Changes
- **Updated RFC 6902 Tests (A.6, A.7):** Modified tests A.6 and A.7 in `src/rfc6902.spec.ts` to assert the ideal `move` operation output, rather than the output of naive algorithms.
- **Expanded `src/arrayDiff.spec.ts`:** Added more test cases covering various array manipulations (swaps, moves, complex mixes, duplicates) with ideal expected outputs (often involving `move`).
- **Pivoted Array Diff Strategy:** Temporarily using a **naive** array diff implementation in `src/arrayDiff.ts` for basic stability, deferring optimized algorithm implementation.
- Created initial `README.md`.

## Next Steps
- **Run Tests:** Execute `npm test` to confirm the syntax of the updated test files and observe the *expected* failures against the current naive array diff implementation.
- **Memory Bank Update:** Update `progress.md`.
- **Handover:** The test suite is now prepared with ideal expectations. The next major step is for another process/AI to implement the optimized array diff algorithm in `src/arrayDiff.ts` to pass these defined tests.

## Active Decisions
- **Defining Ideal Test Expectations:** Prioritizing the definition of a comprehensive test suite with optimal JSON Patch outputs (`move` ops etc.) as the target specification.
- **Current:** Using a **naive** array diff implementation in `src/arrayDiff.ts` temporarily.
- Benchmarking against `fast-json-diff`, `just-diff`, `json-diff`, `fast-json-patch`.
- Using dynamic `await import()` for optional benchmark dependencies.
- Using `"type": "module"`.
- Using `vitest` for testing and benchmarking.
- Using `tsup` for building.
- Added `size-limit` for bundle size monitoring.

## Blockers
- **Implementation Gap:** The current naive array diff implementation in `src/arrayDiff.ts` will not pass the newly defined ideal test cases (especially those expecting `move`). The blocker is the *implementation* of the optimized algorithm, not the test definition.
- TypeScript type resolution issues with dynamically imported libraries (worked around with `@ts-ignore`).
