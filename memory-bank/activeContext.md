# Active Context: zen-json-patch

## Current Focus
- Enable `fast-json-diff` comparison benchmarks by correctly handling module type and dynamic imports.

## Recent Changes
- Confirmed nested `describe` block structure (commit `a2943ca`) is correct for comparing `zenDiff` vs `fastDiff`.
- Set `"type": "module"` in `package.json` to enable ES Module context for Node.js/Vitest.
- Modified `bench/array-diff.bench.ts` and `bench/object-diff.bench.ts`:
    - Used top-level `await` for dynamic `import('fast-json-diff')` to ensure the module is loaded before benchmarks are defined.
    - Added `.js` extension to relative imports (`../src/index.js`, `../src/types.js`) as required by ES Modules with `"type": "module"`.
    - Kept `@ts-ignore` for the persistent `fast-json-diff` type resolution issue as a workaround.
    - Removed "[Naive Compare]" labels from `fastDiff` benchmarks as they are now direct comparisons.

## Next Steps
- Run benchmarks again (`npm run bench`) to verify `fastDiff` benchmarks are no longer skipped.
- **TODO (Performance):** Revisit and implement a correct and performant array diffing algorithm (e.g., optimized Myers diff) later, replacing the naive version.
- Add basic README.md.


## Active Decisions
- Using `"type": "module"` in `package.json` to treat `.ts` files as ES Modules.
- Using top-level `await` for dynamic imports in benchmarks.
- Adding `.js` extensions to relative imports in ES Modules.
- Using nested `describe` blocks *within* each benchmark file (`array-diff.bench.ts`, `object-diff.bench.ts`) to isolate `zenDiff` vs `fastDiff` comparisons for specific tasks is the correct approach for meaningful `fastest`/`slowest` reporting.
- Using `vitest` for both testing and benchmarking.
- Using `tsup` for building ESM and CJS modules with declarations.
- Dynamically importing `fast-json-diff` in benchmarks to keep it optional.
- Suppressing `fast-json-diff` dynamic import type error with `@ts-ignore` as a pragmatic workaround.
- **Temporary:** Using a naive element-by-element array diff for initial correctness.
- **Deferred:** Performance optimization of array diffing using Myers/LCS.

## Blockers
- None currently.
