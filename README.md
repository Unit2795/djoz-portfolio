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
1. Register a domain name with a domain registrar.
2. Create a hosted zone in Route 53 for your domain's DNS.
   1. If you are using a different DNS provider, you will need to:
      1. Modify the .tf files to remove all Route 53 references.
      2. Grab the DNS validation records from the ACM certificate in the AWS console and add them to your DNS provider manually.
3. Create an IAM user in AWS (you can use your root user, but it's not recommended) and ensure they have the proper permissions to deploy to CloudFront, S3, ACM, and Route 53.
4. Install AWS CLI
5. Authorize yourself with the AWS CLI by doing one of the following:
   1. Run `aws configure` in your terminal and enter your IAM user's access key and secret key
   2. Run `aws configure sso` in your terminal if you're using SSO
   3. Modify your aws credentials file
6. Duplicate the `terraform/terraform.tfvars.example` file and rename the new copy to `terraform/terraform.tfvars`. Fill in the variables with your own information, namely your domain name.
7. (Optional) Run `terraform login` to authenticate with Terraform Cloud if you'd like to use it to manage your deploy state. 
   1. Set your AWS credentials (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_DEFAULT_REGION) in the Terraform Cloud workspace as sensitive environment variables. **(THEY MUST BE ENVIRONMENT VARIABLES, NOT TERRAFORM VARIABLES)**
   2. Set the name of your `workspace` and `organization` in the `terraform/main.tf` file.
8. Run `terraform init` in the `/terraform` directory to initialize the Terraform configuration
9. (Optional) Run `terraform plan` to see the changes that will be made
10. Run `terraform apply` to deploy the changes
11. In the `client` directory, run `pnpm run build`. Assuming the build looks good, you may then upload the build to S3 by running `aws s3 sync dist/ s3://djoz-portfolio` (if necessary, replace `djoz-portfolio` with your S3 bucket name).
12. Visit your domain name to see your site live!
13. If you are releasing an update, you should immediately invalidate the CloudFront cache, run `aws cloudfront create-invalidation --distribution-id <your-distribution-id> --paths "/*"`. It may still take a while for the cache to clear (15 to 60 minutes).

Test