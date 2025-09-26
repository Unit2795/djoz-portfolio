<h1>About</h1>

- [Links](#links)
- [Overview](#overview)
- [Good To Know](#good-to-know)
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
  - [Will You Be Adding More Features?](#will-you-be-adding-more-features)
  - [Can You Help Me Customize/Deploy This Portfolio?](#can-you-help-me-customizedeploy-this-portfolio)
  - [Why No UI Libraries/Frameworks?](#why-no-ui-librariesframeworks)
  - [Why Astro?](#why-astro)
  - [Why Terraform?](#why-terraform)
  - [Why Static Content?](#why-static-content)
  - [I Have A Question Not Answered Here](#i-have-a-question-not-answered-here)

# Links

[Return to main README.md](../README.md) | [Setup Guide](./setup.md) | [Live Demo](https://djoz.us/) | [Use This Template](https://github.com/Unit2795/djoz-portfolio/generate)

# Overview

This page provides additional context about the design and implementation of this portfolio and how you can maximize your use of it.

# Good To Know

## Astro Site

1. The site's copywriting content that you'll edit is stored in the ([content/index.ts](../client/src/content/index.ts)) file. Some content can be disabled entirely. Learn more about why this approach was chosen in [Why Static Content?](#why-static-content).
2. Any piece of text that a human being could read can be adjusted in the ([content/index.ts](../client/src/content/index.ts)) file, this includes SEO metadata, alt text, and ARIA attributes. While much of this text may never be edited, it could be useful if you'd like to translate the site into another language.
3. The [content/index.ts](../client/src/content/index.ts) does more that just hold text, it also contains configuration options for enabling/disabling certain features such as the snow particle effect, animation on the navbar, analytics, the contact form, and more.
4. The most complex part of the Astro code is the [SnowParticles](../client/src/components/SnowParticles) component, which sets up the snowfall particle effect. A close second is the [Navbar](../client/src/components/Navbar), which uses a scroll listener to highlight the current section in the navbar, among other features.
5. The site is fully functional without Javascript, but some enhancements are made if Javascript is enabled. These include the snow particle effect, highlighting the current section in the navbar, and form submission without a full page redirect.
6. There is a post-build script that bundles all of the JS and inlines it into the `index.html` file to reduce the number of network requests needed for the site to be fully functional. This script can be found here: [postbuild.js](../client/scripts/postbuild.js).
7. if you enable analytics in the [content/index.ts](../client/src/content/index.ts) file, page views, clicks on interactive elements, and scroll depth will be tracked. You can also selectively enable or disable tracking for some elements in the content file.
8. A [web component creation helper function](../client/src/utils/customEl/client.ts) is used to quickly create components augmented by JavaScript that can both utilize modules/imports and be passed data by the Astro frontmatter. [More info about this pattern in Astro docs](https://docs.astro.build/en/guides/client-side-scripts/#pass-frontmatter-variables-to-scripts)
9. The colors for project cards and tech pills are deterministically generated based on the text content using a hash function. This ensures that the same text will always produce the same color, even across builds, this is important for preventing unnecessary cache-busting. An example of this can be seen in the [Pills](../client/src/components/Pills/Pills.astro) component.
10. If the user accessing the site does not have Javascript enabled, the contact form will redirect to a new page with a generic success or error message after submission. If Javascript is enabled, the form will either redirect to a success page or display an error message inline with the form without a full page reload.
11. If JS is enabled, the contact form will only enable the submit button once all fields are valid. It will prevent multiple submissions by disabling the button while the form is being submitted. It also prevents spam submissions by using a small delay after the user first types into a field before enabling the submit button.
12. If enabled, the contact form will utilize a "dwell-time" cookie feature to also prevent spam submissions. The server reads this cookie and determines if the form submission should be accepted based on how old this cookie is, this helps prevent spam submissions even if JS is disabled.
13. The contact form also utilizes honeypot fields to help prevent spam submissions. These fields are hidden from human users but visible to bots, if they are filled out the submission is rejected.
14. In development, the `pnpm dev` command will also start a mock REST API for testing the contact form and analytics features. This can be found here: [dev-api/index.js](../dev-api/index.js). To start Astro without the mock API, use `pnpm dev:client` instead.

## Terraform

1. All user-provided variables are stored in the [terraform.tfvars](../terraform/terraform.tfvars) and [state.config](../terraform/state.config) files.
2. The `/bootstrap` directory contains the CloudFormation code and shell scripts that create the remote Terraform state backend using S3 and DynamoDB. This is run automatically by the `terraform-apply` GitHub Action workflow if the backend is not already set up. You can use this remote state setup for yourself by visiting the [terraform-s3-bootstrap](https://github.com/Unit2795/terraform-s3-bootstrap) repository.
3. The Route53 DNS records for the `www.` subdomain are created automatically in addition to the root domain you provide. A CloudFront function is used to redirect requests from the `www.` subdomain to the root domain. This is generally considered best practice for SEO and user experience.
4. The `admin_email` variable in the [terraform.tfvars](../terraform/terraform.tfvars) file is used for receiving contact form submissions. If you use an Email based sender identity and this email has not already been verified in SES, an email with a verification link will be sent when terraform provisions your infrastructure for the first time. You must click this link before you can send or receive emails. If you use a Domain based sender identity instead, you must verify your domain in SES and set up the required DNS records before you can send or receive emails. See the [SES documentation](https://docs.aws.amazon.com/ses/latest/dg/creating-identities.html) for more information. If you are using Route53, in the AWS Console, SES will offer to automatically create the required DNS records for you.
5. If you create multiple instances of this portfolio, you will need to update the variable files to ensure the important variables are unique or the deploy will fail. This includes the bucket name in the [terraform.tfvars](../terraform/terraform.tfvars) file, and the bucket and table names in the [state.config](../terraform/state.config) file. You may also wish to change the `domain_name` variable if you are using Route53.
6. The `terraform-destroy` workflow can be run manually in the GitHub Actions tab and will remove all the AWS resources that were created by Terraform.
7. The `terraform-apply` workflow in the GitHub Actions tab will create AWS resources, build the site, upload it, and invalidate the CloudFront cache (if the client or AWS resources have changed). This workflow is automatically triggered on pushes to the `main` branch.

## Lambda Functions

### Contact Form Submission

1. The [contactme.js](../lambda/contactme.js) file contains the Lambda function code for the contact form submission handler.
2. This function is triggered by an API Gateway POST request to the `POST /api/contact` endpoint. This endpoint can receive `JSON` and `x-www-form-urlencoded` request bodies.
3. When a valid submission is received, an email is sent to the `admin_email` address provided in the [terraform.tfvars](../terraform/terraform.tfvars) file.
4. The function stores the number of requests received for the month in a DynamoDB table to prevent excess emails from being sent.
5. This function evaluates several anti-abuse mechanisms to prevent spam submissions. These include API Gateway throttling, Lambda concurrency limits, honeypot fields, a "dwell-time" cookie, and email limiting using DynamoDB.
6. The dwell-time cookie is implanted in the browser using a "tracking pixel" image that is loaded when the website is loaded. The cookie contains a cryptographically signed timestamp of when it was created, and the server will reject any submissions made before a certain amount of time has passed since the cookie was created. This helps prevent spam submissions from bots that submit the form immediately after loading the page, without loading images, or without loading the page at all.

### Analytics Ingest & Processor

1. The [analytics-ingest.js](../lambda/analytics-ingest.js) file contains the Lambda function which is responsible for receiving analytics events from the website, applying some basic validation, and storing them in an SQS queue for later processing.
2. The [analytics-processor.js](../lambda/analytics-processor.js) file contains the Lambda function which is responsible for processing analytics events from the SQS queue and storing them in an S3 bucket in a partitioned format for later analysis.
3. This setup of using SQS as a buffer between the ingest and processor allows us to efficiently aggregate events while also being able to handle bursts.
4. The analytics system is designed to be cost-effective and scalable. S3 storage is very cheap, and the processor function can write large numbers of events in a single invocation.

# FAQs

## How Much Does This Cost To Host?

Including the domain, CloudFront static hosting, APIs, emails, and everthing else, it should cost less than $2 per month for a typical low-traffic portfolio website.

## What Cost Saving Measures Are Implemented?

1. The site is fully statically generated, which means there are no servers to run and maintain. This reduces hosting costs significantly.
2. The site is hosted on a serverless architecture, which means you only pay for what you use. This can lead to significant cost savings, especially for low-traffic sites and sporadic traffic spikes.
3. The contact form submission function is rate-limited and has a maximum number of emails that can be sent per month.
4. CloudFront is usedin a lower price class and with aggressive caching to reduce the number of requests to the site’s S3 origin bucket while also only deploying to the regions you are more likely to see traffic from.
5. The lambda functions have low memory and timeout settings to reduce costs. They also leverage Graviton2 processors for better performance at a lower cost.
6. Using AWS S3 and DynamoDB for remote state storage is a very cost-effective solution and can be a lot cheaper than using a paid service like Terraform Cloud.
7. The analytics system is designed to be cost-effective by using S3 for storage and SQS as a buffer to handle bursts of events.
8. Instead of using a form provider SaaS like Formspree, Web3Forms, or Typeform; this portfolio implements its own contact form backend using AWS Lambda and SES. This saves on monthly subscription costs and gives you more control over the data.
9. The deep control afforded by Terraform and AWS allows for fine-tuning of resources to balance performance and cost effectively for this specific use-case.

## How Secure Is The Site?

1. The site uses ACM SSL certificates for all communications, ensuring that data is encrypted in transit.
2. The site does not store any sensitive data, and the contact form submissions are sent directly to the admin email address without being stored on the server.

## How Do you Prevent Abuse of the Contact Form?

The contact form Lambda function has several anti-abuse mechanisms to prevent spam submissions, including API Gateway throttling, Lambda concurrency limits, honeypot fields, a "dwell-time" cookie, and email limiting using DynamoDB.

## Will You Be Adding More Features?

I plan to continue to improve and add features over time but there is no set roadmap.

## Can You Help Me Customize/Deploy This Portfolio?

For simple questions, please create a GitHub issue. For more in-depth help, such as customization, deployment assistance, please reach out. I am available for consulting and freelance work. Please reach out via the contact form on my [personal website](https://djoz.us/), email me at [d@djoz.us](mailto:d@djoz.us) or create a GitHub issue.

## Why No UI Libraries/Frameworks?

Unless you count Astro or Tailwind, I prioritized shipping as little Javascript to the browser as possible. But it was also a nice challenge to just try and write everything by hand. The total bundled JS is less than 15KB. But you don't even neen JS in order to have a fully functional experience in this portfolio. This was a nice break from React and the churn of modern web development. Sometimes it’s good to get back to the fundamentals of HTML, JS, and CSS. JS can sometimes be a crutch for things that could have been accomplished more efficiently in HTML and CSS.

## Why Astro?

Astro comes up a lot in the vanilla HTML, JS, and CSS world, especially with respect to static content websites. It is a modern static site generator that allows you to build fast, optimized websites with great developer experience. Astro added modern developer experience like componentization and bundling to my experience. Which was a lot better than building one giant HTML file. If you find you need it later, you can also mix in frameworks like React, Svelte, or Vue. But I wanted to keep this site as lightweight as possible, so I stuck with vanilla JS. Astro also has great support for TypeScript, which I wanted to use for type safety. Overall, Astro struck a great balance between modern developer experience and performance.

## Why Terraform?

Sure, it probably would have been easier to use a BaaS like AWS Amplify or Vercel. If this was a production scenario, I probably would have. It probably wouldn’t have even been very costly at all and would have likely taken less time. But I wanted the challenge and flexibility of standing up my own infrastructure from scratch with Terraform and AWS. I enjoyed having freedom from BaaS and vendor lock-in. The option to change cloud providers on the fly is pretty nice, thanks Terraform! Fitting together the most appropriate AWS services and having all the dials at my disposal meant I could really optimize and get a deep understanding.

## Why Static Content?

This portfolio uses static site generation at build time for optimal performance. While this setup forces content updates to require a rebuild, it eliminates the overhead of a fully-fledged CMS. For a simple portfolio like this one, this tradeoff improves load times and reduces hosting costs. If you need dynamic content, you can modify [`content/index.ts`](../client/src/content/index.ts) to fetch data from a CMS, this code is evaluated at build time. You may also choose to host Astro on a server and switch to using server rendering and incremental static regeneration (ISR).

## I Have A Question Not Answered Here

Please create a GitHub issue or reach out via the contact form on my [personal website](https://djoz.us/), or email me at [d@djoz.us](mailto:d@djoz.us).
