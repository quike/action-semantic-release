# FAQ

## Configuration

### **What does `preset: "custom"` do?**

This action ships an opt-in preset named `custom`. It is **not** a real
[conventional-changelog](https://github.com/conventional-changelog/conventional-changelog) package. When a plugin entry
declares `preset: "custom"` and the action input `default-preset-info: true` is set, the action:

1. Injects an opinionated `presetConfig` (visible `refactor` + `chore` sections, plus the `feature` alias that mirrors
   upstream conventional-commits).
2. Injects an opinionated `releaseRules` array (notably `chore: minor` and `refactor: patch`).
3. Swaps the `preset` value back to `conventionalcommits` so semantic-release loads the real parser under the hood.

Any other preset (`conventionalcommits`, `angular`, `eslint`, `ember`, …) is passed through to semantic-release
untouched, with no injection.

Users who want vanilla semantic-release behavior should set `preset: "conventionalcommits"` in their `.releaserc`. Users
who want the action's opinions should set `preset: "custom"` — or omit their `.releaserc` entirely and let
`.releaserc.default` (which already uses `custom`) take over.

#### Changelog sections: `custom` vs upstream `conventionalcommits`

Compares what each commit type renders as in the generated changelog. Sources:
[`conventional-changelog-conventionalcommits/src/constants.js`](https://github.com/conventional-changelog/conventional-changelog/blob/master/packages/conventional-changelog-conventionalcommits/src/constants.js)
and [`src/custom-preset-config.js`](../src/custom-preset-config.js).

| Type              | Upstream (`conventionalcommits`)   | This action (`custom`)             | Effect                                          |
| ----------------- | ---------------------------------- | ---------------------------------- | ----------------------------------------------- |
| `feat`            | Features (visible)                 | Features (visible)                 | same                                            |
| `feature` (alias) | Features (visible)                 | Features (visible)                 | same                                            |
| `fix`             | `Bug Fixes` (visible)              | `Bug Fixes` (visible)              | same                                            |
| `perf`            | Performance Improvements (visible) | Performance Improvements (visible) | same                                            |
| `revert`          | Reverts (visible)                  | Reverts (visible)                  | same                                            |
| `refactor`        | Code Refactoring (hidden)          | Code Refactoring (visible)         | ← `custom` surfaces refactor work in changelogs |
| `chore`           | Miscellaneous Chores (hidden)      | Miscellaneous Chores (visible)     | ← `custom` surfaces chores in changelogs        |
| `docs`            | Documentation (hidden)             | Documentation (hidden)             | same                                            |
| `style`           | Styles (hidden)                    | Styles (hidden)                    | same                                            |
| `test`            | Tests (hidden)                     | Tests (hidden)                     | same                                            |
| `ci`              | Continuous Integration (hidden)    | Continuous Integration (hidden)    | same                                            |
| `build`           | `Build System` (hidden)            | `Build System` (hidden)            | same                                            |

#### Release rules: `custom` vs upstream `conventionalcommits`

Compares what each commit triggers as a release. "Upstream" here means
[`@semantic-release/commit-analyzer`'s bundled defaults](https://github.com/semantic-release/commit-analyzer/blob/master/lib/default-release-rules.js)
applied to commits parsed by `conventional-changelog-conventionalcommits`. Source:
[`src/custom-release-rules.js`](../src/custom-release-rules.js).

| Rule             | Upstream (`conventionalcommits`) | This action (`custom`) | Effect                                                |
| ---------------- | -------------------------------- | ---------------------- | ----------------------------------------------------- |
| `breaking: true` | major                            | major                  | same                                                  |
| `revert: true`   | patch                            | patch                  | same (parser-flagged reverts like `Revert "feat: x"`) |
| `feat`           | minor                            | minor                  | same                                                  |
| `fix`            | patch                            | patch                  | same                                                  |
| `perf`           | patch                            | patch                  | same                                                  |
| `refactor`       | no release                       | patch                  | ← `custom` cuts a patch for refactor work             |
| `revert` (type)  | no release                       | patch                  | ← `custom` cuts a patch for `revert:` typed commits   |
| `chore`          | no release                       | minor                  | ← `custom` cuts a minor for chores (see next section) |
| `docs`           | no release                       | no release             | same                                                  |
| `style`          | no release                       | no release             | same                                                  |
| `test`           | no release                       | no release             | same                                                  |
| `ci`             | no release                       | no release             | same                                                  |
| `build`          | no release                       | no release             | same                                                  |

### **Why does `chore` bump a minor release under the `custom` preset?**

There are genuinely two valid philosophies on what triggers a version bump:

- **Semver-purist:** the version reflects user-visible change. `chore` doesn't bump because nothing observable changed.
- **Artifact-identity:** every CI build produces a distributable, and every distributable needs a unique immutable
  version. Skipping a bump means re-publishing a different artifact under the same tag — registry collision, silent
  overwrite, or worse: production ships code that doesn't match its label. To avoid this without `chore: minor`, you'd
  have to enforce strict commit hygiene so no prod-affecting change ever slips in as `chore`/`docs`/etc., which is
  fragile and human-dependent.

For an action shipped as a Docker image to teams running CI/CD pipelines that build and distribute on every merge, the
artifact-identity stance is the more defensible default. So `chore: minor` isn't a bug — it's a deliberate policy
choice. It now lives behind an explicit opt-in (`preset: "custom"`) instead of silently hijacking `conventionalcommits`,
so the opinion is visible and overridable.

If you prefer the semver-purist behavior, switch your `.releaserc` to `preset: "conventionalcommits"` and the action
will not inject any release rules — you get upstream commit-analyzer defaults.

### **Why alt-input parameter?**

More information on issue [@actions/toolkit#2034](https://github.com/actions/toolkit/issues/2034). If you want to use
the action outside GitHub (like in GitLab for example) your input parameters cannot include a dash/hyphen on their
separation. GitHub Action accepts the input parameters with them. But you cannot pass them in GitLab. That is why it is
required to remove the dash/hyphen and rely on the toolkit core to find an alternative env with `INPUT_` prefix.
