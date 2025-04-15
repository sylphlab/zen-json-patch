# Active Context: zen-json-patch

## Current Focus
- Clean up benchmark output and structure.

## Recent Changes
- Commented out `console.warn` in `src/arrayDiff.ts` to reduce log noise during benchmarks.
- Restructured `bench/array-diff.bench.ts` using nested `describe` blocks to group related benchmarks by scenario. This makes Vitest's fastest/slowest markers more meaningful within each scenario.
- Fixed TypeScript errors in `bench/array-diff.bench.ts` related to dynamic import and array shuffling logic. Suppressed persistent `fast-json-diff` type resolution error with `@ts-ignore`.

## Next Steps
- Run benchmarks again (`npm run bench`) to verify cleaner output and structure.
- **TODO (Performance):** Revisit and implement a correct and performant array diffing algorithm (e.g., optimized Myers diff) later, replacing the naive version.
- Add basic README.md.


## Active Decisions
- Using `vitest` for both testing and benchmarking.
- Using `tsup` for building ESM and CJS modules with declarations.
- Dynamically importing `fast-json-diff` in benchmarks to keep it optional.
- Suppressing `fast-json-diff` dynamic import type error with `@ts-ignore` as a pragmatic workaround.
- **Temporary:** Using a naive element-by-element array diff for initial correctness.
- **Deferred:** Performance optimization of array diffing using Myers/LCS.

## Blockers
- None currently.
