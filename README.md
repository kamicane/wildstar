# 💫 wildstar

A minimal, path-aware, platform-unaware, unicode-safe pattern matching library for node.js. Supports captures and replacements.

## Features

- Wildcard matching with `*` (zero or more characters) and `*+` (one or more characters)
- Wildcard matching across path segments with `**` (zero or more segments) and `**+` (one or more segments)
- Each wildcard captures results
- provides simple path methods like `root`, `leaf`, `parent`, `join`, and more, making it a minimal alternative to Node's `path` module for platform-unaware path manipulation.

## Installation

```sh
npm install wildstar
```

## Pattern Syntax

### wildstar

- `*` matches zero or more characters
- `*+` matches one or more characters

### wildstar/path

- `*` matches zero or more characters within a single path segment (does not cross path boundaries)
- `*+` matches one or more characters within a single path segment (does not cross path boundaries)
- `**` matches zero or more entire path segments (crosses path boundaries)
- `**+` matches one or more entire path segments (crosses path boundaries)

## Usage

```js
// modules
import ws from 'wildstar' // path-unaware matching functions
import iws from 'wildstar/insensitive' // same as above, case insensitive version

import path from 'wildstar/path' // path-aware matching functions and path utilities
import ipath from 'wildstar/path/insensitive' // same as above, case insensitive version

// Bool matching
ws.matches('hello world', 'h*o w*d') // true

// Captures
ws.match('foo bar', 'foo *') // ['bar']

// Replace
ws.replace('baz <1>', ['bar']) // 'baz bar'

// Remap (match + replace)
ws.remap('foo bar', 'foo *', 'baz <1>') // 'baz bar'

// Always greedy
ws.match('aaa', '*a') // ['aa']

// Path matching
path.match('foo/bar/baz.txt', 'foo/*/*.txt') // ['bar', 'baz']
path.match('foo/bar/baz.txt', 'foo/*') // null: * doesn't cross path boundaries
path.match('foo/bar/baz.txt', 'foo/**') // ['bar/baz.txt'] ** crosses path boundaries

// Path utility functions
path.normalize('foo//bar\\../baz/.\\') // 'foo/baz'
path.root('c:/foo/bar/baz.txt') // 'c:'
path.leaf('foo/bar/baz.txt')    // 'baz.txt'
path.parent('foo/bar/baz.txt')  // 'foo/bar'
path.join('foo', 'bar', 'baz')  // 'foo/bar/baz'
path.relative('foo/bar', 'foo/bar/baz') // 'baz'

// fun
const ext = path.match('foo/bar/baz.tar.gz', '**/*.*')?.[2] // tar.gz
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

See [API docs](https://kamicane.github.io/wildstar) for full documentation

## License

MIT
