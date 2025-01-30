#!/bin/bash

# Exit on any error
set -e

# backend config location
CONFIG_PATH="../state.config"
# CloudFormation template location
CLOUDFORMATION_TEMPLATE="terraform-state.yml"

STATE_S3_BUCKET=$(grep '^bucket[[:space:]]*=' "$CONFIG_PATH" | cut -d'"' -f2 | tr -d '[:space:]')
STATE_DYNAMODB_TABLE=$(grep '^dynamodb_table[[:space:]]*=' "$CONFIG_PATH" | cut -d'"' -f2 | tr -d '[:space:]')

# Check if required environment variables are set
if [ -z "$STATE_S3_BUCKET" ] || [ -z "$STATE_DYNAMODB_TABLE" ]; then
    echo "Error: bucket and dynamodb_table variables must be set in state.config"
    exit 1
fi

# Set stack name based on bucket name
STACK_NAME="cf-stack-${STATE_S3_BUCKET}"

# Check if stack exists
check_stack() {
    aws cloudformation describe-stacks --stack-name "$STACK_NAME" 2>/dev/null
    return $?
}

# Deploy or update the stack
deploy_stack() {
    local operation
    if check_stack; then
        operation="update"
    else
        operation="create"
    fi

    echo "${operation} CloudFormation stack..."

    if ! output=$(aws cloudformation ${operation}-stack \
            --stack-name "$STACK_NAME" \
            --template-body file://"$CLOUDFORMATION_TEMPLATE" \
            --parameters \
                ParameterKey=BucketName,ParameterValue="$STATE_S3_BUCKET" \
                ParameterKey=TableName,ParameterValue="$STATE_DYNAMODB_TABLE" \
            --capabilities CAPABILITY_NAMED_IAM 2>&1); then

            if [[ "$output" == *"No updates are to be performed"* ]]; then
                echo "No updates needed for stack"
                return 0
            fi
            echo "$output"
            return 1
        fi

    echo "Waiting for stack ${operation} to complete..."
    aws cloudformation wait stack-${operation}-complete --stack-name "$STACK_NAME"
}

# Deploy the stack
deploy_stack

echo "Stack deployed successfully"

# Output the stack resources
echo "Deployed resources:"
aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --query 'Stacks[0].Outputs[]' \
    --output table