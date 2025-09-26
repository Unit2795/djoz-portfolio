import express from "express";
import { router } from "express-file-routing";

const port = 3001;
const app = express();

(async () => {
	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));

	app.use("/api", await router());

	app.listen(port, () => {
		console.log(`Dev API listening on port ${port}`);
	});
})();
