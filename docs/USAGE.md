# Usage

The purpose of this repo is to act as [GitHub Action](https://docs.github.com/en/actions) for [github/semantic-version](https://github.com/semantic-version/semantic-version).

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

If `.releaserc` does not exist on the working directory, the code will run with default values.

## Run

### GitHub Workflows

```yaml
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Release
        id: release
        uses: quike/semantic-release
        with:
          token: ${{ secrets.GHTOKEN }}
          debugMode: true
          dryRun: false
    outputs:
      version: ${{ steps.release.outputs.version }}
      tag: ${{ steps.release.outputs.tag }}
      sha: ${{ steps.release.outputs.sha }}
```

Action will grab the new version and store it within two different places:

- `VERSION` (env variable)
- ``.VERSION` file

#### Variables

| _Variable_    | _Default_               | _Details_                     |
| ------------- | ----------------------- | ----------------------------- |
| **token**     | `GH_TOKEN` GitHub Token | GitHub Enterprise User Token. |
| **debugMode** | `false`                 | To enable verbosity           |
| **dryRun**    | `false`                 | Dry Run execution             |
