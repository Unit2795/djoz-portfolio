variable "aws_region" {
	description = "AWS region for the S3 bucket"
	type        = string
	default     = "us-east-1"
}

variable "bucket_name" {
	description = "Name of the S3 bucket to store the React app"
	type        = string
}

variable "domain_name" {
	description = "Domain name for the application (e.g., app.example.com)"
	type        = string
}

variable "admin_email" {
	description = "Email address for the admin user you will send emails to"
	type = string
}