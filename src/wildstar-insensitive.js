/**
 * Wildstar main module (case-insensitive version)
 * @module wildstar/insensitive
 */

/** @typedef {import('./wildstar.js').CodePoint} CodePoint */

import {
	match as _match,
	matches as _matches,
	remap as _remap,
	replace
} from './wildstar.js'

export { replace } from './wildstar.js'

/**
 * Case-insensitive version of {@link module:wildstar.match}
 * Returns captures if the pattern matches the source string (case-insensitive), otherwise null
 * @param {string} source - The input string to match
 * @param {string} pattern - The pattern string, may contain * and *+ wildcards
 * @returns {string[] | null} Array of captures if matched, or null if not
 * @example
 * match('Foo Bar', 'foo *') // returns ['Bar']
 */
export function match (source, pattern) {
	return _match(source, pattern, compare)
}

/**
 * Case-insensitive version of {@link module:wildstar.matches}
 * Checks if a string matches a pattern with wildcards (case-insensitive), without returning captures
 * @param {string} source - The input string to match
 * @param {string} pattern - The pattern string, may contain * and *+ wildcards
 * @returns {boolean} True if the pattern matches, false otherwise
 * @example
 * matches('Hello', 'hell*') // returns true
 */
export function matches (source, pattern) {
	return _matches(source, pattern, compare)
}

/**
 * Case-insensitive version of {@link module:wildstar.remap}
 * Matches a string against a pattern (case-insensitive) and replaces using the replacement string if matched
 * @param {string} source - The input string to match
 * @param {string} pattern - The pattern string, may contain * and *+ wildcards
 * @param {string} replacement - The replacement string, may contain <1>, <2>, ... for captures
 * @returns {string | null} The replaced string if matched, or null if not matched
 * @example
 * remap('Foo Bar', 'foo *', '<1> baz') // returns 'Bar baz'
 */
export function remap (source, pattern, replacement) {
	return _remap(source, pattern, replacement, compare)
}

/**
 * Compares two Unicode code points for case-insensitive equality (locale-unaware)
 * @param {CodePoint} codePointA - First code point
 * @param {CodePoint} codePointB - Second code point
 * @returns {boolean} True if code points are equal ignoring case (using toLowerCase)
 * @example
 * compare('A'.codePointAt(0), 'a'.codePointAt(0)) // returns true
 * matches('Hello', 'h*o', compare) // returns true
 */
export function compare (codePointA, codePointB) {
	return (
		String.fromCodePoint(codePointA).toLowerCase() ===
		String.fromCodePoint(codePointB).toLowerCase()
	)
}

const wildstar = {
	match,
	matches,
	replace,
	remap,
	compare
}

export default wildstar
