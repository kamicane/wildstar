/**
 * Wildstar main module.
 * @module wildstar
 */

import os from 'node:os'

const STAR = 0x2A // '*'
const PLUS = 0x2B // '+'
const CAP_START = 0x3C // '<'
const CAP_END = 0x3E // '>'

const STAR_STAR = '**'
const STAR_STAR_PLUS = '**+'
const POSIX_SEP = '/'

function isMultiStar (part) {
	return part === STAR_STAR || part === STAR_STAR_PLUS
}

function toCodePoints (string) {
	return Array.from(string, (char) => char.codePointAt(0))
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
	} else {
		// minimal star cleanup: keep only last * or *+
		part = part.replace(/(\*+\+?)+/g, (match) => match.endsWith('+') ? '*+' : '*')
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

/**
 * Compares two Unicode code points for strict equality.
 * This is a simple function that returns a == b, used for internal logistics.
 * @private
 * @param {number} codePointA - First code point.
 * @param {number} codePointB - Second code point.
 * @returns {boolean} True if code points are equal.
 */
export function compareBasic (codePointA, codePointB) {
	return codePointA === codePointB
}

export { compareBasic as compare }

function matchInternal (captures, charCompare, sourceCodePoints, sourceIndex, patternCodePoints, patternIndex) {
	if (patternIndex >= patternCodePoints.length) {
		return sourceIndex >= sourceCodePoints.length
	}

	if (patternCodePoints[patternIndex] === STAR) {
		const afterStarIndex = patternIndex + 1

		const plus = afterStarIndex < patternCodePoints.length && patternCodePoints[afterStarIndex] === PLUS

		let nextPatternIndex = patternIndex + 1

		let lenIndex = sourceIndex

		if (plus) {
			if (lenIndex >= sourceCodePoints.length) return false
			lenIndex++
			nextPatternIndex++
		}

		if (nextPatternIndex < patternCodePoints.length && patternCodePoints[nextPatternIndex] === STAR) {
			// throw new SyntaxError('multiple stars in succession')
			return false
		}

		while (true) {
			const localCaptures = []

			const matched = matchInternal(
				captures ? localCaptures : null,
				charCompare,
				sourceCodePoints,
				lenIndex,
				patternCodePoints,
				nextPatternIndex
			)

			if (matched) {
				if (captures) {
					const capturedCodePoints = sourceCodePoints.slice(sourceIndex, lenIndex)
					captures.unshift(String.fromCodePoint(...capturedCodePoints))
					captures.push(...localCaptures)
				}
				return true
			}

			if (lenIndex >= sourceCodePoints.length) break
			lenIndex++
		}
		return false
	}

	if (
		sourceIndex >= sourceCodePoints.length ||
		!charCompare(sourceCodePoints[sourceIndex], patternCodePoints[patternIndex])
	) {
		return false
	}

	return matchInternal(captures, charCompare, sourceCodePoints, sourceIndex + 1, patternCodePoints, patternIndex + 1)
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
		const stringCaptures = []
		const matches = matchInternal(stringCaptures, charCompare, toCodePoints(src), 0, toCodePoints(pat), 0)
		if (!matches) return false
		captures.push(...stringCaptures)
	} else {
		const matches = matchInternal(null, charCompare, toCodePoints(src), 0, toCodePoints(pat), 0)
		if (!matches) return false
	}

	return matchPartsInternal(captures, charCompare, source.slice(1), pattern.slice(1))
}

/**
 * Matches a string against a pattern with wildcards and captures.
 * @param {string} source - The input string to match.
 * @param {string} pattern - The pattern string, may contain * and *+ wildcards.
 * @param {function(number, number): boolean} [charCompare] - Optional custom character comparison function.
 * @returns {string[] | null} Array of captures if matched, or null if not.
 * @example
 * match('foo bar', 'foo *') // returns ['bar']
 */
export function match (source, pattern, charCompare = compareBasic) {
	const captures = []
	const matched = matchPartsInternal(captures, charCompare, toParts(source), toParts(pattern))
	return matched ? captures : null
}

/**
 * Checks if a string matches a pattern with wildcards, without returning captures.
 * @param {string} source - The input string to match.
 * @param {string} pattern - The pattern string, may contain * and *+ wildcards.
 * @param {function(number, number): boolean} [charCompare] - Optional custom character comparison function.
 * @returns {boolean} True if the pattern matches, false otherwise.
 * @example
 * matches('hello', 'hell*') // returns true
 */
export function matches (source, pattern, charCompare = compareBasic) {
	return matchPartsInternal(null, charCompare, toParts(source), toParts(pattern))
}

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
export function remap (source, pattern, replacement, charCompare = compareBasic) {
	const matchResult = match(source, pattern, charCompare)
	if (!matchResult) return null
	return replace(replacement, matchResult)
}

function stringify (parts) {
	if (parts.length === 1) {
		const abs = absolute(parts)
		if (abs) return abs
	}
	return parts.join(POSIX_SEP)
}

/**
 * Normalizes a path-like string to wildstar's canonical form.
 * @param {string} string - The input path string to normalize.
 * @returns {string} The normalized path string, using `/` as separator.
 * @example
 * normalize('foo//bar/../baz/./') // 'foo/baz'
 * normalize('~\\foo/') // 'c:/Users/kamicane/foo'
 */
export function normalize (string) {
	return stringify(toParts(string))
}

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
export function parent (string) {
	const parts = toParts(string)
	if (parts.length === 1) {
		const abs = absolute(parts)
		if (abs) return abs
	}
	return stringify(parts.slice(0, -1))
}

/**
 * Returns the root of a path-like string, or empty string if not absolute.
 * @param {string} string - The input path string.
 * @returns {string} The root path, or '' if not absolute.
 * @example
 * root('c:/foo/bar') // 'c:'
 * root('foo/bar') // ''
 * root('/foo/bar') // '/'
 */
export function root (string) {
	const parts = toParts(string)
	if (parts.length > 0) {
		const abs = absolute(parts)
		if (abs) return abs
	}
	return ''
}

/**
 * Returns the last segment (leaf) of a path-like string, or '' if root.
 * @param {string} string - The input path string.
 * @returns {string} The last segment, or '' if input is root.
 * @example
 * leaf('foo/bar/baz') // 'baz'
 * leaf('c:/') // ''
 */
export function leaf (string) {
	const parts = toParts(string)
	if (parts.length === 1) {
		const abs = absolute(parts)
		if (abs) return ''
	}
	return parts.length > 0 ? parts.at(-1) : ''
}

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
export function join (string, ...strings) {
	let baseParts = toParts(string)

	for (const string of strings) {
		const subParts = toParts(string)

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
export function relative (string, base, charCompare = compareBasic) {
	const stringParts = toParts(string)
	const baseParts = toParts(base)

	let common = 0
	while (
		common < baseParts.length &&
		common < stringParts.length &&
		matchInternal(null, charCompare, toCodePoints(stringParts[common]), 0, toCodePoints(baseParts[common]), 0)
	) {
		++common
	}
	if (common !== baseParts.length) return null

	return stringify(stringParts.slice(common))
}

/**
 * Replaces capture references in a replacement string with actual capture values.
 * @param {string} repl - The replacement string, may contain <1>, <2>, ... for captures.
 * @param {string[]} captures - Array of captured substrings.
 * @returns {string} The replaced string.
 * @throws {Error} If the replacement pattern is invalid or references a missing capture.
 * @example
 * replace('foo <1>', ['baz']) // returns 'foo baz'
 */
export function replace (repl, captures) {
	let result = ''
	let replIndex = 0
	let autoIndex = 0

	repl = String(repl)

	while (replIndex < repl.length) {
		if (repl.codePointAt(replIndex) === CAP_START) {
			const closeIndex = repl.indexOf(String.fromCodePoint(CAP_END), replIndex + 1)
			if (closeIndex === -1) {
				throw new SyntaxError('Unclosed capture in replacement string')
			}

			const key = repl.substring(replIndex + 1, closeIndex)
			let index = autoIndex++

			if (key.length > 0) {
				const parsedIndex = parseInt(key, 10)
				if (isNaN(parsedIndex)) {
					throw new SyntaxError(`Invalid capture index: <${key}>`)
				}
				index = parsedIndex - 1
			}

			if (index >= captures.length) throw new SyntaxError(`Capture index out of range: <${key || autoIndex}>`)

			result += captures[index]
			replIndex = closeIndex + 1
		} else {
			result += repl[replIndex]
			replIndex++
		}
	}

	return result
}

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
	compare: compareBasic
}

export default wildstar
