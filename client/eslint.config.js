import globals from "globals";
import tseslint from "typescript-eslint";
import eslintConfigSpacey from "./eslint-config-spacey.js";

export default tseslint.config(
	// Use the Spacey style guide for TypeScript/JS/JSX files https://github.com/Unit2795/spacey
	{
		extends: [ ...eslintConfigSpacey ],
		files: [ "**/*.{js,jsx,mjs,cjs,ts,tsx}" ],
		languageOptions: {
			ecmaVersion: 2020,
			globals: globals.browser,
			parserOptions: {
				// Configure the TypeScript parser to enable usage of type aware lint rules from Spacey
				project: [ "./tsconfig.node.json", "./tsconfig.app.json", "./tsconfig.json" ],
				tsconfigRootDir: import.meta.dirname,
			}
		}
	},
);
