/**
 * Wildstar path module (case-insensitive version)
 * @module wildstar/path/insensitive
 */

/** @typedef {import('./path.js').Path} Path */

import {
	match as _match,
	matches as _matches,
	remap as _remap,
	normalize,
	join,
	root,
	parent,
	leaf,
	relative as _relative
} from './path.js'

import { replace } from './wildstar.js'

import { compare } from './wildstar-insensitive.js'

export { replace } from './wildstar.js'

export { normalize, join, root, parent, leaf } from './path.js'

/**
 * Case-insensitive version of {@link module:wildstar/path.match}
 * Matches a path against a pattern with wildcards and captures (case-insensitive)
 * @param {Path} source - The input path to match
 * @param {Path} pattern - The pattern path, may contain *, *+, **, **+ wildcards
 * @returns {Path[] | null} Array of captures if matched, or null if not
 * @example
 * match('foo/bar/baz/wow.txt', 'FOO/**\/WoW.*') // returns ['bar/baz', 'txt']
 */
export function match (source, pattern) {
	return _match(source, pattern, compare)
}

/**
 * Case-insensitive version of {@link module:wildstar/path.matches}
 * Checks if a path matches a pattern with wildcards, without returning captures (case-insensitive)
 * @param {Path} source - The input path to match
 * @param {Path} pattern - The pattern path, may contain *, *+, **, **+ wildcards
 * @returns {boolean} True if the pattern matches, false otherwise
 * @example
 * matches('hElLo/dear/WOrlD', 'hello/**+/world') // returns true
 */
export function matches (source, pattern) {
	return _matches(source, pattern, compare)
}

/**
 * Case-insensitive version of {@link module:wildstar/path.remap}
 * Matches a path against a pattern and replaces using the replacement path if matched (case-insensitive)
 * @param {Path} source - The input path to match
 * @param {Path} pattern - The pattern path, may contain *, *+, **, **+ wildcards
 * @param {Path} replacement - The replacement path, may contain <1>, <2>, ... for captures
 * @returns {Path | null} The replaced path if matched, or null if not matched
 * @example
 * remap('foo/bar/baz', 'FOO/**+/BAZ', 'new/<1>') // returns 'new/bar'
 */
export function remap (source, pattern, replacement) {
	return _remap(source, pattern, replacement, compare)
}

/**
 * Case-insensitive version of {@link module:wildstar/path.relative}
 * Returns the relative path from base to source (case-insensitive), or null if not a subpath
 * @param {Path} source - The target path
 * @param {Path} base - The base path
 * @returns {Path | null} The relative path, or null if not a subpath
 * @example
 * relative('Foo/Bar/Baz', 'foo/bar') // 'Baz'
 */
export function relative (source, base) {
	return _relative(source, base, compare)
}

const path = {
	match,
	matches,
	remap,
	replace,
	normalize,
	join,
	root,
	parent,
	leaf,
	relative
}

export default path
