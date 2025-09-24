import { test } from 'uvu'
import * as assert from 'uvu/assert'

import ws from '#wildstar'
import iws, { icompare as compareInsensitive } from '#wildstar/insensitive'
import path from '#wildstar/path'
import ipath from '#wildstar/path/insensitive'

test('normalize', () => {
	assert.is(path.normalize('/'), '/')
	assert.is(path.normalize('c:/'), 'c:')

	assert.is(path.normalize('foo/bar'), 'foo/bar')
	assert.is(path.normalize('foo//bar'), 'foo/bar')
	assert.is(path.normalize('foo/bar/../baz'), 'foo/baz')
	assert.is(path.normalize('foo/./bar'), 'foo/bar')
	assert.is(path.normalize('foo/bar/.'), 'foo/bar')
	assert.is(path.normalize('foo/bar/..'), 'foo')

	assert.is(path.normalize('foo/../..'), '..')

	assert.is(path.normalize('/foo/../..'), '/')
	assert.is(path.normalize('c:/../..'), 'c:')
	assert.is(path.normalize('/../..'), '/')

	assert.is(path.normalize('./foo'), 'foo')
	assert.is(path.normalize('foo\\bar\\baz\\'), 'foo/bar/baz')
	assert.is(path.normalize(''), '')
	assert.is(path.normalize('/foo/bar'), '/foo/bar')
	assert.is(path.normalize('../foo/bar'), '../foo/bar')
})

test('root', () => {
	assert.is(path.root('/foo/bar'), '/')
	assert.is(path.root('c:/foo/bar'), 'c:')
	assert.is(path.root('foo/bar'), '')
})

test('leaf', () => {
	assert.is(path.leaf('/'), '')
	assert.is(path.leaf('c:/'), '')
	assert.is(path.leaf('/foo.txt'), 'foo.txt')
	assert.is(path.leaf('c:/foo.txt'), 'foo.txt')
	assert.is(path.leaf('bar/foo.txt'), 'foo.txt')
})

test('parent', () => {
	assert.is(path.parent('/'), '/')
	assert.is(path.parent('c:/'), 'c:')
	assert.is(path.parent('/foo.txt'), '/')
	assert.is(path.parent('c:/foo.txt'), 'c:')
	assert.is(path.parent('bar/foo.txt'), 'bar')
	assert.is(path.parent('foo.txt'), '')
})

test('join', () => {
	assert.is(path.join('foo', 'bar', 'baz'), 'foo/bar/baz')
	assert.is(path.join('/foo', 'bar', 'baz'), '/foo/bar/baz')
	assert.is(path.join('c:/foo', 'bar', 'baz'), 'c:/foo/bar/baz')
	assert.is(path.join('foo', '/bar', 'baz'), '/bar/baz')
	assert.is(path.join('foo', 'c:/bar', 'baz'), 'c:/bar/baz')
	assert.is(path.join('', 'foo', '', 'bar'), 'foo/bar')
	assert.is(path.join('foo', '.', 'bar'), 'foo/bar')
	assert.is(path.join('foo', 'bar', '..', 'baz'), 'foo/baz')
})

test('relative/irelative', () => {
	assert.is(path.relative('foo/bar', 'foo/bar/baz'), 'baz')
	assert.is(path.relative('c:', 'c:/foo/bar/baz'), 'foo/bar/baz')
	assert.is(path.relative('baz', 'foo/bar'), null)
	assert.is(path.relative('/foo', '/foo/bar'), 'bar')
	assert.is(path.relative('foo/Bar', 'foo/Bar/baz'), 'baz')

	assert.is(path.relative('foo/Bar', 'foo/*/Baz'), 'Baz')

	assert.is(path.relative('foo/bar', 'Foo/Bar/Baz'), null)
	assert.is(ipath.relative('foo/bar', 'Foo/Bar/Baz'), 'Baz')
	assert.is(ipath.relative('foo', 'Foo/Bar'), 'Bar')
})

test('matches exact string', () => {
	assert.ok(ws.matches('hello', 'hello'))
	assert.not(ws.matches('hello', 'world'))
})

test('matches with * wildcard', () => {
	assert.ok(ws.matches('hello', 'h*o'))
	assert.ok(ws.matches('hello', '*'))
	assert.ok(iws.matches('HELLO', 'hel*'))

	assert.not(ws.matches('hello', 'h*l*z'))
})

test('matches with *+ (one or more)', () => {
	assert.ok(ws.matches('hello', 'h*+o'))
	assert.not(ws.matches('ho', 'h*+o'))
	assert.ok(ws.matches('hllo', 'h*+o'))
})

test('captures with *', () => {
	assert.equal(ws.match('hello', 'h*o'), ['ell'])
	assert.equal(ws.match('hello', '*'), ['hello'])
	assert.is(ws.match('hello', 'h*l*z'), null)
})

test('replace with captures', () => {
	const caps = ws.match('hello world', 'h*o w*d')

	assert.is(ws.replace('<1>ie', caps ?? []), 'ellie')
	assert.is(ws.replace('<1>ie goes to <2>ando', caps ?? []), 'ellie goes to orlando')
	assert.is(ws.replace('<>ie goes to <>ando', caps ?? []), 'ellie goes to orlando') // implicit numbers

	assert.is(ws.replace('X<3>Y', caps ?? []), 'XY') // overshot

	// syntax errors
	assert.throws(() => ws.replace('X<abc>Y', caps ?? []))
	assert.throws(() => ws.replace('X<1Y', caps ?? []))
})

test('remap', () => {
	assert.is(ws.remap('hello', 'h*o', '<1>is'), 'ellis')
	assert.is(ws.remap('hello', 'h*z', '<1>'), null)
})

test('unicode support', () => {
	assert.ok(ws.matches('héllo', 'h*o'))
	assert.equal(ws.match('héllo', 'h*o'), ['éll'])
})

test('matches and captures with multiple *', () => {
	assert.ok(ws.matches('foobar', '*o*b*'))
	assert.equal(ws.match('foobar', '*o*b*'), ['f', 'o', 'ar'])
	assert.equal(ws.match('abc123xyz', '*1*3*'), ['abc', '2', 'xyz'])
})

test('matches and captures with multiple *+', () => {
	assert.ok(ws.matches('aabbcc', '*+b*+c*'))
	assert.equal(ws.match('aabbcc', '*+b*+c*'), ['aa', 'b', 'c'])
	assert.equal(ws.match('xxxyyyzzz', '*+y*+z*'), ['xxx', 'yy', 'zz'])
})

test('captures with adjacent * should discard previous *', () => {
	assert.equal(ws.match('abc', '**'), ['abc'])
	assert.equal(ws.match('abc', 'abc*+*'), [''])
})

test('captures with * at start and end', () => {
	assert.equal(ws.match('middle', '*d*'), ['mi', 'dle'])
	assert.equal(ws.match('wildstar', '*l*s*'), ['wi', 'd', 'tar'])
})

test('captures greedily', () => {
	assert.equal(ws.match('aaaabbbb', '*b'), ['aaaabbb'])
})

test('caseInsensitiveCompare: compares Unicode code points case-insensitively (locale-aware)', () => {
	// German sharp S
	assert.is(compareInsensitive('ß'.codePointAt(0) ?? 0, 'ẞ'.codePointAt(0) ?? 0), true) // 'ß' vs 'ẞ'
	// Greek sigma
	assert.is(compareInsensitive('Σ'.codePointAt(0) ?? 0, 'ς'.codePointAt(0) ?? 0), false) // 'Σ' vs 'ς' (contextual, fails at code point level)
	// False case
	assert.is(compareInsensitive('İ'.codePointAt(0) ?? 0, 'I'.codePointAt(0) ?? 0), false) // 'İ' vs 'I'
})

test('caseInsensitiveCompare: works with matches/match for case-insensitive Unicode patterns', () => {
	assert.equal(ws.match('straße', 'STR*E', compareInsensitive), ['aß'])
	assert.is(ws.matches('Μάιος', 'μ*Σ', compareInsensitive), false)
})

test('path stuff', () => {
	assert.equal(path.match('foo/bar/baz.tar.gz', '**/*.*')?.[2], 'tar.gz')
})

test('insensitive path matching', () => {
	assert.equal(ipath.match('C:/USERS/FILE.TXT', 'c:/*/file.txt'), ['USERS'])

	assert.equal(ipath.match('C:/USERS/FILE.TXT', 'c:/*/*.txt'), ['USERS', 'FILE'])
	assert.equal(ipath.match('C:/USERS/Kamicane/FILE.TXT', 'c:/**'), ['USERS/Kamicane/FILE.TXT'])

	assert.equal(
		ipath.match('C:/USERS/KAMICANE/APPDATA/FILE.TXT', 'c:/**/KAMICANE/**/*.txt'), ['USERS', 'APPDATA', 'FILE']
	)

	assert.equal(ipath.match('C:/USERS/Kamicane/FILE.TXT', 'c:/**/*.txt'), ['USERS/Kamicane', 'FILE'])

	assert.equal(ipath.match('C:/USERS/Kamicane/FILE.TXT', '**/c:/**'), ['', 'USERS/Kamicane/FILE.TXT'])

	assert.equal(ipath.match('ЖЖ:/Üsers/ƒile.txt', 'ЖЖ:/*/ƑILE.tXt'), ['Üsers'])
})

// the following test cases are kinda shit because a stupid friend of mine coded them. his name is gpt.
// works for now but could use a cleanup (lots of useless and duplicated tests)

test('utf8 path matching 1', () => {
	assert.ok(path.match('C:/Üsers/ƒile.txt', 'C:/Üsers/ƒile.txt'))
	assert.equal(path.match('AB:/Üsers/ƒile.txt', 'AB:/*ers/ƒile.txt'), ['Üs'])
	assert.equal(path.match('Δ:/Üsers/ƒile.txt', 'Δ:/Üs*/ƒile.txt'), ['ers'])

	assert.is(path.match('C:/Üsers/ƒile.txt', 'C:/*'), null)
	assert.equal(path.match('C:/Üsers/😀ile.txt', 'C:/**'), ['Üsers/😀ile.txt'])
	assert.equal(path.match('f😊o/bar/baz.txt', '**'), ['f😊o/bar/baz.txt'])
	assert.is(path.match('Δ:/Üsers/ƒile.txt', 'D:/Üsers/ƒile.txt'), null)
	assert.equal(path.match('AA:/αβγ/bar.txt', 'AA:/*/bar.txt'), ['αβγ'])
	assert.equal(path.match('ZZ:/ƒøø/bar.txt', 'ZZ:/*/bar.txt'), ['ƒøø'])
	assert.equal(path.match('Δ:/漢字/bar.txt', 'Δ:/*/bar.txt'), ['漢字'])
})

test('utf8 path matching 2', () => {
	assert.equal(path.match('ЖЖ:/добро/bar.txt', 'ЖЖ:/*/bar.txt'), ['добро'])
	assert.equal(path.match('C:/café/bar.txt', 'C:/*/bar.txt'), ['café'])
	assert.equal(path.match('😀:/sm😊l/bar.txt', '😀:/*/bar.txt'), ['sm😊l'])
	assert.equal(path.match('🚗:/🚕🚙/bar.txt', '🚗:/*/bar.txt'), ['🚕🚙'])
	assert.equal(path.match('🦄:/unic🦄rn/bar.txt', '🦄:/*/bar.txt'), ['unic🦄rn'])
	assert.equal(path.match('🚗🚕:/🚙/bar.txt', '🚗🚕:/*/bar.txt'), ['🚙'])
	assert.equal(path.match('AB🚗:/foo😀/bar.txt', 'AB🚗:/*/bar.txt'), ['foo😀'])
	assert.equal(path.match('🚗AB:/bar🦄/bar.txt', '🚗AB:/*/bar.txt'), ['bar🦄'])
	assert.equal(path.match('A🚗B:/βγδ/bar.txt', 'A🚗B:/*/bar.txt'), ['βγδ'])
	assert.equal(path.match('日本:/ふぉお/バー.txt', '日本:/*/バー.txt'), ['ふぉお'])
	assert.equal(path.match('日本語:/テスト/バー.txt', '日本語:/*/バー.txt'), ['テスト'])
	assert.equal(path.match('日本:/ふぉお/ばー.txt', '日本:/*/ばー.txt'), ['ふぉお'])
	assert.equal(path.match('日本:/ふぉお/ばー.txt', '日本:/*/*.txt'), ['ふぉお', 'ばー'])
	assert.equal(path.match('日本:/ふぉお/ばー.txt', '日本:/*/*.*'), ['ふぉお', 'ばー', 'txt'])
})

test('utf8 path matching 3', () => {
	assert.is(path.match('日本:/ふぉお/ばー.txt', '日本:/*/b*.*'), null)
	assert.equal(path.match('日本:/ふぉお/ばー.txt', '日本:/**'), ['ふぉお/ばー.txt'])
	assert.equal(path.match('🚗:/foo/bar/baz.txt', '🚗:/**/baz.txt'), ['foo/bar'])
	assert.equal(path.match('föö.txt', '*.txt'), ['föö'])
	assert.equal(path.match('föö.txt', 'föö.*'), ['txt'])
	assert.equal(path.match('fólder/ƒile.txt', 'fólder/*.txt'), ['ƒile'])
	assert.equal(path.match('fólder/ƒile.txt', '*/ƒile.txt'), ['fólder'])
	assert.equal(path.match('fólder/ƒile.txt', 'fólder/*.*'), ['ƒile', 'txt'])
	assert.equal(path.match('fólder/ƒile.txt', '*/*.*'), ['fólder', 'ƒile', 'txt'])
	assert.equal(path.match('fólder/ƒile.txt', 'f*/ƒ*.*xt'), ['ólder', 'ile', 't'])
	assert.is(path.match('föö.txt', '*.cpp'), null)
	assert.is(path.match('föö.txt', 'bar.*'), null)
	assert.is(path.match('föö.txt', '*o.tx'), null)
	assert.is(path.match('fólder/ƒile.txt', 'fólder/*.cpp'), null)
	assert.is(path.match('fólder/ƒile.txt', '*/bar.txt'), null)
	assert.is(path.match('fólder/ƒile.txt', '*/*.cpp'), null)
	assert.is(path.match('fólder/ƒile.txt', 'f*/b*.*'), null)
	assert.equal(path.match('/föö/bar', '**/föö/bar'), [''])
	assert.equal(path.match('Δ:/föö/bar', '**/föö/bar'), ['Δ:'])
})

test('utf8 path matching 4', () => {
	assert.equal(path.match('AA:/föö/bar', '**/föö/bar'), ['AA:'])
	assert.equal(path.match('föö/bar', '**/föö/bar'), [''])
	assert.equal(path.match('föö/bar', '**/bar'), ['föö'])
	assert.is(path.match('föö/bar', '**/föö'), null)
	assert.equal(path.match('/föö/bar', '/föö/**'), ['bar'])
	assert.equal(path.match('Δ:/föö/bar/baz', 'Δ:/föö/**'), ['bar/baz'])
	assert.equal(path.match('föö/bar/baz', 'föö/**'), ['bar/baz'])
	assert.equal(path.match('föö/bar/baz', 'föö/bar/**'), ['baz'])
	assert.equal(path.match('föö/bar/baz', 'föö/bar/baz/**'), [''])
	assert.equal(path.match('/föö/bar/baz/qux', '/föö/**/qux'), ['bar/baz'])
	assert.equal(path.match('Δ:/föö/bar/baz/qux', 'Δ:/föö/**/qux'), ['bar/baz'])
	assert.equal(path.match('föö/bar/baz/qux', 'föö/**/qux'), ['bar/baz'])
	assert.equal(path.match('föö/bar/baz/qux', 'föö/**/baz/qux'), ['bar'])
})

test('utf8 path matching 5', () => {
	assert.equal(path.match('föö/bar/baz/qux/abc/😀ef/ghi', 'föö/**/qux/**/😀ef/ghi'), ['bar/baz', 'abc'])
	assert.equal(path.match('Δ:/a/b/c/d/e/f/g/h', 'Δ:/**/c/**/g/h'), ['a/b', 'd/e/f'])
	assert.is(path.match('föö/bar/baz/qux', 'föö/**/notqux'), null)
	assert.equal(path.match('föö/qux', 'föö/**/qux'), [''])
	assert.is(path.match('föö/qux', 'föö/**+/qux'), null)
	assert.equal(path.match('föö/bar', 'föö/**'), ['bar'])
	assert.is(path.match('föö/bar', 'föö/bar/**+'), null)
	assert.equal(path.match('föö/bar/baz', 'föö/bar/**+'), ['baz'])
	assert.equal(path.match('AA:/föö/bar/baz', '*:/föö/**'), ['AA', 'bar/baz'])
	assert.equal(path.match('Δ:/föö/bar/baz', '*:/föö/**'), ['Δ', 'bar/baz'])
	assert.equal(path.match('Δ:/föö/bar/baz', '**:/föö/**'), ['Δ', 'bar/baz']) // invalid **: gets transformed to *:
	assert.equal(path.match('C:/föö/bar/baz', 'C:/**/baz'), ['föö/bar'])
	assert.is(path.match('C:/föö/bar/baz', 'C:/**/notbaz'), null)
	assert.is(path.match('/föö/bar', 'föö/bar'), null)
	assert.is(path.match('föö/bar', '/föö/bar'), null)
	assert.equal(path.match('fólder/nested1/nested2/ƒile.txt', 'fólder/**/ƒile.txt'), ['nested1/nested2'])
})

test.run()
