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

  it('should inject presetConfig/releaseRules and swap preset when preset is "custom"', async () => {
    core.getBooleanInput.mockReturnValueOnce(true)
    const config = {
      plugins: [['@semantic-release/commit-analyzer', { preset: 'custom' }]]
    }
    const result = await getPlugins(config)
    expect(Array.isArray(result)).toBe(true)

    const commitAnalyzerPlugin = result.find(
      (plugin) => Array.isArray(plugin) && plugin[0] === '@semantic-release/commit-analyzer'
    )

    expect(commitAnalyzerPlugin).toBeDefined()
    expect(commitAnalyzerPlugin).toHaveLength(2)

    const [, pluginConfig] = commitAnalyzerPlugin

    expect(pluginConfig).toMatchObject({
      preset: 'conventionalcommits',
      presetConfig: expect.any(Object),
      releaseRules: expect.any(Array)
    })
  })

  it('should leave plugin config untouched for non-custom presets', async () => {
    core.getBooleanInput.mockReturnValueOnce(true)
    const config = {
      plugins: [['@semantic-release/commit-analyzer', { preset: 'conventionalcommits' }]]
    }
    const result = await getPlugins(config)
    expect(result).toEqual(config.plugins)
  })

  it('should respect existing presetConfig and releaseRules on a custom-preset plugin', async () => {
    core.getBooleanInput.mockReturnValueOnce(true)
    const existingPresetConfig = { types: [{ type: 'feat', section: 'Features' }] }
    const existingReleaseRules = [{ type: 'chore', release: 'minor' }]
    const config = {
      plugins: [
        [
          '@semantic-release/commit-analyzer',
          {
            preset: 'custom',
            presetConfig: existingPresetConfig,
            releaseRules: existingReleaseRules
          }
        ]
      ]
    }
    const result = await getPlugins(config)
    const [, pluginConfig] = result[0]
    expect(pluginConfig.preset).toBe('conventionalcommits')
    expect(pluginConfig.presetConfig).toEqual(existingPresetConfig)
    expect(pluginConfig.releaseRules).toEqual(existingReleaseRules)
  })

  it('should mix injection across multiple commit-analyzer plugin entries', async () => {
    core.getBooleanInput.mockReturnValueOnce(true)
    const config = {
      plugins: [
        // both fields injected, preset swapped
        ['@semantic-release/commit-analyzer', { randomConfig: true, preset: 'custom' }],
        // releaseRules injected, presetConfig kept
        [
          '@semantic-release/commit-analyzer',
          {
            presetConfig: { types: [{ type: 'feat', section: 'Features' }] },
            preset: 'custom'
          }
        ],
        // presetConfig injected, releaseRules kept
        [
          '@semantic-release/commit-analyzer',
          {
            releaseRules: [{ type: 'chore', release: 'minor' }],
            preset: 'custom'
          }
        ],
        // not the custom preset, untouched
        [
          '@semantic-release/commit-analyzer',
          {
            releaseRules: [{ type: 'chore', release: 'minor' }],
            preset: 'angular'
          }
        ],
        ['@semantic-release/commit-analyzer', { randomConfig: true }],
        ['@semantic-release/release-notes-generator', { otherSetting: 42, preset: 'custom' }],
        ['@semantic-release/changelog', { preset: 'custom' }],
        ['@semantic-release/release-notes-generator'],
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
      if (!pluginConfig) return
      if (pluginConfig.preset === 'conventionalcommits') {
        expect(pluginConfig).toMatchObject({
          presetConfig: expect.any(Object),
          releaseRules: expect.any(Object)
        })
      }
    })
  })

  it('should leave commit-analyzer alone when it has no preset', async () => {
    const config = {
      plugins: [['@semantic-release/commit-analyzer', {}]]
    }
    const result = await getPlugins(config)
    expect(result).toEqual(config.plugins)
  })

  it('should leave commit-analyzer alone when it is a bare string', async () => {
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

  it('should pass through multiple commit-analyzer entries without preset', async () => {
    core.getBooleanInput.mockReturnValueOnce(true)
    const config = {
      plugins: [['@semantic-release/commit-analyzer', {}], '@semantic-release/commit-analyzer', 'random-plugin']
    }
    const result = await getPlugins(config)
    expect(result).toEqual(config.plugins)
  })

  it('should not inject when default-preset-info is false', async () => {
    core.getBooleanInput.mockReturnValueOnce(false)
    const config = {
      plugins: [['@semantic-release/commit-analyzer', { preset: 'custom' }]]
    }
    const result = await getPlugins(config)
    expect(result).toEqual(config.plugins)
  })
})
