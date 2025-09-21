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

variable "admin_email" {
  description = "Email address for the admin user you will send emails to"
  type        = string
}

variable "dwell_cookie_name" {
  type        = string
  description = "Name of the dwell cookie. Leave empty to disable dwell time feature."
  default     = "dwellstamp"
}

variable "disable_honeypot" {
  type        = string
  description = "set to 'true' to disable honeypot anti-spam feature"
  default     = "false"
}

/* 
	⚠️NOTE! This should be a long, random string. Change it every once in a while for better security.
 */
variable "hmac_secret" {
  type        = string
  description = "Secret for signing dwell cookie (HMAC-SHA256)"
  sensitive   = true
}

/* 
	Optional: Set to your domain (e.g., .example.com) to share cookie across subdomains.
	Leave empty ("") to skip setting the Domain attribute on the cookie.
	The default is to use the same domain as the API. So unless you alter the terraform resources, this can be left empty.
 */
variable "cookie_domain" {
  type        = string
  description = "Cookie Domain attribute (e.g., .example.com) for dwell cookie. Leave empty to skip."
  default     = ""
}

variable "min_dwell_seconds" {
  type        = number
  description = "Minimum dwell time in seconds to count as a valid visit"
  default     = 15
}

variable "max_dwell_seconds" {
  type        = number
  description = "Maximum dwell time in seconds to count as a valid visit"
  default     = 86400
}

variable "contact_max" {
  type        = number
  description = "Maximum number of contact form submissions allowed per month"
  default     = 10
}
