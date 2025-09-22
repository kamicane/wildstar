/**
 * Compares two Unicode code points for strict equality.
 * This is a simple function that returns a == b, used for internal logistics.
 * @private
 * @param {number} codePointA - First code point.
 * @param {number} codePointB - Second code point.
 * @returns {boolean} True if code points are equal.
 */
export function compareBasic(codePointA: number, codePointB: number): boolean;
/**
 * Matches a string against a pattern with wildcards and captures.
 * @param {string} source - The input string to match.
 * @param {string} pattern - The pattern string, may contain * and *+ wildcards.
 * @param {function(number, number): boolean} [charCompare] - Optional custom character comparison function.
 * @returns {string[] | null} Array of captures if matched, or null if not.
 * @example
 * match('foo bar', 'foo *') // returns ['bar']
 */
export function match(source: string, pattern: string, charCompare?: (arg0: number, arg1: number) => boolean): string[] | null;
/**
 * Checks if a string matches a pattern with wildcards, without returning captures.
 * @param {string} source - The input string to match.
 * @param {string} pattern - The pattern string, may contain * and *+ wildcards.
 * @param {function(number, number): boolean} [charCompare] - Optional custom character comparison function.
 * @returns {boolean} True if the pattern matches, false otherwise.
 * @example
 * matches('hello', 'hell*') // returns true
 */
export function matches(source: string, pattern: string, charCompare?: (arg0: number, arg1: number) => boolean): boolean;
/**
 * Matches a string against a pattern and replaces using the replacement string if matched.
 * @param {string} source - The input string to match.
 * @param {string} pattern - The pattern string, may contain * and *+ wildcards.
 * @param {string} replacement - The replacement string, may contain <1>, <2>, ... for captures.
 * @param {function(number, number): boolean} [charCompare] - Optional custom character comparison function.
 * @returns {string | null} The replaced string if matched, or null if not matched.
 * @example
 * remap('foo bar', '* bar', '<1> baz') // returns 'foo baz'
 */
export function remap(source: string, pattern: string, replacement: string, charCompare?: (arg0: number, arg1: number) => boolean): string | null;
/**
 * Normalizes a path-like string to wildstar's canonical form.
 * @param {string} string - The input path string to normalize.
 * @returns {string} The normalized path string, using `/` as separator.
 * @example
 * normalize('foo//bar/../baz/./') // 'foo/baz'
 * normalize('~\\foo/') // 'c:/Users/kamicane/foo'
 */
export function normalize(string: string): string;
/**
 * Returns the parent directory of a path-like string, normalized.
 * If the input is an absolute root, returns the root itself.
 * @param {string} string - The input path string.
 * @returns {string} The parent path, or root if input is root.
 * @example
 * parent('foo/bar/baz') // 'foo/bar'
 * parent('c:/foo') // 'c:'
 * parent('c:/') // 'c:'
 */
export function parent(string: string): string;
/**
 * Returns the root of a path-like string, or empty string if not absolute.
 * @param {string} string - The input path string.
 * @returns {string} The root path, or '' if not absolute.
 * @example
 * root('c:/foo/bar') // 'c:'
 * root('foo/bar') // ''
 * root('/foo/bar') // '/'
 */
export function root(string: string): string;
/**
 * Returns the last segment (leaf) of a path-like string, or '' if root.
 * @param {string} string - The input path string.
 * @returns {string} The last segment, or '' if input is root.
 * @example
 * leaf('foo/bar/baz') // 'baz'
 * leaf('c:/') // ''
 */
export function leaf(string: string): string;
/**
 * Joins multiple path-like strings into a single normalized path.
 * Handles absolute paths and normalization of wildcards.
 * @param {string} string - The base path string.
 * @param {...string} strings - Additional path strings to join.
 * @returns {string} The joined and normalized path string.
 * @example
 * join('foo', 'bar', 'baz') // 'foo/bar/baz'
 * join('c:/foo', 'bar') // 'c:/foo/bar'
 */
export function join(string: string, ...strings: string[]): string;
/**
 * Returns the relative path from base to string, or null if not a subpath.
 * Uses optional custom character comparison.
 * Note: This function does not support subpath matching with `**` (globstar).
 * @param {string} string - The target path string.
 * @param {string} base - The base path string.
 * @param {function(number, number): boolean} [charCompare] - Optional custom character comparison function.
 * @returns {string|null} The relative path, or null if not a subpath.
 * @example
 * relative('foo/bar/baz', 'foo/bar') // 'baz'
 * relative('foo/bar', 'baz') // null
 * relative('foo/bar/baz', 'foo/ba*') // 'baz'
 */
export function relative(string: string, base: string, charCompare?: (arg0: number, arg1: number) => boolean): string | null;
/**
 * Replaces capture references in a replacement string with actual capture values.
 * @param {string} repl - The replacement string, may contain <1>, <2>, ... for captures.
 * @param {string[]} captures - Array of captured substrings.
 * @returns {string} The replaced string.
 * @throws {Error} If the replacement pattern is invalid or references a missing capture.
 * @example
 * replace('foo <1>', ['baz']) // returns 'foo baz'
 */
export function replace(repl: string, captures: string[]): string;
export { compareBasic as compare };
export default wildstar;
declare namespace wildstar {
    export { root };
    export { join };
    export { leaf };
    export { match };
    export { remap };
    export { parent };
    export { matches };
    export { replace };
    export { relative };
    export { normalize };
    export { compareBasic };
    export { compareBasic as compare };
}
