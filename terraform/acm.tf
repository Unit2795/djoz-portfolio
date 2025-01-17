# Create ACM certificate
resource "aws_acm_certificate" "cert" {
	provider          = aws.us-east-1  # WARNING! CloudFront requires certificates in us-east-1
	domain_name       = var.domain_name
	validation_method = "DNS"

	lifecycle {
		create_before_destroy = true
	}
}

resource "aws_acm_certificate_validation" "certificate_validation" {
	certificate_arn   = aws_acm_certificate.cert.arn
}