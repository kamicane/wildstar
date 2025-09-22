import neostandard, { plugins } from 'neostandard'

export default [
	...neostandard(/* { ts: true } */),
	plugins.n.configs['flat/recommended-module'],
	// ...plugins['typescript-eslint'].configs.recommended,
	{
		languageOptions: {
			ecmaVersion: 'latest'
		},
		rules: {
			'curly': 'off',
			'no-unused-vars': ['warn', { caughtErrors: 'none', args: 'after-used', destructuredArrayIgnorePattern: '^_' }],
			'n/no-unpublished-import': ['error', { allowModules: ['neostandard', 'uvu'] }],
			'n/prefer-node-protocol': ['error'],
			'n/hashbang': 'off',
			'object-shorthand': 'off',
			'@stylistic/max-len': ['warn', { code: 120, tabWidth: 2, ignoreComments: true }],
			'@stylistic/indent': ['error', 'tab'],
			'@stylistic/arrow-parens': ['error', 'always'],
			'@stylistic/no-tabs': 'off',
			'@stylistic/no-extra-parens': ['error', 'all', { returnAssign: false, nestedBinaryExpressions: false }],
			'@stylistic/eol-last': ['error', 'always'],
			'@stylistic/linebreak-style': ['error', 'unix'],
			'@stylistic/quote-props': ['error', 'consistent-as-needed'],
			'@stylistic/array-bracket-newline': ['error', 'consistent'],
			'@stylistic/function-call-argument-newline': ['error', 'consistent'],
			'@stylistic/function-paren-newline': ['error', 'consistent'],
			'@stylistic/array-element-newline': ['error', 'consistent'],
			'@stylistic/quotes': ['error', 'single', { avoidEscape: true }],
			'@stylistic/object-curly-newline': ['error', { consistent: true, multiline: true }],
			'@stylistic/object-property-newline': ['error', { allowAllPropertiesOnSameLine: true }],
			'@stylistic/comma-dangle': ['error', 'never']
		}
	}
]
