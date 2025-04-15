# System Patterns: zen-json-patch

## 1. Core Algorithm Approach (Initial Hypothesis)
- **Recursive Descent:** Traverse both JSON objects simultaneously.
- **Object Diffing:** Compare keys. Identify added, removed, and potentially modified keys. Recurse for modified keys.
- **Array Diffing:** Identify cheapest sequence of operations (add, remove, replace) to transform source array to target array. This is a critical area for optimization. Potential algorithms to investigate:
    - Longest Common Subsequence (LCS) based approaches (e.g., Myers diff).
    - Heuristics for simple cases (e.g., pure additions/removals at ends).
- **Value Diffing:** Direct comparison for primitive types.
- **Path Generation:** Maintain the JSON Pointer path during traversal.

## 2. Performance Optimization Strategies
- **Minimize Object Allocations:** Reuse patch operation objects where possible.
- **Efficient String Comparisons:** Explore optimized string comparison techniques if benchmarking shows it's a bottleneck.
- **Avoid Unnecessary Traversals:** Prune branches of the JSON tree if they are identical early on (potentially using hashing or reference equality checks if applicable, though less likely with parsed JSON).
- **Focus on Array Diffing:** This is often the most computationally expensive part. Research and implement highly optimized array diff algorithms. Consider trade-offs between optimal diffs (fewest operations) and fastest computation.
- **Benchmarking Driven:** Continuously benchmark against `fast_json_diff` and profile the code to identify bottlenecks.

## 3. API Design
- **Simple Function:** `diff(obj1: any, obj2: any): Operation[]` (where `Operation` is the JSON Patch operation interface).
- **RFC 6902 Compliance:** Ensure output strictly follows the JSON Patch format.

## 4. Testing Strategy
- **Unit Tests:** Test individual diffing functions (object, array, value).
- **Integration Tests:** Use standard RFC 6902 test vectors and custom complex scenarios.
- **Property-Based Testing:** Consider using libraries like `fast-check` to generate diverse JSON inputs and verify properties of the diff output.
- **Benchmarking Tests:** Dedicated tests comparing performance against competitors using various data sizes and structures.
