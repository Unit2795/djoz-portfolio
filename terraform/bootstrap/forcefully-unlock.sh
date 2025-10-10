#!/bin/bash

# Exit on unset vars, pipefail, and any error
set -euo pipefail

CONFIG_PATH="../state.config"

# Extract backend values
STATE_KEY=$(grep '^key[[:space:]]*=' "$CONFIG_PATH" | cut -d'"' -f2 | tr -d '[:space:]')
STATE_S3_BUCKET=$(grep '^bucket[[:space:]]*=' "$CONFIG_PATH" | cut -d'"' -f2 | tr -d '[:space:]')
STATE_REGION=$(grep '^region[[:space:]]*=' "$CONFIG_PATH" | cut -d'"' -f2 | tr -d '[:space:]')

if [[ -z "$STATE_KEY" || -z "$STATE_S3_BUCKET" || -z "$STATE_REGION" ]]; then
	echo "Error: bucket, key, and region variables must be set in state.config"
	exit 1
fi

echo "Looking for stale locks in S3 bucket: $STATE_S3_BUCKET (region: $STATE_REGION, key: $STATE_KEY)"

LOCK_FILE="${STATE_KEY}.tflock"
echo "Checking for Terraform lock file: s3://$STATE_S3_BUCKET/$LOCK_FILE (region: $STATE_REGION)"

# Check if lock file exists
if aws s3api head-object --bucket "$STATE_S3_BUCKET" --key "$LOCK_FILE" --region "$STATE_REGION" 2>/dev/null; then
	echo "Lock file found: $LOCK_FILE"
	echo "Deleting lock file to force unlock..."
	aws s3api delete-object --bucket "$STATE_S3_BUCKET" --key "$LOCK_FILE" --region "$STATE_REGION"
	echo "Lock file deleted."
else
	echo "No lock file found for state key '$STATE_KEY'."
fi

echo "Done. Any stale locks for '$STATE_KEY' have been cleared."
