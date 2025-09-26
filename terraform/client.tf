locals {
  s3_origin_id = "PortfolioS3Origin"
}

/*
	======================================================================
	CLOUDFRONT DISTRIBUTION
	======================================================================
*/
resource "aws_cloudfront_distribution" "distro" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  price_class         = "PriceClass_100"
  aliases             = [var.domain_name, "www.${var.domain_name}"]

  origin {
    domain_name              = aws_s3_bucket.website_bucket.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.website_oac.id
    origin_id                = local.s3_origin_id
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD", "OPTIONS"]
    target_origin_id       = local.s3_origin_id
    viewer_protocol_policy = "redirect-to-https"
    compress               = true
    cache_policy_id        = aws_cloudfront_cache_policy.website_cache_policy.id
    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.www_redirect.arn
    }
  }

  custom_error_response {
    error_code         = 404
    response_code      = 200
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

  /*
    ======================================================================
    API Origin/Caching behaviors
    ======================================================================
  */
  # Add API Gateway as an origin so it can use the same domain as the website
  dynamic "origin" {
    for_each = local.disable_api ? [] : [1]
    content {
      domain_name = local.api_domain_name
      origin_id   = local.api_origin_id
      custom_origin_config {
        origin_protocol_policy = "https-only"
        https_port             = 443
        http_port              = 80
        origin_ssl_protocols   = ["TLSv1.2"]
      }
    }
  }
  # Disable caching for API requests and ensure all headers are forwarded
  dynamic "ordered_cache_behavior" {
    for_each = local.disable_api ? [] : [1]
    content {
      path_pattern             = "api/*"
      target_origin_id         = local.api_origin_id
      viewer_protocol_policy   = "redirect-to-https"
      allowed_methods          = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
      cached_methods           = ["GET", "HEAD", "OPTIONS"]
      cache_policy_id          = data.aws_cloudfront_cache_policy.no_cache.id
      origin_request_policy_id = data.aws_cloudfront_origin_request_policy.all_no_host.id
    }
  }
}

/*
	======================================================================
	CACHE POLICIES
	======================================================================
*/
resource "aws_cloudfront_cache_policy" "website_cache_policy" {
  name        = "${var.bucket_name}-cache-policy"
  comment     = "Cache policy for ${var.bucket_name}"
  min_ttl     = 604800  # 7 days
  default_ttl = 2592000 # 30 days
  max_ttl     = 7776000 # 90 days

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
# Cache policiies for the API (no caching, forward all headers)
data "aws_cloudfront_cache_policy" "no_cache" { name = "Managed-CachingDisabled" }
data "aws_cloudfront_origin_request_policy" "all_no_host" { name = "Managed-AllViewerExceptHostHeader" }

/*
	======================================================================
	CLOUDFRONT FUNCTION FOR WWW REDIRECT
	======================================================================
*/
resource "aws_cloudfront_function" "www_redirect" {
  name    = "${var.bucket_name}-www-redirect"
  runtime = "cloudfront-js-2.0"
  comment = "Redirect www to non-www"
  publish = true
  code    = file("${path.module}/../lambda/www-redirect.js")
}


/*
	======================================================================
	Route 53 DNS RECORDS
	======================================================================
*/
# Add Route 53 alias ('A') DNS record for CloudFront distribution
resource "aws_route53_record" "root_domain" {
  zone_id = data.aws_route53_zone.zone.zone_id
  name    = var.domain_name
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.distro.domain_name
    zone_id                = aws_cloudfront_distribution.distro.hosted_zone_id
    evaluate_target_health = false
  }
}

# Ensure that 'www' subdomain also points to the CloudFront distribution
resource "aws_route53_record" "www_subdomain" {
  zone_id = data.aws_route53_zone.zone.zone_id
  name    = "www.${var.domain_name}"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.distro.domain_name
    zone_id                = aws_cloudfront_distribution.distro.hosted_zone_id
    evaluate_target_health = false
  }
}

/*
	======================================================================
	ACM CERTIFICATE
	======================================================================
*/
resource "aws_acm_certificate" "cert" {
  provider                  = aws.us-east-1 # WARNING! CloudFront requires certificates in us-east-1
  domain_name               = var.domain_name
  validation_method         = "DNS"
  subject_alternative_names = ["www.${var.domain_name}"]

  lifecycle {
    create_before_destroy = true
  }
}

# Check the validation status of the SSL certificate
resource "aws_acm_certificate_validation" "validation" {
  certificate_arn         = aws_acm_certificate.cert.arn
  validation_record_fqdns = [for record in aws_route53_record.validation_records : record.fqdn]
  provider                = aws.us-east-1
}

# Fetch the Route 53 zone ID for the domain
data "aws_route53_zone" "zone" {
  name         = var.domain_name
  private_zone = false
}

# Create Route 53 DNS records for certificate validation
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

/*
	======================================================================
	S3 BUCKET WEBSITE FILE HOSTING
	======================================================================
*/
# S3 bucket used to store the static files
resource "aws_s3_bucket" "website_bucket" {
  bucket        = var.bucket_name
  force_destroy = true
}

# Disable public access to the S3 bucket
resource "aws_s3_bucket_public_access_block" "website_bucket_access" {
  bucket = aws_s3_bucket.website_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Disable ACLs for the S3 bucket
resource "aws_s3_bucket_ownership_controls" "website_bucket" {
  bucket = aws_s3_bucket.website_bucket.id
  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

# Explicitly disable versioning for the S3 bucket, feel free to enable it if you need it
resource "aws_s3_bucket_versioning" "website_bucket" {
  bucket = aws_s3_bucket.website_bucket.id
  versioning_configuration {
    status = "Disabled"
  }
}

resource "aws_cloudfront_origin_access_control" "website_oac" {
  name                              = "${var.bucket_name}-oac"
  description                       = "OAC for ${var.bucket_name}"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_s3_bucket_policy" "default" {
  bucket = aws_s3_bucket.website_bucket.id
  policy = data.aws_iam_policy_document.cloudfront_oac_access.json
}

data "aws_iam_policy_document" "cloudfront_oac_access" {
  statement {
    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    actions = [
      "s3:GetObject"
    ]

    resources = [
      "${aws_s3_bucket.website_bucket.arn}/*"
    ]

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.distro.arn]
    }
  }
}
