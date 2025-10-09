import { buildSync } from "esbuild";
import { createWriteStream, existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "path";
import archiver from "archiver";

const FUNCTIONS_DIR = join(process.cwd(), "../functions");
const CONFIG_FILE = "build.config.json";
const TFVARS_FILE = join(process.cwd(), "../../terraform/terraform.tfvars");

const tfvars = parseTfvars();
const allFunctions = readdirSync(FUNCTIONS_DIR);

console.log(`Found ${allFunctions.length} functions in ${FUNCTIONS_DIR}`);
console.log(allFunctions);

for (const func of allFunctions) {
	const fnPath = join(FUNCTIONS_DIR, func);
	const configPath = join(fnPath, CONFIG_FILE);
	const hasConfig = existsSync(configPath);
	if (!hasConfig) {
		throw new Error(`No ${CONFIG_FILE} found for ${func}`);
	}
	const config = JSON.parse(readFileSync(configPath, "utf8"));
	if (config.disable) {
		console.log(`Skipping ${func} because disable is set to true in ${CONFIG_FILE}`);
		continue;
	}

	if (config.disableFlag && tfvars[config.disableFlag] === "true") {
		console.log(`Skipping ${func} because ${config.disableFlag} is set to true in terraform.tfvars`);
		continue;
	}

	const shouldSkip = !!config.skipBuild;

	const outdir = join(fnPath, "dist");

	if (!shouldSkip) {
		const entry = join(fnPath, "src/index.ts");

		buildSync({
			entryPoints: [entry],
			bundle: true,
			outdir,
			platform: "node",
			target: [config.target || "node22"],
			sourcemap: config.sourcemap || false,
			minify: true,
			sourcesContent: false, // You wont see inline code preview in CloudWatch stack traces with this disabled, but you'll still see correct line numbers if sourcemaps are enabled
			treeShaking: true,
			define: { "process.env.NODE_ENV": '"production"' },
			legalComments: "none",
			// Specify external dependencies that should not be bundled
			external: config.external || [],
		});

		console.log(`Built ${func} to ${outdir}`);
	} else {
		console.log(`Skipping build for ${func} because skipBuild is set to true in ${CONFIG_FILE}`);
	}

	const skipZip = !!config.skipZip;
	if (!skipZip) {
		const zipPath = join(fnPath, `index.zip`);
		// If skipBuild.json exists, zip the src directory instead of dist
		const srcdir = join(fnPath, "src");
		const zipDir = shouldSkip ? srcdir : outdir;
		console.log(`Zipping ${zipDir} to ${zipPath}`);
		await zipDirectory(zipDir, zipPath);
	} else {
		console.log(`Skipping zip for ${func} because skipZip is set to true in ${CONFIG_FILE}`);
	}
}

console.log("Build complete!");

function zipDirectory(srcDir, outPath) {
	return new Promise((resolve, reject) => {
		const output = createWriteStream(outPath);
		const archive = archiver("zip", { zlib: { level: 9 } });

		output.on("close", () => resolve());
		output.on("error", (err) => reject(err));
		archive.on("error", (err) => reject(err));

		archive.pipe(output);
		archive.directory(srcDir, false, {
			date: new Date("2000-01-01T00:00:00Z"), // set all file dates to epoch for deterministic zip
		});

		archive.finalize().catch((err) => {
			// in case finalize promise rejects
			reject(err);
		});
	});
}

function parseTfvars() {
	if (!existsSync(TFVARS_FILE)) {
		throw new Error(`No terraform.tfvars file found at ${TFVARS_FILE}`);
	}
	const content = readFileSync(TFVARS_FILE, "utf8");
	const lines = content.split("\n");
	const vars = {};
	for (const line of lines) {
		const match = line.match(/(disable_\w+)\s*=\s*(true|false)/);
		if (match) {
			vars[match[1]] = match[2];
		}
	}
	return vars;
}
