output "cloudfront_distribution_domain" {
  description = "Domain name of the CloudFront distribution"
  value       = aws_cloudfront_distribution.spa_distribution.domain_name
}

output "cloudfront_distribution_id" {
  description = "ID of the CloudFront distribution"
  value       = aws_cloudfront_distribution.spa_distribution.id
}

output "s3_bucket_name" {
  description = "Name of the S3 bucket containing your static files"
  value       = aws_s3_bucket.spa_bucket.id
}

output "route53_domain" {
  description = "Domain name of the Route 53 record that CloudFront has been attached to"
  value       = aws_route53_record.root_domain.fqdn
}

output "api_endpoint" {
  description = "Public API endpoint for contact form"
  value       = "https://${var.domain_name}/api/contact"
}

output "ingest_endpoint" {
  description = "Public API endpoint for analytics ingest"
  value       = "https://${var.domain_name}/api/ingest"
}

output "analytics_bucket_name" {
  value       = aws_s3_bucket.analytics.bucket
  description = "S3 bucket for gzipped NDJSON files"
}

output "analytics_queue_url" {
  value       = aws_sqs_queue.analytics.id
  description = "SQS queue URL for analytics processing"
}
