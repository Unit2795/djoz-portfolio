# S3 bucket used to store the static files
resource "aws_s3_bucket" "spa_bucket" {
	bucket = var.bucket_name
}

# Ensure bucket access is restricted to the owner
resource "aws_s3_bucket_acl" "spa_bucket_acl" {
	bucket = aws_s3_bucket.spa_bucket.id
	acl    = "private"
}

# Disable public access to the S3 bucket
resource "aws_s3_bucket_public_access_block" "spa_bucket_access" {
	bucket = aws_s3_bucket.spa_bucket.id

	block_public_acls       = true
	block_public_policy     = true
	ignore_public_acls      = true
	restrict_public_buckets = true
}

# Create CloudFront Origin Access Identity (OAI)
resource "aws_cloudfront_origin_access_identity" "oai" {
	comment = "OAI for ${var.domain_name}"
}

# Create IAM policy that will allow CloudFront to access the S3 bucket
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