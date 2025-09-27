/**
 * Wildstar path module
 * @module wildstar/path
 */

import os from 'node:os'

import { replace as _replace, match as _match, matches as _matches } from '#wildstar'
import type { CharCompare } from '#wildstar'

const PATH_SEP = '/'
const STAR_STAR = '**'
const STAR_STAR_PLUS = '**+'

const HOMEDIR = os.homedir()

/**
 * Checks if a path part is a multi-star wildcard (** or **+)
 * @private
 * @param part - The path part to check
 * @returns True if the part is ** or **+
 */
function isMultiStar (part: string): boolean {
	return part === STAR_STAR || part === STAR_STAR_PLUS
}

/**
 * Checks if path parts represent an absolute path and returns the root
 * @private
 * @param parts - The path parts array
 * @returns The root if absolute, null otherwise
 */
function absolute (parts: string[]): string | null {
	if (parts.length === 0) return null
	if (parts.at(0)?.length === 0) return PATH_SEP
	if (parts.at(0)?.endsWith(':')) return parts.at(0) ?? null
	return null
}

/**
 * Appends a path part to the parts array, handling . and .. resolution
 * @private
 * @param parts - The path parts array to modify
 * @param part - The part to append
 */
function appendPart (parts: string[], part: string): void {
	if (part === '.' || part.length === 0) return
	if (part === '..') {
		if (parts.length > 1) {
			parts.pop()
			return
		}

		if (parts.length === 1) {
			if (absolute(parts)) return
			parts.pop()
			return
		}
	}

	if (isMultiStar(part)) {
		if (parts.length > 0 && isMultiStar(parts.at(-1) ?? '')) parts.pop()
	}
	parts.push(part)
}

/**
 * Converts a path string to normalized path parts array
 * @private
 * @param source - The path string to convert
 * @returns Array of normalized path parts
 */
function split (source: string): string[] {
	if (source.length === 0) return []

	const parts: string[] = []
	if (source.startsWith('~')) source = source.replace(/^~/, HOMEDIR)
	let start = 0
	let index = 0
	for (let i = 0; i <= source.length; ++i) {
		const c = source[i]
		if (c === '/' || c === '\\' || i === source.length) {
			const part = source.slice(start, i)
			if (part.length === 0) {
				if (index === 0) parts.push(part)
			} else {
				appendPart(parts, part)
			}
			start = i + 1
			index++
		}
	}
	return parts
}

/**
 * Converts path parts array back to a path string
 * @private
 * @param parts - The path parts array
 * @returns The path string
 */
function stringify (parts: string[]): string {
	if (parts.length === 1) {
		const abs = absolute(parts)
		if (abs) return abs
	}
	return parts.join(PATH_SEP)
}

/**
 * Normalizes a path to wildstar's canonical form
 * @param source - The input path to normalize
 * @returns The normalized path, using `/` as separator
 * @example
 * normalize('foo//bar/../baz/./') // returns 'foo/baz'
 * normalize('~\\foo/') // returns 'c:/Users/kamicane/foo'
 * */
export function normalize (source: string): string {
	return stringify(split(source))
}

/**
 * Internal recursive function for path pattern matching with wildcard support
 * @private
 * @param captures - Array to collect captures, or null if not capturing
 * @param charCompare - Function to compare characters
 * @param source - Source path parts array
 * @param pattern - Pattern path parts array
 * @returns True if pattern matches from current positions
 */
function matchPartsInternal (
	source: string[],
	pattern: string[],
	charCompare?: CharCompare,
	captures?: string[]
): boolean {
	if (pattern.length === 0) return source.length === 0

	const pat = pattern[0]

	if (isMultiStar(pat)) {
		const minSkip = pat === STAR_STAR_PLUS ? 1 : 0
		for (let skip = minSkip; skip <= source.length; ++skip) {
			const localCaptures: string[] = []
			const matches = matchPartsInternal(
				source.slice(skip),
				pattern.slice(1),
				charCompare,
				captures ? localCaptures : undefined
			)
			if (matches) {
				if (captures) {
					captures.push(source.slice(0, skip).join(PATH_SEP), ...localCaptures)
				}
				return true
			}
		}
		return false
	}

	if (source.length === 0) return false

	const src = source[0]

	if (captures) {
		const stringCaptures = _match(src, pat, charCompare)
		if (!stringCaptures) return false
		captures.push(...stringCaptures)
	} else {
		const matches = _matches(src, pat, charCompare)
		if (!matches) return false
	}

	return matchPartsInternal(source.slice(1), pattern.slice(1), charCompare, captures)
}

/**
 * Matches a path against a pattern with wildcards and captures
 * @param source - The input path to match
 * @param pattern - The pattern path, may contain *, *+, **, **+ wildcards
 * @param charCompare - Optional custom code point comparison function
 * @returns Array of captures if matched, or null if not
 * @example
 * match('foo/bar/baz/wow.txt', "foo/**+/wow.*") // returns ['bar/baz', 'txt']
 * */
export function match (source: string, pattern: string, charCompare?: CharCompare): string[] | null {
	const captures: string[] = []
	const matched = matchPartsInternal(split(source), split(pattern), charCompare, captures)
	return matched ? captures : null
}

/**
 * Checks if a path matches a pattern with wildcards, without returning captures
 * @param source - The input path to match
 * @param pattern - The pattern path, may contain *, *+, **, **+ wildcards
 * @param charCompare - Optional custom code point comparison function
 * @returns True if the pattern matches, false otherwise
 * @example
 * matches('hello/dear/world', 'hello/**+/world') // returns true
 * */
export function matches (source: string, pattern: string, charCompare?: CharCompare): boolean {
	return matchPartsInternal(split(source), split(pattern), charCompare)
}

/**
 * Replaces capture references in a replacement path with actual capture values
 * @param placeholder - The placeholder path, may contain `<1>`, `<2>`, ... for captures
 * @param captures - Array of captured substrings
 * @returns The replaced, normalized path
 * @throws {SyntaxError} If the replacement pattern is invalid
 * @example
 * replace('foo <1>', ['baz']) // returns 'foo baz'
 * replace('Hello <> <>!', ['beautiful', 'world']) // returns 'Hello beautiful world!'
 * replace('<> <1>', ['middle']) // returns 'middle middle middle'
 * */
export function replace (placeholder: string, captures: string[]): string {
	return normalize(_replace(placeholder, captures))
}

/**
 * Matches a path against a pattern and replaces using the replacement path if matched
 * @param source - The input path to match
 * @param pattern - The pattern path, may contain *, *+, **, **+ wildcards
 * @param replacement - The replacement path, may contain <1>, <2>, ... for captures
 * @param charCompare - Optional custom code point comparison function
 * @returns The replaced normalized path if matched, or null if not matched
 * @example
 * remap('foo/bar/baz', 'foo/**+/baz', '<1>/foo') // returns 'bar/foo'
 * */
export function remap (source: string, pattern: string, replacement: string, charCompare?: CharCompare): string | null {
	const matchResult = match(source, pattern, charCompare)
	if (!matchResult) return null
	return replace(replacement, matchResult)
}

/**
 * Returns the parent directory of a path. If the input is an absolute root, returns the root itself
 * @param path - The input path
 * @returns The normalized parent path, or root if input is root
 * @example
 * parent('foo/bar/baz') // returns 'foo/bar'
 * parent('c:/foo') // returns 'c:'
 * parent('c:/') // returns 'c:'
 * */
export function parent (path: string): string {
	const parts = split(path)
	if (parts.length === 1) {
		const abs = absolute(parts)
		if (abs) return abs
	}
	return stringify(parts.slice(0, -1))
}

/**
 * Returns the root of a path, or empty string if not absolute
 * @param source - The input path
 * @returns The root path, or '' if not absolute
 * @example
 * root('c:/foo/bar') // returns 'c:'
 * root('foo/bar') // returns ''
 * root('/foo/bar') // returns '/'
 * */
export function root (source: string): string {
	const parts = split(source)
	if (parts.length > 0) {
		const abs = absolute(parts)
		if (abs) return abs
	}
	return ''
}

/**
 * Returns the last segment of a path, or '' if root
 * @param path - The input path
 * @returns The last segment, or '' if input is root
 * @example
 * leaf('foo/bar/baz') // returns 'baz'
 * leaf('c:/') // returns ''
 * */
export function leaf (path: string): string {
	const parts = split(path)
	if (parts.length === 1) {
		const abs = absolute(parts)
		if (abs) return ''
	}
	return parts.length > 0 ? parts.at(-1) ?? '' : ''
}

/**
 * Joins multiple paths into a single normalized path
 * @param paths - strings to join
 * @returns The joined and normalized path
 * @example
 * join('foo', 'bar', 'baz') // returns 'foo/bar/baz'
 * join('c:/foo', 'c:/bar') // returns 'c:/bar'
 * */
export function join (...paths: string[]): string {
	let baseParts: string[] = []

	for (const path of paths) {
		const subParts = split(path)

		if (absolute(subParts)) {
			baseParts = subParts
			continue
		}

		for (const part of subParts) {
			appendPart(baseParts, part)
		}
	}
	return stringify(baseParts)
}

/**
 * Returns the relative path from base to source, or null if not a subpath
 * @remarks
 * - This function uses {@link _matches | matches} for subpath matching
 * - Unlike standard implementations, this functions returns null when target is not a direct subpath of base
 * @param base - The base path
 * @param target - The target path
 * @param charCompare - Optional custom code point comparison function
 * @returns The relative normalized path, or null if not a subpath
 * @example
 * relative('foo/bar', 'foo/bar/baz') // returns 'baz'
 * relative('baz', 'foo/bar') // returns null
 */
export function relative (base: string, target: string, charCompare?: CharCompare): string | null {
	const baseParts = split(base)
	const sourceParts = split(target)

	let common = 0
	while (
		common < baseParts.length &&
		common < sourceParts.length &&
		_matches(baseParts[common], sourceParts[common], charCompare)
	) {
		++common
	}
	if (common !== baseParts.length) return null

	return stringify(sourceParts.slice(common))
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
