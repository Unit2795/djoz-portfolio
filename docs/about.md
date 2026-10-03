# About

- [About](#about)
  - [Links](#links)
  - [Overview](#overview)
  - [Good To Know](#good-to-know)
    - [Key Files \& Directories](#key-files--directories)
    - [Astro Site](#astro-site)
    - [Terraform](#terraform)
    - [Contact Form](#contact-form)
    - [Lambda Functions](#lambda-functions)
      - [Analytics Ingest \& Processor](#analytics-ingest--processor)
  - [FAQs](#faqs)
    - [How Much Does This Cost To Host?](#how-much-does-this-cost-to-host)
    - [What Cost Saving Measures Are Implemented?](#what-cost-saving-measures-are-implemented)
    - [How Secure Is The Site?](#how-secure-is-the-site)
    - [How Do you Prevent Abuse of the Contact Form?](#how-do-you-prevent-abuse-of-the-contact-form)
    - [What If I Have Issues With Spam?](#what-if-i-have-issues-with-spam)
    - [Will You Be Adding More Features?](#will-you-be-adding-more-features)
    - [Can You Help Me Customize/Deploy This Portfolio?](#can-you-help-me-customizedeploy-this-portfolio)
    - [Why No UI Libraries/Frameworks?](#why-no-ui-librariesframeworks)
    - [Why Astro?](#why-astro)
    - [Why Terraform?](#why-terraform)
    - [Why Static Content?](#why-static-content)
    - [I Have A Question Not Answered Here](#i-have-a-question-not-answered-here)

## Links

[Return to main README.md](../README.md) | [Setup Guide](./setup.md) | [Live Demo](https://acedev.us/) | [Use This Template](https://github.com/Unit2795/djoz-portfolio/generate)

## Overview

This document provides additional context about the architecture, implementation, and infrastructure choices behind this portfolio project.

## Good To Know

### Key Files & Directories

- `analytics/` - Contains the Next.js code for the local analytics dashboard.
- `client/` - Contains the front-end code for the portfolio site.
- `dev-api/` - Contains a mock API server for local development and testing of the contact form and analytics features.
- `lambda/` - Contains the AWS Lambda function code for the analytics API. The contact form backend is [contact-api](https://github.com/Unit2795/contact-api), a separate repo.
- `shared/` - Contains shared TypeScript types and utilities used by the front-end, Lambda functions, and analytics dashboard.
- `terraform/` - Contains the Terraform configuration files for deploying the infrastructure to AWS.
- `.github/workflows/` - Contains the GitHub Actions workflows for CI/CD and Terraform automation.
-

### Astro Site

1. The site's editable copy (content and text) is located in [content/index.ts](../client/src/content/index.ts). Some content can be disabled entirely. Learn more about this approach in [Why Static Content?](#why-static-content).
2. Any human-readable text; including SEO metadata, alt text, and ARIA attributes, can be modified in [content/index.ts](../client/src/content/index.ts). While you might not need to change most of it, this design allows for full site translation if desired.
3. The [content/index.ts](../client/src/content/index.ts) does more than store text, it defines configuration options for enabling/disabling features such as entire sections, particle effects, navbar animations, analytics, the contact form, and more.
4. The most complex part of the Astro code is the [SnowParticles](../client/src/components/SnowParticles) component, which sets up the snowfall particle effect. A close second is the [Navbar](../client/src/components/Navbar), which uses a scroll listener to highlight the current section in the navbar, among other features.
5. The site functions without JavaScript; when JS is enabled, it enhances UX with animations, navbar highlights, and inline form submissions (progressive enhancement).
6. `robots.txt`, `sitemap.xml` and `site.webmanifest` are generated at build time by small endpoints in [pages/](../client/src/pages/), from `site` in [astro.config.mjs](../client/astro.config.mjs) and the content in [content/index.ts](../client/src/content/index.ts). `site` also sets the canonical and Open Graph URLs, so set it to your domain.
7. A post-build script bundles all JS files and inlines them into index.html to reduce network requests. You can find it at: [postbuild.js](../client/scripts/postbuild.js).
8. If analytics are enabled; page views, interactions, and scroll depth will be tracked. You can selectively enable or disable analytics for some elements.
9. A [web component creation helper function](../client/src/utils/customEl/client.ts) simplifies creating JS-augmented components that use imports and receive data from Astro frontmatter. [More info about this pattern in Astro docs](https://docs.astro.build/en/guides/client-side-scripts/#pass-frontmatter-variables-to-scripts)
10. The colors for project cards and tech pills are generated deterministically based on their text content using a hash function. This ensures consistent colors across builds and avoids unnecessary cache-busting. An example of this can be seen in the [Pills](../client/src/components/Pills/Pills.astro) component.
11. If a visitor has JavaScript disabled, the contact form redirects to a generic success or error page after submission. With JS enabled, it either redirects to a success page or shows inline errors without reloading.
12. With JS enabled, the contact form activates the submit button only when all fields are valid. It disables the button during submission to prevent duplicates and uses a short delay to reduce spam attempts.
13. The home page requests `/api/stamp.gif` (unless the contact section is disabled), which sets a signed cookie. contact-api rejects a submission without this cookie, or one sent too soon after the cookie was set. This helps prevent spam submissions even when JS is disabled.
14. The contact form utilizes honeypot fields to help prevent spam submissions. These fields are hidden from human users but visible to bots. If one is filled out, contact-api returns a normal success but sends no email.
15. In development, the `pnpm dev` command will also start a mock REST API for testing the contact form and analytics features. This can be found here: [dev-api/index.js](../dev-api/index.js). To start Astro without the mock API, use `pnpm dev:client` instead.

### Terraform

1. User-provided variables are stored in [terraform.tfvars](../terraform/terraform.tfvars) and [state.config](../terraform/state.config).
2. The `/bootstrap` directory contains the CloudFormation code and shell scripts that create the remote Terraform state backend in S3, which stores both the state and its lock file. This is run automatically by the `terraform-apply` GitHub Action if the backend is not already set up. You can use this remote state setup in your own projects by visiting the [terraform-s3-bootstrap](https://github.com/Unit2795/terraform-s3-bootstrap) repository.
3. Route53 DNS records for both the `root` and `www.` subdomains are created automatically. A CloudFront function redirects `www.` requests to the root domain, best practice for SEO and UX.
4. The contact form backend, contact-api, must be deployed before this Terraform config, in the same AWS account and region. Otherwise `terraform plan` fails because it can't read contact-api's SSM parameters. To skip the contact form, set `disable_contactform = true`. See [Contact Form](#contact-form).
5. If you create multiple instances of this portfolio, you will need to update the variable files to ensure the important variables are unique for your AWS account. This includes the bucket name in the [terraform.tfvars](../terraform/terraform.tfvars) file, and the bucket name in the [state.config](../terraform/state.config) file. You may also wish to change the `domain_name` variable if you are using Route53.
6. The `terraform-destroy` workflow can be run manually in the GitHub Actions tab and will remove all the AWS resources that were created by Terraform.
7. The `terraform-apply` workflow in the GitHub Actions tab will create AWS resources, build the site, upload it, and invalidate the CloudFront cache (if the client or AWS resources have changed). This workflow is automatically triggered on pushes to the `main` branch.

### Contact Form

1. Submissions are handled by [contact-api](https://github.com/Unit2795/contact-api), a self-hosted contact form backend (AWS Lambda, DynamoDB and SES) deployed separately from your own config repo (created from [contact-api-template](https://github.com/Unit2795/contact-api-template)). This repo holds only the form and the CloudFront routing.
2. [client.tf](../terraform/client.tf) adds a `contact-api` origin to CloudFront and two behaviors that forward `/api/contact/*` and `/api/stamp.gif` to it. They sit above the `api/*` behavior, because CloudFront uses the first path pattern that matches.
3. CloudFront reads contact-api's origin domain and this site's key from the SSM parameters `/contact-api/origin-domain` and `/contact-api/sites/<contact_api_site_id>/origin-key`, which the contact-api deploy writes. `contact_api_site_id` defaults to `portfolio`; set it in [terraform.tfvars](../terraform/terraform.tfvars) if your contact-api site id differs.
4. The form posts to `/api/contact/<formId>`, where `formId` is the form's id in contact-api's `forms.json`. Set `contactForm.formId` in [content/index.ts](../client/src/content/index.ts) (default `portfolio-contact`).
5. With JS enabled, the form sends `Accept: application/json` and shows a message for each contact-api error reason from `contactForm.reasonMessages` in [content/index.ts](../client/src/content/index.ts). Without JS, contact-api redirects to the success or error page.
6. The recipient email, SES sender, message length, rate limits, honeypot field names and success/error pages are set in contact-api's `forms.json`, not in this repo. contact-api's defaults are messages of 12 to 2000 characters, 3 submissions per day per visitor IP and 50 per month. Keep `contactForm.message.minLength`/`maxLength` and the message hint in [content/index.ts](../client/src/content/index.ts) in sync with `forms.json`.
7. To run without a contact form (and without contact-api), set `disable_contactform = true` in [terraform.tfvars](../terraform/terraform.tfvars) and `sections.CONTACT.disabled = true` in [content/index.ts](../client/src/content/index.ts). Terraform then skips the contact-api origin, its behaviors and the SSM reads.
8. See contact-api's [Connect a site](https://github.com/Unit2795/contact-api/blob/main/docs/connect.md) and [Config reference](https://github.com/Unit2795/contact-api/blob/main/docs/config.md) guides for setup and every option.

### Lambda Functions

#### Analytics Ingest & Processor

1. The [analytics-ingest.js](../lambda/functions/analytics-ingest/src/index.ts) function is responsible for receiving analytics events from the website, applying some basic validation, and storing them in an SQS queue for later processing.
2. The [analytics-processor.js](../lambda/functions/analytics-processor/src/index.ts) function is responsible for processing analytics events from the SQS queue and storing them as NDJSON files in an S3 bucket for later analysis.
3. This setup of using SQS as a buffer between the ingest and processor allows us to efficiently aggregate events while also being able to handle bursts of traffic.
4. The analytics system is designed to be cost-effective and scalable. SQS and S3 storage is very cheap, and the ingest/processor functions can write large numbers of events.

## FAQs

### How Much Does This Cost To Host?

**Under $2 per month**; including domain, CloudFront static hosting, APIs, emails, and everything else. The exact cost will depend on your traffic, email volume, and domain registrar.

### What Cost Saving Measures Are Implemented?

1. The site is fully static, no servers are required to render HTML.
2. Serverless architecture ensures no costs when the site or APIs aren’t in use.
3. contact-api rate-limits the contact form per visitor per day and caps outgoing emails per month.
4. CloudFront runs in a lower-cost region class with aggressive caching, reducing S3 origin requests while also only deploying to the regions you are more likely to see traffic from.
5. Lambda functions use minimal memory, short timeouts, and Graviton2 processors for performance and savings.
6. Using AWS S3 for remote Terraform state storage is a very cost-effective solution and can be a lot cheaper than using a paid service like Terraform Cloud.
7. The analytics system is designed to be cost-effective by using S3 for storage and SQS as a buffer to handle bursts of events.
8. By using a self-hosted contact backend ([contact-api](https://github.com/Unit2795/contact-api), AWS Lambda + SES) instead of SaaS tools (Formspree, Web3Forms, Typeform, etc.), the project avoids subscription fees and maintains full control over data.
9. Terraform + AWS allow for granular cost optimization without vendor lock-in.

### How Secure Is The Site?

1. All communication uses ACM SSL certificates for full HTTPS encryption.
2. No sensitive data is stored. Contact form submissions are emailed directly to the admin and never saved on the server.

### How Do you Prevent Abuse of the Contact Form?

contact-api handles this. It checks a site key that CloudFront adds to each request, honeypot fields, a signed cookie that rejects too-fast submissions, and daily per-visitor and monthly per-form limits stored in DynamoDB. See the [contact-api README](https://github.com/Unit2795/contact-api#how-it-works).

### What If I Have Issues With Spam?

If you find that you are still having issues with bots, you can raise `stamp.minDwellSec` or lower the form's limits in contact-api's `forms.json` (see its [Config reference](https://github.com/Unit2795/contact-api/blob/main/docs/config.md)), or attach AWS WAF to your CloudFront distribution for more advanced filtering and rate limiting.

### Will You Be Adding More Features?

**Yes**, ongoing improvements and new features are planned, but there’s no fixed roadmap.

### Can You Help Me Customize/Deploy This Portfolio?

For simple questions, **open a GitHub issue**.

For in-depth help, such as customization or deployment assistance, please reach out. I am available for consulting and freelance work. Please reach out via the contact form on my [personal website](https://acedev.us/), email me at [d@djoz.us](mailto:d@djoz.us), or create a GitHub issue.

### Why No UI Libraries/Frameworks?

Unless you count Astro or Tailwind, I aimed to ship very little JavaScript and use few third-party dependencies. It was a nice challenge to write more by hand and this project is intended to be a learning experience.

### Why Astro?

Astro comes up a lot in the static content website world, especially with respect to vanilla HTML, JS, and CSS. It is a modern static site generator that allows you to build fast, optimized websites with great developer experience. Astro added modern developer experience, like componentization and bundling to my workflow. Which was a lot better than building one giant HTML file. If you find you need it later, you can also mix in frameworks like React, Svelte, or Vue. But I wanted to keep this site as lightweight as possible, so I stuck with vanilla JS so I didn't have to ship any runtimes. Astro also has great support for TypeScript. Astro struck a great balance between modern developer experience and performance.

### Why Terraform?

Sure, it probably would have been easier to use a BaaS like AWS Amplify or Vercel. It probably wouldn’t have even been very costly and taken less time. But I wanted the challenge, flexibility, and learning experience of standing up my own infrastructure from scratch with Terraform and AWS. I enjoyed having freedom from BaaS and vendor lock-in. The option to change cloud providers on the fly is pretty nice, thanks Terraform! Fitting together the most appropriate AWS services and having all the dials at my disposal meant I could really optimize and gain a deep understanding of AWS services.

### Why Static Content?

This portfolio uses static site generation at build time for optimal performance. While this setup forces content updates to require a rebuild, it eliminates the overhead of a fully-fledged CMS. For a simple portfolio like this one, this tradeoff improves load times and reduces hosting costs. If you need dynamic content, you can modify [`content/index.ts`](../client/src/content/index.ts) to fetch data from a CMS, this code is evaluated at build time. You may also choose to host Astro on a server and switch to using server rendering or incremental static regeneration (ISR).

### I Have A Question Not Answered Here

Please create a GitHub issue or reach out via the contact form on my [personal website](https://acedev.us/), or email me at [d@djoz.us](mailto:d@djoz.us).
