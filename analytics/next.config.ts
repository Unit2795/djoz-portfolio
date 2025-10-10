import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* 
		Required in order to prevent errors with the duckdb package
		Otherwise will throw a module not found error.
		IE: 
			Can't resolve '@duckdb/node-bindings-linux-x64/duckdb.node'
	*/
	serverExternalPackages: ["@duckdb/node-api"],
};

export default nextConfig;
