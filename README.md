# wildstar

A minimal, path-aware, platform-unaware, unicode-safe pattern matching library for node.js. Supports captures and replacements.

## Features

- Wildcard matching with `*` (zero or more) and `*+` (one or more)
- `**` and `**+` wildcards for matching across path segments
- Each wildcard captures results
- Unicode-safe (works with code points, not just code units)
- provides simple path methods like `root`, `leaf`, `parent`, `join`, and more, making it a minimal alternative to Node's `path` module for platform-unaware path manipulation.

## Installation

```sh
npm install wildstar
```

## Pattern Syntax

- `*` matches zero or more characters within a single path segment (does not cross path boundaries)
- `*+` matches one or more characters within a single path segment (does not cross path boundaries)
- `**` matches zero or more entire path segments (crosses path boundaries)
- `**+` matches one or more entire path segments (crosses path boundaries)

## Usage

```js
import wildstar from 'wildstar'
import wsi from 'wildstar/insensitive' // for case insensitive comparison functions
// or
// import { match, matches, replace, remap } from 'wildstar'
// and / or
// import { match, matches, replace, remap } from 'wildstar/insensitive'

// Bool matching
wildstar.matches('hello world', 'h*o w*d') // true

// Capture
wildstar.match('foo bar', 'foo *') // ['bar']

// Replace
wildstar.replace('baz <1>', ['bar']) // 'baz bar'

// Remap (match + replace)
wildstar.remap('foo bar', 'foo *', 'baz <1>') // 'baz bar'

// Always greedy
wildstar.match('aaa', '*a') // ['aa']

// Path matching
wildstar.match('foo/bar/baz.txt', 'foo/*/*.txt') // ['bar', 'baz']
wildstar.match('foo/bar/baz.txt', '**/*.txt') // ['foo/bar', 'baz']
wildstar.match('foo/bar/baz.txt', 'foo/**/baz.txt') // ['bar']

wildstar.match('foo/bar/baz.txt', 'foo/**') // ['bar/baz.txt']

wildstar.match('foo', 'foo/**') // ['']
wildstar.match('foo', 'foo/**+') // null

wildstar.match('foo', '**/foo') // ['']
wildstar.match('foo', '**+/foo') // null

// Path utility functions
wildstar.normalize('foo//bar\\../baz/.\\') // 'foo/baz'
wildstar.root('c:/foo/bar/baz.txt') // 'c:/'
wildstar.leaf('foo/bar/baz.txt')    // 'baz.txt'
wildstar.parent('foo/bar/baz.txt')  // 'foo/bar'
wildstar.join('foo', 'bar', 'baz')  // 'foo/bar/baz'
wildstar.relative('foo/bar/baz', 'foo/bar') // 'baz'
```

### Notes

- Each `*`, `**`, `*+` and `**+` will fill a capture slot, even if empty
- Wildstar does not consider trailing slashes
- Subpath captures and path methods always return `/` as separator
- Unlike glob, `folder/**` matches both `folder` and `folder/anything`
- Unlike glob, `**/folder` matches both `folder` and `anything/folder`
- Path handling is entirely platform unaware. Paths like `c:/foo/bar` and `/foo/bar` are always considered absolute
- `**` and `**+` are only considered when a full path segment is exactly `**` or `**+`
- Matches are greedy: each wildcard will match as much as possible while still allowing the overall pattern to match

## Why platform unaware

A platform-unaware path implementation treats all paths the same way, no matter the operating system. This makes it easy to use paths for other purposes other than file system usage.

## API

**Note:** You can import `wildstar` and `wildstar/insensitive`. Both export the same API, but `/insensitive` versions perform all operations case-insensitively.

See [API docs](API.md) for full documentation.

## License

MIT
