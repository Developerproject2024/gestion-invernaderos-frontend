#!/usr/bin/env bash
set -euo pipefail

: "${RENDER_API_KEY:?Configure RENDER_API_KEY in the GitHub environment}"
: "${RENDER_SERVICE_ID:?Configure RENDER_SERVICE_ID in the GitHub environment}"

api_url="https://api.render.com/v1/services/${RENDER_SERVICE_ID}/deploys"
deploy_response=$(curl --fail --silent --show-error \
  --request POST \
  --url "$api_url" \
  --header "Authorization: Bearer ${RENDER_API_KEY}" \
  --header "Content-Type: application/json" \
  --data "$(jq -n --arg commitId "$GITHUB_SHA" '{commitId: $commitId}')")
deploy_id=$(jq --exit-status --raw-output '.id' <<< "$deploy_response")

echo "Waiting for Render deploy ${deploy_id} to become live."

for attempt in {1..60}; do
  deploy_status=$(curl --fail --silent --show-error \
    --url "${api_url}/${deploy_id}" \
    --header "Authorization: Bearer ${RENDER_API_KEY}" |
    jq --exit-status --raw-output '.status')

  echo "Render deploy status: ${deploy_status} (check ${attempt}/60)"

  case "$deploy_status" in
    live)
      exit 0
      ;;
    build_failed|update_failed|pre_deploy_failed|canceled|deactivated)
      echo "Render deploy ${deploy_id} ended with status: ${deploy_status}" >&2
      exit 1
      ;;
  esac

  sleep 30
done

echo "Timed out waiting for Render deploy ${deploy_id} to become live." >&2
exit 1
