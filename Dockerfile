FROM node:22.18.0-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates git jq \
    && rm -rf /var/lib/apt/lists/*

LABEL name="quike/semantic-release"
LABEL maintainer="quike"
LABEL email="616137+quike@users.noreply.github.com"
LABEL description="Fully automated version management and package publishing. A docker wrapping over github/semantic-release"

ENV DRY_RUN=false
ENV DEBUG_MODE=false

RUN mkdir /etc/action
WORKDIR /etc/action

COPY --chmod=555 entrypoint.sh "/etc/action/entrypoint.sh"
COPY --chmod=444 src/ ./src/
COPY --chmod=444 .releaserc.default "/etc/action/.releaserc.default"
COPY ./package.json ./package-lock.json ./
RUN chmod +x "/etc/action/entrypoint.sh" && npm ci --only=prod

ENTRYPOINT ["/etc/action/entrypoint.sh"]

