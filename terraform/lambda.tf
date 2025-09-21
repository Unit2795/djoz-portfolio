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
  timeout          = 10
  memory_size      = 128
  handler          = "index.handler"
  runtime          = "nodejs22.x"
  architectures    = ["arm64"]
  role             = aws_iam_role.lambda_exec.arn

  reserved_concurrent_executions = 1

  environment {
    variables = {
      ADMIN_EMAIL          = var.admin_email
      SUCCESS_REDIRECT     = "https://${var.domain_name}/form-success.html"
      ERROR_REDIRECT       = "https://${var.domain_name}/form-error.html"
      TABLE_NAME           = aws_dynamodb_table.api_quota.name
      IS_HONEYPOT_DISABLED = var.disable_honeypot
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
          aws_ses_domain_identity.admin.arn
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
  source_arn    = "${aws_apigatewayv2_api.api.execution_arn}/*/*/api/contact"
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
  function_name    = "authorizer-${var.bucket_name}"
  filename         = data.archive_file.authorizer_zip.output_path
  source_code_hash = data.archive_file.authorizer_zip.output_base64sha256
  role             = aws_iam_role.authorizer_role.arn
  timeout          = 5
  handler          = "auth.handler"
  runtime          = "nodejs22.x"
  architectures    = ["arm64"]
  memory_size      = 128

  environment {
    variables = {
      TABLE_NAME    = aws_dynamodb_table.api_quota.name
      MONTHLY_LIMIT = var.contact_max
      MIN_DWELL     = var.min_dwell_seconds
      MAX_DWELL     = var.max_dwell_seconds
      HMAC_SECRET   = var.hmac_secret
      COOKIE_NAME   = var.dwell_cookie_name
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
      Action = [
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

/*
	======================================================================
	STAMP LAMBDA
	======================================================================
*/
data "archive_file" "stamp_zip" {
  type        = "zip"
  source_file = "${path.cwd}/../lambda/stamp.js"
  output_path = "${path.module}/../lambda/stamp_function.zip"
}

resource "aws_lambda_function" "stamp_function" {
  function_name    = "stamp-${var.bucket_name}"
  filename         = data.archive_file.stamp_zip.output_path
  source_code_hash = data.archive_file.stamp_zip.output_base64sha256
  timeout          = 3
  memory_size      = 128
  handler          = "stamp.handler"
  runtime          = "nodejs22.x"
  architectures    = ["arm64"]
  role             = aws_iam_role.stamp_role.arn

  environment {
    variables = {
      HMAC_SECRET   = var.hmac_secret
      COOKIE_NAME   = var.dwell_cookie_name
      COOKIE_MAXAGE = var.max_dwell_seconds
      COOKIE_DOMAIN = var.cookie_domain
    }
  }
}

resource "aws_iam_role_policy_attachment" "stamp_basic" {
  role       = aws_iam_role.stamp_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role" "stamp_role" {
  name = "stamp-role-${var.bucket_name}"

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

resource "aws_lambda_permission" "stamp_api" {
  statement_id  = "AllowAPIGatewayInvokeStamp"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.stamp_function.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.api.execution_arn}/*/*/api/stamp.gif"
}
