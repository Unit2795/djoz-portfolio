#!/bin/bash

# Empties the Terraform state bucket and deletes the CloudFormation stack that owns it

# Exit on unset vars, pipefail, and any error
set -euo pipefail

# backend config location
CONFIG_PATH="../state.config"

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

# Stack name mirrors the bootstrap script
STACK_NAME="cf-stack-${STATE_S3_BUCKET}"

# Does the stack exist (not DELETE_COMPLETE)?
stack_exists() {
	aws cloudformation describe-stacks --region "$REGION" --stack-name "$STACK_NAME" >/dev/null 2>&1
}

bucket_exists() {
	aws s3api head-bucket --region "$REGION" --bucket "$STATE_S3_BUCKET" >/dev/null 2>&1
}

# The bucket is versioned, so every object version and delete marker must go before CloudFormation can delete it
empty_bucket() {
	local bucket="$1"

	echo "Emptying S3 bucket: s3://${bucket}"

	while :; do
		payload=$(aws s3api list-object-versions --region "$REGION" --bucket "$bucket" --output json |
			jq '[ (.Versions[]? | {Key, VersionId}),
                  (.DeleteMarkers[]? | {Key, VersionId}) ] | .[:1000]')

		# stop when there’s nothing left
		[ "$(jq 'length' <<<"$payload")" -eq 0 ] && break

		aws s3api delete-objects \
			--region "$REGION" \
			--cli-input-json "$(printf '%s' "$payload" |
				jq -c --arg bucket "$bucket" '{Bucket:$bucket, Delete:{Objects: ., Quiet:true}}')" \
			--cli-binary-format raw-in-base64-out
	done

	echo "Bucket emptied."
}

# --- Main flow ---

if ! stack_exists; then
	echo "No CloudFormation stack named '$STACK_NAME' found. Nothing to delete."
	exit 0
fi

# Empty bucket (if present); this avoids CFN delete failures on non-empty buckets
if bucket_exists; then
	empty_bucket "$STATE_S3_BUCKET"
else
	echo "S3 bucket s3://${STATE_S3_BUCKET} does not exist or is inaccessible; continuing."
fi

# Initiate delete
echo "Deleting CloudFormation stack '$STACK_NAME'..."
aws cloudformation delete-stack --region "$REGION" --stack-name "$STACK_NAME"

echo "Waiting for stack deletion to complete..."
aws cloudformation wait stack-delete-complete --region "$REGION" --stack-name "$STACK_NAME"

echo "Stack deleted successfully."
