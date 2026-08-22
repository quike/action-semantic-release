import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as core from '@actions/core'
import { execa } from 'execa'
import { buildTagRegex, exportCurrentVersion, getLastReleaseVersion } from '../src/get-last-release.js'

vi.mock('@actions/core')
vi.mock('execa')

describe('buildTagRegex', () => {
  it('defaults to the semantic-release "v${version}" format when none is given', () => {
    const regex = buildTagRegex('')
    expect(regex.exec('v1.2.3')?.[1]).toBe('1.2.3')
    expect(regex.test('v1')).toBe(false)
    expect(regex.test('v1.5')).toBe(false)
  })

  it('captures pre-release and build metadata', () => {
    const regex = buildTagRegex('v${version}')
    expect(regex.exec('v1.2.3-beta.1')?.[1]).toBe('1.2.3-beta.1')
  })

  it('honors a custom tag format', () => {
    const regex = buildTagRegex('release-${version}')
    expect(regex.exec('release-2.0.0')?.[1]).toBe('2.0.0')
    expect(regex.test('v2.0.0')).toBe(false)
  })
})

describe('getLastReleaseVersion', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns the highest semver tag, ignoring floating tags', async () => {
    execa.mockResolvedValue({ stdout: 'v1.5.0\nv1.5\nv1\nv1.4.2' })
    const version = await getLastReleaseVersion('', { cwd: '.', env: {} })
    expect(version).toBe('1.5.0')
    expect(execa).toHaveBeenCalledWith('git', ['tag', '--merged', 'HEAD'], { cwd: '.', env: {} })
  })

  it('picks the highest stable version and ignores pre-releases', async () => {
    execa.mockResolvedValue({ stdout: 'v1.5.0-beta.1\nv1.5.0\nv1.4.2' })
    expect(await getLastReleaseVersion('', { cwd: '.', env: {} })).toBe('1.5.0')
  })

  it('returns an empty string when only pre-release tags exist (matches semantic-release)', async () => {
    execa.mockResolvedValue({ stdout: 'v1.5.0-beta.1\nv1.5.0-alpha.1' })
    expect(await getLastReleaseVersion('', { cwd: '.', env: {} })).toBe('')
  })

  it('returns an empty string when there are no tags', async () => {
    execa.mockResolvedValue({ stdout: '' })
    expect(await getLastReleaseVersion('', { cwd: '.', env: {} })).toBe('')
  })

  it('warns and returns an empty string when git fails', async () => {
    execa.mockRejectedValue(new Error('not a git repository'))
    const version = await getLastReleaseVersion('', { cwd: '.', env: {} })
    expect(version).toBe('')
    expect(core.warning).toHaveBeenCalledWith(expect.stringMatching(/Unable to list git tags/))
  })
})

describe('exportCurrentVersion', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('exports RELEASE_VERSION and the release-version output when a version is found', async () => {
    execa.mockResolvedValue({ stdout: 'v1.5.0\nv1.4.2' })
    const version = await exportCurrentVersion('', { cwd: '.', env: {} })
    expect(version).toBe('1.5.0')
    expect(core.exportVariable).toHaveBeenCalledWith('RELEASE_VERSION', '1.5.0')
    expect(core.setOutput).toHaveBeenCalledWith('release-version', '1.5.0')
  })

  it('leaves RELEASE_VERSION unset when no release tag exists', async () => {
    execa.mockResolvedValue({ stdout: '' })
    const version = await exportCurrentVersion('', { cwd: '.', env: {} })
    expect(version).toBe('')
    expect(core.exportVariable).not.toHaveBeenCalled()
    expect(core.setOutput).not.toHaveBeenCalled()
    expect(core.info).toHaveBeenCalledWith(expect.stringMatching(/RELEASE_VERSION left unset/))
  })
})
