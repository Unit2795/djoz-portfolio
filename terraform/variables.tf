variable "cloud_organization" {
	description = "Name of the organization in Terraform Cloud"
	type        = string
}

variable "workspace_name" {
	description = "Name of the workspace in Terraform Cloud"
	type        = string
}

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

variable "tags" {
	description = "Tags to apply to resources"
	type        = map(string)
	default     = {}
}