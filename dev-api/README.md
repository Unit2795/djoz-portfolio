A simple mock API server for local development purposes. Astro's dev server forwards `/api` requests to it on port 3001.

- `routes/ingest.js` approximates the analytics ingest Lambda in the `/lambda` folder.
- `routes/contact/[formId].js` is a small stand-in for [contact-api](https://github.com/Unit2795/contact-api), which handles the contact form in production. It returns JSON `{ ok, reason }` when the request sends `Accept: application/json`, otherwise a 303 redirect to the success or error page. Its checks are rough; the real ones are in contact-api.
- `routes/stamp.gif.js` returns a 1x1 GIF and sets no cookie.
