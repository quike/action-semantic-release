import * as core from '@actions/core'
import { getConfig } from './get-config.js'
import { getOptions } from './get-options.js'
import { runSemanticRelease } from './semantic-release.js'
import { setSummary } from './set-summary.js'
import { verifyRelease } from './verify-release.js'
import { setFloatingTags } from './set-floating-tags.js'
import { getBooleanInput, getInput } from './utils.js'
import { INPUTS } from './constants.js'

/**
 * The main function for the action.
 *
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run() {
  try {
    let workingPathInput = getInput(INPUTS.WORKING_PATH)
    let workDir = '.'
    if (workingPathInput !== '${{ github.workspace }}') {
      workDir = workingPathInput
    }
    core.info(`working directory: ${workDir}`)
    const config = await getConfig(workDir)
    core.info(`configFile:  ${JSON.stringify(config, null, 2)}`)

    const options = await getOptions(config)
    const result = await runSemanticRelease(options, workDir)
    if (!result) {
      core.info('No release is published, stopping here.')
      return
    }
    const release = await verifyRelease(result)
    const dryRunInput = getBooleanInput(INPUTS.DRY_RUN)
    if (getBooleanInput(INPUTS.FLOATING_TAGS) && !dryRunInput) {
      await setFloatingTags(release, { cwd: workDir, env: process.env })
    }
    if (getBooleanInput(INPUTS.ADD_SUMMARY) && !dryRunInput) {
      await setSummary(release)
    }
  } catch (error) {
    console.error('Error executing action:', error)
    if (error instanceof Error) core.setFailed(error.message)
  }
}
