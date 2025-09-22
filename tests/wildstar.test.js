import { test } from 'uvu'
import * as assert from 'uvu/assert'

import {
	normalize, leaf, root, parent, join, match, matches, relative, remap, replace, compareBasic
} from '#wildstar'

import {
	match as imatch, matches as imatches, relative as irelative, remap as iremap, compareInsensitive
} from '#wildstar/insensitive'

test('normalize', () => {
	assert.is(normalize('/'), '/')
	assert.is(normalize('c:/'), 'c:')

	assert.is(normalize('foo/bar'), 'foo/bar')
	assert.is(normalize('foo//bar'), 'foo/bar')
	assert.is(normalize('foo/bar/../baz'), 'foo/baz')
	assert.is(normalize('foo/./bar'), 'foo/bar')
	assert.is(normalize('foo/bar/.'), 'foo/bar')
	assert.is(normalize('foo/bar/..'), 'foo')

	assert.is(normalize('foo/../..'), '..')

	assert.is(normalize('/foo/../..'), '/')
	assert.is(normalize('c:/../..'), 'c:')
	assert.is(normalize('/../..'), '/')

	assert.is(normalize('./foo'), 'foo')
	assert.is(normalize('foo\\bar\\baz\\'), 'foo/bar/baz')
	assert.is(normalize(''), '')
	assert.is(normalize('/foo/bar'), '/foo/bar')
	assert.is(normalize('../foo/bar'), '../foo/bar')
})

test('root', () => {
	assert.is(root('/foo/bar'), '/')
	assert.is(root('c:/foo/bar'), 'c:')
	assert.is(root('foo/bar'), '')
})

test('leaf', () => {
	assert.is(leaf('/'), '')
	assert.is(leaf('c:/'), '')
	assert.is(leaf('/foo.txt'), 'foo.txt')
	assert.is(leaf('c:/foo.txt'), 'foo.txt')
	assert.is(leaf('bar/foo.txt'), 'foo.txt')
})

test('parent', () => {
	assert.is(parent('/'), '/')
	assert.is(parent('c:/'), 'c:')
	assert.is(parent('/foo.txt'), '/')
	assert.is(parent('c:/foo.txt'), 'c:')
	assert.is(parent('bar/foo.txt'), 'bar')
	assert.is(parent('foo.txt'), '')
})

test('join', () => {
	assert.is(join('foo', 'bar', 'baz'), 'foo/bar/baz')
	assert.is(join('/foo', 'bar', 'baz'), '/foo/bar/baz')
	assert.is(join('c:/foo', 'bar', 'baz'), 'c:/foo/bar/baz')
	assert.is(join('foo', '/bar', 'baz'), '/bar/baz')
	assert.is(join('foo', 'c:/bar', 'baz'), 'c:/bar/baz')
	assert.is(join('', 'foo', '', 'bar'), 'foo/bar')
	assert.is(join('foo', '.', 'bar'), 'foo/bar')
	assert.is(join('foo', 'bar', '..', 'baz'), 'foo/baz')
})

test('relative/irelative', () => {
	assert.is(relative('foo/bar/baz', 'foo/bar'), 'baz')
	assert.is(relative('c:/foo/bar/baz', 'c:'), 'foo/bar/baz')
	assert.is(relative('foo/bar', 'baz'), null)
	assert.is(relative('/foo/bar', '/foo'), 'bar')
	assert.is(relative('c:/foo/bar', 'c:/foo'), 'bar')
	assert.is(relative('foo/Bar/baz', 'foo/*'), 'baz')
	assert.is(irelative('Foo/Bar/Baz', 'foo/bar'), 'Baz')
	assert.is(irelative('Foo/Bar', 'foo'), 'Bar')
})

test('matches exact string', () => {
	assert.ok(matches('hello', 'hello'))
	assert.not(matches('hello', 'world'))
})

test('matches with * wildcard', () => {
	assert.ok(matches('hello', 'h*o'))
	assert.ok(matches('hello', '*'))
	assert.ok(imatches('HELLO', 'hel*'))

	assert.not(matches('hello', 'h*l*z'))
})

test('matches with *+ (one or more)', () => {
	assert.ok(matches('hello', 'h*+o'))
	assert.not(matches('ho', 'h*+o'))
	assert.ok(matches('hllo', 'h*+o'))
})

test('captures with *', () => {
	assert.equal(match('hello', 'h*o'), ['ell'])
	assert.equal(match('hello', '*'), ['hello'])
	assert.is(match('hello', 'h*l*z'), null)
})

test('replace with captures', () => {
	const caps = match('hello', 'h*o')
	assert.is(replace('X<1>Y', caps), 'XellY')
	assert.throws(() => replace('X<2>Y', caps))
	assert.throws(() => replace('X<abc>Y', caps))
	assert.throws(() => replace('X<1Y', caps))
})

test('remap works', () => {
	assert.is(remap('hello', 'h*o', 'X<1>Y'), 'XellY')
	assert.is(remap('hello', 'h*z', 'X<1>Y'), null)
})

test('unicode support', () => {
	assert.ok(matches('héllo', 'h*o'))
	assert.equal(match('héllo', 'h*o'), ['éll'])
})

test('matches and captures with multiple *', () => {
	assert.ok(matches('foobar', '*o*b*'))
	assert.equal(match('foobar', '*o*b*'), ['f', 'o', 'ar'])
	assert.equal(match('abc123xyz', '*1*3*'), ['abc', '2', 'xyz'])
})

test('matches and captures with multiple *+', () => {
	assert.ok(matches('aabbcc', '*+b*+c*'))
	assert.equal(match('aabbcc', '*+b*+c*'), ['aa', 'b', 'c'])
	assert.equal(match('xxxyyyzzz', '*+y*+z*'), ['xxx', 'yy', 'zz'])
})

test('captures with adjacent * should discard previous *', () => {
	assert.equal(match('abc', '**'), ['abc'])
	assert.equal(match('abc', 'abc*+*'), [''])
})

test('captures with * at start and end', () => {
	assert.equal(match('middle', '*d*'), ['mi', 'dle'])
	assert.equal(match('wildstar', '*l*s*'), ['wi', 'd', 'tar'])
})

test('captures greedily', () => {
	assert.equal(match('aaaabbbb', '*b'), ['aaaabbb'])
})

test('caseInsensitiveCompare: compares Unicode code points case-insensitively (locale-aware)', () => {
	// German sharp S
	assert.is(compareInsensitive('ß'.codePointAt(0), 'ẞ'.codePointAt(0)), true) // 'ß' vs 'ẞ'
	// Greek sigma
	assert.is(compareInsensitive('Σ'.codePointAt(0), 'ς'.codePointAt(0)), false) // 'Σ' vs 'ς' (contextual, fails at code point level)
	// False case
	assert.is(compareInsensitive('İ'.codePointAt(0), 'I'.codePointAt(0)), false) // 'İ' vs 'I'
})

test('caseInsensitiveCompare: works with matches/match for case-insensitive Unicode patterns', () => {
	assert.equal(match('straße', 'STR*E', compareInsensitive), ['aß'])
	assert.is(matches('Μάιος', 'μ*Σ', compareInsensitive), false)
})

test('insensitive path matching', () => {
	assert.equal(imatch('C:/USERS/FILE.TXT', 'c:/*/file.txt'), ['USERS'])

	assert.equal(imatch('C:/USERS/FILE.TXT', 'c:/*/*.txt'), ['USERS', 'FILE'])
	assert.equal(imatch('C:/USERS/Kamicane/FILE.TXT', 'c:/**'), ['USERS/Kamicane/FILE.TXT'])

	assert.equal(imatch('C:/USERS/KAMICANE/APPDATA/FILE.TXT', 'c:/**/KAMICANE/**/*.txt'), ['USERS', 'APPDATA', 'FILE'])

	assert.equal(imatch('C:/USERS/Kamicane/FILE.TXT', 'c:/**/*.txt'), ['USERS/Kamicane', 'FILE'])

	assert.equal(imatch('C:/USERS/Kamicane/FILE.TXT', '**/c:/**'), ['', 'USERS/Kamicane/FILE.TXT'])

	assert.equal(imatch('ЖЖ:/Üsers/ƒile.txt', 'ЖЖ:/*/ƑILE.tXt'), ['Üsers'])
})

// the following test cases are kinda shit because a stupid friend of mine coded them. his name is gpt.
// works for now but could use a cleanup (lots of useless and duplicated tests)

test('utf8 path matching 1', () => {
	assert.ok(match('C:/Üsers/ƒile.txt', 'C:/Üsers/ƒile.txt'))
	assert.equal(match('AB:/Üsers/ƒile.txt', 'AB:/*ers/ƒile.txt'), ['Üs'])
	assert.equal(match('Δ:/Üsers/ƒile.txt', 'Δ:/Üs*/ƒile.txt'), ['ers'])

	assert.is(match('C:/Üsers/ƒile.txt', 'C:/*'), null)
	assert.equal(match('C:/Üsers/😀ile.txt', 'C:/**'), ['Üsers/😀ile.txt'])
	assert.equal(match('f😊o/bar/baz.txt', '**'), ['f😊o/bar/baz.txt'])
	assert.is(match('Δ:/Üsers/ƒile.txt', 'D:/Üsers/ƒile.txt'), null)
	assert.equal(match('AA:/αβγ/bar.txt', 'AA:/*/bar.txt'), ['αβγ'])
	assert.equal(match('ZZ:/ƒøø/bar.txt', 'ZZ:/*/bar.txt'), ['ƒøø'])
	assert.equal(match('Δ:/漢字/bar.txt', 'Δ:/*/bar.txt'), ['漢字'])
})

test('utf8 path matching 2', () => {
	assert.equal(match('ЖЖ:/добро/bar.txt', 'ЖЖ:/*/bar.txt'), ['добро'])
	assert.equal(match('C:/café/bar.txt', 'C:/*/bar.txt'), ['café'])
	assert.equal(match('😀:/sm😊l/bar.txt', '😀:/*/bar.txt'), ['sm😊l'])
	assert.equal(match('🚗:/🚕🚙/bar.txt', '🚗:/*/bar.txt'), ['🚕🚙'])
	assert.equal(match('🦄:/unic🦄rn/bar.txt', '🦄:/*/bar.txt'), ['unic🦄rn'])
	assert.equal(match('🚗🚕:/🚙/bar.txt', '🚗🚕:/*/bar.txt'), ['🚙'])
	assert.equal(match('AB🚗:/foo😀/bar.txt', 'AB🚗:/*/bar.txt'), ['foo😀'])
	assert.equal(match('🚗AB:/bar🦄/bar.txt', '🚗AB:/*/bar.txt'), ['bar🦄'])
	assert.equal(match('A🚗B:/βγδ/bar.txt', 'A🚗B:/*/bar.txt'), ['βγδ'])
	assert.equal(match('日本:/ふぉお/バー.txt', '日本:/*/バー.txt'), ['ふぉお'])
	assert.equal(match('日本語:/テスト/バー.txt', '日本語:/*/バー.txt'), ['テスト'])
	assert.equal(match('日本:/ふぉお/ばー.txt', '日本:/*/ばー.txt'), ['ふぉお'])
	assert.equal(match('日本:/ふぉお/ばー.txt', '日本:/*/*.txt'), ['ふぉお', 'ばー'])
	assert.equal(match('日本:/ふぉお/ばー.txt', '日本:/*/*.*'), ['ふぉお', 'ばー', 'txt'])
})

test('utf8 path matching 3', () => {
	assert.is(match('日本:/ふぉお/ばー.txt', '日本:/*/b*.*'), null)
	assert.equal(match('日本:/ふぉお/ばー.txt', '日本:/**'), ['ふぉお/ばー.txt'])
	assert.equal(match('🚗:/foo/bar/baz.txt', '🚗:/**/baz.txt'), ['foo/bar'])
	assert.equal(match('föö.txt', '*.txt'), ['föö'])
	assert.equal(match('föö.txt', 'föö.*'), ['txt'])
	assert.equal(match('fólder/ƒile.txt', 'fólder/*.txt'), ['ƒile'])
	assert.equal(match('fólder/ƒile.txt', '*/ƒile.txt'), ['fólder'])
	assert.equal(match('fólder/ƒile.txt', 'fólder/*.*'), ['ƒile', 'txt'])
	assert.equal(match('fólder/ƒile.txt', '*/*.*'), ['fólder', 'ƒile', 'txt'])
	assert.equal(match('fólder/ƒile.txt', 'f*/ƒ*.*xt'), ['ólder', 'ile', 't'])
	assert.is(match('föö.txt', '*.cpp'), null)
	assert.is(match('föö.txt', 'bar.*'), null)
	assert.is(match('föö.txt', '*o.tx'), null)
	assert.is(match('fólder/ƒile.txt', 'fólder/*.cpp'), null)
	assert.is(match('fólder/ƒile.txt', '*/bar.txt'), null)
	assert.is(match('fólder/ƒile.txt', '*/*.cpp'), null)
	assert.is(match('fólder/ƒile.txt', 'f*/b*.*'), null)
	assert.equal(match('/föö/bar', '**/föö/bar'), [''])
	assert.equal(match('Δ:/föö/bar', '**/föö/bar'), ['Δ:'])
})

test('utf8 path matching 4', () => {
	assert.equal(match('AA:/föö/bar', '**/föö/bar'), ['AA:'])
	assert.equal(match('föö/bar', '**/föö/bar'), [''])
	assert.equal(match('föö/bar', '**/bar'), ['föö'])
	assert.is(match('föö/bar', '**/föö'), null)
	assert.equal(match('/föö/bar', '/föö/**'), ['bar'])
	assert.equal(match('Δ:/föö/bar/baz', 'Δ:/föö/**'), ['bar/baz'])
	assert.equal(match('föö/bar/baz', 'föö/**'), ['bar/baz'])
	assert.equal(match('föö/bar/baz', 'föö/bar/**'), ['baz'])
	assert.equal(match('föö/bar/baz', 'föö/bar/baz/**'), [''])
	assert.equal(match('/föö/bar/baz/qux', '/föö/**/qux'), ['bar/baz'])
	assert.equal(match('Δ:/föö/bar/baz/qux', 'Δ:/föö/**/qux'), ['bar/baz'])
	assert.equal(match('föö/bar/baz/qux', 'föö/**/qux'), ['bar/baz'])
	assert.equal(match('föö/bar/baz/qux', 'föö/**/baz/qux'), ['bar'])
})

test('utf8 path matching 5', () => {
	assert.equal(match('föö/bar/baz/qux/abc/😀ef/ghi', 'föö/**/qux/**/😀ef/ghi'), ['bar/baz', 'abc'])
	assert.equal(match('Δ:/a/b/c/d/e/f/g/h', 'Δ:/**/c/**/g/h'), ['a/b', 'd/e/f'])
	assert.is(match('föö/bar/baz/qux', 'föö/**/notqux'), null)
	assert.equal(match('föö/qux', 'föö/**/qux'), [''])
	assert.is(match('föö/qux', 'föö/**+/qux'), null)
	assert.equal(match('föö/bar', 'föö/**'), ['bar'])
	assert.is(match('föö/bar', 'föö/bar/**+'), null)
	assert.equal(match('föö/bar/baz', 'föö/bar/**+'), ['baz'])
	assert.equal(match('AA:/föö/bar/baz', '*:/föö/**'), ['AA', 'bar/baz'])
	assert.equal(match('Δ:/föö/bar/baz', '*:/föö/**'), ['Δ', 'bar/baz'])
	assert.equal(match('Δ:/föö/bar/baz', '**:/föö/**'), ['Δ', 'bar/baz']) // invalid **: gets transformed to *:
	assert.equal(match('C:/föö/bar/baz', 'C:/**/baz'), ['föö/bar'])
	assert.is(match('C:/föö/bar/baz', 'C:/**/notbaz'), null)
	assert.is(match('/föö/bar', 'föö/bar'), null)
	assert.is(match('föö/bar', '/föö/bar'), null)
	assert.equal(match('fólder/nested1/nested2/ƒile.txt', 'fólder/**/ƒile.txt'), ['nested1/nested2'])
})

test.run()
