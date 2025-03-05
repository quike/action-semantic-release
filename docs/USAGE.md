# Usage

The purpose of this repository is to act as [GitHub Action](https://docs.github.com/en/actions) for
[github/semantic-version](https://github.com/semantic-version/semantic-version).

## Information

For [github/semantic-version](https://github.com/semantic-version/semantic-version) manual please visit the original
web.

## Configure

File `.releaserc` is the RC file used to configure semantic-version options.

It is expected to be located at root folder of your repository to be released

Example (this content may change):

```json
{
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/github"
  ],
  "dryRun": true,
  "debug": true
}
```

If `.releaserc` does not exist on the working directory, the code will run with default values. See
[.releaserc.default](../.releaserc.default).

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
        ID: release
        uses: quike/action-semantic-release
        with:
          debug-mode: true
          dry-run: false
          add-summary: true
          default-config-enabled: true
          default-preset-info: true
          floating-tags: false
        env:
          GITHUB_TOKEN: ${{ secrets.GHTOKEN }}
    outputs:
      version: ${{ steps.release.outputs.release-version }}
      git-head: ${{ steps.release.outputs.release-git-head }}
```

### Parameters

#### Action Variables

| _Variable_                 | _Default_ | _Details_                                                                                  |
| -------------------------- | --------- | ------------------------------------------------------------------------------------------ |
| **add-summary**            | `true`    | Add a GitHub Job Summary with release details                                              |
| **debug-mode**             | `false`   | To enable verbosity                                                                        |
| **dry-run**                | `false`   | Dry Run execution                                                                          |
| **default-config-enabled** | `true`    | Force default config if not present                                                        |
| **default-preset-info**    | `true`    | Sets prefixed release rules and preset configs as callback if default info does not exists |
| **floating-tags**          | `false`   | Create floating tags from major and minor versions after release.                          |

#### Environment Variables

| _Variable_ | _Required_ | _Details_                                 |
| ---------- | ---------- | ----------------------------------------- |
| **token**  | `true`     | Required, as `GITHUB_TOKEN` or `GH_TOKEN` |

### Outputs

By default semantic-release is only meant to perform releases, ignoring if further steps require to grab the new version
(like using it in a maven project via `-Drevision=${release-version}`). But if you are in such scenarios you must update
your release config file to force the system to publish the new versions.

The Action will export multiple variables so they can be accessed within your workflows.L

### Exported Variables

| _Variable_            | _GitHub Action Output_ | _Example_                                  | _Details_                                           |
| --------------------- | ---------------------- | ------------------------------------------ | --------------------------------------------------- |
| **RELEASE_PUBLISHED** | **release-published**  | `true`                                     | True if a new release is published, false otherwise |
| **RELEASE_VERSION**   | **release-version**    | `1.2.3`                                    | The new SemVer version of type X.Y.Z                |
| **RELEASE_MAJOR**     | **release-major**      | `1`                                        | Major value of the new SemVer version               |
| **RELEASE_MINOR**     | **release-minor**      | `2`                                        | Minor value of the new SemVer version               |
| **RELEASE_PATCH**     | **release-patch**      | `3`                                        | Patch value of the new SemVer version               |
| **RELEASE_TYPE**      | **release-type**       | `patch`                                    | Type of SemVer release: major, minor or patch       |
| **RELEASE_GIT_HEAD**  | **release-git-head**   | `cddc1177c51b518b3263b1b4f2b50af77dcf8be9` | Commit ID of the release                            |
| **RELEASE_GIT_TAG**   | **release-git-tag**    | `v1.2.3`                                   | Tag ID associated with the release                  |
