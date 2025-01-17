# Create CloudFront distribution
resource "aws_cloudfront_distribution" "spa_distribution" {
	enabled             = true
	is_ipv6_enabled     = true
	default_root_object = "index.html"
	aliases             = [var.domain_name]

	origin {
		domain_name = aws_s3_bucket.spa_bucket.bucket_regional_domain_name
		origin_id   = "S3OriginPortfolio"

		s3_origin_config {
			origin_access_identity = aws_cloudfront_origin_access_identity.oai.cloudfront_access_identity_path
		}
	}

	custom_error_response {
		error_code         = 404
		response_code      = 200
		response_page_path = "/index.html"
	}

	custom_error_response {
		error_code         = 403
		response_code      = 200
		response_page_path = "/index.html"
	}

	default_cache_behavior {
		allowed_methods        = ["GET", "HEAD", "OPTIONS"]
		cached_methods         = ["GET", "HEAD", "OPTIONS"]
		target_origin_id       = "S3OriginPortfolio"
		viewer_protocol_policy = "redirect-to-https"
		compress              = true

		forwarded_values {
			query_string = false
			cookies {
				forward = "none"
			}
		}

		min_ttl     = 0
		default_ttl = 3600
		max_ttl     = 86400
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

	price_class = "PriceClass_100"
	tags        = var.tags

	# Wait for certificate validation before creating distribution
	depends_on = [aws_acm_certificate_validation.certificate_validation]
}