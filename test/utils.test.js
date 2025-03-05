import { describe, it, expect, vi, afterEach } from 'vitest'
import { parseInput, cleanObject, getBooleanInput, getInput } from '../src/utils.js'
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
})

describe('getInput', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return the input when provided', () => {
    core.getInput.mockReturnValue('test-value')

    const result = getInput(INPUTS.DEBUG_MODE)

    expect(core.getInput).toHaveBeenCalledWith('debug-mode', { required: false })
    expect(core.info).toHaveBeenCalledWith('debug-mode: test-value')
    expect(result).toBe('test-value')
  })

  it('should return the default value when input is undefined', () => {
    core.getInput.mockReturnValue(undefined)

    const result = getInput(INPUTS.DEBUG_MODE)

    expect(core.getInput).toHaveBeenCalledWith('debug-mode', { required: false })
    expect(core.info).toHaveBeenCalledWith('debug-mode: undefined')
    expect(result).toBe(true)
  })

  it('should return the default value when input is an empty string', () => {
    core.getInput.mockReturnValue('')

    const result = getInput(INPUTS.DEBUG_MODE)

    expect(core.getInput).toHaveBeenCalledWith('debug-mode', { required: false })
    expect(core.info).toHaveBeenCalledWith('debug-mode: ')
    expect(result).toBe(true)
  })
})
