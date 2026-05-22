# FAQ

## Configuration

### **What does `preset: "custom"` do?**

This action ships an opt-in preset named `custom`. It is **not** a real
[conventional-changelog](https://github.com/conventional-changelog/conventional-changelog) package.
When a plugin entry declares `preset: "custom"` and the action input `default-preset-info: true`
is set, the action:

1. Injects an opinionated `presetConfig` (visible `refactor` + `chore` sections, plus the
   `feature` alias that mirrors upstream conventional-commits).
2. Injects an opinionated `releaseRules` array (notably `chore: minor` and `refactor: patch`).
3. Swaps the `preset` value back to `conventionalcommits` so semantic-release loads the real
   parser under the hood.

Any other preset (`conventionalcommits`, `angular`, `eslint`, `ember`, …) is passed through to
semantic-release untouched, with no injection.

Users who want vanilla semantic-release behavior should set `preset: "conventionalcommits"` in
their `.releaserc`. Users who want the action's opinions should set `preset: "custom"` — or omit
their `.releaserc` entirely and let `.releaserc.default` (which already uses `custom`) take over.

### **Why does `chore` bump a minor release under the `custom` preset?**

There are genuinely two valid philosophies on what triggers a version bump:

- **Semver-purist:** the version reflects user-visible change. `chore` doesn't bump because
  nothing observable changed.
- **Artifact-identity:** every CI build produces a distributable, and every distributable needs
  a unique immutable version. Skipping a bump means re-publishing a different artifact under the
  same tag — registry collision, silent overwrite, or worse: production ships code that doesn't
  match its label. To avoid this without `chore: minor`, you'd have to enforce strict commit
  hygiene so no prod-affecting change ever slips in as `chore`/`docs`/etc., which is fragile and
  human-dependent.

For an action shipped as a Docker image to teams running CI/CD pipelines that build and
distribute on every merge, the artifact-identity stance is the more defensible default. So
`chore: minor` isn't a bug — it's a deliberate policy choice. It now lives behind an explicit
opt-in (`preset: "custom"`) instead of silently hijacking `conventionalcommits`, so the opinion
is visible and overridable.

If you prefer the semver-purist behavior, switch your `.releaserc` to
`preset: "conventionalcommits"` and the action will not inject any release rules — you get
upstream commit-analyzer defaults.

### **Why alt-input parameter?**

More information on issue [@actions/toolkit#2034](https://github.com/actions/toolkit/issues/2034). If you want to use
the action outside GitHub (like in GitLab for example) your input parameters cannot include a dash/hyphen on their
separation. GitHub Action accepts the input parameters with them. But you cannot pass them in GitLab. That is why it is
required to remove the dash/hyphen and rely on the toolkit core to find an alternative env with `INPUT_` prefix.
