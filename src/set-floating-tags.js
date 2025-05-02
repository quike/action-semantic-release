import * as core from '@actions/core'
import { execa } from 'execa'
import { DEFAULT_USER } from './constants.js'
import { getEnvVar } from './utils.js'

/**
 * Sets floating tags for the release.
 *
 * @param {Object} release - The release object containing version information.
 * @param {Object} options - Options for setting the tags.
 * @param {string} [options.cwd=process.cwd()] - The current working directory.
 * @param {Object} [options.env=process.env] - The environment variables.
 * @returns {Promise<Object>} The tags that were set.
 */
export const setFloatingTags = async (release, { cwd = process.cwd(), env = process.env }) => {
  if (release) {
    if (release.new?.major !== undefined && release.new?.minor !== undefined && release.new?.gitHead !== undefined) {
      const majorTag = `v${release?.new?.major}`
      const minorTag = `v${release?.new?.major}.${release?.new?.minor}`
      const gitHead = release?.new?.gitHead
      await setUp({ cwd, env })
      await deleteTag(majorTag, { cwd, env })
      await createTag(majorTag, gitHead, { cwd, env })
      await deleteTag(minorTag, { cwd, env })
      await createTag(minorTag, gitHead, { cwd, env })
      return { majorTag, minorTag }
    }
  } else {
    core.debug('Floating tags cannot be set.')
  }
  return {}
}

/**
 * Deletes a Git tag both locally and remotely.
 *
 * @param {string} myTag - The name of the tag to delete.
 * @param {Object} options - Options for deleting the tag.
 * @param {string} [options.cwd=process.cwd()] - The current working directory.
 * @param {Object} [options.env=process.env] - The environment variables.
 * @returns {Promise<void>} Resolves when the tag has been deleted.
 */
const deleteTag = async (myTag, options) => {
  core.info(`Deleting tag: ${myTag}`)
  try {
    await execa('git', ['tag', myTag, '-d'], options)
    await execa('git', ['push', 'origin', '--delete', myTag], options)
  } catch (error) {
    core.error(`Unable to delete tag. Error: ${error}`)
  }
}

/**
 * Creates a Git tag both locally and remotely.
 *
 * @param {string} myTag - The name of the tag to create.
 * @param {string} gitHead - The Git commit SHA to tag.
 * @param {Object} options - Options for creating the tag.
 * @param {string} [options.cwd=process.cwd()] - The current working directory.
 * @param {Object} [options.env=process.env] - The environment variables.
 * @returns {Promise<void>} Resolves when the tag has been created.
 */
const createTag = async (myTag, gitHead, options) => {
  core.info(`Creating tag: ${myTag}`)
  try {
    await execa('git', ['tag', myTag, gitHead], options)
    await execa('git', ['push', 'origin', myTag], options)
  } catch (error) {
    core.error(`Unable to create tag. Error: ${error}`)
  }
}

/**
 * Config version control details.
 *
 * @param {Object} options - Options for creating the tag.
 * @param {string} [options.cwd=process.cwd()] - The current working directory.
 * @param {Object} [options.env=process.env] - The environment variables.
 * @returns {Promise<void>} Resolves when setup is completed.
 */
const setUp = async (options) => {
  const userName = getEnvVar('GIT_COMMITTER_NAME', DEFAULT_USER.USER_NAME)
  const userEmail = getEnvVar('GIT_COMMITTER_EMAIL', DEFAULT_USER.USER_EMAIL)
  core.info(`Setting up env pre tagging with user: ${DEFAULT_USER.USER_NAME}`)
  try {
    await execa('git', ['config', 'user.name', userName], options)
    await execa('git', ['config', 'user.email', userEmail], options)
  } catch (error) {
    core.error(`Unable to set up. Error: ${error}`)
  }
}
