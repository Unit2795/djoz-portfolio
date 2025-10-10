# About

- [About](#about)
  - [Links](#links)
  - [Overview](#overview)
  - [Good To Know](#good-to-know)
    - [Key Files \& Directories](#key-files--directories)
    - [Astro Site](#astro-site)
    - [Terraform](#terraform)
    - [Lambda Functions](#lambda-functions)
      - [Contact Form Submission](#contact-form-submission)
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

[Return to main README.md](../README.md) | [Setup Guide](./setup.md) | [Live Demo](https://djoz.us/) | [Use This Template](https://github.com/Unit2795/djoz-portfolio/generate)

## Overview

This document provides additional context about the architecture, implementation, and infrastructure choices behind this portfolio project.

## Good To Know

### Key Files & Directories

- `analytics/` - Contains the Next.js code for the local analytics dashboard.
- `client/` - Contains the front-end code for the portfolio site.
- `dev-api/` - Contains a mock API server for local development and testing of the contact form and analytics features.
- `lambda/` - Contains the AWS Lambda function code for the contact form and analytics APIs
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
6. A post-build script bundles all JS files and inlines them into index.html to reduce network requests. You can find it at: [postbuild.js](../client/scripts/postbuild.js).
7. If analytics are enabled; page views, interactions, and scroll depth will be tracked. You can selectively enable or disable analytics for some elements.
8. A [web component creation helper function](../client/src/utils/customEl/client.ts) simplifies creating JS-augmented components that use imports and receive data from Astro frontmatter. [More info about this pattern in Astro docs](https://docs.astro.build/en/guides/client-side-scripts/#pass-frontmatter-variables-to-scripts)
9. The colors for project cards and tech pills are generated deterministically based on their text content using a hash function. This ensures consistent colors across builds and avoids unnecessary cache-busting. An example of this can be seen in the [Pills](../client/src/components/Pills/Pills.astro) component.
10. If a visitor has JavaScript disabled, the contact form redirects to a generic success or error page after submission. With JS enabled, it either redirects to a success page or shows inline errors without reloading.
11. With JS enabled, the contact form activates the submit button only when all fields are valid. It disables the button during submission to prevent duplicates and uses a short delay to reduce spam attempts.
12. If enabled, the contact form will utilize a "dwell-time" cookie feature to prevent spam submissions. The server reads this cookie and determines if the form submission should be accepted based on how old this cookie is, this helps prevent spam submissions even when JS is disabled.
13. The contact form utilizes honeypot fields to help prevent spam submissions. These fields are hidden from human users but visible to bots, if they are filled out the submission is rejected.
14. In development, the `pnpm dev` command will also start a mock REST API for testing the contact form and analytics features. This can be found here: [dev-api/index.js](../dev-api/index.js). To start Astro without the mock API, use `pnpm dev:client` instead.

### Terraform

1. User-provided variables are stored in [terraform.tfvars](../terraform/terraform.tfvars) and [state.config](../terraform/state.config).
2. The `/bootstrap` directory contains the CloudFormation code and shell scripts that create the remote Terraform state backend using S3 and DynamoDB. This is run automatically by the `terraform-apply` GitHub Action if the backend is not already set up. You can use this remote state setup in your own projects by visiting the [terraform-s3-bootstrap](https://github.com/Unit2795/terraform-s3-bootstrap) repository.
3. Route53 DNS records for both the `root` and `www.` subdomains are created automatically. A CloudFront function redirects `www.` requests to the root domain, best practice for SEO and UX.
4. The `admin_email` variable in the [terraform.tfvars](../terraform/terraform.tfvars) file is used for receiving contact form submissions. If you use an Email based sender identity and this email has not already been verified in SES, an email with a verification link will be sent when terraform provisions your infrastructure for the first time. You must click this link before you can send or receive emails. If you use a Domain based sender identity instead, you must verify your domain in SES and set up the required DNS records before you can send or receive emails. See the [SES documentation](https://docs.aws.amazon.com/ses/latest/dg/creating-identities.html) for more information. If you are using Route53, SES will offer to automatically create the required DNS records for you in the AWS Console.
5. If you create multiple instances of this portfolio, you will need to update the variable files to ensure the important variables are unique for your AWS account. This includes the bucket name in the [terraform.tfvars](../terraform/terraform.tfvars) file, and the bucket and table names in the [state.config](../terraform/state.config) file. You may also wish to change the `domain_name` variable if you are using Route53.
6. The `terraform-destroy` workflow can be run manually in the GitHub Actions tab and will remove all the AWS resources that were created by Terraform.
7. The `terraform-apply` workflow in the GitHub Actions tab will create AWS resources, build the site, upload it, and invalidate the CloudFront cache (if the client or AWS resources have changed). This workflow is automatically triggered on pushes to the `main` branch.

### Lambda Functions

#### Contact Form Submission

1. The [contactme.js](../lambda/functions/contactme/src/index.ts) file contains the Lambda function for handling contact form submissions.
2. This function is triggered by an API Gateway POST request to the `POST /api/contact` endpoint. This endpoint can receive `JSON` and `x-www-form-urlencoded` request bodies.
3. When a valid submission is received, an email is sent to the `admin_email` address provided in the [terraform.tfvars](../terraform/terraform.tfvars) file.
4. This function stores the number of requests received for the month in a DynamoDB table in order to prevent excess emails from being sent.
5. The dwell-time cookie is implanted in the browser using a "tracking pixel" image that is loaded with the site. The cookie contains a cryptographically signed timestamp, and the server will reject any submissions made before a certain amount of time has passed since the cookie was created. This helps prevent spam submissions from bots that submit the form immediately after loading the page, without loading images, or without rendering the page at all.

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
3. The contact form is rate-limited and caps outgoing emails per month.
4. CloudFront runs in a lower-cost region class with aggressive caching, reducing S3 origin requests while also only deploying to the regions you are more likely to see traffic from.
5. Lambda functions use minimal memory, short timeouts, and Graviton2 processors for performance and savings.
6. Using AWS S3 and DynamoDB for remote Terraform state storage is a very cost-effective solution and can be a lot cheaper than using a paid service like Terraform Cloud.
7. The analytics system is designed to be cost-effective by using S3 for storage and SQS as a buffer to handle bursts of events.
8. By implementing its own contact backend (AWS Lambda + SES) instead of SaaS tools (Formspree, Web3Forms, Typeform, etc.), the project avoids subscription fees and maintains full control over data.
9. Terraform + AWS allow for granular cost optimization without vendor lock-in.

### How Secure Is The Site?

1. All communication uses ACM SSL certificates for full HTTPS encryption.
2. No sensitive data is stored. Contact form submissions are emailed directly to the admin and never saved on the server.

### How Do you Prevent Abuse of the Contact Form?

Anti-spam measures include API Gateway throttling, Lambda concurrency limits, honeypot fields, a dwell-time cookie, and monthly email rate limits via DynamoDB.

### What If I Have Issues With Spam?

If you find that you are still having issues with bots, you can increase the dwell-time cookie duration, add a CAPTCHA service, or attach AWS WAF to your CloudFront distribution for more advanced filtering and rate limiting.

### Will You Be Adding More Features?

**Yes**, ongoing improvements and new features are planned, but there’s no fixed roadmap.

### Can You Help Me Customize/Deploy This Portfolio?

For simple questions, **open a GitHub issue**.

For in-depth help, such as customization or deployment assistance, please reach out. I am available for consulting and freelance work. Please reach out via the contact form on my [personal website](https://djoz.us/), email me at [d@djoz.us](mailto:d@djoz.us), or create a GitHub issue.

### Why No UI Libraries/Frameworks?

Unless you count Astro or Tailwind, I aimed to ship very little JavaScript and use few third-party dependencies. It was a nice challenge to write more by hand and this project is intended to be a learning experience.

### Why Astro?

Astro comes up a lot in the static content website world, especially with respect to vanilla HTML, JS, and CSS. It is a modern static site generator that allows you to build fast, optimized websites with great developer experience. Astro added modern developer experience, like componentization and bundling to my workflow. Which was a lot better than building one giant HTML file. If you find you need it later, you can also mix in frameworks like React, Svelte, or Vue. But I wanted to keep this site as lightweight as possible, so I stuck with vanilla JS so I didn't have to ship any runtimes. Astro also has great support for TypeScript. Astro struck a great balance between modern developer experience and performance.

### Why Terraform?

Sure, it probably would have been easier to use a BaaS like AWS Amplify or Vercel. It probably wouldn’t have even been very costly and taken less time. But I wanted the challenge, flexibility, and learning experience of standing up my own infrastructure from scratch with Terraform and AWS. I enjoyed having freedom from BaaS and vendor lock-in. The option to change cloud providers on the fly is pretty nice, thanks Terraform! Fitting together the most appropriate AWS services and having all the dials at my disposal meant I could really optimize and gain a deep understanding of AWS services.

### Why Static Content?

This portfolio uses static site generation at build time for optimal performance. While this setup forces content updates to require a rebuild, it eliminates the overhead of a fully-fledged CMS. For a simple portfolio like this one, this tradeoff improves load times and reduces hosting costs. If you need dynamic content, you can modify [`content/index.ts`](../client/src/content/index.ts) to fetch data from a CMS, this code is evaluated at build time. You may also choose to host Astro on a server and switch to using server rendering or incremental static regeneration (ISR).

### I Have A Question Not Answered Here

Please create a GitHub issue or reach out via the contact form on my [personal website](https://djoz.us/), or email me at [d@djoz.us](mailto:d@djoz.us).
