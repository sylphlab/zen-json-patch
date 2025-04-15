# Product Context: zen-json-patch

## 1. Problem Solved
Existing JSON diff libraries, while functional, often struggle with performance, especially on large or complex JSON objects. Developers needing high-throughput diff generation (e.g., real-time collaboration, data synchronization, auditing) require a faster solution. `fast_json_diff` is a known competitor, but we aim for significantly better performance.

## 2. Target Audience
- Developers building applications requiring real-time data synchronization.
- Backend engineers processing large volumes of JSON data for auditing or versioning.
- Frontend developers implementing collaborative editing features.
- Performance-sensitive applications where diff generation is a bottleneck.

## 3. User Experience Goals
- **Blazing Speed:** The core differentiator. Diff generation should feel instantaneous for common use cases and significantly faster than competitors for large datasets.
- **Simple API:** Easy to integrate and use with minimal boilerplate. `diff(obj1, obj2)` should be the primary interface.
- **Reliability:** Correctly implements RFC 6902, passing all standard test cases.
- **Transparency:** Clear documentation and benchmarking results demonstrating the performance advantage.

## 4. Value Proposition
`zen-json-patch` offers developers the fastest available RFC 6902 compliant JSON diff generation in TypeScript, unlocking performance benefits for applications bottlenecked by diffing operations.
