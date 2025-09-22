resource "aws_apigatewayv2_api" "api" {
  name          = "contact-me-api-${var.bucket_name}"
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
  api_id      = aws_apigatewayv2_api.api.id
  name        = "$default"
  auto_deploy = true

  default_route_settings {
    throttling_burst_limit = 1
    throttling_rate_limit  = 1
  }

  route_settings {
    route_key              = aws_apigatewayv2_route.ingest_route.route_key
    throttling_burst_limit = 50
    throttling_rate_limit  = 10
  }
}

resource "aws_apigatewayv2_integration" "lambda" {
  api_id                 = aws_apigatewayv2_api.api.id
  integration_type       = "AWS_PROXY"
  integration_method     = "POST"
  integration_uri        = aws_lambda_function.contact_function.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "route" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "POST /api/contact"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
  authorization_type = "NONE"
}

resource "aws_apigatewayv2_integration" "ingest" {
  api_id                 = aws_apigatewayv2_api.api.id
  integration_type       = "AWS_PROXY"
  integration_method     = "POST"
  integration_uri        = aws_lambda_function.ingest.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "ingest_route" {
  api_id             = aws_apigatewayv2_api.api.id
  route_key          = "POST /api/ingest"
  target             = "integrations/${aws_apigatewayv2_integration.ingest.id}"
  authorization_type = "NONE"
}

resource "aws_apigatewayv2_integration" "stamp" {
  api_id                 = aws_apigatewayv2_api.api.id
  integration_type       = "AWS_PROXY"
  integration_method     = "POST"
  integration_uri        = aws_lambda_function.stamp_function.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "stamp" {
  api_id             = aws_apigatewayv2_api.api.id
  route_key          = "GET /api/stamp.gif"
  target             = "integrations/${aws_apigatewayv2_integration.stamp.id}"
  authorization_type = "NONE"
}
