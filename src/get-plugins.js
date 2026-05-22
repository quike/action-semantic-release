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
 * When a plugin entry declares `preset: 'custom'`, this function injects the custom presetConfig
 * and releaseRules from `custom-preset-config.js` / `custom-release-rules.js`, then swaps the
 * preset name back to `conventionalcommits` so semantic-release can find the actual parser
 * (there is no `conventional-changelog-custom` package). Any other preset is passed through
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

  let plugins = config.plugins || []

  let defaultPresetInfoInput = getBooleanInput(INPUTS.DEFAULT_PRESET_INFO)
  if (defaultPresetInfoInput) {
    return plugins.map((plugin) => {
      if (
        Array.isArray(plugin) &&
        Object.hasOwn(PLUGIN_CONFIG, plugin[0]) &&
        typeof plugin[1] === 'object' &&
        plugin[1] !== null &&
        plugin[1].preset === CUSTOM_PRESET
      ) {
        const requiredConfig = PLUGIN_CONFIG[plugin[0]]
        let pluginConfig = { ...plugin[1] }

        requiredConfig.forEach((field) => {
          if (
            !Object.hasOwn(pluginConfig, field) ||
            pluginConfig[field] == null ||
            Object.keys(pluginConfig[field]).length === 0
          ) {
            switch (field) {
              case 'presetConfig':
                pluginConfig.presetConfig = getCustomPresetConfig(CUSTOM_PRESET)
                break
              case 'releaseRules':
                pluginConfig.releaseRules = getCustomReleaseRules(CUSTOM_PRESET)
                break
            }
          }
        })

        pluginConfig.preset = UNDERLYING_PRESET

        return [plugin[0], pluginConfig]
      }
      return plugin
    })
  }

  core.debug(`Plugins: ${JSON.stringify(plugins)}`)
  return plugins
}
