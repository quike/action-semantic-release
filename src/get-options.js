import * as core from '@actions/core'
import { cleanObject, getBooleanInput, getEnvVar } from './utils.js'
import { getPlugins } from './get-plugins.js'
import { DEFAULT_USER, INPUTS } from './constants.js'

/**
 * Retrieves and processes configuration options for the semantic release action.
 *
 * @param {Object} config - The configuration object.
 * @returns {Promise<Object>} The processed options object.
 */
export const getOptions = async (config) => {
  if (!config) {
    core.error('No config provided')
    return {}
  }

  let dryRunInput = getBooleanInput(INPUTS.DRY_RUN)
  let debugModeInput = getBooleanInput(INPUTS.DEBUG_MODE)

  const options = {
    branches: config.branches || ['master', 'main'],
    repositoryUrl: config.repositoryUrl || '',
    plugins: (await getPlugins(config)) || config.plugins || [],
    ci: config.ci !== undefined ? config.ci : true,
    debug:
      config.debug !== undefined
        ? config.debug
        : debugModeInput !== undefined
          ? debugModeInput
          : INPUTS.DEBUG_MODE.default,
    dryRun:
      config.dryRun !== undefined ? config.dryRun : dryRunInput !== undefined ? dryRunInput : INPUTS.DRY_RUN.default,
    tagFormat: config.tagFormat || '',
    verifyConditions: config.verifyConditions || [],
    prepare: config.prepare || [],
    publish: config.publish || [],
    success: config.success || [],
    fail: config.fail || [],
    gitCredentials: {
      GIT_AUTHOR_NAME: getEnvVar('GIT_AUTHOR_NAME', DEFAULT_USER.USER_NAME),
      GIT_AUTHOR_EMAIL: getEnvVar('GIT_AUTHOR_EMAIL', DEFAULT_USER.USER_EMAIL),
      GIT_COMMITTER_NAME: getEnvVar('GIT_COMMITTER_NAME', DEFAULT_USER.USER_NAME),
      GIT_COMMITTER_EMAIL: getEnvVar('GIT_COMMITTER_EMAIL', DEFAULT_USER.USER_EMAIL)
    }
  }

  // Remove unnecessary elements of the options
  cleanObject(options)

  core.info(`Options: ${JSON.stringify(options)}`)
  return options
}
