# Version 3 Migration Guide

## Links

[Return to main README.md](../README.md) | [Setup Guide](./setup.md) | [Deployment Guide](./deployment.md) | [Live Demo](https://acedev.us/) | [Use This Template](https://github.com/Unit2795/djoz-portfolio/generate)

## Overview

This guide walks you through upgrading from Version 2 (V2) to Version 3 (V3) of the portfolio.

Unlike V2, this is an in-place upgrade: merge the template, update a few files, and deploy. There's no need to destroy your infrastructure.

The breaking change is the contact form. V3 removes its built-in backend (the `contactme` and `stamp` Lambdas, their API Gateway routes and the quota table). The form is now sent through [contact-api](https://github.com/Unit2795/contact-api), a separate contact form backend you deploy once per AWS account. You can also turn the contact form off instead.

## Before You Start

### Toolchain

- [pnpm](https://pnpm.io/installation) >= v12 (V2 pinned pnpm 10)
- [Node.js](https://nodejs.org/en/) >= v22.13
- [Terraform CLI](https://developer.hashicorp.com/terraform/install) 1.16 or later 1.x, only if you run Terraform locally. The GitHub Action installs it for you.
- The Lambdas now run on Node.js 24 in AWS; there's nothing to install for that.

### Choose How to Handle the Contact Form

1. **Use contact-api:** keeps the contact form. contact-api must be deployed **before** your first V3 deploy, or `terraform plan` fails because it can't read contact-api's SSM parameters.
2. **Disable the contact form:** the simplest path if you don't need it.

## Step 1: Merge the Template

1. Create a new branch, then merge the template (see [Maintenance](./setup.md#maintenance) for the commands).
2. Unless you customized them, take the template's version of these files when resolving conflicts:
   - `.github/workflows/*`. The V2 deploy workflow reads the removed `api_endpoint` output and fails on V3. If you keep your own, remove the `API_GATEWAY_ENDPOINT` and `VITE_API_GATEWAY_ENDPOINT` lines.
   - `terraform/*.tf` and `terraform/.terraform.lock.hcl`. The lock file pins the new AWS provider (`~> 6.66`); an old one makes `terraform init` fail.
   - `package.json` and `pnpm-lock.yaml`
3. Delete `client/public/robots.txt`, `client/public/site.webmanifest` and `client/public/sitemap.xml` if they exist. V3 generates them.
4. Run `pnpm install` from the repo root.
5. If you restricted your deploy role's permissions (see [GitHub Actions Setup](./deployment.md#3-github-actions-setup)), it now also needs to read the `/contact-api/*` SSM parameters, unless the contact form is disabled.

## Step 2: Set Up the Contact Form Backend

### Option A: Deploy contact-api

1. Follow contact-api's [Deploy guide](https://github.com/Unit2795/contact-api/blob/main/docs/deploy.md): create a private config repo from [contact-api-template](https://github.com/Unit2795/contact-api-template), run the one-time bootstrap, and deploy.
   - Deploy it in the **same AWS account and region** as your portfolio (`aws_region` in `terraform.tfvars`). contact-api deploys to `us-east-1` unless you set its `aws-region` input.
2. **SES:** contact-api sends from a verified SES **domain** identity in its region, and your account needs SES production access.
   - If V2 created a domain identity (`ses_identity_type = "domain"`), contact-api can send from it.
   - If V2 used an email identity (the default), create and verify a domain identity for your sender address. See the [SES Identity](#ses-identity) section for the old one.
3. Move your V2 settings into contact-api's `forms.json` ([Config reference](https://github.com/Unit2795/contact-api/blob/main/docs/config.md)) or your content:

   | V2 variable | V3 equivalent |
   | --- | --- |
   | `admin_email` | The form's `to` in `forms.json`. V2 also sent from this address; the form's `from` must be an address at a verified SES domain. |
   | `contact_max` | `monthlyCap` in `forms.json` (defaults to 50, V2 defaulted to 10). There's also a new per-IP daily limit, `ipDailyCap`. |
   | `min_dwell_seconds` / `max_dwell_seconds` | `stamp.minDwellSec` / `stamp.maxDwellSec` in `forms.json` |
   | `hmac_secret` | None, contact-api generates its own secrets |
   | `ses_identity_type` | None, contact-api always sends from a domain identity |
   | `cookie_general_error`, `cookie_too_soon_error`, `cookie_too_old_error`, `email_invalid_error`, `message_invalid_error` | `contactForm.reasonMessages` in `client/src/content/index.ts` |
   | `disable_honeypot` | `disableHoneypot` in `client/src/content/index.ts`. `forms.json` still lists the honeypot field names. |
   | `disable_dwelltime`, `dwell_cookie_name`, `cookie_domain` | None, contact-api always requires its stamp cookie. Keep `disableDwellCookie = false` in your content, or every submission is rejected. |

4. This repo expects a contact-api site named `portfolio` and a form named `portfolio-contact`, which match contact-api-template's example `forms.json`. If yours differ, set `contact_api_site_id` in `terraform/terraform.tfvars` and `contactForm.formId` in `client/src/content/index.ts`.

### Option B: Disable the Contact Form

Set both of these:

- `disable_contactform = true` in `terraform/terraform.tfvars`
- `sections.CONTACT.disabled = true` in `client/src/content/index.ts`

## Step 3: Update Your Content

1. Set `site` in `client/astro.config.mjs` to your production URL. The build fails without it, since it's used for the canonical and Open Graph URLs, `robots.txt` and `sitemap.xml`.

   ```js
   export default defineConfig({
   	site: "https://example.com",
   	// ...
   });
   ```

2. Add the new exports and fields to `client/src/content/index.ts`. Compare with the template's copy of this file for the full comments and example values.

   ```ts
   import type { FormStatePage, ShareImage, WebManifestContent /* , ...your existing imports */ } from "@/content/types";

   // Also used as the job title in the Person structured data (JSON-LD)
   export const jobTitle = "Your Profession";

   // Social share preview image in `public/`. Set to undefined to leave the image tags out.
   export const shareImage: ShareImage | undefined = {
   	path: "/og-image.png",
   	alt: `Preview of ${name}'s portfolio`,
   	width: 1200,
   	height: 630,
   };

   // Generates site.webmanifest, which uses `name` as its name
   export const webManifest: WebManifestContent = {
   	shortName: "Portfolio",
   	themeColor: "#1f2937",
   	backgroundColor: "#1f2937",
   };

   export const contactForm: ContactFormContent = {
   	// The form's id in your contact-api forms.json
   	formId: "portfolio-contact",
   	// ...
   	message: {
   		label: "Message",
   		placeholder: "Your message here...",
   		hint: "12–2000 characters",
   		// Keep in sync with the form's messageMin/messageMax in forms.json
   		minLength: 12,
   		maxLength: 2000,
   	},
   	// Optional: messages for contact-api's error reasons, other reasons show errorMessage
   	reasonMessages: {
   		too_soon:
   			"For security reasons, your submission was too fast to process. Please wait a few seconds and try again.",
   		// ...
   	},
   	// ...
   };

   // Content of the 404 page
   export const notFoundPage: FormStatePage = {
   	icon: { lucide: "Compass" },
   	browserTitle: "Page Not Found",
   	browserDescription: "The requested page could not be found.",
   	title: "404",
   	message: "The page you're looking for doesn't exist or may have moved.",
   	redirectText: "Return to Home",
   	redirectHref: "/",
   	disableAutoRedirect: true,
   };
   ```

   - The full list of reasons is in contact-api's [Responses](https://github.com/Unit2795/contact-api/blob/main/docs/connect.md#responses) docs.
   - V2 capped messages at 1000 characters; contact-api defaults to 12 to 2000. To keep a different limit, set `messageMin`/`messageMax` in `forms.json` and match `minLength`/`maxLength` and `hint`.

3. Add a 1200x630 share image at `client/public/og-image.png`, or set `shareImage` to `undefined`.

## Step 4: Clean Up terraform.tfvars

Remove these variables from `terraform/terraform.tfvars`. Terraform only warns about undeclared variables, but they have no effect:

`admin_email`, `ses_identity_type`, `hmac_secret`, `disable_dwelltime`, `disable_honeypot`, `dwell_cookie_name`, `cookie_domain`, `min_dwell_seconds`, `max_dwell_seconds`, `contact_max`, `cookie_general_error`, `cookie_too_soon_error`, `cookie_too_old_error`, `email_invalid_error`, `message_invalid_error`

New variables, both optional: `contact_api_site_id` (defaults to `portfolio`) and `disable_contactform` (see [Step 2](#step-2-set-up-the-contact-form-backend)). See [variables.tf](../terraform/variables.tf) for the full list.

## Step 5: Deploy

1. Make sure contact-api is deployed, or the contact form is disabled.
2. Optional: preview the changes before merging, with AWS credentials for your account:

   ```bash
   pnpm ci:install && pnpm lambda:build
   cd terraform
   terraform init -backend-config=state.config
   terraform plan
   ```

3. Merge your branch into `main`. The "Build and Deploy" workflow applies Terraform and redeploys the client.

### What the First Apply Changes

- **Destroyed:** the V2 contact form backend
  - The `contactme` and `stamp` Lambda functions, with their IAM roles, policies and permissions
  - The `POST /api/contact` and `GET /api/stamp.gif` API Gateway routes and integrations
  - The `api-quota-<bucket_name>` DynamoDB table, which only held V2's monthly submission count
  - If `disable_analytics = true`: the API Gateway API and stage, and CloudFront's `api/*` route to them, since analytics is now their only user
- **Removed from Terraform state, kept in AWS:** the V2 SES identity. See [SES Identity](#ses-identity).
- **Updated in place:**
  - The CloudFront distribution: the contact-api origin with its `/api/contact/*` and `/api/stamp.gif` routes (unless disabled), and missing pages (S3's 403 or 404) now return `/404.html` with a 404 status
  - The analytics Lambdas: runtime `nodejs22.x` to `nodejs24.x`
  - The analytics S3 bucket: `force_destroy` is now on, so a destroy deletes collected analytics with it
  - The site bucket policy may also show as updated because it's re-read after the CloudFront update. Its content doesn't change.
- **No change:** the ACM certificate and its validation. They moved from the `aws.us-east-1` provider alias to the resource `region` argument. If a plan shows the certificate being replaced, stop and check before applying.

### SES Identity

V2 created an SES identity for its contact form. The `removed` blocks in [api.tf](../terraform/api.tf) drop it from Terraform state without deleting it, and do nothing if it isn't in state.

- Keep those blocks until one V3 apply has run. Removing them before that destroys the identity.
- A V2 email identity isn't used by contact-api. Delete it in the SES console once nothing else uses it.

## Post-Upgrade Checks

1. Send a real message through the contact form and confirm it arrives. contact-api's deploy doesn't send a test email, so this is the only proof SES works. See [Verify through the site](https://github.com/Unit2795/contact-api/blob/main/docs/connect.md#verify-through-the-site).
   - If submitting shows the 404 page, contact-api rejected the site key or form id: CloudFront shows its 403 and 404 responses as the 404 page. Check `contact_api_site_id` and `contactForm.formId`.
2. Open a URL that doesn't exist on your domain. You should see the 404 page.
3. Open `/robots.txt`, `/sitemap.xml` and `/site.webmanifest`. They should use your domain and name.
4. If you use analytics, confirm new events still arrive in the dashboard.

Need help or have suggestions? Please open a GitHub issue on this repository.
