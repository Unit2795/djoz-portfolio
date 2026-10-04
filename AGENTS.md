# Portfolio Template

## What this is

Static rendered portfolio site template. Published site is one self-contained `index.html` (all CSS/JS inlined).

## Layout (pnpm workspaces)

- client/
  - The portfolio site. Astro + vanilla TS + Tailwind v4. Most work happens here. Site content lives in `src/content/`, not in markup. `robots.txt`, `sitemap.xml` and `site.webmanifest` are generated from `site` in `astro.config.mjs` and the content.
  - Interactive components are custom elements. To pass frontmatter values to a component's `<script>`, export an `ElementProps` type from its frontmatter, spread `elementProps<ElementProps>({ ... })` onto the element and extend `PropsElement<ElementProps>` in the script. Never import `@/content` in a `<script>`; it bundles site text into the page's JavaScript.
  - `pnpm build` runs `astro check` first, so type errors fail the build and CI.
- shared/
  - `@djoz-portfolio/shared` - analytics types/constants. Source of truth for client, Lambdas, dashboard.
- lambda/
  - AWS Lambda functions (`functions/*`), each bundled by its own esbuild `build` script. Terraform zips the output. `function-boilerplate/` is a template for new ones.
- dev-api/
  - Local Express server (port 3001) mocking the analytics ingest Lambda and contact-api for dev.
- analytics/
  - Local-only Next.js dashboard. Reads analytics from S3 into DuckDB. Not deployed.
- terraform/
  - All AWS infra as code

## Contact form

- The backend is not in this repo. It's [contact-api](https://github.com/Unit2795/contact-api), deployed separately from a config repo created from [contact-api-template](https://github.com/Unit2795/contact-api-template).
- Optional: without contact-api, set `disable_contactform = true` in `terraform/terraform.tfvars` and `sections.CONTACT.disabled = true` in `client/src/content/index.ts`.

## Tech

- Astro
- TypeScript
- Tailwind V4
- AWS (S3/CloudFront/Lambda/SQS/API Gateway)
- Terraform
- pnpm
- Next.js
- DuckDB

