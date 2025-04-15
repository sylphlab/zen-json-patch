# Technical Context: zen-json-patch

## 1. Core Technology Stack
- **Language:** TypeScript (`strict: true`, `target: ES2022`, `module: NodeNext` in `tsconfig.json`)
- **Runtime:** Node.js (Latest LTS recommended)
- **Package Manager:** npm
- **Build System:** `tsup` (for generating ESM, CJS, and `.d.ts` files)
- **Testing/Benchmarking:** `vitest`

## 2. Key Dependencies
- **Development:**
    - `typescript`
    - `@types/node`
    - `vitest` (for testing and benchmarking)
    - `tsup` (for building)
    - `fast-json-diff` (for benchmark comparison)
    - Linting/Formatting (`eslint`, `prettier` - TBD)
- **Runtime:**
    - None.

## 3. Development Environment
- **OS:** Windows (as per Cline's environment), but code should be platform-agnostic.
- **Editor:** VS Code recommended.
- **Version Control:** Git, hosted on GitHub (eventually).

## 4. Constraints & Considerations
- **Performance Focus:** All technical decisions must prioritize raw execution speed. Micro-optimizations are encouraged if benchmarks prove their value.
- **RFC 6902 Compliance:** Strict adherence is mandatory.
- **Code Quality:** Maintain clean, readable, and strongly-typed TypeScript code despite the focus on performance. Use meaningful variable names and comments where necessary.
- **Bundle Size (for potential browser use):** While primarily Node.js focused, keep an eye on potential bundle size implications if browser support becomes a priority later. Avoid heavy dependencies.

## 5. Guideline Checksums
*This section will be populated with Git Blob SHAs for relevant Playbook guidelines as they are verified and used.*
```json
{
}

## 6. Bundle Size History (Brotli + Minified)
*   **2025-04-15 (Initial + Naive Array Diff - Build Output):**
    *   `dist/index.js`: 392 B
    *   `dist/index.cjs`: 634 B
*   **2025-04-15 (Comparison via `import` - Min+Brotli):**
    *   `zen-json-patch` (`{diff}`): 376 B
    *   `just-diff` (`{diff}`): 635 B
    *   `fast-json-diff` (`{diff}`): 780 B
    *   `fast-json-patch` (`{compare}`): 3.33 kB
    *   (`json-diff` excluded due to build issues with Node.js dependencies in size-limit)
