/*
	======================================================================
	S3 (no versioning, no encryption)
	======================================================================
*/
resource "aws_s3_bucket" "analytics" {
  bucket = "${var.bucket_name}-analytics-dump"
}

# Keep public access blocked
resource "aws_s3_bucket_public_access_block" "pab" {
  bucket                  = aws_s3_bucket.analytics.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

/*
	======================================================================
	SQS (no DLQ to keep costs/objects minimal)
	======================================================================
*/
resource "aws_sqs_queue" "analytics" {
  name                       = "${var.bucket_name}-analytics-events"
  visibility_timeout_seconds = 600
  message_retention_seconds  = 345600 # 4 days
}

/*
	======================================================================
	Ingest IAM Role
	======================================================================
*/
resource "aws_iam_role" "ingest" {
  name = "ingest-role-${var.bucket_name}"

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

resource "aws_iam_role_policy" "ingest_policy" {
  name = "ingest-policy-${var.bucket_name}"
  role = aws_iam_role.ingest.id

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
          aws_sqs_queue.analytics.arn
        ]
      }
    ]
  })
}

# Allow API Gateway to invoke the ingest lambda
resource "aws_lambda_permission" "apigw_invoke_ingest" {
  statement_id  = "AllowAPIGwInvokeIngest"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.ingest.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.api.execution_arn}/*/*/ingest"
}

resource "aws_iam_role_policy_attachment" "ingest_basic" {
  role       = aws_iam_role.ingest.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

/*
	======================================================================
	Processor IAM Role
	======================================================================
*/
resource "aws_iam_role" "processor" {
  name = "processor-role-${var.bucket_name}"

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

resource "aws_iam_role_policy" "processor_policy" {
  name = "processor-policy-${var.bucket_name}"
  role = aws_iam_role.processor.id

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
          aws_sqs_queue.analytics.arn
        ]
      },
      {
        Action = [
          "s3:PutObject"
        ]
        Effect   = "Allow"
        Resource = "${aws_s3_bucket.analytics.arn}/*"
      },
      {
        Effect = "Allow"
        Action = [
          "lambda:InvokeFunction"
        ]
        Resource = aws_lambda_function.processor.arn
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "processor_basic" {
  role       = aws_iam_role.processor.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

/*
	======================================================================
	Lambdas
	======================================================================
*/
data "archive_file" "ingest_zip" {
  type        = "zip"
  source_file = "${path.cwd}/../lambda/analytics-ingest.js"
  output_path = "${path.module}/../lambda/analytics-ingest.zip"
}

data "archive_file" "processor_zip" {
  type        = "zip"
  source_file = "${path.cwd}/../lambda/analytics-processor.js"
  output_path = "${path.module}/../lambda/analytics-processor.zip"
}

resource "aws_lambda_function" "ingest" {
  function_name    = "analytics-ingest-${var.bucket_name}"
  role             = aws_iam_role.ingest.arn
  handler          = "analytics-ingest.handler"
  runtime          = "nodejs22.x"
  filename         = data.archive_file.ingest_zip.output_path
  source_code_hash = data.archive_file.ingest_zip.output_base64sha256
  timeout          = 3
  memory_size      = 128

  environment {
    variables = {
      QUEUE_URL = aws_sqs_queue.analytics.id
    }
  }
}

resource "aws_lambda_function" "processor" {
  function_name    = "analytics-processor-${var.bucket_name}"
  role             = aws_iam_role.processor.arn
  handler          = "analytics-processor.handler"
  runtime          = "nodejs22.x"
  filename         = data.archive_file.processor_zip.output_path
  source_code_hash = data.archive_file.processor_zip.output_base64sha256
  #   TODO: Revert to 900 once testing is done
  timeout     = 900
  memory_size = 2048

  environment {
    variables = {
      QUEUE_URL     = aws_sqs_queue.analytics.id
      BUCKET        = aws_s3_bucket.analytics.bucket
      FUNCTION_NAME = "analytics-processor-${var.bucket_name}"
    }
  }
}

/*
	======================================================================
	CloudWatch Event to trigger the processor lambda
	======================================================================

	TODO: Revert to once a day once testing is done
	cron(0 0 * * ? *)
	rate(10 minutes)
*/
resource "aws_cloudwatch_event_rule" "processor_schedule" {
  name                = "analytics-processor-event-${var.bucket_name}"
  schedule_expression = "cron(0 0 * * ? *)"
}

resource "aws_cloudwatch_event_target" "processor_target" {
  rule      = aws_cloudwatch_event_rule.processor_schedule.name
  target_id = "processor"
  arn       = aws_lambda_function.processor.arn
}

resource "aws_lambda_permission" "allow_events_to_invoke_processor" {
  statement_id  = "AllowExecutionFromEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.processor.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.processor_schedule.arn
}
