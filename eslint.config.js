import stylistic from '@stylistic/eslint-plugin'
import tseslint from 'typescript-eslint'
import n from 'eslint-plugin-n'

export default [
	{
		ignores: [
			'**/dst/**',
			'**/node_modules/**'
		]
	},
	n.configs['flat/recommended-module'],
	...tseslint.configs.strict,
	...tseslint.configs.stylistic,
	stylistic.configs.recommended,
	{
		languageOptions: {
			ecmaVersion: 'latest'
		},
		rules: {
			'curly': 'off',
			'no-unused-vars': ['off'],
			'n/no-unpublished-import': ['error', { allowModules: ['uvu', 'tsdoc-markdown'] }],
			'n/prefer-node-protocol': ['error'],
			'n/hashbang': 'off',
			'object-shorthand': 'off',

			'@typescript-eslint/no-unused-vars': ['error'],

			'@stylistic/indent-binary-ops': ['error', 'tab'],
			'@stylistic/brace-style': ['error', '1tbs'],
			'@stylistic/operator-linebreak': ['error', 'after'],
			'@stylistic/space-before-function-paren': ['error', 'always'],
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
