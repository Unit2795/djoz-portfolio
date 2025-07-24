import js from "@eslint/js";
import astro from "eslint-plugin-astro";
import noRelativeImport from "eslint-plugin-no-relative-import-paths";
import prettierConfig from "eslint-plugin-prettier/recommended";
import globals from "globals";
import ts from "typescript-eslint";

export default ts.config([
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
	},
	js.configs.recommended,
	ts.configs.recommended,
	prettierConfig,
	astro.configs.recommended,
	astro.configs["jsx-a11y-recommended"],
	{
		ignores: [".astro/", "dist/"],
	},
	{
		plugins: {
			"no-relative-import-paths": noRelativeImport,
		},
		rules: {
			"no-relative-import-paths/no-relative-import-paths": [
				"error",
				{
					allowSameFolder: false,
					prefix: "@",
					rootDir: "./src",
				},
			],
		},
	},
]);
