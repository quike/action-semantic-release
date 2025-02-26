import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as core from '@actions/core'
import { setSummary } from '../src/set-summary.js'

vi.mock('@actions/core', () => ({
  info: vi.fn(),
  summary: {
    addRaw: vi.fn(),
    addEOL: vi.fn(),
    addHeading: vi.fn(),
    addCodeBlock: vi.fn(),
    write: vi.fn()
  }
}))

vi.mock('handlebars', async () => {
  const original = await vi.importActual('handlebars')
  return {
    ...original,
    compile: vi.fn().mockReturnValue(vi.fn().mockReturnValue('compiled template')),
    registerHelper: vi.fn()
  }
})

describe('setSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should generate and write the summary correctly', async () => {
    const release = {
      published: true,
      new: {
        version: '1.0.0',
        type: 'major',
        gitTag: 'v1.0.0',
        gitHead: 'abc123',
        notes: 'Initial release'
      },
      last: {
        version: '0.9.0',
        gitTag: 'v0.9.0',
        gitHead: 'def456'
      }
    }

    await setSummary(release)

    expect(core.info).toHaveBeenCalledWith(JSON.stringify(release, null, 2))
    expect(core.summary.addRaw).toHaveBeenCalled()
    expect(core.summary.addEOL).toHaveBeenCalled()
    expect(core.summary.addHeading).toHaveBeenCalledWith('Raw Data', 2)
    expect(core.summary.addCodeBlock).toHaveBeenCalledWith(JSON.stringify(release, null, 2), 'json')
    expect(core.summary.write).toHaveBeenCalledWith({ overwrite: true })
  })

  it('should handle no new release correctly', async () => {
    // Arrange
    const release = {
      published: false,
      new: null,
      last: null
    }

    // Act
    await setSummary(release)

    // Assert
    expect(core.info).toHaveBeenCalledWith(JSON.stringify(release, null, 2))
    expect(core.summary.addRaw).toHaveBeenCalled()
    expect(core.summary.addEOL).toHaveBeenCalled()
    expect(core.summary.addHeading).toHaveBeenCalledWith('Raw Data', 2)
    expect(core.summary.addCodeBlock).toHaveBeenCalledWith(JSON.stringify(release, null, 2), 'json')
    expect(core.summary.write).toHaveBeenCalledWith({ overwrite: true })
  })
})
