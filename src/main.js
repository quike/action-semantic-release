import * as core from '@actions/core'
import { getConfig } from './get-config.js'
import { getOptions } from './get-options.js'
import { runSemanticRelease } from './semantic-release.js'
import { setSummary } from './set-summary.js'
import { verifyRelease } from './verify-release.js'
import { setFloatingTags } from './set-floating-tags.js'
import { exportCurrentVersion } from './get-last-release.js'
import { getBooleanInput, getInput, isPullOrMergeRequest } from './utils.js'
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
      // By default respect semantic-release: when nothing is released, emit no
      // version. Opt in with `fallback-current-version` to set RELEASE_VERSION to
      // the current (last released) version instead of leaving it empty. Skip on
      // pull/merge requests, where the CI wrapper already sets a short SHA.
      if (getBooleanInput(INPUTS.FALLBACK_CURRENT_VERSION) && !isPullOrMergeRequest()) {
        core.info('No release is published; fallback-current-version enabled, resolving the last released version.')
        await exportCurrentVersion(options.tagFormat, { cwd: workDir })
      } else {
        core.info('No release is published, stopping here.')
      }
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
