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
  echo "GIT_HEAD=${CURRENT_SHA}" >>"$GITHUB_OUTPUT"
  echo "GIT_HEAD=${CURRENT_SHA}" >>"$GITHUB_ENV"
  if [ -n "$EVENT_NAME" ] && [ "$EVENT_NAME" == "pull_request" ]; then
    print "Type of event: $EVENT_NAME"
    if [ -f "$GITHUB_EVENT_PATH" ]; then
      ORIGINAL_SHA=$(jq -r '.pull_request.head.sha' "$GITHUB_EVENT_PATH")
    else
      print "Error: GITHUB_EVENT_PATH is not set or file does not exist."
      if [ -n "$CI_COMMIT_SHA" ]; then
        print "Falling back to CI_COMMIT_SHA as original SHA."
        ORIGINAL_SHA="$CI_COMMIT_SHA"
      else
        print "Falling back to current HEAD as original SHA."
        ORIGINAL_SHA="$CURRENT_SHA"
      fi
    fi
    print "Original Pull Request Commit ID: $ORIGINAL_SHA"
    print "HEAD is now at ${CURRENT_SHA} after Pull Request Commit Id merge with HEAD."
    PULL_REQUEST_VERSION=${ORIGINAL_SHA:0:7}
    print "Short SHA=${PULL_REQUEST_VERSION}"
    echo "RELEASE_VERSION=${PULL_REQUEST_VERSION}" >>"$GITHUB_OUTPUT"
    echo "RELEASE_VERSION=${PULL_REQUEST_VERSION}" >>"$GITHUB_ENV"
  fi
}

export_metadata() {
  INPUT_FILE="$GITHUB_ENV"
  OUTPUT_FILE="$WORKING_PATH/metadata.env"
  if [ -f "$INPUT_FILE" ] && [ -n "$EXPORT_METADATA" ] && [ "$EXPORT_METADATA" = true ]; then
    true >"$OUTPUT_FILE"

    while IFS= read -r line; do
      if [[ "$line" == *"<<ghadelimiter_"* ]]; then
        key="${line%%<<*}" # Get part before << delimiter
        # Read value and delimiter end line
        IFS= read -r value
        IFS= read -r _end_delim
        echo "$key=$value" >>"$OUTPUT_FILE"
      elif [[ "$line" == *=* ]]; then
        # Fallback to standard key=value lines (e.g., git-head=e202b531...)
        echo "$line" >>"$OUTPUT_FILE"
      fi
    done <"$INPUT_FILE"
    if [ -f "$OUTPUT_FILE" ]; then
      print "Metadata file created successfully: $OUTPUT_FILE"
    else
      print "Error: Metadata file was not created: $OUTPUT_FILE"
      exit 4
    fi
  fi
}

main() {
  set -e
  verify_requirements
  config "$@"
  run "$@"
  validate "$@"
  export_metadata "$@"
}

main "$@"
