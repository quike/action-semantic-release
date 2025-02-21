
FROM node:20-alpine

ARG WORKING_PATH="/github/workspace"

LABEL name="quike/semantic-release"
LABEL maintainer="quike"
LABEL email="quike.mora@gmail.com"
LABEL description="Fully automated version management and package publishing. A docker wrapping over github/semantic-release"

ENV DRY_RUN=false
ENV DEBUG_MODE=false

RUN apk add --no-cache --update \
  curl \
  openssl \
  openssh \
  bash \
  git \
  jq

# Set an environment variable using the build argument
ENV WORKING_PATH=${WORKING_PATH}

COPY package.json /global-package.json
SHELL ["/bin/ash", "-o", "pipefail", "-c"]
RUN jq -r '.dependencies | keys | join(" ")' < /global-package.json | xargs npm install -g

COPY --chmod=555 entrypoint.sh "${WORKING_PATH}/entrypoint.sh"
COPY --chmod=444 .releaserc.default "${WORKING_PATH}/.releaserc.default"
RUN chmod +x "${WORKING_PATH}/entrypoint.sh"

WORKDIR ${WORKING_PATH}

ENTRYPOINT ["./entrypoint.sh"]
