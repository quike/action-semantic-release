import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as core from '@actions/core'
import { analyzeCommits } from '@semantic-release/commit-analyzer'
import { getPlugins } from '../src/get-plugins.js'

vi.mock('@actions/core', async () => {
  const original = await vi.importActual('@actions/core')
  return {
    ...original,
    getBooleanInput: vi.fn()
  }
})

const logger = { log: () => {} }

const runAnalyzer = async (preset, messages) => {
  core.getBooleanInput.mockReturnValueOnce(true)
  const plugins = await getPlugins({
    plugins: [['@semantic-release/commit-analyzer', { preset }]]
  })
  const [, pluginConfig] = plugins.find(
    (plugin) => Array.isArray(plugin) && plugin[0] === '@semantic-release/commit-analyzer'
  )
  return analyzeCommits(pluginConfig, {
    commits: messages.map((message) => ({ message, hash: 'x' })),
    logger,
    cwd: process.cwd()
  })
}

describe('preset integration: custom (action injects opinions, swaps to conventionalcommits parser)', () => {
  beforeEach(() => vi.clearAllMocks())
  afterEach(() => vi.restoreAllMocks())

  it('should swap preset to conventionalcommits and attach presetConfig + releaseRules', async () => {
    core.getBooleanInput.mockReturnValueOnce(true)
    const plugins = await getPlugins({
      plugins: [['@semantic-release/commit-analyzer', { preset: 'custom' }]]
    })
    const [, pluginConfig] = plugins[0]
    expect(pluginConfig.preset).toBe('conventionalcommits')
    expect(pluginConfig.presetConfig).toBeDefined()
    expect(Array.isArray(pluginConfig.releaseRules)).toBe(true)
  })

  const cases = [
    ['feat!: rename inputs', 'major'],
    ['feat: add input\n\nBREAKING CHANGE: input was renamed', 'major'],
    ['feat: add input', 'minor'],
    ['fix: handle null', 'patch'],
    ['perf: faster parse', 'patch'],
    ['refactor: extract helper', 'patch'],
    ['revert: undo previous change', 'patch'],
    ['chore: bump deps', 'minor'],
    ['docs: improve readme', null],
    ['style: format code', null],
    ['test: add unit tests', null],
    ['ci: tweak workflow', null],
    ['build: update bundler', null]
  ]

  for (const [message, expected] of cases) {
    it(`resolves "${message.split('\n')[0]}" to ${expected ?? 'no'} release`, async () => {
      expect(await runAnalyzer('custom', [message])).toBe(expected)
    })
  }
})

describe('preset integration: conventionalcommits (action passes through to upstream defaults)', () => {
  beforeEach(() => vi.clearAllMocks())
  afterEach(() => vi.restoreAllMocks())

  it('should leave preset and plugin config untouched', async () => {
    core.getBooleanInput.mockReturnValueOnce(true)
    const plugins = await getPlugins({
      plugins: [['@semantic-release/commit-analyzer', { preset: 'conventionalcommits' }]]
    })
    const [, pluginConfig] = plugins[0]
    expect(pluginConfig.preset).toBe('conventionalcommits')
    expect(pluginConfig.presetConfig).toBeUndefined()
    expect(pluginConfig.releaseRules).toBeUndefined()
  })

  const cases = [
    ['feat!: rename inputs', 'major'],
    ['feat: add input\n\nBREAKING CHANGE: x', 'major'],
    ['feat: add input', 'minor'],
    ['fix: handle null', 'patch'],
    ['perf: faster parse', 'patch'],
    ['chore: bump deps', null],
    ['refactor: extract helper', null],
    ['docs: improve readme', null]
  ]

  for (const [message, expected] of cases) {
    it(`resolves "${message.split('\n')[0]}" to ${expected ?? 'no'} release`, async () => {
      expect(await runAnalyzer('conventionalcommits', [message])).toBe(expected)
    })
  }
})

describe('preset integration: angular (action passes through to upstream defaults)', () => {
  beforeEach(() => vi.clearAllMocks())
  afterEach(() => vi.restoreAllMocks())

  const cases = [
    ['feat(scope): add thing', 'minor'],
    ['fix(scope): fix thing', 'patch'],
    ['perf(scope): speed up', 'patch'],
    ['feat(scope): something\n\nBREAKING CHANGE: api removed', 'major'],
    ['docs(scope): readme', null],
    ['chore(scope): bump deps', null]
  ]

  for (const [message, expected] of cases) {
    it(`resolves "${message.split('\n')[0]}" to ${expected ?? 'no'} release`, async () => {
      expect(await runAnalyzer('angular', [message])).toBe(expected)
    })
  }
})

describe('preset integration: eslint (action passes through to upstream defaults)', () => {
  beforeEach(() => vi.clearAllMocks())
  afterEach(() => vi.restoreAllMocks())

  const cases = [
    ['Breaking: remove deprecated api', 'major'],
    ['Fix: handle null', 'patch'],
    ['Update: improve docs wording', 'minor'],
    ['New: add option', 'minor'],
    ['Docs: clarify readme', null]
  ]

  for (const [message, expected] of cases) {
    it(`resolves "${message}" to ${expected ?? 'no'} release`, async () => {
      expect(await runAnalyzer('eslint', [message])).toBe(expected)
    })
  }
})

describe('preset integration: ember (action passes through to upstream defaults)', () => {
  beforeEach(() => vi.clearAllMocks())
  afterEach(() => vi.restoreAllMocks())

  const cases = [
    ['[BUGFIX something] fix the thing', 'patch'],
    ['[FEATURE something] add the thing', 'minor'],
    ['[DOC] update readme', null]
  ]

  for (const [message, expected] of cases) {
    it(`resolves "${message.split(']')[0]}]..." to ${expected ?? 'no'} release`, async () => {
      expect(await runAnalyzer('ember', [message])).toBe(expected)
    })
  }
})
