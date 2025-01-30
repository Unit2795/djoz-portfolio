# S3 bucket used to store the static files
resource "aws_s3_bucket" "spa_bucket" {
	bucket = var.bucket_name
}

# Disable public access to the S3 bucket
resource "aws_s3_bucket_public_access_block" "spa_bucket_access" {
	bucket = aws_s3_bucket.spa_bucket.id

	block_public_acls       = true
	block_public_policy     = true
	ignore_public_acls      = true
	restrict_public_buckets = true
}

# Disable ACLs for the S3 bucket
resource "aws_s3_bucket_ownership_controls" "spa_bucket" {
	bucket = aws_s3_bucket.spa_bucket.id
	rule {
		object_ownership = "BucketOwnerEnforced"
	}
}

# Explicitly disable versioning for the S3 bucket, feel free to enable it if you need it
resource "aws_s3_bucket_versioning" "spa_bucket" {
	bucket = aws_s3_bucket.spa_bucket.id
	versioning_configuration {
		status = "Disabled"
	}
}

resource "aws_cloudfront_origin_access_control" "website" {
	name                              = "${var.bucket_name}-oac"
	description                       = "OAC for ${var.bucket_name}"
	origin_access_control_origin_type = "s3"
	signing_behavior                  = "always"
	signing_protocol                  = "sigv4"
}

resource "aws_s3_bucket_policy" "default" {
	bucket = aws_s3_bucket.spa_bucket.id
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
			"${aws_s3_bucket.spa_bucket.arn}/*"
		]

		condition {
			test     = "StringEquals"
			variable = "AWS:SourceArn"
			values   = [aws_cloudfront_distribution.spa_distribution.arn]
		}
	}
}