resource "aws_dynamodb_table" "api_quota" {
	name         = "api-quota-${var.bucket_name}"
	billing_mode = "PAY_PER_REQUEST"
	hash_key     = "id"

	attribute {
		name = "id"
		type = "N"
	}
}