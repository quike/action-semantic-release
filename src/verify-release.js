import * as core from '@actions/core'
import { cleanObject } from './utils.js'

/**
 * Verifies and exports release information.
 * @param result
 */
export const verifyRelease = async (result) => {
  const { lastRelease, nextRelease, commits } = result

  core.info(`Latest release: ${lastRelease.version}.`)
  core.info(`New release: ${nextRelease.version} of type ${nextRelease.type}.`)
  core.info(`Number of commits on new release: ${commits.length}.`)

  if (lastRelease.version) {
    core.info(`The last release was "${lastRelease.version}".`)
  }
  core.info(`Release ${nextRelease.type} with Version ${nextRelease.version}`)

  const { version, notes, type, channel, gitHead, gitTag, name } = nextRelease
  const [major, minor, patch] = version.split('.')

  const release = {
    published: nextRelease !== undefined,
    last: {
      version: lastRelease.version !== undefined ? lastRelease.version : '',
      gitHead: lastRelease.gitHead !== undefined ? lastRelease.gitHead : '',
      gitTag: lastRelease.gitTag !== undefined ? lastRelease.gitTag : '',
      name: lastRelease.name !== undefined ? lastRelease.name : ''
    },
    new: {
      version,
      major,
      minor,
      patch,
      type,
      channel,
      gitHead,
      gitTag,
      name,
      notes
    },
    commits: commits
  }

  cleanObject(release)

  // Mapping of keys to their corresponding values using a Map
  const exportMapping = new Map([
    ['RELEASE_PUBLISHED', release.published],
    ['RELEASE_VERSION', release.new.version],
    ['RELEASE_MAJOR', release.new.major],
    ['RELEASE_MINOR', release.new.minor],
    ['RELEASE_PATCH', release.new.patch],
    ['RELEASE_TYPE', release.new.type],
    ['RELEASE_GIT_HEAD', release.new.gitHead],
    ['RELEASE_GIT_TAG', release.new.gitTag],
    ['RELEASE_NAME', release.new.name]
  ])

  // Export release details as environment variables and system outputs
  exportMapping.forEach((value, envKey) => {
    const outputKey = envKey.toLowerCase().replace(/_/g, '-')
    exportVariable(envKey, value)
    setOutput(outputKey, value)
  })

  return release
}

const setOutput = (key, value) => {
  core.debug(`set-output: ${key}=${value}`)
  core.setOutput(key, value)
}

const exportVariable = (key, value) => {
  core.debug(`export-variable: ${key}=${value}`)
  core.exportVariable(key, value)
}
