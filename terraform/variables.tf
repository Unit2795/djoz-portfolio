variable "aws_region" {
  description = "AWS region for the S3 bucket"
  type        = string
  default     = "us-east-1"
}

variable "bucket_name" {
  description = "Name of the S3 bucket to store the app"
  type        = string
}

variable "domain_name" {
  description = "Domain name for the application (e.g., app.example.com)"
  type        = string
}

variable "disable_analytics" {
  type        = bool
  description = "set to true to disable analytics infrastructure"
  default     = false
}

variable "disable_contactform" {
  type        = bool
  description = "set to true to disable the contact form's CloudFront routing to contact-api (also set sections.CONTACT.disabled in the client content)"
  default     = false
}

variable "contact_api_site_id" {
  type        = string
  description = "This site's id in your contact-api config, used to read its site key from SSM (/contact-api/sites/<id>/origin-key)"
  default     = "portfolio"
}
