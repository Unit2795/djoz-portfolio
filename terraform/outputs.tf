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
	value = aws_route53_record.root_domain.fqdn
}

output "api_endpoint" {
	description = "Endpoint of the API Gateway where the contact form is deployed"
	value = "${aws_apigatewayv2_stage.stage.invoke_url}/contact"
}