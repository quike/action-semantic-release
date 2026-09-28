import * as core from '@actions/core'
import { promises as fs } from 'fs'
import { resolve } from 'path'

/**
 * Writes the published release's notes verbatim to `path`. Not in dry-run:
 * nothing is tagged, so the notes would describe a version that doesn't exist.
 * Notes are a supplementary artifact, so a write failure warns and returns
 * null rather than failing the release that already published.
 *
 * @returns {Promise<string|null>} the resolved written path, or null when skipped/failed.
 */
export const writeNotes = async (release, { path, dryRun, cwd = process.cwd() }) => {
  const notes = release?.new?.notes
  if (!path || dryRun || !release?.published || !notes) {
    return null
  }
  const resolvedPath = resolve(cwd, path)
  try {
    await fs.writeFile(resolvedPath, notes, 'utf8')
  } catch (error) {
    core.warning(`Could not write release notes to ${resolvedPath}: ${error.message}`)
    return null
  }
  core.info(`Release notes written to ${resolvedPath} (${Buffer.byteLength(notes)} bytes).`)
  return resolvedPath
}
