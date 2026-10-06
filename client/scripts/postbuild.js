import * as cheerio from "cheerio";
import esbuild from "esbuild";
import { existsSync } from "node:fs";
import { readdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

/*
	Context: Astro only inlines scripts that have no imports; the rest are emitted as `<script type="module" src="/_astro/...">`
	tags plus shared chunks in `dist/_astro/`. We use this script to bundle+minify the scripts `dist/index.html` references
	into one inline module and delete the JS files from `dist/_astro/`. This results in a single HTML file with no external
	JS, ideal for static hosting and reducing network calls for JS files. Scripts Astro already inlined are re-minified
	so `console`/`debugger` statements are dropped from all shipped JS.

	It may be that as this projects evolves, we want to split out some JS into separate files again or this script interferes
	with functionality unexpectedly. Dynamic imports or library behavior may not work as intended after this transformation.
	When this day comes, we can remove this script and the `postbuild` step in package.json.
*/

const buildRoot = join(fileURLToPath(import.meta.url), "../../dist");
const paths = {
	html: join(buildRoot, "index.html"),
	js: join(buildRoot, "_astro"),
};
const astroScripts = 'script[type="module"][src^="/_astro/"]';
const astroJsRef = /\/_astro\/[^"'\s>]+\.js/;
const jsOptions = {
	minify: true,
	legalComments: "none",
	drop: ["console", "debugger"],
};

const logMessage = (message) => {
	console.log(`\x1b[34m[POSTBUILD]\x1b[0m ${message}`);
};

const $ = cheerio.load(await readFile(paths.html, "utf8"));

const inlineScripts = $('script[type="module"]:not([src])');
logMessage(`Minifying ${inlineScripts.length} inline scripts in ${paths.html} ...`);
for (const el of inlineScripts) {
	const { code } = await esbuild.transform($(el).text(), jsOptions);
	$(el).text(code.trim());
}

const srcs = $(astroScripts)
	.map((_, el) => $(el).attr("src"))
	.get();

if (srcs.length > 0) {
	logMessage(`Bundling ${srcs.length} scripts referenced by ${paths.html} ...`);

	const { outputFiles } = await esbuild.build({
		...jsOptions,
		// Import the entries in document order so they run in the same order as the original tags
		stdin: {
			contents: srcs.map((src) => `import ".${src}";`).join("\n"),
			resolveDir: buildRoot,
		},
		bundle: true,
		format: "esm",
		platform: "browser",
		write: false, // Return as string instead of writing to disk
	});

	$(astroScripts).remove();
	$("head").append(`<script type="module">${outputFiles[0].text.trim()}</script>`);
}

// Astro keeps HTML comments; they are dev notes, so don't ship them
$("*")
	.contents()
	.filter((_, node) => node.type === "comment")
	.remove();
await writeFile(paths.html, $.html());

// Fail the build rather than ship a page pointing at JS that is about to be deleted
const htmlFiles = (await readdir(buildRoot, { recursive: true })).filter((f) => f.endsWith(".html"));
for (const file of htmlFiles) {
	if (astroJsRef.test(await readFile(join(buildRoot, file), "utf8"))) {
		throw new Error(`${file} still references /_astro/ JS`);
	}
}

if (existsSync(paths.js)) {
	logMessage(`Deleting JS files from ${paths.js} ...`);

	const jsFiles = (await readdir(paths.js)).filter((f) => f.endsWith(".js"));
	await Promise.all(jsFiles.map((f) => rm(join(paths.js, f))));

	// Remove _astro directory if empty
	if ((await readdir(paths.js)).length === 0) {
		await rm(paths.js, { recursive: true });
	}
}

logMessage(`✓ Inlined ${srcs.length} bundled + ${inlineScripts.length} Astro-inlined scripts → index.html`);
