/**
 * Wildstar path module (case-insensitive version)
 * @module wildstar/path/insensitive
 */

import {
	match as _match,
	matches as _matches,
	remap as _remap,
	normalize,
	join,
	root,
	parent,
	leaf,
	replace,
	relative as _relative
} from 'wildstar/path'

import { icompare } from 'wildstar/insensitive'

export { normalize, join, root, parent, leaf, replace } from 'wildstar/path'

/**
 * Match a path against a pattern with wildcards and capture results (case-insensitive)
 * @remarks
 * - Case-insensitive version of {@link _match | path/match}
 * @param source - The input path to match
 * @param pattern - The pattern path, may contain *, *+, **, **+ wildcards
 * @returns Array of captures if matched, or null if not
 * @example
 * match('foo/bar/baz/wow.txt', 'FOO/**\/WoW.*') // returns ['bar/baz', 'txt']
 * */
export function match (source: string, pattern: string): string[] | null {
	return _match(source, pattern, icompare)
}

/**
 * Checks if a path matches a pattern with wildcards, without returning captures (case-insensitive)
 * @remarks
 * - Case-insensitive version of {@link _matches | path/matches}
 * @param source - The input path to match
 * @param pattern - The pattern path, may contain *, *+, **, **+ wildcards
 * @returns True if the pattern matches, false otherwise
 * @example
 * matches('hElLo/dear/WOrlD', 'hello/**+/world') // returns true
 * */
export function matches (source: string, pattern: string): boolean {
	return _matches(source, pattern, icompare)
}

/**
 * Matches a path against a pattern and replaces using the replacement path if matched (case-insensitive)
 * @remarks
 * - Case-insensitive version of {@link _remap | path/remap}
 * @param source - The input path to match
 * @param pattern - The pattern path, may contain *, *+, **, **+ wildcards
 * @param replacement - The replacement path, may contain <1>, <2>, ... for captures
 * @returns The replaced path if matched, or null if not matched
 * @example
 * remap('foo/bar/baz', 'FOO/**+/BAZ', 'new/<1>') // returns 'new/bar'
 * */
export function remap (source: string, pattern: string, replacement: string): string | null {
	return _remap(source, pattern, replacement, icompare)
}

/**
 * Returns the relative path from base to source (case-insensitive), or null if not a subpath
 * @remarks
 * - Case-insensitive version of {@link _relative | path/relative}
 * @param base - The base path
 * @param target - The target path
 * @returns The relative path, or null if not a subpath
 * @example
 * relative('Foo/Bar/Baz', 'foo/bar') // 'Baz'
 * */
export function relative (base: string, target: string): string | null {
	return _relative(base, target, icompare)
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
