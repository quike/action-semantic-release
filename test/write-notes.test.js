import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mkdtempSync, readFileSync, existsSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import * as core from '@actions/core'
import { writeNotes } from '../src/write-notes.js'

vi.mock('@actions/core', () => ({ info: vi.fn(), debug: vi.fn(), warning: vi.fn() }))

const release = (notes) => ({ published: true, new: { version: '2.0.0', notes } })

describe('writeNotes', () => {
  let dir
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'notes-'))
    vi.clearAllMocks()
  })

  it('writes the notes byte-identical, including shell metacharacters and emoji', async () => {
    const notes = '## 2.0.0\n\n* "quoted" `tick` $(rm -rf /) ${HOME} 🚀 ⚠\n'
    const path = join(dir, 'release-notes.md')
    expect(await writeNotes(release(notes), { path, dryRun: false })).toBe(path)
    expect(readFileSync(path, 'utf8')).toBe(notes)
  })

  it('does nothing when the input is empty', async () => {
    expect(await writeNotes(release('x'), { path: '', dryRun: false })).toBeNull()
  })

  it('does nothing in dry-run, so no notes exist for an untagged version', async () => {
    const path = join(dir, 'release-notes.md')
    expect(await writeNotes(release('x'), { path, dryRun: true })).toBeNull()
    expect(existsSync(path)).toBe(false)
  })

  it('does nothing when no release was published or notes are empty', async () => {
    const path = join(dir, 'release-notes.md')
    expect(await writeNotes(null, { path, dryRun: false })).toBeNull()
    expect(await writeNotes(release(''), { path, dryRun: false })).toBeNull()
    expect(existsSync(path)).toBe(false)
  })

  it('warns and returns null instead of failing the release when the write fails', async () => {
    const path = join(dir, 'missing-subdir', 'release-notes.md')
    expect(await writeNotes(release('x'), { path, dryRun: false })).toBeNull()
    expect(core.warning).toHaveBeenCalledWith(expect.stringContaining(path))
  })

  it('resolves a relative path against cwd', async () => {
    const notes = 'relative notes\n'
    expect(await writeNotes(release(notes), { path: 'release-notes.md', dryRun: false, cwd: dir })).toBe(
      join(dir, 'release-notes.md')
    )
    expect(readFileSync(join(dir, 'release-notes.md'), 'utf8')).toBe(notes)
  })
})
