/**
 * Wildstar module (case-insensitive version)
 * @module wildstar/insensitive
 */

import {
	match as _match,
	matches as _matches,
	remap as _remap,
	replace
} from '#wildstar'

/** {@inheritDoc replace} */
export { replace } from '#wildstar'

/**
 * Compares two Unicode code points for case-insensitive equality (locale-unaware)
 * @param codePointA - First code point
 * @param codePointB - Second code point
 * @returns True if code points are equal ignoring case (using toLowerCase)
 * @internal
 */
export function icompare (codePointA: number, codePointB: number): boolean {
	return (
		String.fromCodePoint(codePointA).toLowerCase() ===
		String.fromCodePoint(codePointB).toLowerCase()
	)
}

/**
 * Returns captures if the pattern matches the source string (case-insensitive), otherwise null.
 * @remarks
 * - Case-insensitive version of {@link _match | match}.
 * @param source - The input string to match
 * @param pattern - The pattern string, may contain * and *+ wildcards
 * @returns Array of captures if matched, or null if not
 * @example
 * match('Foo Bar', 'foo *') // returns ['Bar']
 * */
export function match (source: string, pattern: string): string[] | null {
	return _match(source, pattern, icompare)
}

/**
 * Checks if a string matches a pattern with wildcards (case-insensitive), without returning captures.
 * @remarks
 * - Case-insensitive version of {@link _matches | matches}.
 * @param source - The input string to match
 * @param pattern - The pattern string, may contain * and *+ wildcards
 * @returns True if the pattern matches, false otherwise
 * @example
 * matches('Hello', 'hell*') // returns true
 * */
export function matches (source: string, pattern: string): boolean {
	return _matches(source, pattern, icompare)
}

/**
 * Matches a string against a pattern (case-insensitive) and replaces using the replacement string if matched.
 * @remarks
 * - Case-insensitive version of {@link _remap | remap}.
 * @param source - The input string to match
 * @param pattern - The pattern string, may contain * and *+ wildcards
 * @param replacement - The replacement string, may contain `<1>`, `<2>`, ... for captures
 * @returns The replaced string if matched, or null if not matched
 * @example
 * remap('Foo Bar', 'foo *', '<1> baz') // returns 'Bar baz'
 * */
export function remap (source: string, pattern: string, replacement: string): string | null {
	return _remap(source, pattern, replacement, icompare)
}

const wildstar = {
	match,
	matches,
	replace,
	remap,
	icompare
}

export default wildstar
