# Create ACM certificate
resource "aws_acm_certificate" "cert" {
	provider          = aws.us-east-1  # WARNING! CloudFront requires certificates in us-east-1
	domain_name       = var.domain_name
	validation_method = "DNS"
	subject_alternative_names = ["www.${var.domain_name}"]

	lifecycle {
		create_before_destroy = true
	}
}

# Check the validation status of the SSL certificate
resource "aws_acm_certificate_validation" "validation" {
	certificate_arn   = aws_acm_certificate.cert.arn
	validation_record_fqdns = [for record in aws_route53_record.validation_records : record.fqdn]
}


# Fetch the Route 53 zone ID for the domain
data "aws_route53_zone" "zone" {
	name         = var.domain_name
	private_zone = false
}

# Create Route 53 records for certificate validation
resource "aws_route53_record" "validation_records" {
	for_each = {
		for dvo in aws_acm_certificate.cert.domain_validation_options : dvo.domain_name => {
			name   = dvo.resource_record_name
			record = dvo.resource_record_value
			type   = dvo.resource_record_type
		}
	}

	allow_overwrite = true
	name            = each.value.name
	records         = [each.value.record]
	ttl             = 3600
	type            = each.value.type
	zone_id         = data.aws_route53_zone.zone.zone_id
}
