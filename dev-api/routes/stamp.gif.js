// 1x1 GIF pixel
const gif = Buffer.from("R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==", "base64");

export const get = async (_, res) => {
	console.log("Stamp request received");

	return res.status(200).header("Content-Type", "image/gif").send(gif);
};
