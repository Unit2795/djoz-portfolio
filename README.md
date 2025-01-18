# David's Portfolio

## Deployment
### Dependencies
You'll need to have the following installed to build the client:
- [Node.js](https://nodejs.org/en)
- [PNPM](https://pnpm.io/)

If you'd like to deploy the site to AWS, you'll need to have the following installed:
- [Terraform](https://www.terraform.io/)
- [AWS CLI](https://aws.amazon.com/cli/)

### Building the Site
Follow these steps to build the site:
1. Open a terminal, navigate to the `/client` directory, and run `pnpm install` to install the project dependencies
2. Create an account with [Web3Forms](https://web3forms.com/). Copy the API key provided, as you’ll need it in the `content.ts` file.
3. Duplicate the `content.example.ts` file contained in the `/src` directory and rename the new copy to `content.ts`. Edit the file and replace the placeholder content with your own information, including the Web3Forms API key.
4. Create a `/projects` directory inside the `/public` directory. Add your project images to this folder. Update your `src/content.ts` file to reflect the new image file names.


### (Optional) Deploy to AWS
A Terraform configuration is included if you'd like to deploy the site to AWS CloudFront. To deploy the site to AWS, follow these steps:
1. (Optional) Create an IAM user in AWS and ensure they have the proper permissions for CloudFront, S3, and ACM.
2. Install AWS CLI
3. Authorize yourself with the AWS CLI by doing one of the following:
   1. Run `aws configure` and enter your access key and secret key. 
   2. Run `aws configure sso` if you're using SSO.
   3. Modify your aws credentials file
4. Duplicate the `terraform/terraform.tfvars.example` file and rename the new copy to `terraform/terraform.tfvars`. Fill in the variables with your own information, namely your domain name.
5. (Optional) Run `terraform login` to authenticate with Terraform Cloud if you'd like to use it to manage your deploy state. 
   1. Set your AWS credentials (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_DEFAULT_REGION) in the Terraform Cloud workspace as sensitive environment variables. (THEY MUST BE ENVIRONMENT VARIABLES, NOT TERRAFORM VARIABLES)
   2. Set the name of your `workspace` and `organization` in the `terraform/main.tf` file.
6. Run `terraform init` in `/terraform` directory to initialize the Terraform configuration
7. Run `npm run cert` to issue the ACM certificate. The CNAME DNS record you need to supply to your domain registrar will be output to the console.
8. (Optional) Run `terraform plan` to see the changes that will be made
9. Run `terraform apply` to deploy the changes
10. On first run, the ACM SSL certificate will await validation. Visit the AWS console, find the certificate, and copy the CNAME DNS record to your domain registrar to validate the certificate. Upon validation, the CloudFront distribution will be created.
11. The output will provide the CloudFront distribution domain name. Create a CNAME record in your domain registrar to point to this domain name.
12. In the `client` directory, run `pnpm run build`. Assuming the build looks good, you may then upload the build to S3 by running `aws s3 sync dist/ s3://djoz-portfolio` (if necessary, replace `djoz-portfolio` with your S3 bucket name).
13. Visit your domain name to see your site live!
14. If you'd like to immediately invalidate the CloudFront cache, run `aws cloudfront create-invalidation --distribution-id <your-distribution-id> --paths "/*"`. It may still take a while for the cache to clear.