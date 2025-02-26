import * as core from '@actions/core'
import { getConfig } from './get-config.js'
import { getOptions } from './get-options.js'
import { runSemanticRelease } from './semantic-release.js'
import { setSummary } from './set-summary.js'
import { verifyRelease } from './verify-release.js'

/**
 * The main function for the action.
 *
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run() {
  try {
    let workingPathInput = core.getInput('working-path', { required: false }) || '{}'
    core.info(`workingPath: ${workingPathInput}`)
    let workDir = '.'
    if (workingPathInput !== '${{ github.workspace }}') {
      workDir = workingPathInput
    }
    core.info(`working directory: ${workDir}`)
    const config = await getConfig(workDir)
    core.info(`configFile:  ${JSON.stringify(config, null, 2)}`)

    const options = await getOptions(config)
    const result = await runSemanticRelease(options, workDir)
    if (result) {
      const release = await verifyRelease(result)
      if (!release) {
        core.error(`Error verifying release: ${release}`)
      }
      let addSummaryInput = core.getBooleanInput('add-summary', { required: false })
      core.info(`add-summary: ${addSummaryInput}`)
      addSummaryInput = addSummaryInput !== '' ? addSummaryInput : false
      if (addSummaryInput) {
        await setSummary(release)
      }
    }
  } catch (error) {
    console.error('Error executing action:', error)
    if (error instanceof Error) core.setFailed(error.message)
  }
}
