#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from '#wildstar/path'

const updateType = process.argv[2]

const pkgJson = await fs.readFile('package.json', 'utf8')

const pkg = JSON.parse(pkgJson)

for (const [name, importPath] of Object.entries(pkg.imports)) {
	let remapped: string | null = null
	if (updateType === 'dst') {
		remapped = path.remap(importPath as string, './src/**/*+.ts', './dst/<1>/<2>.js')
	} else if (updateType === 'src') {
		remapped = path.remap(importPath as string, './dst/**/*+.js', './src/<1>/<2>.ts')
	}

	if (remapped != null) pkg.imports[name] = './' + remapped
}

await fs.writeFile('package.json', JSON.stringify(pkg, null, 2) + '\n', 'utf8')
