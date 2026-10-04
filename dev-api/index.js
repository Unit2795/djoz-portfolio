import express from "express";
import * as contact from "./routes/contact.js";
import * as ingest from "./routes/ingest.js";
import * as stamp from "./routes/stamp.gif.js";

const port = 3001;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/api/contact/:formId", contact.post);
app.post("/api/ingest", ingest.post);
app.get("/api/stamp.gif", stamp.get);

app.listen(port, () => {
	console.log(`Dev API listening on port ${port}`);
});
