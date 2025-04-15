# Technical Context: zen-json-patch

## 1. Core Technology Stack
- **Language:** TypeScript (Strict mode enabled)
- **Runtime:** Node.js (Latest LTS recommended for development and benchmarking)
- **Package Manager:** npm
- **Build System:** TypeScript Compiler (`tsc`)

## 2. Key Dependencies (Initial)
- **Development:**
    - `typescript`
    - `@types/node`
    - Testing framework (e.g., `jest`, `vitest` - TBD)
    - Benchmarking library (e.g., `benchmark`)
    - Linting/Formatting (`eslint`, `prettier` - TBD)
- **Runtime:**
    - None initially. The goal is a self-contained library.

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
