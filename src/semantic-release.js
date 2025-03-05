/**
 * Runs the semantic release process with the given options and working directory.
 *
 * @param {Object} options - The options to pass to the semantic release process.
 * @param {string} workdir - The working directory where the semantic release process should be executed.
 * @returns {Promise<Object|null>} The result of the semantic release process, or null if no release was published.
 *
 * @throws {Error} If the semantic release process fails.
 */
import semanticRelease from 'semantic-release'
import * as core from '@actions/core'

export const runSemanticRelease = async (options, workdir) => {
  const result = await semanticRelease(options, { cwd: workdir })
  core.info(`Semantic Release Execution Result: ${JSON.stringify(result, null, 2)}`)
  if (!result) {
    core.debug('No release published')
    core.exportVariable('RELEASE_PUBLISHED', 'false')
    core.setOutput('release-published', 'false')
  }
  return result
}
