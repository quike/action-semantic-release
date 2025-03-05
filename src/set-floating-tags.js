import * as core from '@actions/core'
import { tag } from 'semantic-release/lib/git.js'
import { execa } from 'execa'

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
      core.info(`Setting floating major tag: ${majorTag}`)
      await tag(majorTag, '-d', { cwd, env })
      await execa('git', ['push', 'origin', '--delete', majorTag], { cwd, env })
      await tag(majorTag, gitHead, { cwd, env })
      core.info(`Setting floating minor tag: ${minorTag}`)
      await tag(minorTag, '-d', { cwd, env })
      await execa('git', ['push', 'origin', '--delete', minorTag], { cwd, env })
      await tag(minorTag, gitHead, { cwd, env })
      await execa('git', ['push', 'origin', majorTag, minorTag], { cwd, env })
      return { majorTag, minorTag }
    }
  } else {
    core.debug('Floating tags cannot be set.')
  }
  return {}
}
