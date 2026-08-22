import * as core from '@actions/core'
import { execa } from 'execa'
import semver from 'semver'

// Captures a semantic version (with optional pre-release / build metadata) from a tag.
const SEMVER = '(\\d+\\.\\d+\\.\\d+(?:[-+][0-9A-Za-z.-]+)*)'

/**
 * Builds a regex that extracts the version out of a git tag, honoring the same
 * `tagFormat` semantic-release uses. When no format is configured, semantic-release
 * defaults to `v${version}`, so we mirror that here.
 *
 * @param {string} tagFormat - The semantic-release tagFormat (may be empty).
 * @returns {RegExp} A regex whose first capture group is the version.
 */
export const buildTagRegex = (tagFormat) => {
  const format = tagFormat && tagFormat.length > 0 ? tagFormat : 'v${version}'
  const [prefix, suffix = ''] = format.split('${version}')
  const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`^${escape(prefix)}${SEMVER}${escape(suffix)}$`)
}

/**
 * Resolves the most recent released version from git tags. This is the equivalent
 * of semantic-release's `lastRelease.version`, which it computes but does not
 * expose when it publishes nothing (it returns `false`/`{ releases }` without
 * `lastRelease`). This mirrors semantic-release's own `lib/get-last-release.js`
 * for a stable branch: from the tags reachable from HEAD (semantic-release scopes
 * to `git tag --merged <branch>`), keep valid, non-pre-release versions and take
 * the highest by semver precedence (semver ordering, not git's `--sort=v:refname`,
 * which ranks pre-releases above their stable counterpart).
 *
 * @param {string} tagFormat - The semantic-release tagFormat (may be empty).
 * @param {Object} [options] - Execution options.
 * @param {string} [options.cwd=process.cwd()] - The current working directory.
 * @param {Object} [options.env=process.env] - The environment variables.
 * @returns {Promise<string>} The current version, or '' when no release tag exists.
 */
export const getLastReleaseVersion = async (tagFormat, { cwd = process.cwd(), env = process.env } = {}) => {
  const regex = buildTagRegex(tagFormat)
  let output
  try {
    output = await execa('git', ['tag', '--merged', 'HEAD'], { cwd, env })
  } catch (error) {
    core.warning(`Unable to list git tags to resolve the current version: ${error?.message ?? error}`)
    return ''
  }
  const versions = []
  for (const tag of output.stdout.split('\n').map((line) => line.trim())) {
    const match = regex.exec(tag)
    // Skip pre-releases: like semantic-release, a stable branch's last release is
    // the highest stable tag; a lone pre-release is not treated as a release.
    if (match && semver.valid(match[1]) && !semver.prerelease(match[1])) {
      versions.push(match[1])
    }
  }
  return versions.length > 0 ? semver.rsort(versions)[0] : ''
}

/**
 * Opt-in fallback (enabled via the `fallback-current-version` input): when
 * semantic-release publishes nothing, populate RELEASE_VERSION with the current
 * (last released) version so downstream consumers receive a valid tag instead of
 * an empty value. Off by default to preserve semantic-release's native behavior.
 *
 * @param {string} tagFormat - The semantic-release tagFormat (may be empty).
 * @param {Object} [options] - Execution options.
 * @param {string} [options.cwd=process.cwd()] - The current working directory.
 * @param {Object} [options.env=process.env] - The environment variables.
 * @returns {Promise<string>} The exported version, or '' when none was found.
 */
export const exportCurrentVersion = async (tagFormat, { cwd = process.cwd(), env = process.env } = {}) => {
  const version = await getLastReleaseVersion(tagFormat, { cwd, env })
  if (!version) {
    core.info('No previous release tag found; RELEASE_VERSION left unset.')
    return ''
  }
  core.info(`No release published; setting RELEASE_VERSION to current version ${version}.`)
  core.exportVariable('RELEASE_VERSION', version)
  core.setOutput('release-version', version)
  return version
}
