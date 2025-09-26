function handler(event) {
	const request = event.request;
	const host = request.headers.host.value;
	if (host && host.startsWith("www.")) {
		const newHost = host.slice(4);
		const redirectUrl = `https://${newHost}${request.uri}`;
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
