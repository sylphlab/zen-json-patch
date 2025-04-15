import { Operation } from './types.js';
import { appendPath } from './path.js';
import { compareValues } from './index.js'; // Keep for recursion on elements

/**
 * Performs a basic deep equality check. Copied here temporarily, consider moving to utils.
 */
function internalDeepEqual(a: any, b: any): boolean {
    if (a === b) return true;
    if (a == null || b == null || typeof a !== typeof b) return false;
    if (typeof a !== 'object') return false;
    if (Array.isArray(a) !== Array.isArray(b)) return false;

    if (Array.isArray(a)) { // Both are arrays
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (!internalDeepEqual(a[i], b[i])) return false;
        }
        return true;
    }

    // Both are objects
    const keysA = Object.keys(a);
    const keysB = new Set(Object.keys(b));
    if (keysA.length !== keysB.size) return false;
    for (const key of keysA) {
        if (!keysB.has(key) || !internalDeepEqual(a[key], b[key])) {
            return false;
        }
    }
    return true;
}

/**
 * Compares two arrays using a naive approach (element-wise compare, add/remove for length diff).
 * Generates 'add', 'remove', and 'replace' JSON Patch operations.
 * Calls `compareValues` recursively for common object elements that are not strictly equal.
 */
export function compareArrays(arr1: any[], arr2: any[], path: string, operations: Operation[]): void {
    const len1 = arr1.length;
    const len2 = arr2.length;
    const minLen = Math.min(len1, len2);

    // Compare common indices
    for (let i = 0; i < minLen; i++) {
        const currentPath = appendPath(path, i);
        const val1 = arr1[i];
        const val2 = arr2[i];

        // Use internalDeepEqual for comparison
        if (!internalDeepEqual(val1, val2)) {
             // If complex types (specifically non-array objects), recurse. Otherwise, replace.
             if (typeof val1 === 'object' && val1 !== null && !Array.isArray(val1) &&
                 typeof val2 === 'object' && val2 !== null && !Array.isArray(val2))
             {
                  compareValues(val1, val2, currentPath, operations);
             } else {
                 // Primitives, arrays, null, or mixed types -> replace
                 operations.push({ op: 'replace', path: currentPath, value: val2 });
             }
        }
        // If elements are deep equal, do nothing for this index.
    }

    // Handle additions if arr2 is longer
    if (len2 > len1) {
        for (let i = len1; i < len2; i++) {
            operations.push({ op: 'add', path: appendPath(path, i), value: arr2[i] });
        }
    }
    // Handle removals if arr1 is longer (in descending index order)
    else if (len1 > len2) {
        for (let i = len1 - 1; i >= len2; i--) {
            operations.push({ op: 'remove', path: appendPath(path, i) });
        }
    }
    // If lengths are equal, all differences handled by the 'replace' loop above.
}
