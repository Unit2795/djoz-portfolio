// CloudFront Function (cloudfront-js-2.0, deployed by client.tf) that redirects www to the bare domain

function handler(event) {
	const request = event.request;
	const host = request.headers.host.value;
	if (host && host.startsWith("www.")) {
		const newHost = host.slice(4);
		// The query string exactly as the visitor sent it, undefined or "" when there is none
		const query = request.rawQueryString();
		const redirectUrl = `https://${newHost}${request.uri}${query ? `?${query}` : ""}`;
		return {
			statusCode: 301,
			statusDescription: "Moved Permanently",
			headers: {
				location: { value: redirectUrl },
				"cache-control": { value: "public, max-age=86400, immutable" },
			},
		};
	}
	return request;
}
