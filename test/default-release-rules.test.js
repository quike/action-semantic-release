import { describe, it, expect } from 'vitest'
import { analyzeCommits } from '@semantic-release/commit-analyzer'
import { defaultReleaseRules, getReleaseRules } from '../src/default-release-rules.js'
import { getPresetConfig } from '../src/default-preset-config.js'

describe('getReleaseRules', () => {
  it('should return the conventional commits release rules by default', () => {
    const result = getReleaseRules()
    expect(result).toEqual(defaultReleaseRules.get('conventionalcommits'))
  })

  it('should return the conventional commits release rules when preset is "conventionalcommits"', () => {
    const result = getReleaseRules('conventionalcommits')
    expect(result).toEqual(defaultReleaseRules.get('conventionalcommits'))
  })

  it('should return null when preset is not found', () => {
    const result = getReleaseRules('unknown-preset')
    expect(result).toEqual(null)
  })

  it('should return the correct release type for "chore"', () => {
    const rules = getReleaseRules('conventionalcommits')
    const choreRule = rules.find((rule) => rule.type === 'chore')
    expect(choreRule.release).toBe('minor')
  })

  it('should return the correct release type for "feat"', () => {
    const rules = getReleaseRules('conventionalcommits')
    const featRule = rules.find((rule) => rule.type === 'feat')
    expect(featRule.release).toBe('minor')
  })

  it('should return the correct release type for "fix"', () => {
    const rules = getReleaseRules('conventionalcommits')
    const fixRule = rules.find((rule) => rule.type === 'fix')
    expect(fixRule.release).toBe('patch')
  })

  it('should include a type-less rule that maps any breaking commit to "major"', () => {
    const rules = getReleaseRules('conventionalcommits')
    const breakingRule = rules.find((rule) => rule.breaking === true && !rule.type)
    expect(breakingRule).toBeDefined()
    expect(breakingRule.release).toBe('major')
  })

  it('should include a type-less rule that maps parser-detected reverts to "patch"', () => {
    const rules = getReleaseRules('conventionalcommits')
    const revertRule = rules.find((rule) => rule.revert === true && !rule.type)
    expect(revertRule).toBeDefined()
    expect(revertRule.release).toBe('patch')
  })
})

describe('analyzeCommits with conventional-commits release rules', () => {
  const pluginConfig = {
    preset: 'conventionalcommits',
    presetConfig: getPresetConfig('conventionalcommits'),
    releaseRules: getReleaseRules('conventionalcommits')
  }
  const logger = { log: () => {} }

  const run = (messages) =>
    analyzeCommits(pluginConfig, { commits: messages.map((message) => ({ message, hash: 'x' })), logger, cwd: process.cwd() })

  it('should resolve "feat!" to a major release', async () => {
    const release = await run(['feat!: hyphenate component inputs and add self-test pipeline'])
    expect(release).toBe('major')
  })

  it('should resolve a feat commit with a BREAKING CHANGE footer to a major release', async () => {
    const release = await run(['feat: rename inputs\n\nBREAKING CHANGE: inputs are now hyphenated'])
    expect(release).toBe('major')
  })

  it('should resolve a plain "feat" commit to a minor release', async () => {
    const release = await run(['feat: add thing'])
    expect(release).toBe('minor')
  })

  it('should resolve a plain "fix" commit to a patch release', async () => {
    const release = await run(['fix: fix thing'])
    expect(release).toBe('patch')
  })

  it('should resolve a "docs" commit to no release', async () => {
    const release = await run(['docs: update readme'])
    expect(release).toBeNull()
  })
})
