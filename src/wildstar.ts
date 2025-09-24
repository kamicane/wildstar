/**
 * Wildstar module
 * @module wildstar
 */

/**
 * A function type for comparing two Unicode code points.
 * @remarks
 * - Used to customize character comparison logic in pattern matching functions.
 * @param codePointA - The first Unicode code point (number)
 * @param codePointB - The second Unicode code point (number)
 * @returns True if the code points are considered equal, false otherwise
 * @example
 * const strict: CharCompare = (a, b) => a === b
 * const insensitive: CharCompare = (a, b) => String.fromCodePoint(a).toLowerCase() === String.fromCodePoint(b).toLowerCase()
 * */
export type CharCompare = (codePointA: number, codePointB: number) => boolean

const STAR = 0x2A // '*'
const PLUS = 0x2B // '+'
const CAP_START = 0x3C // '<'
const CAP_END = 0x3E // '>'

/**
 * Compares two Unicode code points for strict equality
 * @remarks
 * - This is a simple function that returns a === b, used for internal logistics
 * @param codePointA - First code point
 * @param codePointB - Second code point
 * @returns true if codepoints are equal, otherwise false
 * @private
 */
function compare (codePointA: number, codePointB: number): boolean {
	return codePointA === codePointB
}

/**
 * Converts a string to an array of Unicode code points, normalizing wildcard sequences
 * @param source - The input string to convert
 * @returns Array of Unicode code points
 * @private
 */
function toCodePoints (source: string): number[] {
	const normalizedString = source.replaceAll(/(\*+\+?)+/g, (match) => match.endsWith('+') ? '*+' : '*')
	return Array.from(normalizedString, (char: string): number => char.codePointAt(0) ?? 0)
}

/**
 * Internal recursive function for pattern matching with wildcard support
 * @param captures - Array to collect captures, or null if not capturing
 * @param charCompare - Function to compare characters
 * @param sourceCodePoints - Source string as code points
 * @param sourceIndex - Current position in source
 * @param patternCodePoints - Pattern string as code points
 * @param patternIndex - Current position in pattern
 * @returns True if pattern matches from current positions
 * @private
 */
function matchInternal (
	sourceCodePoints: number[],
	sourceIndex: number,
	patternCodePoints: number[],
	patternIndex: number,
	charCompare: CharCompare = compare,
	captures?: string[]
): boolean {
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

		while (true) {
			const localCaptures: string[] = []

			const matched = matchInternal(
				sourceCodePoints,
				lenIndex,
				patternCodePoints,
				nextPatternIndex,
				charCompare,
				captures ? localCaptures : undefined
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

	return matchInternal(sourceCodePoints, sourceIndex + 1, patternCodePoints, patternIndex + 1, charCompare, captures)
}

/**
 * Matches a string against a pattern with wildcards and captures
 * @param source - The input string to match
 * @param pattern - The pattern string, may contain * and *+ wildcards
 * @param charCompare - Optional custom character comparison function
 * @returns Array of captures if matched, or null if not
 * @example
 * match('foo bar', 'foo *') // returns ['bar']
 * match('hello world', 'h*o w*d') // returns ['ell', 'orl']
 * match('no match', 'different') // returns null
 * */
export function match (source: string, pattern: string, charCompare?: CharCompare): string[] | null {
	const captures: string[] = []
	const matched = matchInternal(toCodePoints(source), 0, toCodePoints(pattern), 0, charCompare, captures)
	return matched ? captures : null
}

/**
 * Checks if a string matches a pattern with wildcards, without returning captures
 * @param source - The input string to match
 * @param pattern - The pattern string, may contain * and *+ wildcards
 * @param charCompare - Optional custom character comparison function
 * @returns True if the pattern matches, false otherwise
 * @example
 * matches('hello', 'hell*') // returns true
 * matches('world', 'w*d') // returns true
 * matches('test', 'different') // returns false
 * */
export function matches (source: string, pattern: string, charCompare?: CharCompare): boolean {
	return matchInternal(toCodePoints(source), 0, toCodePoints(pattern), 0, charCompare)
}

/**
 * Replaces capture references in a replacement string with actual capture values
 * @param placeholder - The placeholder string, may contain `<1>`, `<2>`, ... for captures
 * @param captures - Array of captured substrings
 * @returns The replaced string
 * @throws {SyntaxError} If the replacement pattern is invalid
 * @example
 * replace('foo <1>', ['baz', 'bar']) // returns 'foo baz'
 * replace('Hello <> <>!', ['beautiful', 'world']) // returns 'Hello beautiful world!'
 * replace('<1> <1> <1>', ['string']) // returns 'string string string'
 * */
export function replace (placeholder: string, captures: string[]): string {
	let result = ''
	let replIndex = 0
	let autoIndex = 0

	while (replIndex < placeholder.length) {
		if (placeholder.codePointAt(replIndex) === CAP_START) {
			const closeIndex = placeholder.indexOf(String.fromCodePoint(CAP_END), replIndex + 1)
			if (closeIndex === -1) {
				throw new SyntaxError('Unclosed capture in replacement string')
			}

			const key = placeholder.substring(replIndex + 1, closeIndex)
			let index = autoIndex++

			if (key.length > 0) {
				const parsedIndex = parseInt(key, 10)
				if (isNaN(parsedIndex)) {
					throw new SyntaxError(`Invalid capture index: <${key}>`)
				}
				index = parsedIndex - 1
			}

			result += captures[index] ?? ''
			replIndex = closeIndex + 1
		} else {
			result += placeholder[replIndex]
			replIndex++
		}
	}

	return result
}

/**
 * Matches a string against a pattern and replaces using the replacement string if matched
 * @param source - The input string to match
 * @param pattern - The pattern string, may contain * and *+ wildcards
 * @param replacement - The replacement string, may contain `<1>`, `<2>`, ... for captures
 * @param charCompare - Optional custom character comparison function
 * @returns The replaced string if matched, or null if not matched
 * @example
 * remap('foo bar', '* bar', '<1> baz') // returns 'foo baz'
 * remap('hello world', 'h* *', 'Hi <2>!') // returns 'Hi world!'
 * remap('no match', 'different *', '<1>') // returns null
 * */
export function remap (source: string, pattern: string, replacement: string, charCompare?: CharCompare): string | null {
	const matchResult = match(source, pattern, charCompare)
	if (!matchResult) return null
	return replace(replacement, matchResult)
}

const wildstar = {
	match,
	matches,
	replace,
	remap
}

export default wildstar
