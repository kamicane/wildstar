/**
 * Compares two Unicode code points for case-insensitive equality (locale-unaware).
 * @param {number} codePointA - First code point.
 * @param {number} codePointB - Second code point.
 * @returns {boolean} True if code points are equal ignoring case (using toLowerCase).
 * @example
 * compareInsensitive('A'.codePointAt(0), 'a'.codePointAt(0)) // returns true
 * matches('Hello', 'h*o', compareInsensitive) // returns true
 */
export function compareInsensitive(codePointA: number, codePointB: number): boolean;
/**
 * Case-insensitive version of {@link module:wildstar.remap}.
 * Matches a string against a pattern (case-insensitive) and replaces using the replacement string if matched.
 * @param {string} source - The input string to match.
 * @param {string} pattern - The pattern string, may contain * and *+ wildcards.
 * @param {string} replacement - The replacement string, may contain <1>, <2>, ... for captures.
 * @returns {string | null} The replaced string if matched, or null if not matched.
 * @example
 * remap('Foo Bar', 'foo *', '<1> baz') // returns 'Bar baz'
 */
export function remap(source: string, pattern: string, replacement: string): string | null;
/**
 * Case-insensitive version of {@link module:wildstar.match}.
 * Returns captures if the pattern matches the source string (case-insensitive), otherwise null.
 * @param {string} source - The input string to match.
 * @param {string} pattern - The pattern string, may contain * and *+ wildcards.
 * @returns {string[] | null} Array of captures if matched, or null if not.
 * @example
 * imatch('Foo Bar', 'foo *') // returns ['Bar']
 */
export function match(source: string, pattern: string): string[] | null;
/**
 * Case-insensitive version of {@link module:wildstar.matches}.
 * Checks if a string matches a pattern with wildcards (case-insensitive), without returning captures.
 * @param {string} source - The input string to match.
 * @param {string} pattern - The pattern string, may contain * and *+ wildcards.
 * @returns {boolean} True if the pattern matches, false otherwise.
 * @example
 * matches('Hello', 'hell*') // returns true
 */
export function matches(source: string, pattern: string): boolean;
/**
 * Case-insensitive version of {@link module:wildstar.relative}.
 * Returns the relative path from base to string (case-insensitive), or null if not a subpath.
 * @param {string} string - The target path string.
 * @param {string} base - The base path string.
 * @returns {string|null} The relative path, or null if not a subpath.
 * @example
 * relative('Foo/Bar/Baz', 'foo/bar') // 'Baz'
 */
export function relative(string: string, base: string): string | null;
export { compareInsensitive as compare };
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
    export { compareInsensitive };
    export { compareInsensitive as compare };
}
import { root } from './wildstar.js';
import { join } from './wildstar.js';
import { leaf } from './wildstar.js';
import { parent } from './wildstar.js';
import { replace } from './wildstar.js';
import { normalize } from './wildstar.js';
import { compareBasic } from './wildstar.js';
export { root, join, leaf, parent, replace, normalize, compareBasic } from "./wildstar.js";
