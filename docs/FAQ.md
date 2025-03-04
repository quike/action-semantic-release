# FAQ

## Configuration

### **Not expected release types when preset is conventionalcommits**

This is covered on
[quike/action-semantic-release/issues/11](https://github.com/quike/action-semantic-release/issues/11).

We have introduced a mechanism to populate the required rules and config when using that preset. The code will check for
`@semantic-release/commit-analyzer` and `@semantic-release/release-notes-generator` plugins and add prefixed rules and
preset config if `"preset": "conventionalcommits"` is found but not `presetConfig` or `releaseRules` objects. To enable
this feature, set `"default-preset-info": true` in the action parameters.
