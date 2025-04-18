#!/usr/bin/env bash

SCRIPT=$(basename "${BASH_SOURCE[0]}")

print() {
  printf "[${SCRIPT}] %s\n" "$*"
}

verify_parameter() {
  PARAMETER_VALUE=$1
  PARAMETER_TAG=$2
  PARAMETER_MASK=$3
  if [ -z "${PARAMETER_VALUE}" ] || [ "${PARAMETER_VALUE}" == "null" ]; then
    print "Error: ${PARAMETER_TAG} is null."
    exit 3
  fi
  if [ -z "${PARAMETER_MASK}" ] || [ "${PARAMETER_MASK}" == "false" ]; then
    print "${PARAMETER_TAG}: ${PARAMETER_VALUE}"
  else
    print "${PARAMETER_TAG}: ******************"
  fi
}

verify_requirements() {
  print "${FUNCNAME[0]}"
  verify_parameter "${WORKING_PATH}" "WORKING_PATH" "false"
  if [ -n "$DEBUG_MODE" ] && [ "$DEBUG_MODE" = true ]; then
    pwd
    ls -la
    ls -la /etc/action
    ls -la /etc/action/src
  fi
}

config() {
  print "${FUNCNAME[0]}"
  bash -c "git config --global --add safe.directory \$PWD"
}

# shellcheck disable=SC2086
run() {
  print "${FUNCNAME[0]}"
  COMMAND="node /etc/action/src/index.js"
  print "Executing command: ${COMMAND}"
  ${COMMAND}
  EXIT_CODE=$?
  if [ ${EXIT_CODE} -ne 0 ]; then
    print "Error executing command ${COMMAND}. Exit code=${EXIT_CODE}"
    exit ${EXIT_CODE}
  fi
}

validate() {
  CURRENT_SHA=$(git rev-parse HEAD)
  echo "git-head=${CURRENT_SHA}" >>"$GITHUB_OUTPUT"
  echo "git-head=${CURRENT_SHA}" >>"$GITHUB_ENV"
  if [ -n "$EVENT_NAME" ] && [ "$EVENT_NAME" == "pull_request" ]; then
    echo "Type of event: $EVENT_NAME"
    ORIGINAL_SHA=$(jq -r '.pull_request.head.sha' "$GITHUB_EVENT_PATH")
    echo "Original Pull Request Commit ID: $ORIGINAL_SHA"
    echo "HEAD is now at ${CURRENT_SHA} after Pull Request Commit Id merge with HEAD."
    PULL_REQUEST_VERSION=${ORIGINAL_SHA:0:7}
    echo "Short SHA=${PULL_REQUEST_VERSION}"
    echo "release-version=${PULL_REQUEST_VERSION}" >>"$GITHUB_OUTPUT"
    echo "release-version=${PULL_REQUEST_VERSION}" >>"$GITHUB_ENV"
  fi
}

main() {
  set -e
  verify_requirements
  config "$@"
  run "$@"
  validate "$@"
}

main "$@"
