output "certificate_validation_records" {
	description = "DNS records needed for certificate validation"
	value = {
		for dvo in aws_acm_certificate.cert.domain_validation_options : dvo.domain_name => {
			name   = dvo.resource_record_name
			record = dvo.resource_record_value
			type   = dvo.resource_record_type
		}
	}
}

output "cloudfront_distribution_domain" {
	description = "Domain name of the CloudFront distribution"
	value       = aws_cloudfront_distribution.spa_distribution.domain_name
}

output "s3_bucket_name" {
	description = "Name of the S3 bucket"
	value       = aws_s3_bucket.spa_bucket.id
}