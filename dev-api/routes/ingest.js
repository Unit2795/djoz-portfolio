export const post = async (req, res) => {
	console.log("Analytics data received:\n", req.body);

	return res.status(204).send();
};
