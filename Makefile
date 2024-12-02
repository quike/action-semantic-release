COMPONENT												:= action-semantic-release
OWNER														:= quike
VERSION													:= 0.0.0


.PHONY: config
config:
	yarn install --frozen-lockfile

.PHONY: release
release: config
	npx semantic-release


