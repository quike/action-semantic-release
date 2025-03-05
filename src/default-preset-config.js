/**
 * Default `presetConfig` rules for conventional-commits commit formats, following conventions.
 *
 * @type {{types: []}}
 */
const presetConfigConventionalCommits = {
  types: [
    { type: 'feat', section: 'Features' },
    { type: 'fix', section: 'Bug Fixes' },
    { type: 'perf', section: 'Performance Improvements' },
    { type: 'refactor', section: 'Code Refactoring' },
    { type: 'revert', section: 'Reverts' },
    { type: 'docs', section: 'Documentation', hidden: true },
    { type: 'test', section: 'Tests', hidden: true },
    { type: 'ci', section: 'Continuous Integration', hidden: true },
    { type: 'chore', section: 'Chores', hidden: true },
    { type: 'style', section: 'Styles', hidden: true },
    { type: 'build', section: 'Build System', hidden: true }
  ]
}

export const defaultPresetConfigs = new Map([['conventionalcommits', presetConfigConventionalCommits]])

/**
 * Retrieves the preset configuration for the specified preset.
 *
 * @param {string} preset - The preset name.
 * @returns {Object} The preset configuration.
 */
export function getPresetConfig(preset = 'conventionalcommits') {
  return defaultPresetConfigs.get(preset) ?? null
}
