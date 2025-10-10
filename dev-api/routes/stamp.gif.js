export const get = async (_, res) => {
	console.log("Stamp request received");

	return res.status(200).header("Content-Type", "image/gif").send("R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==");
};
