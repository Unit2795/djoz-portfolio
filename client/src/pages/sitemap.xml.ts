import type { APIRoute } from "astro";

// The site is a single page, so the sitemap only lists the home page
export const GET: APIRoute = ({ site }) =>
	new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
	<url>
		<loc>${new URL("/", site).href}</loc>
	</url>
</urlset>
`);
