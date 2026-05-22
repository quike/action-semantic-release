import { describe, it, expect } from 'vitest'
import { analyzeCommits } from '@semantic-release/commit-analyzer'
import { customReleaseRulesMap, getCustomReleaseRules } from '../src/custom-release-rules.js'
import { getCustomPresetConfig } from '../src/custom-preset-config.js'

describe('getCustomReleaseRules', () => {
  it('should return the custom release rules by default', () => {
    const result = getCustomReleaseRules()
    expect(result).toEqual(customReleaseRulesMap.get('custom'))
  })

  it('should return the custom release rules when preset is "custom"', () => {
    const result = getCustomReleaseRules('custom')
    expect(result).toEqual(customReleaseRulesMap.get('custom'))
  })

  it('should return null when preset is not the custom preset', () => {
    expect(getCustomReleaseRules('conventionalcommits')).toBeNull()
    expect(getCustomReleaseRules('angular')).toBeNull()
    expect(getCustomReleaseRules('unknown-preset')).toBeNull()
  })

  it('should return the correct release type for "chore"', () => {
    const rules = getCustomReleaseRules('custom')
    const choreRule = rules.find((rule) => rule.type === 'chore')
    expect(choreRule.release).toBe('minor')
  })

  it('should return the correct release type for "feat"', () => {
    const rules = getCustomReleaseRules('custom')
    const featRule = rules.find((rule) => rule.type === 'feat')
    expect(featRule.release).toBe('minor')
  })

  it('should return the correct release type for "fix"', () => {
    const rules = getCustomReleaseRules('custom')
    const fixRule = rules.find((rule) => rule.type === 'fix')
    expect(fixRule.release).toBe('patch')
  })

  it('should include a type-less rule that maps any breaking commit to "major"', () => {
    const rules = getCustomReleaseRules('custom')
    const breakingRule = rules.find((rule) => rule.breaking === true && !rule.type)
    expect(breakingRule).toBeDefined()
    expect(breakingRule.release).toBe('major')
  })

  it('should include a type-less rule that maps parser-detected reverts to "patch"', () => {
    const rules = getCustomReleaseRules('custom')
    const revertRule = rules.find((rule) => rule.revert === true && !rule.type)
    expect(revertRule).toBeDefined()
    expect(revertRule.release).toBe('patch')
  })
})

describe('analyzeCommits with custom release rules over conventionalcommits parser', () => {
  const pluginConfig = {
    preset: 'conventionalcommits',
    presetConfig: getCustomPresetConfig('custom'),
    releaseRules: getCustomReleaseRules('custom')
  }
  const logger = { log: () => {} }

  const run = (messages) =>
    analyzeCommits(pluginConfig, {
      commits: messages.map((message) => ({ message, hash: 'x' })),
      logger,
      cwd: process.cwd()
    })

  it('should resolve "feat!" to a major release', async () => {
    expect(await run(['feat!: hyphenate component inputs and add self-test pipeline'])).toBe('major')
  })

  it('should resolve a feat commit with a BREAKING CHANGE footer to a major release', async () => {
    expect(await run(['feat: rename inputs\n\nBREAKING CHANGE: inputs are now hyphenated'])).toBe('major')
  })

  it('should resolve a plain "feat" commit to a minor release', async () => {
    expect(await run(['feat: add thing'])).toBe('minor')
  })

  it('should resolve a plain "fix" commit to a patch release', async () => {
    expect(await run(['fix: fix thing'])).toBe('patch')
  })

  it('should resolve a "chore" commit to a minor release (project policy)', async () => {
    expect(await run(['chore: bump deps'])).toBe('minor')
  })

  it('should resolve a "docs" commit to no release', async () => {
    expect(await run(['docs: update readme'])).toBeNull()
  })
})
