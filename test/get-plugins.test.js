import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getPlugins } from '../src/get-plugins.js'
import * as core from '@actions/core'

vi.mock('@actions/core', async () => {
  const original = await vi.importActual('@actions/core')
  return {
    ...original,
    getBooleanInput: vi.fn()
  }
})

describe('getPlugins', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return an empty object if no config is provided', async () => {
    const result = await getPlugins(null)
    expect(result).toEqual({})
  })

  it('should return an empty array if config.plugins is not provided', async () => {
    const result = await getPlugins({})
    expect(result).toEqual([])
  })

  it('should return plugins as is if commit-analyzer already has a preset', async () => {
    core.getBooleanInput.mockReturnValueOnce(true)
    const config = {
      plugins: [['@semantic-release/commit-analyzer', { preset: 'conventionalcommits' }]]
    }
    const result = await getPlugins(config)
    expect(Array.isArray(result)).toBe(true)

    // Find the commit-analyzer plugin
    const commitAnalyzerPlugin = result.find(
      (plugin) => Array.isArray(plugin) && plugin[0] === '@semantic-release/commit-analyzer'
    )

    expect(commitAnalyzerPlugin).toBeDefined()
    expect(commitAnalyzerPlugin).toHaveLength(2)

    const [, pluginConfig] = commitAnalyzerPlugin

    expect(pluginConfig).toMatchObject({
      preset: 'conventionalcommits',
      presetConfig: expect.any(Object),
      releaseRules: expect.any(Object)
    })
  })

  it('should return passed plugins with expected modification', async () => {
    core.getBooleanInput.mockReturnValueOnce(true)
    const config = {
      plugins: [
        // should include both
        ['@semantic-release/commit-analyzer', { randomConfig: true, preset: 'conventionalcommits' }],
        // should include releaseRules only
        [
          '@semantic-release/commit-analyzer',
          {
            presetConfig: {
              types: [{ type: 'feat', section: 'Features' }]
            },
            preset: 'conventionalcommits'
          }
        ],
        // should include presetConfig only
        [
          '@semantic-release/commit-analyzer',
          {
            releaseRules: [{ type: 'chore', release: 'minor' }],
            preset: 'conventionalcommits'
          }
        ],
        // should respect existing config
        [
          '@semantic-release/commit-analyzer',
          {
            releaseRules: [{ type: 'chore', release: 'minor' }],
            preset: 'angular'
          }
        ],
        ['@semantic-release/commit-analyzer', { randomConfig: true }], // No "preset", should remain unchanged
        ['@semantic-release/release-notes-generator', { otherSetting: 42, preset: 'conventionalcommits' }],
        ['@semantic-release/changelog', { preset: 'conventionalcommits' }], // no change required
        ['@semantic-release/release-notes-generator'], // No config, should remain unchanged
        '@semantic-release/git'
      ]
    }
    const result = await getPlugins(config)
    const commitAnalyzerPlugins = result.filter(
      (plugin) => Array.isArray(plugin) && plugin[0] === '@semantic-release/commit-analyzer'
    )
    expect(commitAnalyzerPlugins.length).toBeGreaterThan(0)
    commitAnalyzerPlugins.forEach((plugin) => {
      const [, pluginConfig] = plugin

      // If pluginConfig has the required properties, we check them
      if (pluginConfig && pluginConfig.preset === 'conventionalcommits') {
        expect(pluginConfig).toMatchObject({
          presetConfig: expect.any(Object),
          releaseRules: expect.any(Object)
        })
      }
    })
  })

  it('should add default preset if commit-analyzer has no preset', async () => {
    const config = {
      plugins: [['@semantic-release/commit-analyzer', {}]]
    }
    const result = await getPlugins(config)

    expect(result).toEqual(config.plugins)
  })

  it('should add default preset if commit-analyzer is a string', async () => {
    const config = {
      plugins: ['@semantic-release/commit-analyzer']
    }
    const result = await getPlugins(config)

    expect(result).toEqual(config.plugins)
  })

  it('should not modify other plugins', async () => {
    const config = {
      plugins: ['random-plugin', ['@semantic-release/commit-analyzer', {}], 'another-plugin']
    }
    const result = await getPlugins(config)

    expect(result).toEqual(config.plugins)
  })

  it('should work with multiple instances of commit-analyzer', async () => {
    core.getBooleanInput.mockReturnValueOnce(true)
    const config = {
      plugins: [['@semantic-release/commit-analyzer', {}], '@semantic-release/commit-analyzer', 'random-plugin']
    }
    const result = await getPlugins(config)

    expect(result).toEqual(config.plugins)
  })

  it('should not add default if conventionalcommits preset is not set', async () => {
    const consoleErrorSpy = vi.spyOn(core, 'error').mockImplementation(() => {})
    core.getBooleanInput.mockReturnValueOnce(true)
    const config = {
      plugins: [['@semantic-release/commit-analyzer'], ['@semantic-release/release-notes-generator']]
    }
    const result = await getPlugins(config)

    expect(result).toEqual(config.plugins)
  })
})
