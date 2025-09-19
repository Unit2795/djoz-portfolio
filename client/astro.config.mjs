// @ts-check
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
	output: "static",
	compressHTML: true,
	vite: {
		plugins: [tailwindcss()],
	},
	build: {
		inlineStylesheets: "always",
		format: "preserve",
	},
});
