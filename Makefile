COMPONENT					:= action-semantic-release
OWNER							:= quike
VERSION						:= $(shell jq -r '.version' package.json)
# Default to the environment variables GH_TOKEN or GITHUB_TOKEN
TOKEN := $(or $(GH_TOKEN),$(GITHUB_TOKEN))

# Override TOKEN if .env file exists and contains GH_TOKEN or GITHUB_TOKEN
ifneq ("$(wildcard .env)","")
include .env
export
TOKEN := $(or $(TOKEN),$(GH_TOKEN),$(GITHUB_TOKEN))
endif

.PHONY: config
config:
	jq -r '.dependencies | keys | join(" ")' < package.json | xargs npm install save-dev --verbose

.PHONY: release
release: config
	@echo "Execute entrypoint"
	./entrypoint.sh


