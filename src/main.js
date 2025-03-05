import * as core from '@actions/core'
import { getConfig } from './get-config.js'
import { getOptions } from './get-options.js'
import { runSemanticRelease } from './semantic-release.js'
import { setSummary } from './set-summary.js'
import { verifyRelease } from './verify-release.js'
import { setFloatingTags } from './set-floating-tags.js'
import { getBooleanInput, getInput } from './utils.js'

/**
 * The main function for the action.
 *
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run() {
  try {
    let workingPathInput = getInput('working-path', { required: false, default: '{}' })
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
      let dryRunInput = getBooleanInput('dry-run', { required: false, default: true })
      if (dryRunInput) {
        let floatingTagsInput = getBooleanInput('floating-tags', { required: false, default: false })
        if (floatingTagsInput) {
          await setFloatingTags(release, { cwd: workDir, env: process.env })
        }
        let addSummaryInput = getBooleanInput('add-summary', { required: false, default: false })
        if (addSummaryInput) {
          await setSummary(release)
        }
      }
    }
  } catch (error) {
    console.error('Error executing action:', error)
    if (error instanceof Error) core.setFailed(error.message)
  }
}
