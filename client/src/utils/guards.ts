export const isServer = typeof window === "undefined" || import.meta.env.SSR;

const guard = (condition: boolean, message?: string, throwError: boolean = true): boolean => {
	if (condition) {
		if (throwError) {
			throw new Error(message);
		}
		return false;
	}
	return true;
};

const DEFAULT_CLIENT_ERROR = "This function can only be called on the client.";
const DEFAULT_SERVER_ERROR = "This function can only be called on the server.";

// Determines if code is running on the client, returns a boolean (true = client). May also optionally throw an error
export const clientGuard = (message?: string, throwError: boolean = true): boolean => {
	return guard(isServer, message || DEFAULT_CLIENT_ERROR, throwError);
};

// Determines if code is running on the server, returns a boolean (true = server). May also optionally throw an error
export const serverGuard = (message?: string, throwError: boolean = true): boolean => {
	return guard(!isServer, message || DEFAULT_SERVER_ERROR, throwError);
};
