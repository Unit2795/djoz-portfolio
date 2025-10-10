locals {
  disable_api   = var.disable_contactform && var.disable_analytics && var.disable_dwelltime
  api_origin_id = "ApiGatewayOrigin"
  api_domain_name = try(
    replace(aws_apigatewayv2_api.api[0].api_endpoint, "https://", ""),
    null
  )
}

/*
	======================================================================
	SIMPLE EMAIL SERVICE
	======================================================================
*/
# EMAIL based identity
resource "aws_ses_email_identity" "admin" {
  count = var.ses_identity_type == "email" && !local.disable_api ? 1 : 0
  email = var.admin_email
}

/*
DOMAIN based identity

⚠️ Note!

1. If you wish to use a domain based identity, you will need to create the domain in the AWS SES console. Verify it by adding the DNS records to your domain's DNS settings (If you are using Route53, AWS can do this automatically). This Terraform config does NOT create the DNS records for you.
2. If you wish to use a separate email sending domain from the one the site is deployed on, you'll need to add it to the tf variables separate from the domain name the SPA is deployed to.
3. Update the lambda IAM policy to use the domain identity ARN instead of the email identity ARN.
*/
resource "aws_ses_domain_identity" "admin" {
  count  = var.ses_identity_type == "domain" && !local.disable_api ? 1 : 0
  domain = var.domain_name
}

locals {
  ses_identity_arn = try(
    aws_ses_domain_identity.admin[0].arn,
    aws_ses_email_identity.admin[0].arn,
    null
  )
}


/*
	======================================================================
	API GATEWAY V2 HTTP API
	======================================================================
*/
resource "aws_apigatewayv2_api" "api" {
  count         = local.disable_api ? 0 : 1
  name          = "api-${var.bucket_name}"
  protocol_type = "HTTP"
  cors_configuration {
    allow_origins     = ["https://${var.domain_name}", "https://www.${var.domain_name}"]
    allow_methods     = ["POST", "GET", "OPTIONS"]
    allow_headers     = ["content-type"]
    allow_credentials = true
    max_age           = 3600
  }
}

resource "aws_apigatewayv2_stage" "stage" {
  count       = local.disable_api ? 0 : 1
  api_id      = aws_apigatewayv2_api.api[0].id
  name        = "$default"
  auto_deploy = true

  default_route_settings {
    throttling_burst_limit = 1
    throttling_rate_limit  = 1
  }

  route_settings {
    route_key              = aws_apigatewayv2_route.ingest[0].route_key
    throttling_burst_limit = 50
    throttling_rate_limit  = 10
  }
}

/*
	======================================================================
	Lambda Integrations and Routes
	======================================================================
*/
resource "aws_apigatewayv2_integration" "contactme" {
  count                  = var.disable_contactform ? 0 : 1
  api_id                 = aws_apigatewayv2_api.api[0].id
  integration_type       = "AWS_PROXY"
  integration_method     = "POST"
  integration_uri        = aws_lambda_function.contactme[0].invoke_arn
  payload_format_version = "2.0"
}
resource "aws_apigatewayv2_route" "contactme" {
  count              = var.disable_contactform ? 0 : 1
  api_id             = aws_apigatewayv2_api.api[0].id
  route_key          = "POST /api/contact"
  target             = "integrations/${aws_apigatewayv2_integration.contactme[0].id}"
  authorization_type = "NONE"
}

resource "aws_apigatewayv2_integration" "stamp" {
  count                  = var.disable_dwelltime ? 0 : 1
  api_id                 = aws_apigatewayv2_api.api[0].id
  integration_type       = "AWS_PROXY"
  integration_method     = "POST"
  integration_uri        = aws_lambda_function.stamp[0].invoke_arn
  payload_format_version = "2.0"
}
resource "aws_apigatewayv2_route" "stamp" {
  count              = var.disable_dwelltime ? 0 : 1
  api_id             = aws_apigatewayv2_api.api[0].id
  route_key          = "GET /api/stamp.gif"
  target             = "integrations/${aws_apigatewayv2_integration.stamp[0].id}"
  authorization_type = "NONE"
}

resource "aws_apigatewayv2_integration" "ingest" {
  count                  = var.disable_analytics ? 0 : 1
  api_id                 = aws_apigatewayv2_api.api[0].id
  integration_type       = "AWS_PROXY"
  integration_method     = "POST"
  integration_uri        = aws_lambda_function.ingest[0].invoke_arn
  payload_format_version = "2.0"
}
resource "aws_apigatewayv2_route" "ingest" {
  count              = var.disable_analytics ? 0 : 1
  api_id             = aws_apigatewayv2_api.api[0].id
  route_key          = "POST /api/ingest"
  target             = "integrations/${aws_apigatewayv2_integration.ingest[0].id}"
  authorization_type = "NONE"
}

/*
	======================================================================
	CONTACT ME LAMBDA
	======================================================================
*/
locals {
  contactme_zip = "${path.module}/../lambda/functions/contactme/index.zip"
}

resource "aws_lambda_function" "contactme" {
  count            = var.disable_contactform ? 0 : 1
  function_name    = "contactme-${var.bucket_name}"
  filename         = local.contactme_zip
  source_code_hash = filebase64sha256(local.contactme_zip)
  timeout          = 10
  memory_size      = 2048
  handler          = "index.handler"
  runtime          = "nodejs22.x"
  architectures    = ["arm64"]
  role             = aws_iam_role.contactme[0].arn

  reserved_concurrent_executions = 1

  environment {
    variables = {
      ADMIN_EMAIL           = var.admin_email
      SUCCESS_REDIRECT      = "https://${var.domain_name}/form-success.html"
      ERROR_REDIRECT        = "https://${var.domain_name}/form-error.html"
      TABLE_NAME            = aws_dynamodb_table.api_quota[0].name
      IS_HONEYPOT_DISABLED  = var.disable_honeypot
      MONTHLY_LIMIT         = var.contact_max
      MIN_DWELL             = var.min_dwell_seconds
      MAX_DWELL             = var.max_dwell_seconds
      HMAC_SECRET           = var.hmac_secret
      COOKIE_NAME           = var.dwell_cookie_name
      GENERAL_COOKIE_ERROR  = var.cookie_general_error
      TOO_SOON_ERROR        = var.cookie_too_soon_error
      TOO_OLD_ERROR         = var.cookie_too_old_error
      EMAIL_INVALID_ERROR   = var.email_invalid_error
      MESSAGE_INVALID_ERROR = var.message_invalid_error
      DISABLE_DWELLTIME     = var.disable_dwelltime
    }
  }
}

resource "aws_iam_role" "contactme" {
  count = var.disable_contactform ? 0 : 1
  name  = "contactme-execution-role-${var.bucket_name}"

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

resource "aws_iam_role_policy_attachment" "contactme_basic" {
  count      = var.disable_contactform ? 0 : 1
  role       = aws_iam_role.contactme[0].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "contactme" {
  count = var.disable_contactform ? 0 : 1
  name  = "contactme-${var.bucket_name}"
  role  = aws_iam_role.contactme[0].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["ses:SendEmail", "ses:SendRawEmail"]
        Resource = local.ses_identity_arn
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:UpdateItem",
          "dynamodb:GetItem",
          "dynamodb:PutItem"
        ]
        Resource = aws_dynamodb_table.api_quota[0].arn
      }
    ]
  })
}

resource "aws_lambda_permission" "contactme_api" {
  count         = var.disable_contactform ? 0 : 1
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.contactme[0].function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.api[0].execution_arn}/*/*/api/contact"
}

/*
	======================================================================
	STAMP LAMBDA
	======================================================================
*/
locals {
  stamp_zip = "${path.module}/../lambda/functions/stamp/index.zip"
}

resource "aws_lambda_function" "stamp" {
  count            = var.disable_dwelltime ? 0 : 1
  function_name    = "stamp-${var.bucket_name}"
  filename         = local.stamp_zip
  source_code_hash = filebase64sha256(local.stamp_zip)
  timeout          = 5
  memory_size      = 256
  handler          = "index.handler"
  runtime          = "nodejs22.x"
  architectures    = ["arm64"]
  role             = aws_iam_role.stamp[0].arn


  environment {
    variables = {
      HMAC_SECRET   = var.hmac_secret
      COOKIE_NAME   = var.dwell_cookie_name
      COOKIE_MAXAGE = var.max_dwell_seconds
      COOKIE_DOMAIN = var.cookie_domain
    }
  }
}

resource "aws_iam_role" "stamp" {
  count = var.disable_dwelltime ? 0 : 1
  name  = "stamp-role-${var.bucket_name}"

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

resource "aws_iam_role_policy_attachment" "stamp_basic" {
  count      = var.disable_dwelltime ? 0 : 1
  role       = aws_iam_role.stamp[0].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_lambda_permission" "stamp_api" {
  count         = var.disable_dwelltime ? 0 : 1
  statement_id  = "AllowAPIGatewayInvokeStamp"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.stamp[0].function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.api[0].execution_arn}/*/*/api/stamp.gif"
}


/*
	======================================================================
	INGEST (ANALYTICS) LAMBDA
	======================================================================
*/
locals {
  ingest_zip = "${path.module}/../lambda/functions/analytics-ingest/index.zip"
}

resource "aws_lambda_function" "ingest" {
  count            = var.disable_analytics ? 0 : 1
  function_name    = "analytics-ingest-${var.bucket_name}"
  role             = aws_iam_role.ingest[0].arn
  handler          = "index.handler"
  runtime          = "nodejs22.x"
  architectures    = ["arm64"]
  filename         = local.ingest_zip
  source_code_hash = filebase64sha256(local.ingest_zip)
  timeout          = 5
  memory_size      = 256

  environment {
    variables = {
      QUEUE_URL = aws_sqs_queue.analytics[0].id
    }
  }
}

resource "aws_iam_role" "ingest" {
  count = var.disable_analytics ? 0 : 1
  name  = "ingest-role-${var.bucket_name}"

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

resource "aws_iam_role_policy_attachment" "ingest_basic" {
  count      = var.disable_analytics ? 0 : 1
  role       = aws_iam_role.ingest[0].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "ingest" {
  count = var.disable_analytics ? 0 : 1
  name  = "ingest-policy-${var.bucket_name}"
  role  = aws_iam_role.ingest[0].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "sqs:SendMessage",
          "sqs:SendMessageBatch"
        ]
        Resource = [
          aws_sqs_queue.analytics[0].arn
        ]
      }
    ]
  })
}

resource "aws_lambda_permission" "ingest_api" {
  count         = var.disable_analytics ? 0 : 1
  statement_id  = "AllowAPIGwInvokeIngest"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.ingest[0].function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.api[0].execution_arn}/*/*/api/ingest"
}

/*
	======================================================================
	PROCESSOR (ANALYTICS) LAMBDA
	======================================================================
*/
locals {
  processor_zip = "${path.module}/../lambda/functions/analytics-processor/index.zip"
}

resource "aws_lambda_function" "processor" {
  count            = var.disable_analytics ? 0 : 1
  function_name    = "analytics-processor-${var.bucket_name}"
  role             = aws_iam_role.processor[0].arn
  handler          = "index.handler"
  runtime          = "nodejs22.x"
  architectures    = ["arm64"]
  filename         = local.processor_zip
  source_code_hash = filebase64sha256(local.processor_zip)
  timeout          = 900
  memory_size      = 2048


  environment {
    variables = {
      QUEUE_URL     = aws_sqs_queue.analytics[0].id
      BUCKET        = aws_s3_bucket.analytics[0].bucket
      FUNCTION_NAME = "analytics-processor-${var.bucket_name}"
    }
  }
}

resource "aws_iam_role" "processor" {
  count = var.disable_analytics ? 0 : 1
  name  = "processor-role-${var.bucket_name}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "processor_basic" {
  count      = var.disable_analytics ? 0 : 1
  role       = aws_iam_role.processor[0].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "processor" {
  count = var.disable_analytics ? 0 : 1
  name  = "processor-policy-${var.bucket_name}"
  role  = aws_iam_role.processor[0].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:DeleteMessageBatch",
          "sqs:GetQueueAttributes"
        ]
        Resource = [
          aws_sqs_queue.analytics[0].arn
        ]
      },
      {
        Action = [
          "s3:PutObject"
        ]
        Effect   = "Allow"
        Resource = "${aws_s3_bucket.analytics[0].arn}/*"
      },
      {
        Effect = "Allow"
        Action = [
          "lambda:InvokeFunction"
        ]
        Resource = aws_lambda_function.processor[0].arn
      }
    ]
  })
}

/*
	======================================================================
	ANALYTICS S3 DUMP (no versioning, no encryption)
	======================================================================
*/
resource "aws_s3_bucket" "analytics" {
  count  = var.disable_analytics ? 0 : 1
  bucket = "analytics-dump-${var.bucket_name}"
}

# Keep public access blocked!
resource "aws_s3_bucket_public_access_block" "analytics_pab" {
  count                   = var.disable_analytics ? 0 : 1
  bucket                  = aws_s3_bucket.analytics[0].id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

/*
	======================================================================
	ANALYTICS SQS (no DLQ! Keep costs/objects minimal)
	======================================================================
*/
resource "aws_sqs_queue" "analytics" {
  count                      = var.disable_analytics ? 0 : 1
  name                       = "${var.bucket_name}-analytics-events"
  visibility_timeout_seconds = 600
  message_retention_seconds  = 345600 # 4 days
}


/*
	======================================================================
	ANALYTICS CloudWatch Event to trigger the processor lambda
	======================================================================
*/
resource "aws_cloudwatch_event_rule" "processor_schedule" {
  count = var.disable_analytics ? 0 : 1
  name  = "analytics-processor-event-${var.bucket_name}"
  # Run once a day at 00:01 UTC
  schedule_expression = "cron(1 0 * * ? *)"
}

resource "aws_cloudwatch_event_target" "processor_target" {
  count     = var.disable_analytics ? 0 : 1
  rule      = aws_cloudwatch_event_rule.processor_schedule[0].name
  target_id = "processor"
  arn       = aws_lambda_function.processor[0].arn
}

resource "aws_lambda_permission" "events_invoke_processor" {
  count         = var.disable_analytics ? 0 : 1
  statement_id  = "AllowExecutionFromEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.processor[0].function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.processor_schedule[0].arn
}

/*
	======================================================================
	DynamoDB Table for Contact Me API Quotas
	======================================================================
*/
resource "aws_dynamodb_table" "api_quota" {
  count        = var.disable_contactform ? 0 : 1
  name         = "api-quota-${var.bucket_name}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "N"
  }
}
