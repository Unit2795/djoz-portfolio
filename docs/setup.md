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

[Return to main README.md](../README.md) | [Deployment Guide](./deployment.md) | [Live Demo](https://djoz.us/) | [Use This Template](https://github.com/Unit2795/djoz-portfolio/generate)

## Overview

This guide will help you build a copy of the static files for your portfolio website using Astro. Deployment using Terraform is optional and covered in the [Deployment Guide](../docs/deployment.md).

## Prerequisites

You'll need the following in order to build the site:

- [Node.js](https://nodejs.org/en/) >= v22
- [pnpm](https://pnpm.io/installation) >= v10.0
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
   The site's copywriting content is managed through a singular file ([content/index.ts](./client/src/content/index.ts)) as a sort of simple Git-based CMS.

   Update the contents of this file to customize your portfolio's text, links, and other content. You can also customize or enable/disable certain features here such as the snow particle effect.

   ```bash
   # Edit the main content file
   vim client/src/content/index.ts  # or use your preferred editor
   ```

3. **Replace Images**

   ```bash
   # Project thumbnails
   public/project/ # Add your project images here

   # Hero image
   public/hero.webp # Replace with your hero image

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

   > Note: The `pnpm dev` command also starts a mock API server for local testing of the contact form and analytics APIs. To run without the mock API server, use `pnpm dev:client`.

5. **Build for Production**

   ```bash
   # Create optimized build
   pnpm build

   # Preview production build
   pnpm preview
   ```

   > The production build will be created in the `/dist` directory, ready for deployment.

### Deployment Options

6. **Choose Your Deployment**

   **Option A: Automated Terraform/AWS Deployment**

   - Follow the [Deployment Guide](../docs/deployment.md) to deploy using AWS and Terraform.
   - Includes CDN, SSL certificates, DNS records, and contact form submission and analytics APIs.

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

#### Major Version Changes

The code for this portfolio is actively being updated and improved. It's likely to continue to experience significant changes.

It may be easier to either clear your repository's files out and copy the files from the template repository to your own repository, or create a new repository from the template. Then manually copy and reconcile your custom content and configurations. It's not ideal but it avoids complex merge conflicts.

An example of this can be seen in the [V2 Migration Guide](./v2_migration_guide.md) which walks through migrating from V1 to V2.
