import { describe, it, expect, vi, afterEach } from 'vitest'
import { parseInput, cleanObject, getBooleanInput, getInput, isGitLabCi, transformKey } from '../src/utils.js'
import * as core from '@actions/core'
import { INPUTS } from '../src/constants.js'

vi.mock('@actions/core')

describe('parseInput', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should parse a valid JSON string', () => {
    const input = '{"key": "value"}'
    const result = parseInput(input)
    expect(result).toEqual({ key: 'value' })
  })

  it('should return the default value when given an invalid JSON string', () => {
    const input = 'invalid json'
    const defaultValue = 'default'
    const result = parseInput(input, defaultValue)
    expect(result).toBe(defaultValue)
  })

  it('should return the default value when given an empty string', () => {
    const input = ''
    const defaultValue = 'default'
    const result = parseInput(input, defaultValue)
    expect(result).toBe(defaultValue)
  })

  it('should return the provided default value when parsing fails', () => {
    const input = 'invalid json'
    const defaultValue = 'custom default'
    const result = parseInput(input, defaultValue)
    expect(result).toBe(defaultValue)
  })

  it('should return the original input when parsing fails and no default value is provided', () => {
    const input = 'invalid json'
    const result = parseInput(input)
    expect(result).toBe(input)
  })

  it('should log an error message when parsing fails', () => {
    const input = 'invalid json'
    const errorSpy = vi.spyOn(core, 'error')
    parseInput(input)
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Error parsing input:'))
    errorSpy.mockRestore()
  })
})

describe('cleanObject', () => {
  it('should clean nested objects', () => {
    const input = {
      a: { b: { c: '', d: 'value' }, e: undefined },
      f: { g: [], h: 'value' }
    }
    const expected = {
      a: { b: { d: 'value' } },
      f: { h: 'value' }
    }
    const result = cleanObject(input)
    expect(result).toEqual(expected)
  })

  it('should remove properties with empty string values', () => {
    const input = { a: '', b: 'value', c: '' }
    const expected = { b: 'value' }
    const result = cleanObject(input)
    expect(result).toEqual(expected)
  })

  it('should remove properties with undefined values', () => {
    const input = { a: undefined, b: 'value', c: undefined }
    const expected = { b: 'value' }
    const result = cleanObject(input)
    expect(result).toEqual(expected)
  })

  it('should remove properties with empty array values', () => {
    const input = { a: [], b: 'value', c: [] }
    const expected = { b: 'value' }
    const result = cleanObject(input)
    expect(result).toEqual(expected)
  })

  it('should preserve properties with non-empty values', () => {
    const input = { a: 'value', b: 42, c: { d: 'nested' } }
    const expected = { a: 'value', b: 42, c: { d: 'nested' } }
    const result = cleanObject(input)
    expect(result).toEqual(expected)
  })

  it('should handle null values correctly', () => {
    const input = { a: null, b: 'value', c: null }
    const expected = { a: null, b: 'value', c: null }
    const result = cleanObject(input)
    expect(result).toEqual(expected)
  })

  it('should handle mixed values correctly', () => {
    const input = {
      a: '',
      b: undefined,
      c: [],
      d: null,
      e: 'value',
      f: { g: '', h: 'nested' }
    }
    const expected = {
      d: null,
      e: 'value',
      f: { h: 'nested' }
    }
    const result = cleanObject(input)
    expect(result).toEqual(expected)
  })
})

describe('getBooleanInput', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should return the boolean input when provided', () => {
    core.getBooleanInput.mockReturnValue(true)

    const result = getBooleanInput(INPUTS.DRY_RUN)

    expect(core.getBooleanInput).toHaveBeenCalledWith('dry-run', { required: false })
    expect(core.info).toHaveBeenCalledWith('dry-run: true')
    expect(result).toBe(true)
  })

  it('should return the default value when input is undefined', () => {
    core.getBooleanInput.mockReturnValue(undefined)

    const result = getBooleanInput(INPUTS.DRY_RUN)

    expect(core.getBooleanInput).toHaveBeenCalledWith('dry-run', { required: false })
    expect(core.info).toHaveBeenCalledWith('dry-run: undefined')
    expect(result).toBe(false)
  })

  it('should return the boolean value when input is provided and CI is GitLab', () => {
    process.env.CI = 'true'
    process.env.GITLAB_CI = 'true'
    core.getBooleanInput.mockReturnValue(true)

    const result = getBooleanInput(INPUTS.DEBUG_MODE)

    expect(core.getBooleanInput).toHaveBeenCalledWith('DEBUG_MODE', { required: false })
    expect(core.info).toHaveBeenCalledWith('debug-mode: true')
    expect(result).toBe(true)
  })
})

describe('getInput', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    if (!process.env) {
      process.env = {} // Mock process.env if it doesn't exist
    }
    process.env.CI = 'false'
    process.env.GITLAB_CI = 'false'
  })

  afterEach(() => {
    vi.clearAllMocks()
    delete process.env
  })

  it('should return the input when provided', () => {
    core.getInput.mockReturnValue('whatever')

    const result = getInput(INPUTS.WORKING_PATH)

    expect(core.getInput).toHaveBeenCalledWith('working-path', { required: false })
    expect(core.info).toHaveBeenCalledWith('working-path: whatever')
    expect(result).toBe('whatever')
  })

  it('should return the default value when input is undefined', () => {
    core.getInput.mockReturnValue(undefined)

    const result = getInput(INPUTS.WORKING_PATH)

    expect(core.getInput).toHaveBeenCalledWith('working-path', { required: false })
    expect(core.info).toHaveBeenCalledWith('working-path: undefined')
    expect(result).toBe('{}')
  })

  it('should return the default value when input is an empty string', () => {
    core.getInput.mockReturnValue('')

    const result = getInput(INPUTS.WORKING_PATH)

    expect(core.getInput).toHaveBeenCalledWith('working-path', { required: false })
    expect(core.info).toHaveBeenCalledWith('working-path: ')
    expect(result).toBe('{}')
  })

  it('should return the value when input is provided and CI is GitLab', () => {
    process.env.CI = 'true'
    process.env.GITLAB_CI = 'true'
    core.getInput.mockReturnValue('whatever')

    const result = getInput(INPUTS.WORKING_PATH)

    expect(core.getInput).toHaveBeenCalledWith('WORKING_PATH', { required: false })
    expect(core.info).toHaveBeenCalledWith('working-path: whatever')
    expect(result).toBe('whatever')

    delete process.env.CI
    delete process.env.GITLAB_CI
  })
})

describe('transformKey', () => {
  it('should replace hyphens with underscores and convert to uppercase', () => {
    const input = 'one-potato'
    const result = transformKey(input)
    expect(result).toBe('ONE_POTATO')
  })

  it('should replace spaces with underscores and convert to uppercase', () => {
    const input = 'one potato'
    const result = transformKey(input)
    expect(result).toBe('ONE_POTATO')
  })

  it('should handle single word inputs correctly', () => {
    const input = 'potato'
    const result = transformKey(input)
    expect(result).toBe('POTATO')
  })

  it('should return the key unchanged if it is not a string', () => {
    const input = 123
    const result = transformKey(input)
    expect(result).toBe(123)
  })

  it('should return the key unchanged if the input is undefined', () => {
    const input = undefined
    const result = transformKey(input)
    expect(result).toBe(undefined)
  })
})

describe('isGitLabCi', () => {
  beforeEach(() => {
    if (!process.env) {
      process.env = {} // Mock process.env if it doesn't exist
    }
  })

  afterEach(() => {
    delete process.env.CI
    delete process.env.GITLAB_CI
  })

  it('should return true when CI and GITLAB_CI environment variables are set to "true"', () => {
    process.env.CI = 'true'
    process.env.GITLAB_CI = 'true'

    const result = isGitLabCi()
    expect(result).toBe(true)
  })

  it('should return false when CI is not set to "true"', () => {
    process.env.CI = 'false'
    process.env.GITLAB_CI = 'true'

    const result = isGitLabCi()
    expect(result).toBe(false)
  })

  it('should return false when GITLAB_CI is not set to "true"', () => {
    process.env.CI = 'true'
    process.env.GITLAB_CI = 'false'

    const result = isGitLabCi()
    expect(result).toBe(false)
  })

  it('should return false when neither CI nor GITLAB_CI are set', () => {
    const result = isGitLabCi()
    expect(result).toBe(false)
  })

  it('should return false when process.env is undefined', () => {
    const originalProcessEnv = process.env
    process.env = undefined

    const result = isGitLabCi()
    expect(result).toBe(false)

    process.env = originalProcessEnv // Restore process.env
  })
})
