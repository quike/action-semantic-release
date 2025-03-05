/**
 * Default `releaseRules` rules for conventional-commits commit formats, following conventions.
 *
 * @type {Array}
 */

const releaseRulesConventionalCommits = [
  { type: 'feat', release: 'minor' },
  { type: 'fix', release: 'patch' },
  { type: 'perf', release: 'patch' },
  { type: 'refactor', release: 'patch' },
  { type: 'revert', release: 'patch' },
  { type: 'BREAKING CHANGE', release: 'major' },
  { type: 'chore', release: 'minor' },
  { type: 'docs', release: false },
  { type: 'style', release: false },
  { type: 'test', release: false },
  { type: 'ci', release: false },
  { type: 'build', release: false }
]

export const defaultReleaseRules = new Map([['conventionalcommits', releaseRulesConventionalCommits]])

export function getReleaseRules(preset = 'conventionalcommits') {
  return defaultReleaseRules.get(preset) ?? null
}
