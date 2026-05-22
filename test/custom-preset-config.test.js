import { describe, it, expect } from 'vitest'
import { customPresetConfigs, getCustomPresetConfig } from '../src/custom-preset-config.js'

describe('getCustomPresetConfig', () => {
  it('should return the custom preset config by default', () => {
    const result = getCustomPresetConfig()
    expect(result).toEqual(customPresetConfigs.get('custom'))
  })

  it('should return the custom preset config when preset is "custom"', () => {
    const result = getCustomPresetConfig('custom')
    expect(result).toEqual(customPresetConfigs.get('custom'))
  })

  it('should return null when preset is not the custom preset', () => {
    expect(getCustomPresetConfig('conventionalcommits')).toBeNull()
    expect(getCustomPresetConfig('angular')).toBeNull()
    expect(getCustomPresetConfig('unknown-preset')).toBeNull()
  })

  it('should return the correct section for "feat"', () => {
    const config = getCustomPresetConfig('custom')
    const featConfig = config.types.find((rule) => rule.type === 'feat')
    expect(featConfig.section).toBe('Features')
  })

  it('should include a "feature" alias mapped to Features', () => {
    const config = getCustomPresetConfig('custom')
    const featureAlias = config.types.find((rule) => rule.type === 'feature')
    expect(featureAlias).toBeDefined()
    expect(featureAlias.section).toBe('Features')
  })

  it('should return the correct section for "fix"', () => {
    const config = getCustomPresetConfig('custom')
    const fixConfig = config.types.find((rule) => rule.type === 'fix')
    expect(fixConfig.section).toBe('Bug Fixes')
  })

  it('should surface "chore" in the changelog (not hidden)', () => {
    const config = getCustomPresetConfig('custom')
    const choreConfig = config.types.find((rule) => rule.type === 'chore')
    expect(choreConfig.section).toBe('Miscellaneous Chores')
    expect(choreConfig.hidden).toBeUndefined()
  })

  it('should surface "refactor" in the changelog (not hidden, unlike upstream)', () => {
    const config = getCustomPresetConfig('custom')
    const refactorConfig = config.types.find((rule) => rule.type === 'refactor')
    expect(refactorConfig.section).toBe('Code Refactoring')
    expect(refactorConfig.hidden).toBeUndefined()
  })

  it('should hide "docs"', () => {
    const config = getCustomPresetConfig('custom')
    const docsConfig = config.types.find((rule) => rule.type === 'docs')
    expect(docsConfig.section).toBe('Documentation')
    expect(docsConfig.hidden).toBe(true)
  })
})
