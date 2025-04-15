# Project Brief: zen-json-patch

## 1. Overview
Develop a TypeScript library named `zen-json-patch` designed to generate JSON Patch (RFC 6902) diffs between two JSON objects with unparalleled speed, aiming to significantly outperform existing libraries like `fast_json_diff`.

## 2. Goals
- **Primary Goal:** Achieve monstrously fast performance for JSON diff generation.
- Implement the full JSON Patch specification (RFC 6902).
- Provide a simple and intuitive API.
- Target Node.js and potentially browser environments.
- Rigorous benchmarking against `fast_json_diff` and other relevant libraries.

## 3. Non-Goals
- Implementing JSON Patch *application*. Focus is solely on *generation*.
- Supporting formats other than standard JSON.

## 4. Scope
- Core diffing algorithm implementation.
- API definition and implementation.
- Comprehensive test suite (unit, integration).
- Performance benchmarking suite.
- Basic documentation (README).

## 5. Success Metrics
- Measurably faster diff generation times compared to `fast_json_diff` across a variety of JSON structures and diff complexities.
- Full compliance with RFC 6902 test vectors.
- Clean, maintainable, and well-documented TypeScript code.
