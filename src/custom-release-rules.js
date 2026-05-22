/**
 * Custom `releaseRules` for the opt-in `custom` preset, layered on conventional-commits parsing.
 *
 * Structure mirrors @semantic-release/commit-analyzer's own defaults: cross-cutting rules that
 * act on commit metadata (`breaking`, `revert`) sit above type-based rules. The `breaking` rule
 * has no `type` because conventional-commits parses `!` and `BREAKING CHANGE:` footers into
 * `commit.notes`, which commit-analyzer matches via the `breaking` flag independent of type.
 *
 * Project policy (opt-in via `preset: 'custom'`):
 *  - `chore` bumps a minor release. Rationale documented in docs/FAQ.md — every CI merge that
 *    produces a distributable artifact needs a unique version to avoid registry collisions and
 *    label/content drift.
 *  - `refactor` bumps a patch release (upstream does not release on refactor).
 *
 * @type {Array}
 */

const customReleaseRules = [
  { breaking: true, release: 'major' },
  { revert: true, release: 'patch' },
  { type: 'feat', release: 'minor' },
  { type: 'fix', release: 'patch' },
  { type: 'perf', release: 'patch' },
  { type: 'refactor', release: 'patch' },
  { type: 'revert', release: 'patch' },
  { type: 'chore', release: 'minor' },
  { type: 'docs', release: false },
  { type: 'style', release: false },
  { type: 'test', release: false },
  { type: 'ci', release: false },
  { type: 'build', release: false }
]

export const customReleaseRulesMap = new Map([['custom', customReleaseRules]])

/**
 * Retrieves the release rules configuration for the specified preset.
 *
 * @param {string} preset - The preset name.
 * @returns {Array|null} The release rules array, or null if not a custom preset.
 */
export function getCustomReleaseRules(preset = 'custom') {
  return customReleaseRulesMap.get(preset) ?? null
}
