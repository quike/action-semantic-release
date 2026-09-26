import * as core from '@actions/core'
import { promises as fs } from 'fs'

/**
 * Writes the published release's notes verbatim to `path`. Not in dry-run:
 * nothing is tagged, so the notes would describe a version that doesn't exist.
 *
 * @returns {Promise<string|null>} the written path, or null when skipped.
 */
export const writeNotes = async (release, { path, dryRun }) => {
  const notes = release?.new?.notes
  if (!path || dryRun || !release?.published || !notes) {
    return null
  }
  await fs.writeFile(path, notes, 'utf8')
  core.info(`Release notes written to ${path} (${Buffer.byteLength(notes)} bytes).`)
  return path
}
