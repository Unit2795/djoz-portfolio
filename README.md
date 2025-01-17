# DJOZ Portfolio

## Getting Started
### Building the Site
You can build the site and deploy the built files to a static host using the following steps:
1. In the `/client` directory
   1. Run `pnpm install` to install the project dependencies
   2. Duplicate the `src/content.example.ts` file and rename the new copy to `src/content.ts`. Fill in the content with your own information.
   3. Create a `/projects` directory in the `/public` directory and add your project images. Adjust your `src/content.ts` file as needed to use your new image file names.


### Deploy
A Terraform configuration is included to deploy the site to AWS S3 and CloudFront. Note that there is NOT a domain name setup included in this. So you'll need to register your domain manually or modify the Terraform setup. To deploy the site:
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
7. (Optional) Run `terraform plan` to see the changes that will be made
8. Run `terraform apply` to deploy the changes
9. On first run, the ACM SSL certificate will await validation. Visit the AWS console, find the certificate, and copy the CNAME DNS record to your domain registrar to validate the certificate. Upon validation, the CloudFront distribution will be created.
10. The output will provide the CloudFront distribution domain name. Create a CNAME record in your domain registrar to point to this domain name.
11. In the `client` directory, run `pnpm run build`. Assuming the build looks good, you may then upload the build to S3 by running `aws s3 sync dist/ s3://djoz-portfolio` (if necessary, replace `djoz-portfolio` with your S3 bucket name).
12. Visit your domain name to see your site live!
13. If you'd like to immediately invalidate the CloudFront cache, run `aws cloudfront create-invalidation --distribution-id <your-distribution-id> --paths "/*"`. It may still take a while for the cache to clear.