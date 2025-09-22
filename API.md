## Modules

* [wildstar](#module_wildstar)
    * [`.match(source, pattern, [charCompare])`](#module_wildstar.match) ⇒ <code>Array.&lt;string&gt;</code> \| <code>null</code>
    * [`.matches(source, pattern, [charCompare])`](#module_wildstar.matches) ⇒ <code>boolean</code>
    * [`.remap(source, pattern, replacement, [charCompare])`](#module_wildstar.remap) ⇒ <code>string</code> \| <code>null</code>
    * [`.normalize(string)`](#module_wildstar.normalize) ⇒ <code>string</code>
    * [`.parent(string)`](#module_wildstar.parent) ⇒ <code>string</code>
    * [`.root(string)`](#module_wildstar.root) ⇒ <code>string</code>
    * [`.leaf(string)`](#module_wildstar.leaf) ⇒ <code>string</code>
    * [`.join(string, ...strings)`](#module_wildstar.join) ⇒ <code>string</code>
    * [`.relative(string, base, [charCompare])`](#module_wildstar.relative) ⇒ <code>string</code> \| <code>null</code>
    * [`.replace(repl, captures)`](#module_wildstar.replace) ⇒ <code>string</code>
* [wildstar/insensitive](#module_wildstar/insensitive)
    * [`.root`](#module_wildstar/insensitive.root)
    * [`.join`](#module_wildstar/insensitive.join)
    * [`.leaf`](#module_wildstar/insensitive.leaf)
    * [`.parent`](#module_wildstar/insensitive.parent)
    * [`.replace`](#module_wildstar/insensitive.replace)
    * [`.normalize`](#module_wildstar/insensitive.normalize)
    * [`.compareInsensitive(codePointA, codePointB)`](#module_wildstar/insensitive.compareInsensitive) ⇒ <code>boolean</code>
    * [`.remap(source, pattern, replacement)`](#module_wildstar/insensitive.remap) ⇒ <code>string</code> \| <code>null</code>
    * [`.match(source, pattern)`](#module_wildstar/insensitive.match) ⇒ <code>Array.&lt;string&gt;</code> \| <code>null</code>
    * [`.matches(source, pattern)`](#module_wildstar/insensitive.matches) ⇒ <code>boolean</code>
    * [`.relative(string, base)`](#module_wildstar/insensitive.relative) ⇒ <code>string</code> \| <code>null</code>

<a name="module_wildstar"></a>

## wildstar
Wildstar main module.


* [wildstar](#module_wildstar)
    * [`.match(source, pattern, [charCompare])`](#module_wildstar.match) ⇒ <code>Array.&lt;string&gt;</code> \| <code>null</code>
    * [`.matches(source, pattern, [charCompare])`](#module_wildstar.matches) ⇒ <code>boolean</code>
    * [`.remap(source, pattern, replacement, [charCompare])`](#module_wildstar.remap) ⇒ <code>string</code> \| <code>null</code>
    * [`.normalize(string)`](#module_wildstar.normalize) ⇒ <code>string</code>
    * [`.parent(string)`](#module_wildstar.parent) ⇒ <code>string</code>
    * [`.root(string)`](#module_wildstar.root) ⇒ <code>string</code>
    * [`.leaf(string)`](#module_wildstar.leaf) ⇒ <code>string</code>
    * [`.join(string, ...strings)`](#module_wildstar.join) ⇒ <code>string</code>
    * [`.relative(string, base, [charCompare])`](#module_wildstar.relative) ⇒ <code>string</code> \| <code>null</code>
    * [`.replace(repl, captures)`](#module_wildstar.replace) ⇒ <code>string</code>

<a name="module_wildstar.match"></a>

### `wildstar.match(source, pattern, [charCompare])` ⇒ <code>Array.&lt;string&gt;</code> \| <code>null</code>
Matches a string against a pattern with wildcards and captures.

**Kind**: static method of [<code>wildstar</code>](#module_wildstar)  
**Returns**: <code>Array.&lt;string&gt;</code> \| <code>null</code> - Array of captures if matched, or null if not.  

| Param | Type | Description |
| --- | --- | --- |
| source | <code>string</code> | The input string to match. |
| pattern | <code>string</code> | The pattern string, may contain * and *+ wildcards. |
| [charCompare] | <code>function</code> | Optional custom character comparison function. |

**Example**  
```js
match('foo bar', 'foo *') // returns ['bar']
```
<a name="module_wildstar.matches"></a>

### `wildstar.matches(source, pattern, [charCompare])` ⇒ <code>boolean</code>
Checks if a string matches a pattern with wildcards, without returning captures.

**Kind**: static method of [<code>wildstar</code>](#module_wildstar)  
**Returns**: <code>boolean</code> - True if the pattern matches, false otherwise.  

| Param | Type | Description |
| --- | --- | --- |
| source | <code>string</code> | The input string to match. |
| pattern | <code>string</code> | The pattern string, may contain * and *+ wildcards. |
| [charCompare] | <code>function</code> | Optional custom character comparison function. |

**Example**  
```js
matches('hello', 'hell*') // returns true
```
<a name="module_wildstar.remap"></a>

### `wildstar.remap(source, pattern, replacement, [charCompare])` ⇒ <code>string</code> \| <code>null</code>
Matches a string against a pattern and replaces using the replacement string if matched.

**Kind**: static method of [<code>wildstar</code>](#module_wildstar)  
**Returns**: <code>string</code> \| <code>null</code> - The replaced string if matched, or null if not matched.  

| Param | Type | Description |
| --- | --- | --- |
| source | <code>string</code> | The input string to match. |
| pattern | <code>string</code> | The pattern string, may contain * and *+ wildcards. |
| replacement | <code>string</code> | The replacement string, may contain <1>, <2>, ... for captures. |
| [charCompare] | <code>function</code> | Optional custom character comparison function. |

**Example**  
```js
remap('foo bar', '* bar', '<1> baz') // returns 'foo baz'
```
<a name="module_wildstar.normalize"></a>

### `wildstar.normalize(string)` ⇒ <code>string</code>
Normalizes a path-like string to wildstar's canonical form.

**Kind**: static method of [<code>wildstar</code>](#module_wildstar)  
**Returns**: <code>string</code> - The normalized path string, using `/` as separator.  

| Param | Type | Description |
| --- | --- | --- |
| string | <code>string</code> | The input path string to normalize. |

**Example**  
```js
normalize('foo//bar/../baz/./') // 'foo/baz'
normalize('~\\foo/') // 'c:/Users/kamicane/foo'
```
<a name="module_wildstar.parent"></a>

### `wildstar.parent(string)` ⇒ <code>string</code>
Returns the parent directory of a path-like string, normalized.
If the input is an absolute root, returns the root itself.

**Kind**: static method of [<code>wildstar</code>](#module_wildstar)  
**Returns**: <code>string</code> - The parent path, or root if input is root.  

| Param | Type | Description |
| --- | --- | --- |
| string | <code>string</code> | The input path string. |

**Example**  
```js
parent('foo/bar/baz') // 'foo/bar'
parent('c:/foo') // 'c:'
parent('c:/') // 'c:'
```
<a name="module_wildstar.root"></a>

### `wildstar.root(string)` ⇒ <code>string</code>
Returns the root of a path-like string, or empty string if not absolute.

**Kind**: static method of [<code>wildstar</code>](#module_wildstar)  
**Returns**: <code>string</code> - The root path, or '' if not absolute.  

| Param | Type | Description |
| --- | --- | --- |
| string | <code>string</code> | The input path string. |

**Example**  
```js
root('c:/foo/bar') // 'c:'
root('foo/bar') // ''
root('/foo/bar') // '/'
```
<a name="module_wildstar.leaf"></a>

### `wildstar.leaf(string)` ⇒ <code>string</code>
Returns the last segment (leaf) of a path-like string, or '' if root.

**Kind**: static method of [<code>wildstar</code>](#module_wildstar)  
**Returns**: <code>string</code> - The last segment, or '' if input is root.  

| Param | Type | Description |
| --- | --- | --- |
| string | <code>string</code> | The input path string. |

**Example**  
```js
leaf('foo/bar/baz') // 'baz'
leaf('c:/') // ''
```
<a name="module_wildstar.join"></a>

### `wildstar.join(string, ...strings)` ⇒ <code>string</code>
Joins multiple path-like strings into a single normalized path.
Handles absolute paths and normalization of wildcards.

**Kind**: static method of [<code>wildstar</code>](#module_wildstar)  
**Returns**: <code>string</code> - The joined and normalized path string.  

| Param | Type | Description |
| --- | --- | --- |
| string | <code>string</code> | The base path string. |
| ...strings | <code>string</code> | Additional path strings to join. |

**Example**  
```js
join('foo', 'bar', 'baz') // 'foo/bar/baz'
join('c:/foo', 'bar') // 'c:/foo/bar'
```
<a name="module_wildstar.relative"></a>

### `wildstar.relative(string, base, [charCompare])` ⇒ <code>string</code> \| <code>null</code>
Returns the relative path from base to string, or null if not a subpath.
Uses optional custom character comparison.
Note: This function does not support subpath matching with `**` (globstar).

**Kind**: static method of [<code>wildstar</code>](#module_wildstar)  
**Returns**: <code>string</code> \| <code>null</code> - The relative path, or null if not a subpath.  

| Param | Type | Description |
| --- | --- | --- |
| string | <code>string</code> | The target path string. |
| base | <code>string</code> | The base path string. |
| [charCompare] | <code>function</code> | Optional custom character comparison function. |

**Example**  
```js
relative('foo/bar/baz', 'foo/bar') // 'baz'
relative('foo/bar', 'baz') // null
relative('foo/bar/baz', 'foo/ba*') // 'baz'
```
<a name="module_wildstar.replace"></a>

### `wildstar.replace(repl, captures)` ⇒ <code>string</code>
Replaces capture references in a replacement string with actual capture values.

**Kind**: static method of [<code>wildstar</code>](#module_wildstar)  
**Returns**: <code>string</code> - The replaced string.  
**Throws**:

- <code>Error</code> If the replacement pattern is invalid or references a missing capture.


| Param | Type | Description |
| --- | --- | --- |
| repl | <code>string</code> | The replacement string, may contain <1>, <2>, ... for captures. |
| captures | <code>Array.&lt;string&gt;</code> | Array of captured substrings. |

**Example**  
```js
replace('foo <1>', ['baz']) // returns 'foo baz'
```
<a name="module_wildstar/insensitive"></a>

## wildstar/insensitive
Wildstar insensitive module.


* [wildstar/insensitive](#module_wildstar/insensitive)
    * [`.root`](#module_wildstar/insensitive.root)
    * [`.join`](#module_wildstar/insensitive.join)
    * [`.leaf`](#module_wildstar/insensitive.leaf)
    * [`.parent`](#module_wildstar/insensitive.parent)
    * [`.replace`](#module_wildstar/insensitive.replace)
    * [`.normalize`](#module_wildstar/insensitive.normalize)
    * [`.compareInsensitive(codePointA, codePointB)`](#module_wildstar/insensitive.compareInsensitive) ⇒ <code>boolean</code>
    * [`.remap(source, pattern, replacement)`](#module_wildstar/insensitive.remap) ⇒ <code>string</code> \| <code>null</code>
    * [`.match(source, pattern)`](#module_wildstar/insensitive.match) ⇒ <code>Array.&lt;string&gt;</code> \| <code>null</code>
    * [`.matches(source, pattern)`](#module_wildstar/insensitive.matches) ⇒ <code>boolean</code>
    * [`.relative(string, base)`](#module_wildstar/insensitive.relative) ⇒ <code>string</code> \| <code>null</code>

<a name="module_wildstar/insensitive.root"></a>

### `wildstar/insensitive.root`
re-export of [root](#module_wildstar.root)

**Kind**: static property of [<code>wildstar/insensitive</code>](#module_wildstar/insensitive)  
<a name="module_wildstar/insensitive.join"></a>

### `wildstar/insensitive.join`
re-export of [join](#module_wildstar.join)

**Kind**: static property of [<code>wildstar/insensitive</code>](#module_wildstar/insensitive)  
<a name="module_wildstar/insensitive.leaf"></a>

### `wildstar/insensitive.leaf`
re-export of [leaf](#module_wildstar.leaf)

**Kind**: static property of [<code>wildstar/insensitive</code>](#module_wildstar/insensitive)  
<a name="module_wildstar/insensitive.parent"></a>

### `wildstar/insensitive.parent`
re-export of [parent](#module_wildstar.parent)

**Kind**: static property of [<code>wildstar/insensitive</code>](#module_wildstar/insensitive)  
<a name="module_wildstar/insensitive.replace"></a>

### `wildstar/insensitive.replace`
re-export of [replace](#module_wildstar.replace)

**Kind**: static property of [<code>wildstar/insensitive</code>](#module_wildstar/insensitive)  
<a name="module_wildstar/insensitive.normalize"></a>

### `wildstar/insensitive.normalize`
re-export of [normalize](#module_wildstar.normalize)

**Kind**: static property of [<code>wildstar/insensitive</code>](#module_wildstar/insensitive)  
<a name="module_wildstar/insensitive.compareInsensitive"></a>

### `wildstar/insensitive.compareInsensitive(codePointA, codePointB)` ⇒ <code>boolean</code>
Compares two Unicode code points for case-insensitive equality (locale-unaware).

**Kind**: static method of [<code>wildstar/insensitive</code>](#module_wildstar/insensitive)  
**Returns**: <code>boolean</code> - True if code points are equal ignoring case (using toLowerCase).  

| Param | Type | Description |
| --- | --- | --- |
| codePointA | <code>number</code> | First code point. |
| codePointB | <code>number</code> | Second code point. |

**Example**  
```js
compareInsensitive('A'.codePointAt(0), 'a'.codePointAt(0)) // returns true
matches('Hello', 'h*o', compareInsensitive) // returns true
```
<a name="module_wildstar/insensitive.remap"></a>

### `wildstar/insensitive.remap(source, pattern, replacement)` ⇒ <code>string</code> \| <code>null</code>
Case-insensitive version of [remap](#module_wildstar.remap).
Matches a string against a pattern (case-insensitive) and replaces using the replacement string if matched.

**Kind**: static method of [<code>wildstar/insensitive</code>](#module_wildstar/insensitive)  
**Returns**: <code>string</code> \| <code>null</code> - The replaced string if matched, or null if not matched.  

| Param | Type | Description |
| --- | --- | --- |
| source | <code>string</code> | The input string to match. |
| pattern | <code>string</code> | The pattern string, may contain * and *+ wildcards. |
| replacement | <code>string</code> | The replacement string, may contain <1>, <2>, ... for captures. |

**Example**  
```js
remap('Foo Bar', 'foo *', '<1> baz') // returns 'Bar baz'
```
<a name="module_wildstar/insensitive.match"></a>

### `wildstar/insensitive.match(source, pattern)` ⇒ <code>Array.&lt;string&gt;</code> \| <code>null</code>
Case-insensitive version of [match](#module_wildstar.match).
Returns captures if the pattern matches the source string (case-insensitive), otherwise null.

**Kind**: static method of [<code>wildstar/insensitive</code>](#module_wildstar/insensitive)  
**Returns**: <code>Array.&lt;string&gt;</code> \| <code>null</code> - Array of captures if matched, or null if not.  

| Param | Type | Description |
| --- | --- | --- |
| source | <code>string</code> | The input string to match. |
| pattern | <code>string</code> | The pattern string, may contain * and *+ wildcards. |

**Example**  
```js
match('Foo Bar', 'foo *') // returns ['Bar']
```
<a name="module_wildstar/insensitive.matches"></a>

### `wildstar/insensitive.matches(source, pattern)` ⇒ <code>boolean</code>
Case-insensitive version of [matches](#module_wildstar.matches).
Checks if a string matches a pattern with wildcards (case-insensitive), without returning captures.

**Kind**: static method of [<code>wildstar/insensitive</code>](#module_wildstar/insensitive)  
**Returns**: <code>boolean</code> - True if the pattern matches, false otherwise.  

| Param | Type | Description |
| --- | --- | --- |
| source | <code>string</code> | The input string to match. |
| pattern | <code>string</code> | The pattern string, may contain * and *+ wildcards. |

**Example**  
```js
matches('Hello', 'hell*') // returns true
```
<a name="module_wildstar/insensitive.relative"></a>

### `wildstar/insensitive.relative(string, base)` ⇒ <code>string</code> \| <code>null</code>
Case-insensitive version of [relative](#module_wildstar.relative).
Returns the relative path from base to string (case-insensitive), or null if not a subpath.

**Kind**: static method of [<code>wildstar/insensitive</code>](#module_wildstar/insensitive)  
**Returns**: <code>string</code> \| <code>null</code> - The relative path, or null if not a subpath.  

| Param | Type | Description |
| --- | --- | --- |
| string | <code>string</code> | The target path string. |
| base | <code>string</code> | The base path string. |

**Example**  
```js
relative('Foo/Bar/Baz', 'foo/bar') // 'Baz'
```
