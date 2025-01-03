import {
	defineConfig
} from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import {
	name
} from "./src/content.ts";

// https://vite.dev/config/
export default defineConfig( {
	plugins: [
		react(),
		{
			name: "html-transform",
			transformIndexHtml( html ) {
				return html.replace(
					/<title>(.*?)<\/title>/,
					`<title>${ name }</title>`
				);
			}
		}
	],
	resolve: {
		alias: {
			"@": path.resolve(
				__dirname,
				"./src"
			),
		}
	},
} );
