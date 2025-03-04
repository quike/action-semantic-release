import { describe, it, expect } from 'vitest'
import { defaultReleaseRules, getReleaseRules } from '../src/default-release-rules.js'

describe('getReleaseRules', () => {
  it('should return the conventional commits release rules by default', () => {
    const result = getReleaseRules()
    expect(result).toEqual(defaultReleaseRules.get('conventionalcommits'))
  })

  it('should return the conventional commits release rules when preset is "conventionalcommits"', () => {
    const result = getReleaseRules('conventionalcommits')
    expect(result).toEqual(defaultReleaseRules.get('conventionalcommits'))
  })

  it('should return the conventional commits release rules when preset is not found', () => {
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

  it('should return the correct release type for "BREAKING CHANGE"', () => {
    const rules = getReleaseRules('conventionalcommits')
    const breakingChangeRule = rules.find((rule) => rule.type === 'BREAKING CHANGE')
    expect(breakingChangeRule.release).toBe('major')
  })
})
