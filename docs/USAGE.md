# Usage

The purpose of this repository is to act as [GitHub Action](https://docs.github.com/en/actions) for [github/semantic-version](https://github.com/semantic-version/semantic-version).

## Information

For [github/semantic-version](https://github.com/semantic-version/semantic-version) manual please visit the original web.

## Configure

File `.releaserc` is the RC file used to configure semantic-version options.

It is expected to be located at root folder of your repository to be released

Example (this content may change):

```json
{
  "branches": ["master"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/github"
  ],
  "dryRun": true,
  "debug": true
}
```

If `.releaserc` does not exist on the working directory, the code will run with default values. See [.releaserc.default](../.releaserc.default).

## Run

### GitHub Workflows

```yaml
jobs:
  release:
    permissions:
      contents: write
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Release
        id: release
        uses: quike/semantic-release
        with:
          token: ${{ secrets.GHTOKEN }}
          debug-mode: true
          dry-run: false
    outputs:
      version: ${{ steps.release.outputs.release-version }}
      git-head: ${{ steps.release.outputs.git-head }}
```

By default semantic-release is only meant to perform releases, ignoring if further steps require to grab the new version (like using it in a maven project via `-Drevision=${release-version}`). But if you are in such scenarios you must update your release config file to force the system to publish the new versions.

The following piece of code is an example used in the default configuration. This change would

```json
[
  "@semantic-release/exec",
  {
    "publishCmd": "echo 'RELEASE_VERSION=${nextRelease.version}' >> $GITHUB_OUTPUT",
    "verifyReleaseCmd": "echo ${nextRelease.version} > .release-version"
  }
]
```

- `VERSION` (env variable)
- ``.VERSION` file

#### Action Variables

| _Variable_                 | _Default_               | _Details_                     |
| -------------------------- | ----------------------- | ----------------------------- |
| **token**                  | `GH_TOKEN` GitHub Token | GitHub Enterprise User Token. |
| **debug-mode**             | `false`                 | To enable verbosity           |
| **dry-run**                | `false`                 | Dry Run execution             |
| **default-config-enabled** | `true`                  | Dry Run execution             |
