locals {
  api_origin_id   = "ApiGatewayOrigin"
  api_domain_name = try(trimprefix(aws_apigatewayv2_api.api[0].api_endpoint, "https://"), null)
  lambda_runtime  = "nodejs24.x"

  # Shared by every Lambda execution role
  lambda_assume_role_policy = jsonencode({
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

/*
	======================================================================
	SIMPLE EMAIL SERVICE
	======================================================================
*/
/*
  v2 created an SES identity here (domain or email, per ses_identity_type) for its built-in contact form.
  contact-api can send from it but doesn't manage it. These blocks drop it from state without deleting it,
  and do nothing if it isn't in state. Removing them before one apply has run would destroy the identity.
*/
removed {
  from = aws_ses_domain_identity.admin
  lifecycle {
    destroy = false
  }
}

removed {
  from = aws_ses_email_identity.admin
  lifecycle {
    destroy = false
  }
}

/*
	======================================================================
	API GATEWAY V2 HTTP API
	======================================================================
*/
resource "aws_apigatewayv2_api" "api" {
  count         = var.disable_analytics ? 0 : 1
  name          = "api-${var.bucket_name}"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_stage" "stage" {
  count       = var.disable_analytics ? 0 : 1
  api_id      = aws_apigatewayv2_api.api[0].id
  name        = "$default"
  auto_deploy = true

  default_route_settings {
    throttling_burst_limit = 50
    throttling_rate_limit  = 10
  }
}

/*
	======================================================================
	Lambda Integrations and Routes
	======================================================================
*/
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
	INGEST (ANALYTICS) LAMBDA
	======================================================================
*/
# Zips the bundle built by `pnpm lambda:build`
data "archive_file" "ingest" {
  count            = var.disable_analytics ? 0 : 1
  type             = "zip"
  source_file      = "${path.module}/../lambda/functions/analytics-ingest/dist/index.js"
  output_path      = "${path.module}/../lambda/functions/analytics-ingest/dist/index.zip"
  output_file_mode = "0644" # Same zip hash on every OS, so a local apply doesn't redeploy the Lambda
}

resource "aws_lambda_function" "ingest" {
  count            = var.disable_analytics ? 0 : 1
  function_name    = "analytics-ingest-${var.bucket_name}"
  role             = aws_iam_role.ingest[0].arn
  handler          = "index.handler"
  runtime          = local.lambda_runtime
  architectures    = ["arm64"]
  filename         = data.archive_file.ingest[0].output_path
  source_code_hash = data.archive_file.ingest[0].output_base64sha256
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

  assume_role_policy = local.lambda_assume_role_policy
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
data "archive_file" "processor" {
  count            = var.disable_analytics ? 0 : 1
  type             = "zip"
  source_file      = "${path.module}/../lambda/functions/analytics-processor/dist/index.js"
  output_path      = "${path.module}/../lambda/functions/analytics-processor/dist/index.zip"
  output_file_mode = "0644"
}

resource "aws_lambda_function" "processor" {
  count            = var.disable_analytics ? 0 : 1
  function_name    = "analytics-processor-${var.bucket_name}"
  role             = aws_iam_role.processor[0].arn
  handler          = "index.handler"
  runtime          = local.lambda_runtime
  architectures    = ["arm64"]
  filename         = data.archive_file.processor[0].output_path
  source_code_hash = data.archive_file.processor[0].output_base64sha256
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

  assume_role_policy = local.lambda_assume_role_policy
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
  # Allows a destroy to succeed, but deletes all collected analytics with it
  force_destroy = true
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
