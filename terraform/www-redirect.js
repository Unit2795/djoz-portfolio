// CloudFront Function (cloudfront-js-2.0, deployed by client.tf) that redirects www to the bare domain

// Rebuild the query string from CloudFront's { key: { value, multiValue? } } object so it survives the redirect
function stringifyQuerystring(querystring) {
	const parts = [];
	for (const key in querystring) {
		const param = querystring[key];
		const values = param.multiValue || [param];
		values.forEach((item) => parts.push(`${key}=${item.value}`));
	}
	return parts.join("&");
}

function handler(event) {
	const request = event.request;
	const host = request.headers.host.value;
	if (host && host.startsWith("www.")) {
		const newHost = host.slice(4);
		const query = stringifyQuerystring(request.querystring);
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
