import {
	defineConfig
} from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import {
	description,
	keywords,
	name
} from "./src/content.ts";

// https://vite.dev/config/
export default defineConfig( {
	plugins: [
		react()
	],
	define: {
		"import.meta.env.NAME": JSON.stringify( name ),
		"import.meta.env.DESCRIPTION": JSON.stringify( description ),
		"import.meta.env.KEYWORDS": JSON.stringify( keywords ),
	},
	resolve: {
		alias: {
			"@": path.resolve(
				__dirname,
				"./src"
			),
		}
	},
} );
