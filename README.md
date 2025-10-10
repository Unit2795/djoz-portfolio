# David's Portfolio Template

> A lightning-fast, SEO-optimized portfolio website with automated AWS deployment

<p align="center"><img src="./docs/assets/demo.gif" alt="David's Portfolio demo while scrolling" width="800"/></p>

---

<p align="center"><a target="_blank" href="https://djoz.us/"><img src="./docs/assets/button.png" alt="Click to visit the live website" width="200"/></a></p>

- [David's Portfolio Template](#davids-portfolio-template)
  - [Links](#links)
  - [Overview](#overview)
    - [⚡️ **Performance**](#️-performance)
    - [🎨 **Design \& Accessibility**](#-design--accessibility)
    - [🚀 **API \& Deployment**](#-api--deployment)
  - [Key Technologies](#key-technologies)
  - [License](#license)
  - [Contributing](#contributing)

## Links

[About](./docs/about.md) | [Setup Guide](./docs/setup.md) | [Deployment Guide](./docs/deployment.md) | [Analytics](./docs/analytics.md) | [Live Demo](https://djoz.us/) | [Use This Template](https://github.com/Unit2795/djoz-portfolio/generate)

## Overview

- Thank you for checking out my portfolio template! It's built in [Astro](https://astro.build/) with vanilla HTML, JS, and [Tailwind CSS](https://tailwindcss.com/).
- The site is deployed using [Terraform](https://www.terraform.io/), [GitHub Actions](https://docs.github.com/en/actions), and [AWS](https://aws.amazon.com/).
- This site includes its own optional contact form API with anti-spam protection and a [simple analytics API](./docs/analytics.md) with a local dashboard to visualize analytics data.
- Click ["use this template"](https://github.com/Unit2795/djoz-portfolio/generate) and follow the instructions in the [Setup Guide](./docs/setup.md) if you'd like to set up a copy of this website for yourself! Optionally, use the [Deployment Guide](./docs/deployment.md) to deploy to AWS.
- Want to learn more about the reasoning behind the implementation of this portfolio, other helpful context, or FAQs? See the [About page](./docs/about.md)
- Need help or have a suggestion? Please create a GitHub issue.
- This is an ongoing project being actively updated

> ℹ️ Note: This portfolio is an experimental testbed and proof of concept for my very specific use-case. It is subject to change abruptly.

### ⚡️ **Performance**

- Statically rendered with deeply customizable CMS content (Entire site is under 30KB compressed)
- CDN-powered global delivery
- Functional without Javascript
- CSS/JS is built into the html file to reduce network requests
- Only 15 KB of JS uncompressed
- 100/100 [Lighthouse](https://developer.chrome.com/docs/lighthouse/overview) score

### 🎨 **Design & Accessibility**

- Modern glassmorphic design
- Responsive down to 320 pixel width
- Easy content customization through a single file ([content/index.ts](./client/src/content/index.ts))
- Fully accessible. Reads well with screen readers, can zoom to 200%, high contrast, large clickable regions, semantic HTML and aria attributes. Working towards WCAG 2.2 AA conformance
- Eye-catching animations, disabled if user prefers reduced motion

### 🚀 **API & Deployment**

- Automated, low-cost, and secure AWS deployment (less than $2 per month) using Terraform for easy setup
- GitHub Actions for CI/CD when code changes
- CloudFormation script for bootstrapping Terraform state storage in AWS S3 & DynamoDB
- Contact form and analytics APIs with abuse protection

## Key Technologies

- [Astro](https://astro.build/)
  - Library for building the static generated site
- [Tailwind CSS](https://tailwindcss.com/)
  - Utility-first CSS styling
- [TypeScript](https://www.typescriptlang.org/)
  - Type safety for the site
- [PNPM](https://pnpm.io/)
  - Efficient package manager
- [ESLint](https://eslint.org/)
  - Code linter
- [Prettier](https://prettier.io/)
  - Code formatting
- [Vite](https://vite.dev/)
  - Build tool used by Astro
- [Node.js](https://nodejs.org/en/)
  - JavaScript runtime for Lambda functions
- [AWS](https://aws.amazon.com/)
  - Cloud provider for the site and APIs
- [Terraform](https://www.terraform.io/)
  - Infrastructure as Code library that deploys the site and manages resources
- [GitHub Actions](https://github.com/features/actions)
  - Automates the deployment of the site to AWS using Terraform and Linux
- [CloudFormation](https://aws.amazon.com/cloudformation/)
  - Bootstraps the Terraform state backend in AWS
- [Next.js](https://nextjs.org/)
  - Used for the local analytics dashboard
- [DuckDB](https://duckdb.org/)
  - Database for analytics report generation
- [Recharts](https://recharts.org/en-US/)
  - Simple charting library for analytics dashboard
- [Shadcn/ui](https://ui.shadcn.com/)
  - Component library for analytics dashboard
- [Tanstack Table](https://tanstack.com/table)
  - Table library for analytics dashboard

## License

This project is licensed under the MIT License. You are free to use, modify, and distribute this code as you see fit. See the [LICENSE](./LICENSE) file for more information.

## Contributing

If you have any suggestions, improvements, or issues, please create a GitHub issue or a pull request. Feedback welcome!

---

<div align="center"><img src="./docs/assets/analytics.jpg" alt="Analytics Dashboard" width="400"/><p><i>Analytics Dashboard</i></p></div>

<div align="center"><img src="./docs/assets/lighthouse.jpg" alt="Lighthouse Score" width="400"/><p><i>Lighthouse Score</i></p></div>
