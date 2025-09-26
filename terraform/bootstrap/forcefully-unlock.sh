#!/bin/bash

# Exit on unset vars, pipefail, and any error
set -euo pipefail

CONFIG_PATH="../state.config"

# Extract backend values
STATE_KEY=$(grep '^key[[:space:]]*=' "$CONFIG_PATH" | cut -d'"' -f2 | tr -d '[:space:]')
STATE_DYNAMODB_TABLE=$(grep '^dynamodb_table[[:space:]]*=' "$CONFIG_PATH" | cut -d'"' -f2 | tr -d '[:space:]')
STATE_REGION=$(grep '^region[[:space:]]*=' "$CONFIG_PATH" | cut -d'"' -f2 | tr -d '[:space:]')

if [[ -z "$STATE_KEY" || -z "$STATE_DYNAMODB_TABLE" || -z "$STATE_REGION" ]]; then
	echo "Error: bucket and dynamodb_table variables must be set in state.config"
	exit 1
fi

echo "Looking for stale locks in DynamoDB table: $STATE_DYNAMODB_TABLE (region: $STATE_REGION, key: $STATE_KEY)"

# Find all locks related to the specified state key
LOCK_IDS=$(aws dynamodb scan \
	--region "$STATE_REGION" \
	--table-name "$STATE_DYNAMODB_TABLE" \
	--filter-expression "contains(LockID, :k)" \
	--expression-attribute-values '{":k":{"S":"'"$STATE_KEY"'"}}' \
	--query 'Items[].LockID.S' \
	--output text || true)

if [[ -z "$LOCK_IDS" ]]; then
	echo "No locks found for state key '$STATE_KEY'."
	exit 0
fi

for id in $LOCK_IDS; do
	echo "Force-unlocking: $id"
	terraform force-unlock -force "$id" || true
done

echo "Done. Any stale locks for '$STATE_KEY' have been cleared."
