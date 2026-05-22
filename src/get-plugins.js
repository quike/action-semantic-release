import * as core from '@actions/core'
import { getCustomPresetConfig } from './custom-preset-config.js'
import { getCustomReleaseRules } from './custom-release-rules.js'
import { getBooleanInput } from './utils.js'
import { INPUTS } from './constants.js'

const PLUGIN_CONFIG = {
  '@semantic-release/commit-analyzer': ['presetConfig', 'releaseRules'],
  '@semantic-release/release-notes-generator': ['presetConfig']
}

const CUSTOM_PRESET = 'custom'
const UNDERLYING_PRESET = 'conventionalcommits'

/**
 * Retrieves and processes configuration plugins for the semantic release action.
 *
 * When a plugin entry declares `preset: 'custom'`, this function always swaps the preset back to
 * `conventionalcommits` so semantic-release can find the actual parser (there is no
 * `conventional-changelog-custom` package). When `default-preset-info` is also enabled, it
 * additionally injects the opinionated `presetConfig` / `releaseRules` from
 * `custom-preset-config.js` / `custom-release-rules.js`. Any other preset is passed through
 * untouched.
 *
 * @param {Object} config - The configuration object.
 * @returns {Promise<Object>} The processed plugins object.
 */
export const getPlugins = async (config) => {
  if (!config) {
    core.error('No config provided')
    return {}
  }

  const plugins = config.plugins || []
  const defaultPresetInfoInput = getBooleanInput(INPUTS.DEFAULT_PRESET_INFO)

  return plugins.map((plugin) => {
    if (
      !Array.isArray(plugin) ||
      !Object.hasOwn(PLUGIN_CONFIG, plugin[0]) ||
      typeof plugin[1] !== 'object' ||
      plugin[1] === null ||
      plugin[1].preset !== CUSTOM_PRESET
    ) {
      return plugin
    }

    const pluginConfig = { ...plugin[1] }

    if (defaultPresetInfoInput) {
      PLUGIN_CONFIG[plugin[0]].forEach((field) => {
        if (
          !Object.hasOwn(pluginConfig, field) ||
          pluginConfig[field] == null ||
          Object.keys(pluginConfig[field]).length === 0
        ) {
          if (field === 'presetConfig') pluginConfig.presetConfig = getCustomPresetConfig(CUSTOM_PRESET)
          if (field === 'releaseRules') pluginConfig.releaseRules = getCustomReleaseRules(CUSTOM_PRESET)
        }
      })
    }

    pluginConfig.preset = UNDERLYING_PRESET
    return [plugin[0], pluginConfig]
  })
}
