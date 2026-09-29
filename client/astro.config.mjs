// @ts-check
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
	// Production URL, used for canonical/Open Graph URLs (`Astro.site`)
	site: "https://example.com",
	compressHTML: true,
	vite: {
		plugins: [tailwindcss()],
		build: {
			assetsInlineLimit: 100000,
			rolldownOptions: {
				treeshake: {
					moduleSideEffects: false,
					propertyReadSideEffects: false,
				},
			},
			reportCompressedSize: false,
		},
		server: {
			proxy: {
				"/api": {
					target: "http://localhost:3001",
					changeOrigin: true,
				},
			},
		},
	},
	build: {
		inlineStylesheets: "always",
		format: "preserve",
	},
});
