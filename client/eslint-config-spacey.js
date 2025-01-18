/**
	More information about the Spacey style guide: https://github.com/Unit2795/spacey

	Are you sure you want to edit this file? Consider extending it instead in your config.
	Editing it directly may make it harder to update to a newer version in the future if Spacey is updated.
 */

import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import stylistic from "@stylistic/eslint-plugin";
import eslintNewlinePlugin from "eslint-plugin-import-newlines";
import react from "eslint-plugin-react";
import noRelative from "eslint-plugin-no-relative-import-paths";
import newlineDestructuring from "eslint-plugin-newline-destructuring";

export default [
	js.configs.recommended,
	...tseslint.configs.strictTypeChecked,
	...tseslint.configs.stylisticTypeChecked,
	{
		settings: {
			react: {
				version: "detect"
			}
		},
		plugins: {
			"react-hooks": reactHooks,
			"react-refresh": reactRefresh,
			"@stylistic": stylistic,
			"import-newlines": eslintNewlinePlugin,
			"react": react,
			"no-relative-import-paths": noRelative,
			"newline-destructuring": newlineDestructuring
		},
		rules: {
			...reactHooks.configs.recommended.rules,
			...react.configs[ "jsx-runtime" ].rules,
			"react-refresh/only-export-components": [
				"warn",
				{
					allowConstantExport: true
				},
			],
			"newline-destructuring/newline": [
				"error",
				{
					items: 1
				}
			],
			"no-relative-import-paths/no-relative-import-paths": [
				"error",
				{
					allowSameFolder: true
				}
			],
			"import-newlines/enforce": [
				"error",
				{
					items: 1,
					semi: true,
					forceSingleLine: false
				}
			],
			"@stylistic/quotes": [ "error", "double" ],
			"@stylistic/array-bracket-spacing": [ "error", "always" ],
			"@stylistic/block-spacing": [ "error", "always" ],
			"@stylistic/brace-style": [ "error", "1tbs" ],
			"@stylistic/computed-property-spacing": [ "error", "always" ],
			"@stylistic/dot-location": [ "error", "property" ],
			"@stylistic/eol-last": [ "error", "always" ],
			"@stylistic/func-call-spacing": [ "error", "never" ],
			"@stylistic/function-paren-newline": [ "error", "multiline-arguments" ],
			"@stylistic/function-call-argument-newline": [ "error", "always" ],
			"@stylistic/jsx-quotes": [ "error", "prefer-double" ],
			"@stylistic/no-extra-semi": [ "error" ],
			"@stylistic/type-annotation-spacing": [
				"error",
				{
					before: false,
					after: true
				}
			],
			"@stylistic/keyword-spacing": [
				"error",
				{
					before: true,
					after: true
				}
			],
			"@stylistic/indent": [ "error", "tab", {
				"SwitchCase": 1
			} ],
			"@stylistic/linebreak-style": [ "error", "unix" ],
			"@stylistic/key-spacing": [
				"error",
				{
					beforeColon: false,
					afterColon: true
				}
			],
			"@stylistic/rest-spread-spacing": [ "error", "never" ],
			"@stylistic/lines-between-class-members": [ "error", "always" ],
			"@stylistic/multiline-ternary": [ "error", "always-multiline" ],
			"@stylistic/space-infix-ops": [ "error", {
				int32Hint: false
			} ],
			"@stylistic/no-mixed-spaces-and-tabs": [ "error" ],
			"@stylistic/no-multi-spaces": [ "error" ],
			"@stylistic/semi": [ "error", "always" ],
			"@stylistic/padding-line-between-statements": [
				"error",
				{
					blankLine: "always",
					prev: "*",
					next: "return"
				},
				{
					blankLine: "never",
					prev: "import",
					next: "import"
				},
				{
					blankLine: "always",
					prev: "import",
					next: [ "block-like", "const", "let", "var", "function", "return" ]
				}
			],
			"@stylistic/no-multiple-empty-lines": [
				"error",
				{
					max: 2,
					maxEOF: 1,
					maxBOF: 0
				}
			],
			"@stylistic/no-trailing-spaces": [ "error" ],
			"@stylistic/nonblock-statement-body-position": [ "error", "beside" ],
			"@stylistic/object-curly-spacing": [ "error", "always" ],
			"@stylistic/object-property-newline": [ "error" ],
			"@stylistic/object-curly-newline": [
				"error",
				"always"
			],
			"@stylistic/semi-style": [ "error", "last" ],
			"@stylistic/space-before-blocks": [ "error", "always" ],
			"@stylistic/space-before-function-paren": [ "error", "never" ],
			"@stylistic/space-in-parens": [ "error", "always" ],
			"@stylistic/switch-colon-spacing": [ "error" ],
			"@stylistic/template-curly-spacing": [ "error", "always" ],
			"@stylistic/template-tag-spacing": [ "error", "never" ],
			"@stylistic/semi-spacing": [
				"error",
				{
					before: false,
					after: true
				}
			],
			"@stylistic/newline-per-chained-call": [
				"error",
				{
					ignoreChainWithDepth: 2
				}
			],
			"@stylistic/jsx-one-expression-per-line": [ "error", {
				allow: "single-line"
			} ],
			"sort-imports": [
				"error",
				{
					ignoreDeclarationSort: true
				}
			],
			"no-nested-ternary": [ "error" ],
			"prefer-template": [ "error" ],
			"prefer-const": [ "error" ],
			"no-var": [ "error" ],
			"no-lonely-if": [ "error" ],
			"no-implicit-coercion": [ "error" ],
			"no-useless-return": [ "error" ],
			"no-useless-escape": [ "error" ],
			"no-useless-catch": [ "error" ],
			"no-unneeded-ternary": [ "error" ],
			"no-regex-spaces": [ "error" ],
			"no-extra-boolean-cast": [ "error" ],
			"no-empty": [ "error" ],
			eqeqeq: [ "error" ],
			"valid-typeof": [ "error" ],
			complexity: [ "warn", 12 ],
			"dot-notation": [ "error" ],
			"no-global-assign": [ "error" ],
			"react/button-has-type": [ "error" ],
			"react/no-access-state-in-setstate": [ "error" ],
			"react/style-prop-object": [ "error" ],
			"react/void-dom-elements-no-children": [ "error" ],
			"react/self-closing-comp": [ "error" ],
			"react/no-unstable-nested-components": [ "error" ],
			"react/no-this-in-sfc": [ "error" ],
			"react/no-render-return-value": [ "error" ],
			"react/no-object-type-as-default-prop": [ "error" ],
			"react/no-namespace": [ "error" ],
			"react/no-find-dom-node": [ "error" ],
			"react/no-deprecated": [ "error" ],
			"react/no-danger-with-children": [ "error" ],
			"react/no-danger": [ "warn" ],
			"react/no-children-prop": [ "error" ],
			"react/no-array-index-key": [ "error" ],
			"react/jsx-wrap-multilines": [ "error", {
				return: "parens-new-line",
				declaration: "parens-new-line",
				assignment: "parens-new-line",
				arrow: "parens-new-line",
				condition: "parens-new-line",
				logical: "parens-new-line",
				prop: "parens-new-line"
			} ],
			"react/jsx-uses-react": [ "error" ],
			"react/jsx-sort-props": [ "error", {
				callbacksLast: true,
				ignoreCase: true,
			} ],
			"react/jsx-pascal-case": [ "error" ],
			"react/jsx-indent": [ "error", "tab", {
				indentLogicalExpressions: true
			} ],
			"react/jsx-no-useless-fragment": [ "error", {
				allowExpressions: true
			} ],
			"react/jsx-no-undef": [ "error" ],
			"react/jsx-no-target-blank": [ "error", {
				enforceDynamicLinks: "always",
				forms: true,
				warnOnSpreadAttributes: true
			} ],
			"react/jsx-no-leaked-render": [ "error" ],
			"react/jsx-no-constructed-context-values": [ "error" ],
			"react/jsx-newline": [ "error" ],
			"react/jsx-first-prop-new-line": [ "error", "multiline" ],
			"react/jsx-max-props-per-line": [ "error" ],
			"react/jsx-max-depth": [ "warn", {
				"max": 4
			} ],
			"react/jsx-key": [ "error", {
				warnOnDuplicates: true,
				checkKeyMustBeforeSpread: true,
				checkFragmentShorthand: true
			} ],
			"react/jsx-fragments": [ "error", "syntax" ],
			"react/jsx-equals-spacing": [ "error", "never" ],
			"react/jsx-curly-spacing": [ "error", {
				"when": "always"
			} ],
			"react/jsx-curly-newline": [ "error", {
				multiline: "require",
				singleline: "consistent"
			} ],
			"react/jsx-curly-brace-presence": [ "error", {
				props: "never",
				children: "never",
				propElementValues: "always"
			} ],
			"react/jsx-closing-tag-location": [ "error" ],
			"react/jsx-closing-bracket-location": [ "error", "after-props" ],
			"react/jsx-boolean-value": [ "error", "never" ],
			"react/hook-use-state": [
				"error",
				{
					allowDestructuredState: true
				}
			],
			"react/iframe-missing-sandbox": [ "error" ],
			"@typescript-eslint/no-misused-promises": "off"
		},
	}
];
