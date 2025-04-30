# FAQ

## Configuration

### **Not expected release types when preset is conventionalcommits**

This is covered on
[quike/action-semantic-release/issues/11](https://github.com/quike/action-semantic-release/issues/11).

We have introduced a mechanism to populate the required rules and config when using that preset. The code will check for
`@semantic-release/commit-analyzer` and `@semantic-release/release-notes-generator` plugins and add prefixed rules and
preset config if `"preset": "conventionalcommits"` is found but not `presetConfig` or `releaseRules` objects. To enable
this feature, set `"default-preset-info": true` in the action parameters.

### **Why alt-input parameter?**

More information on issue [@actions/toolkit#2034](https://github.com/actions/toolkit/issues/2034). If you want to use
the action outside GitHub (like in GitLab for example) your input parameters cannot include a dash/hyphen on their
separation. GitHub Action accepts the input parameters with them. But you cannot pass them in GitLab. That is why it is
required to remove the dash/hyphen and rely on the toolkit core to find an alternative env with `INPUT_` prefix.
