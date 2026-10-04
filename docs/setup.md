# Setup Guide

- [Setup Guide](#setup-guide)
  - [Links](#links)
  - [Overview](#overview)
  - [Prerequisites](#prerequisites)
  - [Building Your Portfolio Website](#building-your-portfolio-website)
    - [Initial Setup](#initial-setup)
    - [Content Customization](#content-customization)
    - [Development Workflow](#development-workflow)
    - [Deployment Options](#deployment-options)
    - [Version Control](#version-control)
    - [Maintenance](#maintenance)
      - [Major Version Changes](#major-version-changes)

## Links

[Return to main README.md](../README.md) | [Deployment Guide](./deployment.md) | [Live Demo](https://acedev.us/) | [Use This Template](https://github.com/Unit2795/djoz-portfolio/generate)

## Overview

This guide will help you build a copy of the static files for your portfolio website using Astro. Deployment using Terraform is optional and covered in the [Deployment Guide](../docs/deployment.md).

## Prerequisites

You'll need the following in order to build the site:

- [Node.js](https://nodejs.org/en/) >= v22.13
- [pnpm](https://pnpm.io/installation) >= v12
- [GitHub](https://github.com/) account
- A code editor like [VS Code](https://code.visualstudio.com/) or [WebStorm](https://www.jetbrains.com/webstorm/)

## Building Your Portfolio Website

### Initial Setup

1. **Install Dependencies**

   ```bash
   # Navigate to the client directory
   cd client

   # Install project dependencies
   pnpm install
   ```

### Content Customization

2. **Update Site Content**
   The site's copywriting content is managed through a singular file ([content/index.ts](../client/src/content/index.ts)) as a sort of simple Git-based CMS.

   Update the contents of this file to customize your portfolio's text, links, and other content. You can also customize or enable/disable certain features here such as the snow particle effect.

   ```bash
   # Edit the main content file
   vim client/src/content/index.ts  # or use your preferred editor
   ```

   Also set `site` in [astro.config.mjs](../client/astro.config.mjs) to your production URL. It's used for the canonical and Open Graph URLs, and to generate `robots.txt` and `sitemap.xml`.

3. **Replace Images**

   ```bash
   # Project thumbnails
   public/project/ # Add your project images here

   # Hero image
   public/hero.webp # Replace with your hero image

   # Social share preview image (set shareImage in content/index.ts to undefined to leave it out)
   public/og-image.png

   # Favicon
   public/favicon/ # You can generate appropriately sized favicons for all devices from a single image by using https://favicon.io and then place them here
   ```

   📋Image Recommendations:

   - Use WebP format with the lowest quality you can manage for optimal performance
   - Project thumbnails: 500x180 recommended
   - Hero image: 1920x1080px recommended
   - Favicon: Generate a complete set from [favicon.io](https://favicon.io/favicon-converter/)

### Development Workflow

4. **Start Development Server**

   ```bash
   # Start local development
   pnpm dev

   # Access your site at
   http://localhost:4321/
   ```

   > Note: The `pnpm dev` command also starts a mock API server for local testing of the contact form and analytics APIs. Its contact form route is a small stand-in for [contact-api](https://github.com/Unit2795/contact-api). To run without the mock API server, use `pnpm dev:client`.

5. **Build for Production**

   ```bash
   # Create optimized build
   pnpm build

   # Preview production build
   pnpm preview
   ```

   > The production build will be created in the `/dist` directory, ready for deployment. `pnpm build` runs `astro check` first, so type errors fail the build. Run `pnpm typecheck` to check types on their own.

### Deployment Options

6. **Choose Your Deployment**

   **Option A: Automated Terraform/AWS Deployment**

   - Follow the [Deployment Guide](../docs/deployment.md) to deploy using AWS and Terraform.
   - Includes CDN, SSL certificates, DNS records, and the analytics API.
   - The contact form needs [contact-api](https://github.com/Unit2795/contact-api) deployed separately, before this deployment. Or set `disable_contactform = true` in `terraform/terraform.tfvars` and `sections.CONTACT.disabled = true` in `client/src/content/index.ts` to deploy without it.

   **Option B: Static Host**

   - Deploy the `/dist` directory to your preferred hosting service such as:
     - [Netlify](https://www.netlify.com/)
     - [Vercel](https://vercel.com/)
     - [GitHub Pages](https://pages.github.com/)
   - Configure contact form:
     ```typescript
     // Edit src/components/sections/ContactForm/ContactForm.astro
     // Modify the form to accommodate your form service
     ```
     - Some available form services:
       - [Formspree](https://formspree.io/)
       - [Web3Forms](https://web3forms.com/)

### Version Control

7. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "customize portfolio content"
   git push origin main
   ```

### Maintenance

To merge updates from the template repository:

```bash
# Add the template as a remote
git remote add template https://github.com/Unit2795/djoz-portfolio.git

# Fetch updates
git fetch template

# Merge updates (resolve conflicts if needed)
git merge template/main
```

If you created your repo with **Use this template**, it shares no history with the template and Git refuses the first merge. Run the first one with `git merge template/main --allow-unrelated-histories`, and expect conflicts in every file you've customized.

#### Major Version Changes

The code for this portfolio is actively being updated and improved. It's likely to continue to experience significant changes. Each major version, and each minor version with breaking changes, has a migration guide:

- [V3.1 Migration Guide](./v3.1_migration_guide.md): V3.0 to V3.1. An in-place upgrade; re-sync the analytics dashboard and update any customized site components.
- [V3 Migration Guide](./v3_migration_guide.md): V2 to V3. An in-place upgrade; the contact form moved to [contact-api](https://github.com/Unit2795/contact-api).
- [V2 Migration Guide](./v2_migration_guide.md): V1 to V2. The versions differ so much that it's easier to start from a fresh copy of the template and reconcile your custom content and configurations by hand.
