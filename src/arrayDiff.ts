import { Operation, AddOperation, RemoveOperation } from './types';
import { appendPath } from './path';
// Import compareValues for deep comparison of common elements during backtracking
import { compareValues } from './index';

/**
 * Simple equality check used by Myers Diff to find matching elements quickly along snakes.
 */
function isEqual(a: any, b: any): boolean {
  // Strict equality (===) is usually sufficient and fast for Myers.
  return a === b;
}

/**
 * Recursively diffs common suffix elements identified by the optimization step.
 * Adds generated patch operations (for deep diffs) to the *beginning* of the provided `ops` array.
 */
 function diffCommonSuffix(
    arr1: any[], arr2: any[],
    N: number, M: number, commonSuffix: number,
    path: string, ops: Operation[] // Array to prepend operations to
): void {
    const suffixOps: Operation[] = []; // Collect suffix ops separately
    for (let i = 0; i < commonSuffix; i++) {
        const idx1 = N - 1 - i;
        const idx2 = M - 1 - i;
         // Only deep diff if the elements are objects/arrays
         if (typeof arr1[idx1] === 'object' && arr1[idx1] !== null &&
             typeof arr2[idx2] === 'object' && arr2[idx2] !== null) {
            // Create a temporary array for recursive diff results for this element
            const elementOps: Operation[] = [];
            compareValues(arr1[idx1], arr2[idx2], appendPath(path, idx2), elementOps);
            // Prepend suffix operations in reverse order of discovery (correct logical order)
            suffixOps.unshift(...elementOps);
         }
    }
    // Prepend all suffix operations before the middle operations in the main array
    ops.unshift(...suffixOps);
}


/**
 * Backtracks through the Myers diff trace (using array-based v) to build JSON Patch operations.
 * Adds operations to the `patchOps` array in reverse logical order (caller should reverse).
 */
 function buildPatchWithArrays(
  subArr1: any[], subArr2: any[],
  trace: ReadonlyArray<ReadonlyArray<number>>, // History of 'v' array states
  d: number, k: number, offsetV: number,
  offset: number, // commonPrefix offset
  path: string,
  patchOps: Operation[] // Accumulator for *this run*
): void {
  let kIdx = k + offsetV;
  let x = trace[d]?.[kIdx]; // Use optional chaining for safety
  if (x === undefined || x === -1) throw new Error(`Invalid final trace state: d=${d}, k=${k}, kIdx=${kIdx}`);
  let y = x - k;         // Final y

  for (let currentD = d; currentD > 0; currentD--) {
    const vPrev = trace[currentD - 1]; // v state from distance d-1
    if (!vPrev) throw new Error(`Invalid trace: Missing state for d=${currentD - 1}`);

    const prevK = k;                   // Diagonal k at distance 'currentD'
    const prevKIdx = k + offsetV;

    // Determine if we came from k-1 or k+1 by comparing x values in vPrev
    // Important: Use vPrev values, check for undefined or -1 explicitly
    const kIdxM1 = prevKIdx - 1;
    const kIdxP1 = prevKIdx + 1;
    const vPrevKMinus1 = (kIdxM1 >= 0 && kIdxM1 < vPrev.length) ? vPrev[kIdxM1] : undefined; // Bounds check
    const vPrevKPlus1 = (kIdxP1 >= 0 && kIdxP1 < vPrev.length) ? vPrev[kIdxP1] : undefined; // Bounds check

    const xFromKMinus1 = (prevK > -(currentD - 1) && vPrevKMinus1 !== undefined && vPrevKMinus1 !== -1)
                         ? vPrevKMinus1 + 1 : -Infinity;
    const xFromKPlus1 = (prevK < (currentD - 1) && vPrevKPlus1 !== undefined && vPrevKPlus1 !== -1)
                        ? vPrevKPlus1 : -Infinity;

    let cameFromKMinus1: boolean;
    if (xFromKMinus1 === -Infinity && xFromKPlus1 === -Infinity) {
         throw new Error(`Error in buildPatch: Both previous paths invalid for d=${currentD}, k=${k}`);
    } else if (xFromKMinus1 >= xFromKPlus1) { // Prefer deletion if equal or better x
        cameFromKMinus1 = true;
    } else {
        cameFromKMinus1 = false;
    }

    let prevX: number;
    let prevY: number;

    if (cameFromKMinus1) {
      // Came from k-1: DELETION from subArr1
      k = prevK - 1; // Go to previous diagonal
      const kIdxPrev = k + offsetV;
      const potentialPrevXDel = vPrev[kIdxPrev];
      if (potentialPrevXDel === undefined || potentialPrevXDel === -1) {
          throw new Error(`Invalid trace state during deletion backtrack: d=${currentD-1}, k=${k}, kIdxPrev=${kIdxPrev}`);
      }
      prevX = potentialPrevXDel; // Guaranteed number now
      prevY = prevX - k;
      // Add 'remove' op for the element at target index 'offset + y' BEFORE this step
      patchOps.push({ op: 'remove', path: appendPath(path, offset + y) });
    } else {
      // Came from k+1: INSERTION into subArr2
      k = prevK + 1; // Go to previous diagonal
      const kIdxPrev = k + offsetV;
      const potentialPrevXIns = vPrev[kIdxPrev];
       if (potentialPrevXIns === undefined || potentialPrevXIns === -1) {
           throw new Error(`Invalid trace state during insertion backtrack: d=${currentD-1}, k=${k}, kIdxPrev=${kIdxPrev}`);
       }
      prevX = potentialPrevXIns; // Guaranteed number now
      prevY = prevX - k;
      // Add 'add' op for the element at target index 'offset + y'
      // The value comes from subArr2[y] (y is relative to subArr2 start)
      // Check bounds for subArr2[y]
      if (y < 0 || y >= subArr2.length) throw new Error(`Invalid index 'y'=${y} during insertion backtrack`);
      patchOps.push({ op: 'add', path: appendPath(path, offset + y), value: subArr2[y] });
    }

    // Backtrack through the preceding snake (common elements)
    let snakeEndX = x; // End of snake *before* this add/remove step
    let snakeEndY = y;

    // Calculate the start of the snake based on where we came from
    const snakeStartX = cameFromKMinus1 ? prevX + 1 : prevX;
    const snakeStartY = snakeStartX - prevK; // y at start of snake (relative to sub arrays)

    // Diff elements within the snake we just backtracked *over*
    let currentSnakeX = snakeEndX;
    let currentSnakeY = snakeEndY;
    while (currentSnakeX > snakeStartX && currentSnakeY > snakeStartY) {
      currentSnakeX--;
      currentSnakeY--;
      // Check bounds for sub arrays
      if (currentSnakeX < 0 || currentSnakeX >= subArr1.length || currentSnakeY < 0 || currentSnakeY >= subArr2.length) {
          throw new Error(`Snake backtrack index out of bounds: X=${currentSnakeX}, Y=${currentSnakeY}`);
      }
      // Recursively diff common elements
       if (typeof subArr1[currentSnakeX] === 'object' && subArr1[currentSnakeX] !== null &&
           typeof subArr2[currentSnakeY] === 'object' && subArr2[currentSnakeY] !== null) {
            const elementOps: Operation[] = [];
            // Path index uses target array index: offset + currentSnakeY
            compareValues(subArr1[currentSnakeX], subArr2[currentSnakeY], appendPath(path, offset + currentSnakeY), elementOps);
            patchOps.push(...elementOps);
       }
    }

    // Update x, y to the end of the previous snake for the next loop iteration
    x = prevX;
    y = prevY;
  }

  // Diff elements in the initial snake (from origin to the start of the d=1 step)
   let currentSnakeX = x; // Should be 0 after loop finishes if d>=1
   let currentSnakeY = y; // Should be 0 after loop finishes if d>=1
   while (currentSnakeX > 0 && currentSnakeY > 0) {
     currentSnakeX--;
     currentSnakeY--;
      if (currentSnakeX < 0 || currentSnakeY < 0) throw new Error("Initial snake backtrack index out of bounds");
      if (typeof subArr1[currentSnakeX] === 'object' && subArr1[currentSnakeX] !== null &&
          typeof subArr2[currentSnakeY] === 'object' && subArr2[currentSnakeY] !== null) {
        const elementOps: Operation[] = [];
        compareValues(subArr1[currentSnakeX], subArr2[currentSnakeY], appendPath(path, offset + currentSnakeY), elementOps);
        patchOps.push(...elementOps);
      }
   }
   // Note: patchOps is currently in reverse logical order. Caller must reverse.
}


/**
 * Compares two arrays using an optimized algorithm (Myers diff with prefix/suffix optimization)
 * and generates patch operations.
 */
export function compareArrays(arr1: any[], arr2: any[], path: string, operations: Operation[]): void {
  const N = arr1.length;
  const M = arr2.length;
  const opsStartIndex = operations.length; // Record start index in case of fallback

  // --- Optimization: Check for common prefix ---
  let commonPrefix = 0;
  while (commonPrefix < N && commonPrefix < M && isEqual(arr1[commonPrefix], arr2[commonPrefix])) {
    if (typeof arr1[commonPrefix] === 'object' && arr1[commonPrefix] !== null &&
        typeof arr2[commonPrefix] === 'object' && arr2[commonPrefix] !== null) {
      // Deep diff prefix elements directly into main operations array
      compareValues(arr1[commonPrefix], arr2[commonPrefix], appendPath(path, commonPrefix), operations);
    }
    commonPrefix++;
  }

  // --- Optimization: Check for common suffix ---
  let commonSuffix = 0;
  while (
    commonPrefix + commonSuffix < N &&
    commonPrefix + commonSuffix < M &&
    isEqual(arr1[N - 1 - commonSuffix], arr2[M - 1 - commonSuffix])
  ) {
    commonSuffix++;
  }

  // --- Handle case where prefix/suffix cover everything ---
   if (commonPrefix + commonSuffix >= N && commonPrefix + commonSuffix >= M) {
     if (N === M) { // If lengths match, only need deep diff on suffix
        diffCommonSuffix(arr1, arr2, N, M, commonSuffix, path, operations); // Prepends suffix ops
        return;
     }
     // If lengths differ, the middle is pure adds/removes, handled below.
   }

  // --- Prepare for Myers Diff on the middle section ---
  const subArr1 = arr1.slice(commonPrefix, N - commonSuffix);
  const subArr2 = arr2.slice(commonPrefix, M - commonSuffix);
  const subN = subArr1.length;
  const subM = subArr2.length;

  // --- Handle cases where one sub-array is empty ---
  if (subN === 0 && subM === 0) {
       // Both subs empty, diff suffix and return
       diffCommonSuffix(arr1, arr2, N, M, commonSuffix, path, operations); // Prepends suffix ops
       return;
  }

  // Collect middle and suffix operations separately to ensure order
  const middleOps: Operation[] = [];
  const suffixOps: Operation[] = [];
  diffCommonSuffix(arr1, arr2, N, M, commonSuffix, path, suffixOps); // Calculate suffix diffs first (will be prepended later)

  if (subN === 0) {
      // Only additions left in the middle
      for (let i = 0; i < subM; i++) {
          middleOps.push({ op: 'add', path: appendPath(path, commonPrefix + i), value: subArr2[i] });
      }
      operations.push(...suffixOps, ...middleOps); // Add suffix ops, then middle adds
      return;
  }
  if (subM === 0) {
      // Only removals left in the middle
      // Generate removals backwards by index for correct JSON Patch indices
      for (let i = subN - 1; i >= 0; i--) {
         middleOps.push({ op: 'remove', path: appendPath(path, commonPrefix + i) });
      }
      operations.push(...suffixOps, ...middleOps); // Add suffix ops, then middle removals
      return;
  }


  // --- Myers Diff Core Logic ---
  const max = subN + subM;
  const offsetV = max; // Offset for array indices to handle negative k
  const vArray = new Array(2 * max + 2).fill(-1); // Use -1 to indicate unreached state, size 2*max+1 or +2 for safety? Let's use +2
  const traceArrays: Array<number[]> = [];
  // Base case: d=0 implies k=0 conceptually, but SES starts from imagining k=1 reaching x=0 or k=-1 reaching x=-1
  // Standard implementation sets v[offsetV + 1] = 0 for d=0
  vArray[offsetV + 1] = 0;

  try { // Wrap Myers in try/catch for easier fallback
      for (let d = 0; d <= max; d++) {
         traceArrays.push(vArray.slice()); // Store *copy* of previous state

         for (let k = -d; k <= d; k += 2) {
             const kIdx = k + offsetV;
             if (kIdx < 0 || kIdx >= vArray.length) {
                 throw new Error(`Index kIdx=${kIdx} out of bounds for vArray (d=${d}, k=${k})`);
             }

             let x: number;
             let cameFromKMinus1: boolean; // For backtracking

             // Determine previous x based on which path (k-1 or k+1) reaches further
             // Check bounds and -1 state explicitly
             const xFromKPlus1 = (k === d || vArray[kIdx + 1] === -1) ? -Infinity : vArray[kIdx + 1];
             const xFromKMinus1 = (k === -d || vArray[kIdx - 1] === -1) ? -Infinity : vArray[kIdx - 1] + 1;

             if (xFromKMinus1 >= xFromKPlus1) {
                  x = xFromKMinus1;
                  cameFromKMinus1 = true; // Came via deletion
             } else {
                  x = xFromKPlus1;
                  cameFromKMinus1 = false; // Came via insertion
             }

             let y = x - k;
             const startX = x; // Store snake start

             // Follow snake
             while (x < subN && y < subM && isEqual(subArr1[x], subArr2[y])) {
                 x++;
                 y++;
             }

             // Update furthest x for current d, k
             vArray[kIdx] = x;

             // Check for completion
             if (x >= subN && y >= subM) {
                 // Found SES
                 traceArrays.push(vArray.slice()); // Store final state
                 const sesOps: Operation[] = []; // Ops from SES backtracking
                 buildPatchWithArrays(subArr1, subArr2, traceArrays, d, k, offsetV, commonPrefix, path, sesOps);
                 // Combine: Suffix ops, then SES ops
                 operations.push(...suffixOps, ...sesOps);
                 return; // Done
             }
         } // k loop
      } // d loop

      // If loop finishes without finding SES (should not happen if max is N+M)
       throw new Error("Myers algorithm did not terminate");

  } catch (error) {
       console.error(`Myers diff failed for path "${path}":`, error);
       // Fallback: Clear operations added *by this call* and replace the whole array
       operations.length = opsStartIndex; // Reset operations array to state before this call
       operations.push({ op: 'replace', path, value: arr2 });
  }
}
