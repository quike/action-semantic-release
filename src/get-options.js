import * as core from '@actions/core'
import { cleanObject } from './utils.js'
import { getPlugins } from './get-plugins.js'

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

  let dryRunInput = core.getBooleanInput('dry-run', { required: false })
  core.info(`dry-run: ${dryRunInput}`)
  dryRunInput = dryRunInput !== '' ? dryRunInput : false

  let debugModeInput = core.getBooleanInput('debug-mode', { required: false })
  core.info(`debug-mode: ${debugModeInput}`)
  debugModeInput = debugModeInput !== '' ? debugModeInput === true : ''

  const options = {
    branches: config.branches || ['master', 'main'],
    repositoryUrl: config.repositoryUrl || '',
    plugins: getPlugins(config),
    ci: config.ci !== undefined ? config.ci : true,
    debug: debugModeInput !== undefined ? debugModeInput : config.debug !== undefined ? config.debug : true,
    dryRun: dryRunInput !== undefined ? dryRunInput : config.dryRun !== undefined ? config.dryRun : false,
    tagFormat: config.tagFormat || '',
    verifyConditions: config.verifyConditions || [],
    prepare: config.prepare || [],
    publish: config.publish || [],
    success: config.success || [],
    fail: config.fail || [],
    gitCredentials: {
      GIT_AUTHOR_NAME: process.env.GIT_AUTHOR_NAME || '',
      GIT_AUTHOR_EMAIL: process.env.GIT_AUTHOR_EMAIL || '',
      GIT_COMMITTER_NAME: process.env.GIT_COMMITTER_NAME || '',
      GIT_COMMITTER_EMAIL: process.env.GIT_COMMITTER_EMAIL || ''
    }
  }

  // Remove unnecessary elements of the options
  cleanObject(options)

  core.info(`Options: ${JSON.stringify(options)}`)
  return options
}
