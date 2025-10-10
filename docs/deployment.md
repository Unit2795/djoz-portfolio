<h1>Deployment Guide</h1>

- [Links](#links)
- [Overview](#overview)
- [Infrastructure](#infrastructure)
  - [Prerequisites](#prerequisites)
  - [Deployment Steps](#deployment-steps)
    - [1. Domain Registration](#1-domain-registration)
    - [2. DNS Configuration](#2-dns-configuration)
    - [3. GitHub Actions Setup](#3-github-actions-setup)
    - [4. Repository Configuration](#4-repository-configuration)
    - [5. Infrastructure Configuration](#5-infrastructure-configuration)
    - [6. Deployment](#6-deployment)
  - [Alternative DNS Setup](#alternative-dns-setup)
  - [Manually Rebuilding the Site \& Forcing Cache Invalidation](#manually-rebuilding-the-site--forcing-cache-invalidation)
- [Destroying the Infrastructure](#destroying-the-infrastructure)

# Links

[Return to main README.md](../README.md) | [Setup Guide](./setup.md) | [Live Demo](https://djoz.us/) | [Use This Template](https://github.com/Unit2795/djoz-portfolio/generate)

# Overview

This guide walks you through deploying your portfolio using AWS infrastructure. The deployment is automated using GitHub Actions and Terraform, providing you with a production-grade setup including a CDN and a fully serverless backend.

> 💡 Note: This deployment is optional. You can alternatively host on platforms like Netlify, Vercel, or anywhere that supports static file hosting.
>
> 💡 Note: It's also possible to disable the GitHub Actions and deploy manually using the Terraform CLI, but this is not covered here.

> ⚠️ Warning: The AWS services used in this deployment will incur costs (likely less than $2 per month). Make sure to monitor your usage to avoid unexpected charges.

# Infrastructure

The deployment automatically provisions:

- **CloudFront** - Global CDN for fast content delivery
- **S3** - Secure static file hosting & Terraform state storage
- **DynamoDB** - Stores Terraform state locking and tracks contact form submissions
- **Lambda** - Serverless backend for contact form and analytics
- **API Gateway** - HTTP endpoints for contact form submissions and analytics
- **IAM** - Identity and Access Management for secure access to AWS resources
- **CloudFormation** - Bootstraps the Terraform state storage backend
- **SQS** - Queue for storing analytics events before being processed
- **SES** - Email handling for form submissions
- **ACM** - SSL/TLS certificate management
- **Route 53** - DNS management (optional)

## Prerequisites

- [AWS Account](https://aws.amazon.com/) with administrative access
- [GitHub](https://github.com/) account
- Registered domain name
- [Route 53](https://aws.amazon.com/route53/) hosted zone for your domain (if using AWS DNS)
- [SES](https://aws.amazon.com/ses/) verified email address or domain for sending contact form submissions
- [Terraform CLI](https://learn.hashicorp.com/tutorials/terraform/install-cli) installed locally (if verifying configs or deploying locally)
- [AWS CLI](https://aws.amazon.com/cli/) installed and configured locally (if deploying locally)

## Deployment Steps

### 1. Domain Registration

If you don't have a domain name yet, you can register one through [Route 53](https://aws.amazon.com/route53/) or any domain registrar of your choice.

### 2. DNS Configuration

If you don't have one already and wish to use Route 53 for your DNS provider, create a hosted zone for your domain using the AWS CLI or in the AWS Console.

```bash
# Create Route 53 hosted zone (if using AWS DNS)
aws route53 create-hosted-zone \
  --name YOURDOMAINHERE.com \
  --caller-reference $(date +%s)

# (Optional) Note the nameservers if using a 3rd party domain registrar, you'll need to add these to your domain's DNS settings
aws route53 get-hosted-zone --id /hostedzone/ZONEID
```

Want to use another DNS provider? See [Alternative DNS Setup](#alternative-dns-setup).

### 3. GitHub Actions Setup

1. Create an IAM Identity Provider using the AWS CLI or in the AWS console for GitHub Actions to use.
   1. **Provider URL**: `https://token.actions.githubusercontent.com`
   2. **Audience**: `sts.amazonaws.com`
2. Create an IAM Role
   1. Make note of the name you give this role, you will need it later.
   2. Select **Web Identity** as the trusted entity type.
   3. Set **Identity Provider** to the one you just created `token.actions.githubusercontent.com`
   4. Set **Audience** to `sts.amazonaws.com`
   5. Set the GitHub organization (your username if you don’t have one). You may also optionally specify the repo and the branch.
      1. Example of multiple repos/branches:
      ```json
      "token.actions.githubusercontent.com:sub": [
         "repo:<organization-or-username>/<repo-1>:ref:refs/heads/<branch-1>",
         "repo:<organization-or-username>/<repo-1>:ref:refs/heads/<branch-2>",
         "repo:<organization-or-username>/<repo-2>:ref:refs/heads/<branch-1>",
         "repo:<organization-or-username>/<repo-3>:ref:refs/heads/*"
      ]
      ```
   6. For the permissions, you may start with the `AdministratorAccess` policy to get everything working, then later restrict the permissions to only what is needed.
   7. Copy your AWS account ID. It can be found in the top right of the AWS web Console when you click your name. The dropdown menu will show your “Account ID”

More Info:

- [Creating a GitHub OIDC identity provider in AWS](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
- [Using IAM roles to connect GitHub Actions to actions in AWS](https://aws.amazon.com/blogs/security/use-iam-roles-to-connect-github-actions-to-actions-in-aws/)

### 4. Repository Configuration

In your GitHub repository's settings, under the "Secrets and variables" section, add the following secrets:

```bash
AWS_ACCOUNT_ID      # Your AWS Account ID
AWS_IAM_ROLE_NAME   # Role name from step 3
AWS_DEFAULT_REGION  # e.g., us-east-1
```

### 5. Infrastructure Configuration

Configure Terraform in the [terraform/terraform.tfvars](../terraform/terraform.tfvars) and [terraform/state.config](../terraform/state.config) files.

1. Update Terraform variables:

   ```hcl
   # terraform/terraform.tfvars
    domain_name        = "example.com"
    aws_region         = "us-east-1"
    bucket_name        = "djoz-portfolio"
    admin_email        = "johndoe@example.com"
    hmac_secret        = "your_long_random_secret_string"
   ```

   - Note: You can see the complete list of available variables in the [variables.tf](../terraform/variables.tf) file.

2. Configure state backend:
   ```hcl
   # terraform/state.config
    bucket = "tf-state-djoz-portfolio"
    key = "terraform.tfstate"
    dynamodb_table = "tf-state-djoz-portfolio-lock"
    region = "us-east-1"
   ```
   - Note: You can change the bucket and table names if you want, but they must be unique for your AWS account.
   - You could also utilize Terraform Cloud, another remote backend, or even local state if you prefer (if using GitHub Actions, you could potentially use "Artifacts" or something else).
3. (Optional) Change SES Email sending identity:
   - By default, the template uses an `Email-Based` sending identity for SES. If you have a verified domain, you can switch to the `Domain-Based` sending identity by updating the [terraform.tfvars](../terraform/terraform.tfvars) file.

### 6. Deployment

1. Push your changes to GitHub to trigger deployment:

   ```bash
   git add .
   git commit -m "configure aws deployment and content"
   git push origin main
   ```

2. Monitor the deployment:
   - Check GitHub Actions tab
   - **⚠️Note! If you are using an Email-Based sending identity for SES**: You'll receive an email from Amazon SES to verify your `admin_email` address provided in the [terraform.tfvars](../terraform/terraform.tfvars) file _if_ you haven't already added this email to SES before. You must click the verification link before you can send emails from/to this address. This admin email is where you will receive contact form submissions.
   - Wait for CloudFront distribution (~15 mins)

## Alternative DNS Setup

If not using Route 53:

1. Remove Route 53 configurations from [client.tf](./terraform/client.tf) file.
2. Configure DNS manually:
   - Retrieve the ACM validation records from AWS Console after deploying
   - Add CNAME records to your DNS provider
   - Add CloudFront distribution CNAME

## Manually Rebuilding the Site & Forcing Cache Invalidation

If you need to manually rebuild the site and force cache invalidation on CloudFront; you can manually trigger the `Build and Deploy` GitHub Action and indicate you'd like to force the client redeploy in the dialog that appears. This will trigger a cache invalidation on CloudFront after the deployment, note that there is a small cost associated with cache invalidation requests.

# Destroying the Infrastructure

If you want to take down the website, you can run the `Manual Terraform Destroy` workflow in the GitHub Actions tab of your repository. This will remove all of the AWS resources that were created by Terraform. You may also manually run `terraform destroy` from your local machine if you have the AWS and Terraform CLIs installed and configured.

> 💡 **Tip:** If you have any issues with deleting AWS resources, such as an S3 bucket containing objects, you may need to forcibly empty the bucket before it can be deleted. Though the Terraform config is configured to force deletion of S3 buckets. If other resources refuse to delete, you may need to delete these manually using the AWS Console or CLI.
