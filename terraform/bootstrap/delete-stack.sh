#!/bin/bash

# Exit on unset vars, pipefail, and any error
set -euo pipefail

# backend config location
CONFIG_PATH="../state.config"

# Read values from state.config
STATE_S3_BUCKET=$(grep '^bucket[[:space:]]*=' "$CONFIG_PATH" | cut -d'"' -f2 | tr -d '[:space:]')
STATE_DYNAMODB_TABLE=$(grep '^dynamodb_table[[:space:]]*=' "$CONFIG_PATH" | cut -d'"' -f2 | tr -d '[:space:]')

# Check required vars
if [ -z "$STATE_S3_BUCKET" ] || [ -z "$STATE_DYNAMODB_TABLE" ]; then
	echo "Error: bucket and dynamodb_table variables must be set in state.config"
	exit 1
fi

# Stack name mirrors the bootstrap script
STACK_NAME="cf-stack-${STATE_S3_BUCKET}"

# Does the stack exist (not DELETE_COMPLETE)?
stack_exists() {
	aws cloudformation describe-stacks --stack-name "$STACK_NAME" >/dev/null 2>&1
}

# Best-effort: disable termination protection
disable_termination_protection() {
	aws cloudformation update-termination-protection \
		--stack-name "$STACK_NAME" \
		--no-enable-termination-protection >/dev/null 2>&1 || true
}

# Does the bucket exist?
bucket_exists() {
	aws s3api head-bucket --bucket "$STATE_S3_BUCKET" >/dev/null 2>&1
}

# Empty S3 bucket (handles versioned & unversioned)
empty_bucket() {
	local bucket="$1"

	echo "Emptying S3 bucket: s3://${bucket}"

	# First, try a simple recursive remove (works for unversioned buckets)
	aws s3 rm "s3://${bucket}" --recursive >/dev/null 2>&1 || true

	# now clear all versions + delete markers
	while :; do
		payload=$(aws s3api list-object-versions --bucket "$bucket" --output json |
			jq '[ (.Versions[]? | {Key, VersionId}),
                  (.DeleteMarkers[]? | {Key, VersionId}) ] | .[:1000]')

		# stop when there’s nothing left
		[ "$(jq 'length' <<<"$payload")" -eq 0 ] && break

		aws s3api delete-objects \
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

# Disable termination protection (best-effort)
disable_termination_protection

# Empty bucket (if present); this avoids CFN delete failures on non-empty buckets
if bucket_exists; then
	empty_bucket "$STATE_S3_BUCKET"
else
	echo "S3 bucket s3://${STATE_S3_BUCKET} does not exist or is inaccessible; continuing."
fi

# Initiate delete
echo "Deleting CloudFormation stack '$STACK_NAME'..."
aws cloudformation delete-stack --stack-name "$STACK_NAME"

echo "Waiting for stack deletion to complete..."
aws cloudformation wait stack-delete-complete --stack-name "$STACK_NAME"

echo "Stack deleted successfully."
