import { describe, it, expect } from 'vitest'
import { defaultPresetConfigs, getPresetConfig } from '../src/default-preset-config'

describe('getPresetConfig', () => {
  it('should return the conventional commits preset config by default', () => {
    const result = getPresetConfig()
    expect(result).toEqual(defaultPresetConfigs.get('conventionalcommits'))
  })

  it('should return the conventional commits preset config when preset is "conventionalcommits"', () => {
    const result = getPresetConfig('conventionalcommits')
    expect(result).toEqual(defaultPresetConfigs.get('conventionalcommits'))
  })

  it('should return the conventional commits preset config when preset is not found', () => {
    const result = getPresetConfig('unknown-preset')
    expect(result).toEqual(null)
  })

  it('should return the correct section for "feat"', () => {
    const config = getPresetConfig('conventionalcommits')
    const featConfig = config.types.find((rule) => rule.type === 'feat')
    expect(featConfig.section).toBe('Features')
  })

  it('should return the correct section for "fix"', () => {
    const config = getPresetConfig('conventionalcommits')
    const fixConfig = config.types.find((rule) => rule.type === 'fix')
    expect(fixConfig.section).toBe('Bug Fixes')
  })

  it('should return the correct section for "chore" and check if hidden is true', () => {
    const config = getPresetConfig('conventionalcommits')
    const choreConfig = config.types.find((rule) => rule.type === 'chore')
    expect(choreConfig.section).toBe('Chores')
    expect(choreConfig.hidden).toBe(true)
  })

  it('should return the correct section for "docs" and check if hidden is true', () => {
    const config = getPresetConfig('conventionalcommits')
    const docsConfig = config.types.find((rule) => rule.type === 'docs')
    expect(docsConfig.section).toBe('Documentation')
    expect(docsConfig.hidden).toBe(true)
  })
})
