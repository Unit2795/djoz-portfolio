/*
	======================================================================
	CONTACT ME LAMBDA
	======================================================================
*/
data "archive_file" "lambda_zip" {
	type        = "zip"
	source_file = "${path.cwd}/../lambda/index.js"
	output_path = "${path.module}/../lambda/lambda_function.zip"
}

resource "aws_lambda_function" "contact_function" {
	function_name    = "contact-me-${var.bucket_name}"
	filename         = data.archive_file.lambda_zip.output_path
	source_code_hash = data.archive_file.lambda_zip.output_base64sha256
	handler          = "index.handler"
	runtime          = "nodejs22.x"
	role             = aws_iam_role.lambda_exec.arn

	reserved_concurrent_executions = 1 # Limit to 1 concurrent execution

	environment {
		variables = {
			ADMIN_EMAIL = var.admin_email
		}
	}
}

resource "aws_iam_role" "lambda_exec" {
	name = "lambda-execution-role-${var.bucket_name}"

	assume_role_policy = jsonencode({
		Version = "2012-10-17"
		Statement = [{
			Action = "sts:AssumeRole"
			Effect = "Allow"
			Principal = {
				Service = "lambda.amazonaws.com"
			}
		}]
	})
}

resource "aws_iam_role_policy_attachment" "lambda_basic" {
	role       = aws_iam_role.lambda_exec.name
	policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "lambda_ses" {
	name = "lambda-ses-invoke-${var.bucket_name}"
	role = aws_iam_role.lambda_exec.id

	policy = jsonencode({
		Version = "2012-10-17"
		Statement = [
			{
				Effect = "Allow"
				Action = [
					"ses:SendEmail",
					"ses:SendRawEmail"
				]
				Resource = [
					aws_ses_email_identity.admin.arn
				]
			}
		]
	})
}

resource "aws_lambda_permission" "api" {
	statement_id  = "AllowAPIGatewayInvoke"
	action        = "lambda:InvokeFunction"
	function_name = aws_lambda_function.contact_function.function_name
	principal     = "apigateway.amazonaws.com"
	source_arn    = "${aws_apigatewayv2_api.api.execution_arn}/*/*/contact"
}



/*
	======================================================================
	AUTHORIZER LAMBDA
	======================================================================
*/
data "archive_file" "authorizer_zip" {
	type        = "zip"
	source_file = "${path.cwd}/../lambda/auth.js"
	output_path = "${path.module}/../lambda/auth_function.zip"
}

resource "aws_lambda_function" "quota_authorizer" {
	function_name  = "authorizer-${var.bucket_name}"
	filename = data.archive_file.authorizer_zip.output_path
	source_code_hash = data.archive_file.authorizer_zip.output_base64sha256
	role = aws_iam_role.authorizer_role.arn
	handler = "auth.handler"
	runtime = "nodejs22.x"

	environment {
		variables = {
			TABLE_NAME = aws_dynamodb_table.api_quota.name
			MONTHLY_LIMIT = "10"
		}
	}
}

resource "aws_iam_role" "authorizer_role" {
	name = "authorizer-role-${var.bucket_name}"

	assume_role_policy = jsonencode({
		Version = "2012-10-17"
		Statement = [{
			Action = "sts:AssumeRole"
			Effect = "Allow"
			Principal = {
				Service = "lambda.amazonaws.com"
			}
		}]
	})
}

resource "aws_iam_role_policy_attachment" "auth_basic" {
	role       = aws_iam_role.authorizer_role.name
	policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "dynamodb_access" {
	role = aws_iam_role.authorizer_role.name

	policy = jsonencode({
		Version = "2012-10-17"
		Statement = [{
			Action   = [
				"dynamodb:UpdateItem",
				"dynamodb:GetItem",
				"dynamodb:PutItem"
			]
			Effect   = "Allow"
			Resource = aws_dynamodb_table.api_quota.arn
		}]
	})
}

resource "aws_lambda_permission" "auth_api" {
	statement_id  = "AllowAPIGatewayInvoke"
	action        = "lambda:InvokeFunction"
	function_name = aws_lambda_function.quota_authorizer.function_name
	principal     = "apigateway.amazonaws.com"
	source_arn    = "${aws_apigatewayv2_api.api.execution_arn}/*/*"
}
