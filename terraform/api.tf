resource "aws_apigatewayv2_api" "api" {
	name          = "contact-me-api-${var.bucket_name}"
	protocol_type = "HTTP"
	cors_configuration {
		allow_origins = ["https://${var.domain_name}", "https://www.${var.domain_name}"]
		allow_methods = ["POST"]
	}
}

resource "aws_apigatewayv2_stage" "stage" {
	api_id = aws_apigatewayv2_api.api.id
	name = "prod"
	auto_deploy = true

	default_route_settings {
		throttling_burst_limit = 1
		throttling_rate_limit = 1
	}
}

resource "aws_apigatewayv2_integration" "lambda" {
	api_id = aws_apigatewayv2_api.api.id

	integration_type = "AWS_PROXY"
	integration_method = "POST"
	integration_uri = aws_lambda_function.contact_function.invoke_arn
	payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "route" {
	api_id = aws_apigatewayv2_api.api.id
	route_key = "POST /contact"
	target = "integrations/${aws_apigatewayv2_integration.lambda.id}"

	authorization_type = "CUSTOM"
	authorizer_id = aws_apigatewayv2_authorizer.quota.id
}

resource "aws_apigatewayv2_authorizer" "quota" {
	api_id = aws_apigatewayv2_api.api.id
	authorizer_type = "REQUEST"
	authorizer_uri = aws_lambda_function.quota_authorizer.invoke_arn
	name = "quota-authorizer-${var.bucket_name}"
	authorizer_payload_format_version = "2.0"
	enable_simple_responses = true
}