<h1>Version 2 Migration Guide</h1>

# Links

[Return to main README.md](../README.md) | [Setup Guide](./setup.md) | [Deployment Guide](./deployment.md) | [Live Demo](https://djoz.us/) | [Use This Template](https://github.com/Unit2795/djoz-portfolio/generate)

# Overview

This guide walks you through migrating from Version 1 (V1) to Version 2 (V2) of the portfolio.

The two versions are significantly different, so the process is closer to a fresh start than an incremental upgrade. However, a few elements can be reused to save time.

# Migration Options

You have two approaches:

1. **Start Fresh**
   1. Create a new private repository from the template. This is the simplest option if you don’t care about preserving your commit history.
   2. If you used Terraform to deploy your infrastructure, be sure to destroy your old infrastructure so you aren't charged for it.
      1. ⚠️**Note:** You may wish to pull in the `terraform-destroy.yml` GitHub Action and `/terraform/bootstrap` directory files from V2, these are more comprehensive and more likely to successfully tear down your Terraform infrastructure. But you may still need to manually clear out S3 buckets or delete other AWS resources in the AWS console.
2. **Using Existing Repo**
   1. Use this approach if you want to keep your commit history
   2. Create a new branch in your existing repository.
   3. Back up your current portfolio files somehwere on your computer outside of your repo's directory.
   4. Clear your repo directory completely, leaving only metadata directories such as `.git`, `.vscode`, `.idea`, or any other untracked files you want to preserve. It's important to keep `.git` to keep your git commit history and other data. While the others likely contain your IDE/tooling settings.
   5. Clone the template repository somewhere on your computer and copy its contents into your repo.
   6. If everything looks good, commit these new files to your new branch.

Once complete, you’ll reconcile your V1 content with the new V2 structure.

# What Needs Adjustment?

## Client Assets

- `/client/public` directory
  - Keep your existing favicons, hero image, and project images.
  - The only file that changed and needs to be kept for the site to look right is the `hexagon.svg`, which is used in the skills section's icons
- `/client/src/content/index.ts` file
  - As in V1, this file holds all of your website’s copy.
  - The schema has changed considerably. Some variables (e.g., email, name) remain, but others differ.
  - Review and update this file with your new content.

## Terraform (If using for deploys)

- `/terraform/terraform.tfvars` file
  - Several new variables were introduced. Update this file to match your deployment needs.
  - Reference `/terraform/variables.tf` for the full list.
- `/terraform/state.config` file
  - The structure is unchanged. If you customized your TF state backend, ensure your values are present here.
- `/terraform/api.tf`
  - If you configured SES for domain-based identity (instead of email-based), migrate your settings accordingly.

## Other Changes

- If you made any additional changes to the client, Terraform, or Lambdas, be sure to bring those over!

# Infrastructure Notes

V2 uses much of the same AWS infrastructure as V1, but **resource names and configurations have changed**. Migrating Terraform state is not recommended. Instead:

- **Destroy and redeploy** your infrastructure.
- Expect small costs when tearing down and recreating resources (typically only a few cents).

## Step 1: Destroy Old Infrastructure

1. **Disable auto-deploy**
   1. Go to your repo on GitHub → Actions tab → select "Build and Deploy" → click the three dots → "Disable Workflow".
2. **Merge new code**
   1. Commit your V2 files and merge them into your main branch.
3. Run destroy workflow
   1. In GitHub Actions, trigger the "Manual Terraform Destroy" workflow
   2. Confirm the prompt and allow the destroy to run.
   3. This will remove all infrastructure—including your SES sender identity.
   4. ⚠️ Tip: If the destroy fails (e.g., S3 buckets not empty), manually clear the buckets, delete blocking resources, and re-run.

## Step 2: Reconfigure SES

After destroy completes:

- Recreate your **SES sender identity** (domain-based or email-based) in the AWS console.
- If using email-based identity, check your inbox for AWS’s verification email.
- Domain identity verifications usually take about 15 minutes but you can continue with deployment while waiting.

## Step 3: Deploy New Infrastructure

1. In GitHub Actions:
   1. Re-enable the "Build and Deploy" workflow.
   2. Trigger it manually like you did with the destroy action.
   3. Just to be sure, enable the “force client redeploy” option.
2. Deployment can take up to **15 minutes**, mostly due to ACM certificate validation and CloudFront distribution.
3. When complete, visit your domain to see your V2 portfolio live. 🎉

# Summary

- Copy over only what’s reusable (hexagon.svg, images, and index.ts content).
- Update Terraform variables if deploying infrastructure.
- Destroy old infra
- Reconfigure SES if needed.
- Redeploy and validate your new portfolio.

Need help or have suggestions? Please open a GitHub issue on this repository.
