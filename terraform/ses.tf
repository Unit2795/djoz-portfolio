resource "aws_ses_email_identity" "admin" {
	email = var.admin_email
}