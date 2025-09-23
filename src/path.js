/**
 * Wildstar path module
 * @module wildstar/path
 */

/** @typedef {string} Path - a string potentially representing a path, using `/` and/or `\\` as separators */

/** @typedef {import('./wildstar.js').CharCompare} CharCompare */

import os from 'node:os'

import { replace, match as _match, matches as _matches } from './wildstar.js'

export { replace } from './wildstar.js'

const POSIX_SEP = '/'

const STAR_STAR = '**'
const STAR_STAR_PLUS = '**+'

function isMultiStar (part) {
	return part === STAR_STAR || part === STAR_STAR_PLUS
}

function absolute (parts) {
	if (parts.length === 0) return null
	if (parts.at(0).length === 0) return POSIX_SEP
	if (parts.at(0).at(-1) === ':') return parts.at(0)
	return null
}

function appendPart (parts, part) {
	if (parts.length === 0 && part.length === 0) {
		parts.push(part)
		return
	}

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
		if (parts.length > 0 && isMultiStar(parts.at(-1))) parts.pop()
	}
	parts.push(part)
}

function toParts (string) {
	if (string == null) return []

	string = String(string)
	if (string.length === 0) return []

	const segments = []
	string = string.replace(/^~/, os.homedir())
	for (const token of string.split(/[\\/]/)) {
		appendPart(segments, token)
	}
	return segments
}

function matchPartsInternal (captures, charCompare, source, pattern) {
	if (pattern.length === 0) return source.length === 0

	const pat = pattern[0]

	if (isMultiStar(pat)) {
		const minSkip = pat === STAR_STAR_PLUS ? 1 : 0
		for (let skip = minSkip; skip <= source.length; ++skip) {
			const localCaptures = []
			const matches = matchPartsInternal(
				captures ? localCaptures : null,
				charCompare,
				source.slice(skip),
				pattern.slice(1)
			)
			if (matches) {
				if (captures) {
					captures.push(source.slice(0, skip).join(POSIX_SEP), ...localCaptures)
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

	return matchPartsInternal(captures, charCompare, source.slice(1), pattern.slice(1))
}

/**
 * Matches a path against a pattern with wildcards and captures
 * @param {Path} source - The input path to match
 * @param {Path} pattern - The pattern path, may contain *, *+, **, **+ wildcards
 * @param {CharCompare} [charCompare] - Optional custom code point comparison function
 * @returns {Path[] | null} Array of captures if matched, or null if not
 * @example
 * match('foo/bar/baz/wow.txt', 'foo/**\/wow.*') // returns ['bar/baz', 'txt']
 */
export function match (source, pattern, charCompare) {
	const captures = []
	const matched = matchPartsInternal(captures, charCompare, toParts(source), toParts(pattern))
	return matched ? captures : null
}

/**
 * Checks if a path matches a pattern with wildcards, without returning captures
 * @param {Path} source - The input path to match
 * @param {Path} pattern - The pattern path, may contain *, *+, **, **+ wildcards
 * @param {CharCompare} [charCompare] - Optional custom code point comparison function
 * @returns {boolean} True if the pattern matches, false otherwise
 * @example
 * matches('hello/dear/world', 'hello/**+/world') // returns true
 */
export function matches (source, pattern, charCompare) {
	return matchPartsInternal(null, charCompare, toParts(source), toParts(pattern))
}

/**
 * Matches a path against a pattern and replaces using the replacement path if matched
 * @param {Path} source - The input path to match
 * @param {Path} pattern - The pattern path, may contain *, *+, **, **+ wildcards
 * @param {Path} replacement - The replacement path, may contain <1>, <2>, ... for captures
 * @param {CharCompare} [charCompare] - Optional custom code point comparison function
 * @returns {Path | null} The replaced path if matched, or null if not matched
 * @example
 * remap('foo/bar/baz', 'foo/**+/baz', '<1>/foo') // returns 'bar/foo'
 */
export function remap (source, pattern, replacement, charCompare) {
	const matchResult = match(source, pattern, charCompare)
	if (!matchResult) return null
	return normalize(replace(replacement, matchResult))
}

function stringify (parts) {
	if (parts.length === 1) {
		const abs = absolute(parts)
		if (abs) return abs
	}
	return parts.join(POSIX_SEP)
}

/**
 * Normalizes a path-like string to wildstar's canonical form
 * @param {string} source - The input path string to normalize
 * @returns {Path} The normalized path string, using `/` as separator
 * @example
 * normalize('foo//bar/../baz/./') // 'foo/baz'
 * normalize('~\\foo/') // 'c:/Users/kamicane/foo'
 */
export function normalize (source) {
	return stringify(toParts(source))
}

/**
 * Returns the parent directory of a path
 * If the input is an absolute root, returns the root itself
 * @param {Path} path - The input path
 * @returns {Path} The normalized parent path, or root if input is root
 * @example
 * parent('foo/bar/baz') // 'foo/bar'
 * parent('c:/foo') // 'c:'
 * parent('c:/') // 'c:'
 */
export function parent (path) {
	const parts = toParts(path)
	if (parts.length === 1) {
		const abs = absolute(parts)
		if (abs) return abs
	}
	return stringify(parts.slice(0, -1))
}

/**
 * Returns the root of a path, or empty string if not absolute
 * @param {Path} source - The input path
 * @returns {string} The root path, or '' if not absolute
 * @example
 * root('c:/foo/bar') // 'c:'
 * root('foo/bar') // ''
 * root('/foo/bar') // '/'
 */
export function root (source) {
	const parts = toParts(source)
	if (parts.length > 0) {
		const abs = absolute(parts)
		if (abs) return abs
	}
	return ''
}

/**
 * Returns the last segment (leaf) of a path, or '' if root
 * @param {Path} path - The input path
 * @returns {string} The last segment, or '' if input is root
 * @example
 * leaf('foo/bar/baz') // 'baz'
 * leaf('c:/') // ''
 */
export function leaf (path) {
	const parts = toParts(path)
	if (parts.length === 1) {
		const abs = absolute(parts)
		if (abs) return ''
	}
	return parts.length > 0 ? parts.at(-1) : ''
}

/**
 * Joins multiple paths into a single normalized path
 * @param {...Path} paths - Paths to join
 * @returns {Path} The joined and normalized path
 * @example
 * join('foo', 'bar', 'baz') // 'foo/bar/baz'
 * join('c:/foo', 'c:/bar') // 'c:/bar'
 */
export function join (...paths) {
	let baseParts = []

	for (const path of paths) {
		const subParts = toParts(path)

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
 * Uses optional custom code point comparison
 * Note: This function does not support subpath matching with `**` (globstar)
 * @param {Path} source - The target path
 * @param {Path} base - The base path
 * @param {CharCompare} [charCompare] - Optional custom code point comparison function
 * @returns {Path | null} The relative normalized path, or null if not a subpath
 * @example
 * relative('foo/bar/baz', 'foo/bar') // 'baz'
 * relative('foo/bar', 'baz') // null
 * relative('foo/bar/baz', 'foo/ba*') // 'baz'
 */
export function relative (source, base, charCompare) {
	const stringParts = toParts(source)
	const baseParts = toParts(base)

	let common = 0
	while (
		common < baseParts.length &&
		common < stringParts.length &&
		_matches(stringParts[common], baseParts[common], charCompare)
	) {
		++common
	}
	if (common !== baseParts.length) return null

	return stringify(stringParts.slice(common))
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
