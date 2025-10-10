// @ts-check
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
	compressHTML: true,
	vite: {
		plugins: [tailwindcss()],
		build: {
			assetsInlineLimit: 100000,
			rollupOptions: {
				output: {
					compact: true,
				},
				treeshake: {
					preset: "smallest",
					moduleSideEffects: false,
					propertyReadSideEffects: false,
					tryCatchDeoptimization: false,
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
