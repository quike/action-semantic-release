/**
 * Default `releaseRules` rules for conventional-commits commit formats, following conventions.
 *
 * Structure mirrors @semantic-release/commit-analyzer's own defaults: cross-cutting rules that
 * act on commit metadata (`breaking`, `revert`) sit above the type-based rules. The `breaking`
 * rule has no `type` because conventional-commits parses `!` and `BREAKING CHANGE:` footers into
 * `commit.notes`, which commit-analyzer matches via the `breaking` flag independent of type.
 *
 * @type {Array}
 */

const releaseRulesConventionalCommits = [
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

export const defaultReleaseRules = new Map([['conventionalcommits', releaseRulesConventionalCommits]])

/**
 * Retrieves the release rules configuration for the specified preset.
 *
 * @param {string} preset - The preset name.
 * @returns {Object} The release rules configuration.
 */
export function getReleaseRules(preset = 'conventionalcommits') {
  return defaultReleaseRules.get(preset) ?? null
}
