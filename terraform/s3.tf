# Create S3 bucket for hosting the React app
resource "aws_s3_bucket" "spa_bucket" {
	bucket = var.bucket_name
}

# Block all public access to the S3 bucket
resource "aws_s3_bucket_public_access_block" "spa_bucket_access" {
	bucket = aws_s3_bucket.spa_bucket.id

	block_public_acls       = true
	block_public_policy     = true
	ignore_public_acls      = true
	restrict_public_buckets = true
}

# Enable versioning on the S3 bucket
resource "aws_s3_bucket_versioning" "spa_bucket_versioning" {
	bucket = aws_s3_bucket.spa_bucket.id
	versioning_configuration {
		status = "Enabled"
	}
}

# Create CloudFront Origin Access Identity (OAI)
resource "aws_cloudfront_origin_access_identity" "oai" {
	comment = "OAI for ${var.domain_name}"
}

# Create S3 bucket policy
data "aws_iam_policy_document" "s3_policy" {
	statement {
		actions   = ["s3:GetObject"]
		resources = ["${aws_s3_bucket.spa_bucket.arn}/*"]

		principals {
			type        = "AWS"
			identifiers = [aws_cloudfront_origin_access_identity.oai.iam_arn]
		}
	}
}

# Attach the policy to the S3 bucket
resource "aws_s3_bucket_policy" "bucket_policy" {
	bucket = aws_s3_bucket.spa_bucket.id
	policy = data.aws_iam_policy_document.s3_policy.json
}