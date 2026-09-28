#!/usr/bin/env bash
# Usage: set-action-image.sh <version>
# Pins runs.image in action.yml to the release image and fails unless exactly that line is present.

set -euo pipefail

VERSION="${1:?version required}"
LINE="  image: 'docker://ghcr.io/quike/action-semantic-release:${VERSION}'"

sed -i "s|^  image: .*|${LINE}|" action.yml
grep -qxF "${LINE}" action.yml
