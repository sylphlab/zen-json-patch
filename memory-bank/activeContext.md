# Active Context: zen-json-patch

## Current Focus
- Expand benchmark comparisons to include more libraries.

## Recent Changes
- Installed `fast-json-patch`, `deep-diff`, `jsondiffpatch`, `json-diff`, `rfc6902`, `just-diff` as dev dependencies.
- **Modified `bench/array-diff.bench.ts` and `bench/object-diff.bench.ts`:**
    - Added dynamic top-level `await import()` for `just-diff`, `json-diff`, and `fast-json-patch` (using its `compare` function).
    - Integrated these new libraries into the existing benchmark structure using the `addBenchmark` helper. Each nested `describe` block now compares `zenDiff` against all loaded comparison libraries for a specific task.
- Confirmed `"type": "module"` in `package.json` and top-level `await` correctly enables dynamic imports and execution of comparison benchmarks.
- Kept `.js` extensions for relative imports and `@ts-ignore` for persistent type resolution issues with dynamic imports.

## Next Steps
- Run benchmarks again (`npm run bench`) to verify the inclusion and execution of the newly added comparison libraries.
- **TODO (Performance):** Revisit and implement a correct and performant array diffing algorithm (e.g., optimized Myers diff) later, replacing the naive version.
- Add basic README.md.


## Active Decisions
- Benchmarking against `fast-json-diff`, `just-diff`, `json-diff`, `fast-json-patch`. (`deep-diff`, `jsondiffpatch` excluded for now due to non-standard output format; `rfc6902` seems to be for patch application).
- Using dynamic `await import()` to keep comparison libraries as optional dev dependencies.
- Using `"type": "module"` in `package.json`.
- Adding `.js` extensions to relative imports.
- Using nested `describe` blocks for direct comparison within specific tasks.
- Using `vitest` for testing and benchmarking.
- Using `tsup` for building.
- **Temporary:** Naive array diff implementation.
- **Deferred:** Array diff optimization.

## Blockers
- Persistent TypeScript type resolution issues with dynamically imported libraries (worked around with `@ts-ignore`).
