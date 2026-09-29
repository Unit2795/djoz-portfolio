import { name, webManifest } from "@/content";
import type { APIRoute } from "astro";

export const GET: APIRoute = () =>
	new Response(
		JSON.stringify(
			{
				name,
				short_name: webManifest.shortName,
				icons: [
					{ src: "/favicon/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
					{ src: "/favicon/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
				],
				theme_color: webManifest.themeColor,
				background_color: webManifest.backgroundColor,
				display: "standalone",
			},
			null,
			2,
		),
	);
