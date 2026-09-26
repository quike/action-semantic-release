import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as core from '@actions/core'
import { getConfig } from '../src/get-config.js'
import { getOptions } from '../src/get-options.js'
import { runSemanticRelease } from '../src/semantic-release.js'
import { verifyRelease } from '../src/verify-release.js'
import { setSummary } from '../src/set-summary.js'
import { setFloatingTags } from '../src/set-floating-tags.js'
import { writeNotes } from '../src/write-notes.js'
import { run } from '../src/main.js'

vi.mock('@actions/core')
vi.mock('../src/get-config.js')
vi.mock('../src/get-options.js')
vi.mock('../src/semantic-release.js')
vi.mock('../src/verify-release.js')
vi.mock('../src/set-summary.js')
vi.mock('../src/set-floating-tags.js')
vi.mock('../src/write-notes.js')

describe('run', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    getConfig.mockResolvedValue({})
    getOptions.mockResolvedValue({})
    runSemanticRelease.mockResolvedValue({})
    verifyRelease.mockResolvedValue({ published: true, new: { notes: 'notes' } })
    setSummary.mockResolvedValue()
    setFloatingTags.mockResolvedValue()
    writeNotes.mockResolvedValue(null)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('calls writeNotes with the notes-file input and the dry-run flag', async () => {
    core.getInput.mockImplementation((name) => (name === 'notes-file' ? 'release-notes.md' : ''))
    core.getBooleanInput.mockReturnValue(false)

    await run()

    expect(writeNotes).toHaveBeenCalledWith(
      { published: true, new: { notes: 'notes' } },
      { path: 'release-notes.md', dryRun: false }
    )
  })
})
