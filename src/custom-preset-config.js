/**
 * Custom `presetConfig` for the opt-in `custom` preset.
 *
 * Differences vs upstream `conventional-changelog-conventionalcommits`:
 *  - `refactor` and `chore` sections are visible in the changelog (upstream hides both).
 *
 * Section labels match upstream. The `feature` alias mirrors upstream so commits like `feature:`
 * are grouped under Features.
 *
 * The Map is keyed by the synthetic preset name `custom` — not a real conventional-changelog
 * preset. `get-plugins.js` swaps the preset back to `conventionalcommits` before semantic-release
 * loads the parser.
 *
 * @type {{types: []}}
 */
const customPresetConfig = {
  types: [
    { type: 'feat', section: 'Features' },
    { type: 'feature', section: 'Features' },
    { type: 'fix', section: 'Bug Fixes' },
    { type: 'perf', section: 'Performance Improvements' },
    { type: 'refactor', section: 'Code Refactoring' },
    { type: 'revert', section: 'Reverts' },
    { type: 'docs', section: 'Documentation', hidden: true },
    { type: 'test', section: 'Tests', hidden: true },
    { type: 'ci', section: 'Continuous Integration', hidden: true },
    { type: 'chore', section: 'Miscellaneous Chores' },
    { type: 'style', section: 'Styles', hidden: true },
    { type: 'build', section: 'Build System', hidden: true }
  ]
}

export const customPresetConfigs = new Map([['custom', customPresetConfig]])

/**
 * Retrieves the preset configuration for the specified preset.
 *
 * @param {string} preset - The preset name.
 * @returns {Object|null} The preset configuration, or null if not a custom preset.
 */
export function getCustomPresetConfig(preset = 'custom') {
  return customPresetConfigs.get(preset) ?? null
}
