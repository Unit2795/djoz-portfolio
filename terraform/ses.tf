# EMAIL based identity
# resource "aws_ses_email_identity" "admin" {
# 	email = var.admin_email
# }

/*
DOMAIN based identity

⚠️ Note!

1. If you wish to use a domain based identity, you will need to create the domain in the AWS SES console. Verify it by adding the DNS records to your domain's DNS settings (If you are using Route53, AWS can do this automatically). This Terraform config does NOT create the DNS records for you.
2. If you wish to use a separate email sending domain from the one the site is deployed on, you'll need to add it to the tf variables separate from the domain name the SPA is deployed to.
3. Update the lambda IAM policy to use the domain identity ARN instead of the email identity ARN.
*/
resource "aws_ses_domain_identity" "admin" {
	domain = var.domain_name
}
