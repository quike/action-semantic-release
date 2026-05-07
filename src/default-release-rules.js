/**
 * Default `releaseRules` rules for conventional-commits commit formats, following conventions.
 *
 * @type {Array}
 */

const releaseRulesConventionalCommits = [
  { type: 'feat', breaking: false, release: 'minor' },
  { type: 'fix', breaking: false, release: 'patch' },
  { type: 'perf', breaking: false, release: 'patch' },
  { type: 'refactor', breaking: false, release: 'patch' },
  { type: 'revert', breaking: false, release: 'patch' },
  { type: 'BREAKING CHANGE', breaking: true, release: 'major' },
  { type: 'chore', breaking: false, release: 'minor' },
  { type: 'docs', breaking: false, release: false },
  { type: 'style', breaking: false, release: false },
  { type: 'test', breaking: false, release: false },
  { type: 'ci', breaking: false, release: false },
  { type: 'build', breaking: false, release: false }
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
