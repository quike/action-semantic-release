import { afterEach, describe, expect, it, vi } from 'vitest'
import { cosmiconfig } from 'cosmiconfig'
import * as core from '@actions/core'
import { promises as fs } from 'fs'
import { getConfig } from '../src/get-config.js'

vi.mock('cosmiconfig')
vi.mock('@actions/core', async () => {
  const original = await vi.importActual('@actions/core')
  return {
    ...original,
    getBooleanInput: vi.fn()
  }
})
vi.mock('fs', () => ({
  promises: {
    readFile: vi.fn().mockRejectedValue(new Error('File not found'))
  }
}))

describe('getConfig', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should return the default config if default-config-enabled is true and no config found', async () => {
    core.getBooleanInput.mockReturnValueOnce(true)
    cosmiconfig.mockReturnValueOnce({
      search: vi.fn().mockResolvedValueOnce(null)
    })
    fs.readFile.mockResolvedValueOnce(JSON.stringify({ default: 'config' }))

    const config = await getConfig('/some/workdir')
    expect(config).toEqual({ default: 'config' })
  })

  it('should return the found config if default-config-enabled is false', async () => {
    core.getBooleanInput.mockReturnValueOnce(false)
    cosmiconfig.mockReturnValueOnce({
      search: vi.fn().mockResolvedValueOnce({ config: { found: 'config' } })
    })

    const config = await getConfig('/some/workdir')
    expect(config).toEqual({ found: 'config' })
  })

  it('should return the found config if default-config-enabled is not set', async () => {
    core.getBooleanInput.mockReturnValueOnce('')
    cosmiconfig.mockReturnValueOnce({
      search: vi.fn().mockResolvedValueOnce({ config: { found: 'config' } })
    })

    const config = await getConfig('/some/workdir')
    expect(config).toEqual({ found: 'config' })
  })

  it('should return the default config if default-config-enabled is true and config is not found', async () => {
    core.getBooleanInput.mockReturnValueOnce(true)
    cosmiconfig.mockReturnValueOnce({
      search: vi.fn().mockResolvedValueOnce(null)
    })
    fs.readFile.mockResolvedValueOnce(JSON.stringify({ default: 'config' }))

    const config = await getConfig('/some/workdir')
    expect(config).toEqual({ default: 'config' })
  })

  it('should return the found config if default-config-enabled is true and config is found', async () => {
    core.getBooleanInput.mockReturnValueOnce(true)
    cosmiconfig.mockReturnValueOnce({
      search: vi.fn().mockResolvedValueOnce({ config: { found: 'config' } })
    })

    const config = await getConfig('/some/workdir')
    expect(config).toEqual({ found: 'config' })
  })

  it('should log an error if reading the default config file fails', async () => {
    const consoleErrorSpy = vi.spyOn(core, 'error').mockImplementation(() => {})
    core.getBooleanInput.mockReturnValueOnce(true)
    cosmiconfig.mockReturnValueOnce({
      search: vi.fn().mockResolvedValueOnce(null)
    })
    fs.readFile.mockRejectedValueOnce(new Error('File not found'))

    const config = await getConfig('/some/workdir')
    expect(config).toEqual({})

    await new Promise((resolve) => setTimeout(resolve, 10)) // Small delay
    console.log(consoleErrorSpy.mock.calls)
    expect(consoleErrorSpy).toHaveBeenCalled()
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Error reading the default config file'))

    consoleErrorSpy.mockRestore()
  })
})
