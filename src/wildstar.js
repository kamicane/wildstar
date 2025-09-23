/**
 * Wildstar main module
 * @module wildstar
 */

/**
 * @typedef {number} CodePoint - a number representing a Unicode code point
 */

/**
 * @typedef {function(CodePoint, CodePoint): boolean} CharCompare
 * A function that compares two Unicode code points and returns true if they should be considered equal
 */

const STAR = 0x2A // '*'
const PLUS = 0x2B // '+'
const CAP_START = 0x3C // '<'
const CAP_END = 0x3E // '>'

/**
 * Converts a string to an array of Unicode code points, normalizing wildcard sequences
 * @private
 * @param {string} string - The input string to convert
 * @returns {CodePoint[]} Array of Unicode code points
 */
function toCodePoints (string) {
	if (string == null) return []

	string = String(string).replace(/(\*+\+?)+/g, (match) => match.endsWith('+') ? '*+' : '*')
	return Array.from(string, (char) => char.codePointAt(0))
}

/**
 * Internal recursive function for pattern matching with wildcard support
 * @private
 * @param {string[]|null} captures - Array to collect captures, or null if not capturing
 * @param {CharCompare} charCompare - Function to compare characters
 * @param {CodePoint[]} sourceCodePoints - Source string as code points
 * @param {number} sourceIndex - Current position in source
 * @param {CodePoint[]} patternCodePoints - Pattern string as code points
 * @param {number} patternIndex - Current position in pattern
 * @returns {boolean} True if pattern matches from current positions
 */
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

/**
 * Matches a string against a pattern with wildcards and captures
 * @param {string} source - The input string to match
 * @param {string} pattern - The pattern string, may contain * and *+ wildcards
 * @param {CharCompare} [charCompare] - Optional custom character comparison function
 * @returns {string[] | null} Array of captures if matched, or null if not
 * @example
 * match('foo bar', 'foo *') // returns ['bar']
 */
export function match (source, pattern, charCompare = compare) {
	const captures = []
	const matched = matchInternal(captures, charCompare, toCodePoints(source), 0, toCodePoints(pattern), 0)
	return matched ? captures : null
}

/**
 * Checks if a string matches a pattern with wildcards, without returning captures
 * @param {string} source - The input string to match
 * @param {string} pattern - The pattern string, may contain * and *+ wildcards
 * @param {CharCompare} [charCompare] - Optional custom character comparison function
 * @returns {boolean} True if the pattern matches, false otherwise
 * @example
 * matches('hello', 'hell*') // returns true
 */
export function matches (source, pattern, charCompare = compare) {
	return matchInternal(null, charCompare, toCodePoints(source), 0, toCodePoints(pattern), 0)
}

/**
 * Replaces capture references in a replacement string with actual capture values
 * @param {string} repl - The replacement string, may contain <1>, <2>, ... for captures
 * @param {string[]} captures - Array of captured substrings
 * @returns {string} The replaced string
 * @throws {SyntaxError} If the replacement pattern is invalid or references a missing capture
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

/**
 * Matches a string against a pattern and replaces using the replacement string if matched
 * @param {string} source - The input string to match
 * @param {string} pattern - The pattern string, may contain * and *+ wildcards
 * @param {string} replacement - The replacement string, may contain <1>, <2>, ... for captures
 * @param {CharCompare} [charCompare] - Optional custom character comparison function
 * @returns {string | null} The replaced string if matched, or null if not matched
 * @example
 * remap('foo bar', '* bar', '<1> baz') // returns 'foo baz'
 */
export function remap (source, pattern, replacement, charCompare = compare) {
	const matchResult = match(source, pattern, charCompare)
	if (!matchResult) return null
	return replace(replacement, matchResult)
}

/**
 * Compares two Unicode code points for strict equality
 * This is a simple function that returns a == b, used for internal logistics
 * @param {CodePoint} codePointA - First code point
 * @param {CodePoint} codePointB - Second code point
 * @returns {boolean} True if code points are equal
 */
export function compare (codePointA, codePointB) {
	return codePointA === codePointB
}

const wildstar = {
	match,
	matches,
	replace,
	remap,
	compare
}

export default wildstar
