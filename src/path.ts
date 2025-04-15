/**
 * Escapes a string segment for use in a JSON Pointer.
 * Replaces '~' with '~0' and '/' with '~1'.
 * See https://tools.ietf.org/html/rfc6901#section-3
 *
 * @param segment The string segment to escape.
 * @returns The escaped string segment.
 */
export function escapePathComponent(segment: string | number): string {
  // Convert number segments to string
  const strSegment = String(segment);
  // First replace '~' with '~0', then '/' with '~1'
  return strSegment.replace(/~/g, '~0').replace(/\//g, '~1');
}

/**
 * Joins path segments into a JSON Pointer string.
 * Automatically escapes each segment.
 * Prepends '/' to each segment except the first (root).
 *
 * @param segments An array of path segments (strings or numbers).
 * @returns A JSON Pointer string.
 */
export function joinPath(segments: (string | number)[]): string {
  if (segments.length === 0) {
    return ''; // Root path
  }
  // Map each segment to its escaped version and join with '/'
  return '/' + segments.map(escapePathComponent).join('/');
}

/**
 * Appends a segment to an existing JSON Pointer path.
 *
 * @param basePath The existing JSON Pointer path.
 * @param segment The segment to append (string or number).
 * @returns The new JSON Pointer string.
 */
export function appendPath(basePath: string, segment: string | number): string {
  // Special case for appending to the root path ""
  if (basePath === '') {
    return '/' + escapePathComponent(segment);
  }
  return basePath + '/' + escapePathComponent(segment);
}
