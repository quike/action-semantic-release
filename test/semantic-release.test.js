import { describe, it, expect, vi } from 'vitest'
import { runSemanticRelease } from '../src/semantic-release.js'
import semanticRelease from 'semantic-release'
import * as core from '@actions/core'

// Mock the semanticRelease function
vi.mock('semantic-release', () => ({
  default: vi.fn()
}))

// Mock the core module
vi.mock('@actions/core', () => ({
  info: vi.fn(),
  debug: vi.fn(),
  exportVariable: vi.fn(),
  setOutput: vi.fn()
}))

describe('runSemanticRelease', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should call semanticRelease with the correct arguments', async () => {
    const options = {
      /* some options */
    }
    const workdir = '/path/to/workdir'
    const result = {
      /* some result */
    }

    // Mock the return value of semanticRelease
    semanticRelease.mockResolvedValue(result)

    await runSemanticRelease(options, workdir)

    expect(semanticRelease).toHaveBeenCalledWith(options, { cwd: workdir })
    expect(core.info).toHaveBeenCalledWith(`Semantic Release Execution Result: ${JSON.stringify(result)}`)
  })

  it('should handle no release published', async () => {
    const options = {
      /* some options */
    }
    const workdir = '/path/to/workdir'

    // Mock the return value of semanticRelease to be falsy
    semanticRelease.mockResolvedValue(null)

    await runSemanticRelease(options, workdir)

    expect(core.debug).toHaveBeenCalledWith('No release published')
    expect(core.exportVariable).toHaveBeenCalledWith('RELEASE_PUBLISHED', 'false')
    expect(core.setOutput).toHaveBeenCalledWith('release-published', 'false')
  })
})
