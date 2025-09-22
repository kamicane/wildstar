/**
 * Wildstar insensitive module.
 * @module wildstar/insensitive
 */

import {
	match as _match,
	matches as _matches,
	remap as _remap,
	relative as _relative,
	root,
	join,
	leaf,
	parent,
	replace,
	normalize,
	compareBasic
} from './wildstar.js'

/**
 * Compares two Unicode code points for case-insensitive equality (locale-unaware).
 * @param {number} codePointA - First code point.
 * @param {number} codePointB - Second code point.
 * @returns {boolean} True if code points are equal ignoring case (using toLowerCase).
 * @example
 * compareInsensitive('A'.codePointAt(0), 'a'.codePointAt(0)) // returns true
 * matches('Hello', 'h*o', compareInsensitive) // returns true
 */
export function compareInsensitive (codePointA, codePointB) {
	return (
		String.fromCodePoint(codePointA).toLowerCase() ===
		String.fromCodePoint(codePointB).toLowerCase()
	)
}

export { compareInsensitive as compare }

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
export function remap (source, pattern, replacement) {
	return _remap(source, pattern, replacement, compareInsensitive)
}

/**
 * Case-insensitive version of {@link module:wildstar.match}.
 * Returns captures if the pattern matches the source string (case-insensitive), otherwise null.
 * @param {string} source - The input string to match.
 * @param {string} pattern - The pattern string, may contain * and *+ wildcards.
 * @returns {string[] | null} Array of captures if matched, or null if not.
 * @example
 * match('Foo Bar', 'foo *') // returns ['Bar']
 */
export function match (source, pattern) {
	return _match(source, pattern, compareInsensitive)
}

/**
 * Case-insensitive version of {@link module:wildstar.matches}.
 * Checks if a string matches a pattern with wildcards (case-insensitive), without returning captures.
 * @param {string} source - The input string to match.
 * @param {string} pattern - The pattern string, may contain * and *+ wildcards.
 * @returns {boolean} True if the pattern matches, false otherwise.
 * @example
 * matches('Hello', 'hell*') // returns true
 */
export function matches (source, pattern) {
	return _matches(source, pattern, compareInsensitive)
}

/**
 * Case-insensitive version of {@link module:wildstar.relative}.
 * Returns the relative path from base to string (case-insensitive), or null if not a subpath.
 * @param {string} string - The target path string.
 * @param {string} base - The base path string.
 * @returns {string|null} The relative path, or null if not a subpath.
 * @example
 * relative('Foo/Bar/Baz', 'foo/bar') // 'Baz'
 */
export function relative (string, base) {
	return _relative(string, base, compareInsensitive)
}

export {
	/** re-export of {@link module:wildstar.root} */
	root,
	/** re-export of {@link module:wildstar.join} */
	join,
	/** re-export of {@link module:wildstar.leaf} */
	leaf,
	/** re-export of {@link module:wildstar.parent} */
	parent,
	/** re-export of {@link module:wildstar.replace} */
	replace,
	/** re-export of {@link module:wildstar.normalize} */
	normalize,
	compareBasic
} from './wildstar.js'

const wildstar = {
	root,
	join,
	leaf,
	match,
	remap,
	parent,
	matches,
	replace,
	relative,
	normalize,
	compareBasic,
	compareInsensitive,
	compare: compareInsensitive
}

export default wildstar
