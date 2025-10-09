import { access } from "node:fs/promises";

export const fileExists = async (path: string) => {
	try {
		await access(path);
		return true;
	} catch {
		return false;
	}
};
