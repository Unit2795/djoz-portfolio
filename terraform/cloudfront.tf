locals {
	s3_origin_id = "PortfolioS3Origin"
}

resource "aws_cloudfront_cache_policy" "website" {
	name        = "${var.bucket_name}-cache-policy"
	comment     = "Cache policy for ${var.bucket_name}"
	min_ttl     = 604800    # 7 days
	default_ttl = 2592000   # 30 days
	max_ttl     = 7776000   # 90 days

	parameters_in_cache_key_and_forwarded_to_origin {
		enable_accept_encoding_brotli = true
		enable_accept_encoding_gzip   = true

		cookies_config {
			cookie_behavior = "none"
		}

		headers_config {
			header_behavior = "none"
		}

		query_strings_config {
			query_string_behavior = "none"
		}
	}
}

resource "aws_cloudfront_distribution" "spa_distribution" {
	enabled = true
	is_ipv6_enabled  = true
	default_root_object = "index.html"
	price_class = "PriceClass_100"
	aliases = [var.domain_name, "www.${var.domain_name}"]

	origin {
		domain_name = aws_s3_bucket.spa_bucket.bucket_regional_domain_name
		origin_access_control_id = aws_cloudfront_origin_access_control.website.id
		origin_id = local.s3_origin_id
	}

	default_cache_behavior {
		allowed_methods = ["GET", "HEAD", "OPTIONS"]
		cached_methods = ["GET", "HEAD", "OPTIONS"]
		target_origin_id = local.s3_origin_id
		viewer_protocol_policy = "redirect-to-https"
		compress = true
		cache_policy_id = aws_cloudfront_cache_policy.website.id
	}

	custom_error_response {
		error_code = 404
		response_code = 200
		response_page_path = "/index.html"
	}

	custom_error_response {
		error_code = 403
		response_code = 200
		response_page_path = "/index.html"
	}

	restrictions {
		geo_restriction {
			restriction_type = "none"
		}
	}

	viewer_certificate {
		acm_certificate_arn      = aws_acm_certificate.cert.arn
		ssl_support_method       = "sni-only"
		minimum_protocol_version = "TLSv1.2_2021"
	}

	# Wait for certificate validation before creating distribution
	depends_on = [aws_acm_certificate_validation.validation]
}

# Add Route 53 alias ('A') DNS record for CloudFront distribution
resource "aws_route53_record" "root_domain" {
	zone_id = data.aws_route53_zone.zone.zone_id
	name    = var.domain_name
	type    = "A"
	alias {
		name                   = aws_cloudfront_distribution.spa_distribution.domain_name
		zone_id                = aws_cloudfront_distribution.spa_distribution.hosted_zone_id
		evaluate_target_health = false
	}
}

resource "aws_route53_record" "www_subdomain" {
	zone_id = data.aws_route53_zone.zone.zone_id
	name    = "www.${var.domain_name}"
	type    = "A"

	alias {
		name                   = aws_cloudfront_distribution.spa_distribution.domain_name
		zone_id                = aws_cloudfront_distribution.spa_distribution.hosted_zone_id
		evaluate_target_health = false
	}
}