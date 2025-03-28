import { afterEach, beforeEach, describe, vi } from 'vitest'
import * as core from '@actions/core'
import { setFloatingTags } from '../src/set-floating-tags.js'
import { execa } from 'execa'
import { DEFAULT_USER } from '../src/constants.js'

vi.mock('@actions/core')
vi.mock('execa')

describe('setFloatingTags', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should log a debug message and return an empty object when no release is provided', async () => {
    const result = await setFloatingTags(null, {})
    expect(core.debug).toHaveBeenCalledWith('Floating tags cannot be set.')
    expect(result).toEqual({})
  })

  it('should set floating major and minor tags when release has major, minor, and gitHead', async () => {
    const release = {
      new: {
        major: 1,
        minor: 0,
        gitHead: 'abc123'
      }
    }

    const result = await setFloatingTags(release, {})

    expect(core.info).toHaveBeenCalledWith('Setting up env pre tagging with user: ' + DEFAULT_USER.USER_NAME)
    expect(core.info).toHaveBeenCalledWith('Creating tag: v1')
    expect(core.info).toHaveBeenCalledWith('Creating tag: v1.0')
    expect(execa).toHaveBeenCalledWith('git', ['config', 'user.name', DEFAULT_USER.USER_NAME], {
      cwd: process.cwd(),
      env: process.env
    })
    expect(execa).toHaveBeenCalledWith('git', ['config', 'user.email', DEFAULT_USER.USER_EMAIL], {
      cwd: process.cwd(),
      env: process.env
    })
    expect(execa).toHaveBeenCalledWith('git', ['tag', 'v1', '-d'], { cwd: process.cwd(), env: process.env })
    expect(execa).toHaveBeenCalledWith('git', ['tag', 'v1', 'abc123'], { cwd: process.cwd(), env: process.env })
    expect(execa).toHaveBeenCalledWith('git', ['tag', 'v1.0', '-d'], { cwd: process.cwd(), env: process.env })
    expect(execa).toHaveBeenCalledWith('git', ['tag', 'v1.0', 'abc123'], { cwd: process.cwd(), env: process.env })
    expect(result).toEqual({ majorTag: 'v1', minorTag: 'v1.0' })
  })

  it('should return an empty object when release does not have major, minor, or gitHead', async () => {
    const release = {
      new: {}
    }

    const result = await setFloatingTags(release, {})
    expect(result).toEqual({})
  })
})
