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

variable "disable_contactform" {
  type        = bool
  description = "set to true to disable contact form infrastructure"
  default     = false
}

variable "disable_analytics" {
  type        = bool
  description = "set to true to disable analytics infrastructure"
  default     = false
}

variable "disable_dwelltime" {
  type        = bool
  description = "set to true to disable dwell time tracking infrastructure"
  default     = false
}

variable "disable_honeypot" {
  type        = bool
  description = "set to true to disable honeypot anti-spam feature"
  default     = false
}

variable "dwell_cookie_name" {
  type        = string
  description = "Name of the dwelltime cookie, use empty string to use default"
  default     = "dwellstamp"
}

/* 
	⚠️NOTE! This should be a long, random string. Change it every once in a while for better security.
 */
variable "hmac_secret" {
  type        = string
  description = "Secret for signing dwell cookie. Use a long, random string."
  sensitive   = true
}

/* 
	Optional: Set to your domain (e.g., .example.com) to share the dwell time cookie across subdomains.
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

variable "cookie_general_error" {
  type        = string
  description = "General error message for cookie issues"
  default     = "Please enable cookies and try again. If the problem persists, contact the site administrator directly."
}

variable "cookie_too_soon_error" {
  type        = string
  description = "Error message when form is submitted too quickly"
  default     = "For security reasons, your submission was too fast to process. Please resubmit after a moment."
}

variable "cookie_too_old_error" {
  type        = string
  description = "Error message when form submission cookie is too old"
  default     = "The form has expired. Please refresh the page and try again."
}

variable "email_invalid_error" {
  type        = string
  description = "Error message for invalid email addresses"
  default     = "The email address you entered is not valid. Please check and try again."
}

variable "message_invalid_error" {
  type        = string
  description = "Error message for invalid message content"
  default     = "The message you entered is not valid. Please check and try again."
}
