# Active Context: zen-json-patch

## Current Focus
- Finalize benchmark structure for meaningful `zenDiff` vs `fastDiff` comparison.

## Recent Changes
- Reverted previous benchmark file splitting (`git reset --hard 4f3f8ee`).
- **Corrected Benchmark Structure:** Confirmed that using nested `describe` blocks within `bench/array-diff.bench.ts` and `bench/object-diff.bench.ts` correctly limits Vitest's `fastest`/`slowest` markers to direct `zenDiff` vs `fastDiff` comparisons for each specific task, as intended by commit `a2943ca`.
- Kept previous fixes (log silencing, TypeScript error workarounds).
- Deleted mistakenly created separate benchmark file (`bench/array-diff-simple-add.bench.ts`).

## Next Steps
- **(Completed)** Run benchmarks to verify the direct comparison structure.
- **TODO (Performance):** Revisit and implement a correct and performant array diffing algorithm (e.g., optimized Myers diff) later, replacing the naive version.
- Add basic README.md.


## Active Decisions
- Using nested `describe` blocks *within* each benchmark file (`array-diff.bench.ts`, `object-diff.bench.ts`) to isolate `zenDiff` vs `fastDiff` comparisons for specific tasks is the correct approach for meaningful `fastest`/`slowest` reporting.
- Using `vitest` for both testing and benchmarking.
- Using `tsup` for building ESM and CJS modules with declarations.
- Dynamically importing `fast-json-diff` in benchmarks to keep it optional.
- Suppressing `fast-json-diff` dynamic import type error with `@ts-ignore` as a pragmatic workaround.
- **Temporary:** Using a naive element-by-element array diff for initial correctness.
- **Deferred:** Performance optimization of array diffing using Myers/LCS.

## Blockers
- None currently.
