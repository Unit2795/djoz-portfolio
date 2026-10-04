#!/bin/bash

# Creates or updates the CloudFormation stack that owns the Terraform state bucket

# Exit on unset vars, pipefail, and any error
set -euo pipefail

# backend config location
CONFIG_PATH="../state.config"
# CloudFormation template location
CLOUDFORMATION_TEMPLATE="terraform-state.yml"

# Read a quoted value from state.config, e.g. `bucket = "my-bucket"`
config_value() {
	grep "^$1[[:space:]]*=" "$CONFIG_PATH" | cut -d'"' -f2 | tr -d '[:space:]' || true
}

STATE_S3_BUCKET=$(config_value bucket)
REGION=$(config_value region)

if [ -z "$STATE_S3_BUCKET" ] || [ -z "$REGION" ]; then
	echo "Error: bucket and region must be set in state.config"
	exit 1
fi

# Set stack name based on bucket name
STACK_NAME="cf-stack-${STATE_S3_BUCKET}"

# Creates the stack or updates it, waits for it to finish, and succeeds when nothing changed
echo "Deploying CloudFormation stack '$STACK_NAME' in $REGION..."
aws cloudformation deploy \
	--region "$REGION" \
	--stack-name "$STACK_NAME" \
	--template-file "$CLOUDFORMATION_TEMPLATE" \
	--parameter-overrides BucketName="$STATE_S3_BUCKET" \
	--no-fail-on-empty-changeset

echo "Deployed resources:"
aws cloudformation describe-stacks \
	--region "$REGION" \
	--stack-name "$STACK_NAME" \
	--query 'Stacks[0].Outputs[]' \
	--output table
