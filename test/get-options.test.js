import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as core from '@actions/core'
import { getOptions } from '../src/get-options.js'

vi.mock('@actions/core')

describe('getOptions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return an empty object and log an error when no config is provided', async () => {
    const result = await getOptions()
    expect(result).toEqual({})
    expect(core.error).toHaveBeenCalledWith('No config provided')
  })

  it('should return default values when config is missing certain properties', async () => {
    const config = {}
    const result = await getOptions(config)
    const expected = {
      branches: ['master', 'main'],
      ci: true,
      debug: false,
      dryRun: false
    }
    expect(result).toEqual(expected)
    expect(core.info).toHaveBeenCalledWith(`Options: ${JSON.stringify(expected)}`)
  })

  it('should correctly clean the options object', async () => {
    const config = {
      branches: [
        '+([0-9])?(.{+([0-9]),x}).x',
        'master',
        'main',
        'next',
        'next-major',
        { name: 'beta', prerelease: true },
        { name: 'alpha', prerelease: true }
      ],
      repositoryUrl: 'https://www.github.com/quike/action-semantic-release',
      plugins: [
        '@semantic-release/commit-analyzer',
        '@semantic-release/release-notes-generator',
        '@semantic-release/npm',
        '@semantic-release/github'
      ],
      ci: true,
      debug: false,
      dryRun: false,
      tagFormat: `v\${version}`
    }
    const result = await getOptions(config)
    const expected = config
    Ï(result).toEqual(expected)
    expect(core.info).toHaveBeenCalledWith(`Options: ${JSON.stringify(expected)}`)
  })

  it('should use environment variables for gitCredentials', async () => {
    process.env.GIT_AUTHOR_NAME = 'Author Name'
    process.env.GIT_AUTHOR_EMAIL = 'author@example.com'
    process.env.GIT_COMMITTER_NAME = 'Committer Name'
    process.env.GIT_COMMITTER_EMAIL = 'committer@example.com'

    const config = {}
    const result = await getOptions(config)
    const expected = {
      branches: ['master', 'main'],
      ci: true,
      debug: false,
      dryRun: false,
      gitCredentials: {
        GIT_AUTHOR_NAME: 'Author Name',
        GIT_AUTHOR_EMAIL: 'author@example.com',
        GIT_COMMITTER_NAME: 'Committer Name',
        GIT_COMMITTER_EMAIL: 'committer@example.com'
      }
    }
    expect(result).toEqual(expected)
    expect(core.info).toHaveBeenCalledWith(`Options: ${JSON.stringify(expected)}`)

    // Clean up environment variables
    delete process.env.GIT_AUTHOR_NAME
    delete process.env.GIT_AUTHOR_EMAIL
    delete process.env.GIT_COMMITTER_NAME
    delete process.env.GIT_COMMITTER_EMAIL
  })

  it('should handle a custom config object', async () => {
    const config = {
      branches: ['main'],
      repositoryUrl: 'https://example.com',
      plugins: ['plugin1', 'plugin2'],
      ci: false,
      debug: false,
      dryRun: true,
      tagFormat: 'v${version}',
      verifyConditions: ['condition1'],
      prepare: ['prepare1'],
      publish: ['publish1'],
      success: ['success1'],
      fail: ['fail1']
    }
    const result = await getOptions(config)
    const expected = {
      branches: ['main'],
      repositoryUrl: 'https://example.com',
      plugins: ['plugin1', 'plugin2'],
      ci: false,
      debug: false,
      dryRun: true,
      tagFormat: 'v${version}',
      verifyConditions: ['condition1'],
      prepare: ['prepare1'],
      publish: ['publish1'],
      success: ['success1'],
      fail: ['fail1']
    }
    expect(result).toEqual(expected)
    expect(core.info).toHaveBeenCalledWith(`Options: ${JSON.stringify(expected)}`)
  })
})
