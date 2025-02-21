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
  verify_parameter "${GH_TOKEN}" "GH_TOKEN" "true"
  verify_parameter "${WORKING_PATH}" "WORKING_PATH" "false"
  if [ -n "$DEBUG_MODE" ] && [ "$DEBUG_MODE" = true ]; then
    pwd
    print "Working Path=${WORKING_PATH}"
    ls -la
    whoami
  fi
}

config() {
  print "${FUNCNAME[0]}"
  npm link @actions/core
  bash -c "git config --global --add safe.directory \$PWD"
  CONFIG_EXISTS=false
  DEFAULT_CONFIG="${WORKING_DIR}/.releaserc.default"
  CONFIG_FILES=".releaserc .releaserc.json .releaserc.yaml .releaserc.yml .releaserc.js .releaserc.cjs release.config.js release.config.cjs"
  for CONF_FILE in ${CONFIG_FILES}; do
    if [ -e "${CONF_FILE}" ]; then
      CONFIG_EXISTS=true
      print "Accepted config file found: ${CONF_FILE}"
      break
    fi
  done
  if [ -n "$CONFIG_EXISTS" ] && [ "$CONFIG_EXISTS" = false ]; then
    print "A valid config file cannot be found. Trying default config."
    if [ -n "$DEFAULT_CONFIG_ENABLED" ] && [ "$DEFAULT_CONFIG_ENABLED" = true ]; then
      print "DEFAULT_CONFIG_ENABLED: $DEFAULT_CONFIG_ENABLED. Copying default config."
      if [ -e "${DEFAULT_CONFIG}" ]; then
        ln -s "${DEFAULT_CONFIG}" ".releaserc"
      else
        print "Unable to find default config file ${DEFAULT_CONFIG}"
      fi
    else
      print "DEFAULT_CONFIG_ENABLED: $DEFAULT_CONFIG_ENABLED. Execution will run without known file config."
    fi
  fi
}

# shellcheck disable=SC2086
run() {
  print "${FUNCNAME[0]}"
  COMMAND="npx semantic-release"
  if [ -n "$GH_TOKEN" ] && [ "$DRY_RUN" != "" ]; then
    verify_parameter "${GH_TOKEN}" "GH_TOKEN" true
  fi
  if [ -n "$DRY_RUN" ] && [ "$DRY_RUN" = true ]; then
    print "DRY_RUN enabled: $DRY_RUN"
    COMMAND="$COMMAND --dry-run"
  fi
  if [ -n "$DEBUG_MODE" ] && [ "$DEBUG_MODE" = true ]; then
    print "DEBUG_MODE enabled: $DEBUG_MODE"
    COMMAND="$COMMAND --debug"
  fi
  ${COMMAND}
  EXIT_CODE=$?
  if [ ${EXIT_CODE} -ne 0 ]; then
    print "Error executing command ${COMMAND}. Exit code=${EXIT_CODE}"
    exit ${EXIT_CODE}
  fi
}

validate() {
  if [ -e ".release-version" ]; then
    RELEASE_VERSION=$(cat .release-version)
    print "Release Version: ${RELEASE_VERSION}"
  fi
  if [ -n "$NEW_RELEASE_PUBLISHED" ] && [ "$NEW_RELEASE_PUBLISHED" == true ]; then
    print "Release Git Head: ${RELEASE_GIT_HEAD}"
  fi
  CURRENT_SHA=$(git rev-parse HEAD)
  echo "git-head=${CURRENT_SHA}" >>"$GITHUB_OUTPUT"
  echo "git-head=${CURRENT_SHA}" >>"$GITHUB_ENV"
  if [ -n "$EVENT_NAME" ] && [ "$EVENT_NAME" == "pull_request" ]; then
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
  validate "@"
}

main "$@"
