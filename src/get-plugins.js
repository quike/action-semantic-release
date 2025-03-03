import * as core from '@actions/core'
import { defaultPresetConfigs, getPresetConfig } from './default-preset-config.js'
import { getReleaseRules } from './default-release-rules.js'

const PLUGIN_CONFIG = {
  '@semantic-release/commit-analyzer': ['presetConfig', 'releaseRules'],
  '@semantic-release/release-notes-generator': ['presetConfig']
}

/**
 * Retrieves and processes configuration plugins for the semantic release action.
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

  let defaultPresetInfoInput = core.getBooleanInput('default-preset-info', { required: false })
  core.info(`set-default-preset-info: ${defaultPresetInfoInput}`)
  defaultPresetInfoInput = defaultPresetInfoInput !== '' ? defaultPresetInfoInput === true : ''

  if (defaultPresetInfoInput) {
    return plugins.map((plugin) => {
      if (
        Array.isArray(plugin) &&
        PLUGIN_CONFIG.hasOwnProperty(plugin[0]) &&
        typeof plugin[1] === 'object' &&
        plugin[1] !== null &&
        'preset' in plugin[1] // Only modify if 'preset' exists
      ) {
        const presetName = plugin[1].preset // Get the preset value from the plugin
        // Get the required configuration properties for this plugin from PLUGIN_CONFIG
        const requiredConfig = PLUGIN_CONFIG[plugin[0]]

        // Start by copying the original plugin config
        let pluginConfig = { ...plugin[1] }

        // Dynamically add required configuration properties based on the requiredConfig array
        requiredConfig.forEach((config) => {
          if (
            !pluginConfig.hasOwnProperty(config) ||
            pluginConfig[config] == null ||
            Object.keys(pluginConfig[config]).length === 0
          ) {
            switch (config) {
              case 'presetConfig':
                pluginConfig.presetConfig = getPresetConfig(presetName) // Only add presetConfig if it's required
                break
              case 'releaseRules':
                pluginConfig.releaseRules = getReleaseRules(presetName) // Only add releaseRules if it's required
                break
            }
          }
        })

        // Return the modified plugin configuration
        return [plugin[0], pluginConfig]
      }
      return plugin
    })
  }

  core.debug(`Plugins: ${JSON.stringify(plugins)}`)
  return plugins
}
