import { Operation, AddOperation, RemoveOperation, ReplaceOperation } from './types';
import { appendPath } from './path';
// Import compareValues for deep comparison of common elements
import { compareValues } from './index';

/**
 * Simple equality check.
 * TODO: Consider moving to a utils file.
 */
function isEqual(a: any, b: any): boolean {
    // Strict equality check handles primitives and same object references.
    if (a === b) return true;
    // This is insufficient for deep comparison, rely on compareValues.
    // For the naive approach, we might just always replace if !==
    return false; // Treat non-identical references as unequal for naive replace
}


/**
 * Compares two arrays using a very naive approach:
 * - If lengths differ, replace the entire array.
 * - If lengths are same, compare elements one by one. If different, replace or deep diff.
 * This is TEMPORARY for correctness and avoids infinite loops. Performance is BAD.
 *
 * @param arr1 Source array.
 * @param arr2 Target array.
 * @param path Current JSON Pointer path for the array itself.
 * @param operations Accumulator for operations.
 */
export function compareArrays(arr1: any[], arr2: any[], path: string, operations: Operation[]): void {
    const N = arr1.length;
    const M = arr2.length;

    // Simplest Naive Approach: If lengths differ, just replace the whole array.
    if (N !== M) {
        operations.push({ op: 'replace', path, value: arr2 });
        // console.warn(`[Naive Diff] Array lengths differ at path "${path}", replacing entire array.`);
        return;
    }

    // If lengths are the same, compare element by element.
    for (let i = 0; i < N; i++) {
        const currentPath = appendPath(path, i);
        const val1 = arr1[i];
        const val2 = arr2[i];

        // Use strict equality check first for performance
        if (val1 !== val2) {
             // If they are objects/arrays, perform deep comparison
             if (typeof val1 === 'object' && val1 !== null && typeof val2 === 'object' && val2 !== null) {
                 compareValues(val1, val2, currentPath, operations);
             } else {
                 // Otherwise, it's a simple replace for primitives or type changes
                 operations.push({ op: 'replace', path: currentPath, value: val2 });
             }
        }
        // If elements are strictly equal (===), do nothing.
    }
}

// NOTE: This naive implementation is extremely basic and inefficient.
// It serves only as a temporary measure to get tests running without timeouts.
// The TODO remains to implement a proper diff algorithm like Myers.
