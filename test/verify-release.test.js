import { describe, it, expect, vi } from 'vitest'
import { verifyRelease } from '../src/verify-release.js'
import * as core from '@actions/core'

vi.mock('@actions/core', () => ({
  info: vi.fn(),
  debug: vi.fn(),
  exportVariable: vi.fn(),
  setOutput: vi.fn()
}))

describe('verifyRelease', () => {
  it('should log release information and set environment variables and outputs', async () => {
    const result = {
      lastRelease: {
        version: '1.2.2',
        gitHead: 'def456',
        gitTag: 'v1.2.2'
      },
      nextRelease: {
        version: '1.2.3',
        notes: 'Release notes',
        type: 'minor',
        channel: 'stable',
        gitHead: 'abc123',
        gitTag: 'v1.2.3',
        name: 'Release 1.2.3'
      },
      commits: []
    }

    await verifyRelease(result)

    // Verify that core.info was called with the correct message
    expect(core.info).toHaveBeenCalledWith('Release minor with Version 1.2.3')

    // Verify that core.exportVariable was called with the correct arguments
    expect(core.exportVariable).toHaveBeenCalledWith('RELEASE_PUBLISHED', true)
    expect(core.exportVariable).toHaveBeenCalledWith('RELEASE_VERSION', '1.2.3')
    expect(core.exportVariable).toHaveBeenCalledWith('RELEASE_MAJOR', '1')
    expect(core.exportVariable).toHaveBeenCalledWith('RELEASE_MINOR', '2')
    expect(core.exportVariable).toHaveBeenCalledWith('RELEASE_PATCH', '3')
    expect(core.exportVariable).toHaveBeenCalledWith('RELEASE_TYPE', 'minor')
    expect(core.exportVariable).toHaveBeenCalledWith('RELEASE_GIT_HEAD', 'abc123')
    expect(core.exportVariable).toHaveBeenCalledWith('RELEASE_GIT_TAG', 'v1.2.3')
    expect(core.exportVariable).toHaveBeenCalledWith('RELEASE_NAME', 'Release 1.2.3')

    // Verify that core.setOutput was called with the correct arguments
    expect(core.setOutput).toHaveBeenCalledWith('release-published', true)
    expect(core.setOutput).toHaveBeenCalledWith('release-version', '1.2.3')
    expect(core.setOutput).toHaveBeenCalledWith('release-major', '1')
    expect(core.setOutput).toHaveBeenCalledWith('release-minor', '2')
    expect(core.setOutput).toHaveBeenCalledWith('release-patch', '3')
    expect(core.setOutput).toHaveBeenCalledWith('release-type', 'minor')
    expect(core.setOutput).toHaveBeenCalledWith('release-git-head', 'abc123')
    expect(core.setOutput).toHaveBeenCalledWith('release-git-tag', 'v1.2.3')
    expect(core.setOutput).toHaveBeenCalledWith('release-name', 'Release 1.2.3')
  })

  it('should strip pre-release suffix from major/minor/patch outputs', async () => {
    const result = {
      lastRelease: { version: '1.2.2', gitHead: 'def', gitTag: 'v1.2.2' },
      nextRelease: {
        version: '2.0.0-beta.1',
        notes: '',
        type: 'major',
        channel: 'beta',
        gitHead: 'abc',
        gitTag: 'v2.0.0-beta.1',
        name: 'v2.0.0-beta.1'
      },
      commits: []
    }

    await verifyRelease(result)

    expect(core.exportVariable).toHaveBeenCalledWith('RELEASE_VERSION', '2.0.0-beta.1')
    expect(core.exportVariable).toHaveBeenCalledWith('RELEASE_MAJOR', '2')
    expect(core.exportVariable).toHaveBeenCalledWith('RELEASE_MINOR', '0')
    expect(core.exportVariable).toHaveBeenCalledWith('RELEASE_PATCH', '0')
  })

  it('should always export release-published as true (function is only called when a release exists)', async () => {
    const result = {
      lastRelease: { version: '1.0.0', gitHead: 'old', gitTag: 'v1.0.0' },
      nextRelease: {
        version: '1.0.1',
        notes: '',
        type: 'patch',
        channel: 'stable',
        gitHead: 'new',
        gitTag: 'v1.0.1',
        name: 'v1.0.1'
      },
      commits: []
    }

    const release = await verifyRelease(result)

    expect(release.published).toBe(true)
    expect(core.exportVariable).toHaveBeenCalledWith('RELEASE_PUBLISHED', true)
  })
})
