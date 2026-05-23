import { afterEach, beforeEach, describe, vi } from 'vitest'
import * as core from '@actions/core'
import { setFloatingTags } from '../src/set-floating-tags.js'
import { execa } from 'execa'
import { DEFAULT_USER } from '../src/constants.js'

vi.mock('@actions/core')
vi.mock('execa')

describe('setFloatingTags', () => {
  beforeEach(() => {
    vi.resetAllMocks()
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

  it('should propagate a non-missing-tag delete error', async () => {
    const release = {
      new: {
        major: 1,
        minor: 0,
        gitHead: 'abc123'
      }
    }

    execa.mockImplementation((command, args) => {
      if (command === 'git' && args.includes('-d')) {
        const err = new Error('fatal: unable to access remote: Permission denied')
        err.stderr = 'fatal: Permission denied'
        throw err
      }
      return Promise.resolve()
    })

    await expect(setFloatingTags(release, {})).rejects.toThrow(/Permission denied/)
  })

  it('should swallow a "tag not found" delete error (first-release case)', async () => {
    const release = {
      new: {
        major: 3,
        minor: 0,
        gitHead: 'abc123'
      }
    }

    execa.mockImplementation((command, args) => {
      if (command === 'git' && args.includes('-d')) {
        const err = new Error("error: tag 'v3' not found.")
        err.stderr = "error: tag 'v3' not found."
        throw err
      }
      return Promise.resolve()
    })

    const result = await setFloatingTags(release, {})

    expect(core.info).toHaveBeenCalledWith(expect.stringMatching(/did not exist; skipping local delete/))
    expect(result).toEqual({ majorTag: 'v3', minorTag: 'v3.0' })
  })

  it('should swallow a "remote ref does not exist" push-delete error', async () => {
    const release = {
      new: {
        major: 3,
        minor: 0,
        gitHead: 'abc123'
      }
    }

    execa.mockImplementation((command, args) => {
      if (command === 'git' && args.includes('--delete')) {
        const err = new Error('remote ref does not exist')
        err.stderr = 'error: unable to delete v3: remote ref does not exist'
        throw err
      }
      return Promise.resolve()
    })

    const result = await setFloatingTags(release, {})

    expect(core.info).toHaveBeenCalledWith(expect.stringMatching(/did not exist; skipping remote delete/))
    expect(result).toEqual({ majorTag: 'v3', minorTag: 'v3.0' })
  })

  it('should capture an error when a tag cannot be created', async () => {
    const release = {
      new: {
        major: 1,
        minor: 0,
        gitHead: 'abc123'
      }
    }

    // Mock `execa` to throw an error when deleting a tag
    execa.mockImplementation((command, args) => {
      if (command === 'git' && args.includes(release.new.gitHead)) {
        throw new Error('Failed to create tag')
      }
      return Promise.resolve()
    })

    const result = await setFloatingTags(release, {})

    expect(core.error).toHaveBeenCalledWith('Unable to create tag. Error: Error: Failed to create tag')
    expect(core.info).toHaveBeenCalledWith('Setting up env pre tagging with user: ' + DEFAULT_USER.USER_NAME)
    expect(result).toEqual({ majorTag: 'v1', minorTag: 'v1.0' })
  })

  it('should capture an error when repo cannot be synced up', async () => {
    const release = {
      new: {
        major: 1,
        minor: 0,
        gitHead: 'abc123'
      }
    }

    const user = {
      username: 'john.doe',
      email: 'john.doe@example.com'
    }

    // Mock `execa` to throw an error when deleting a tag
    execa.mockImplementation((command, args) => {
      if (command === 'git' && args.includes('config')) {
        throw new Error('Failed to sync up')
      }
      return Promise.resolve()
    })

    const result = await setFloatingTags(release, {})

    expect(core.error).toHaveBeenCalledWith('Unable to set up. Error: Error: Failed to sync up')
    expect(core.info).toHaveBeenCalledWith('Setting up env pre tagging with user: ' + DEFAULT_USER.USER_NAME)
    expect(result).toEqual({ majorTag: 'v1', minorTag: 'v1.0' })
  })

  it('should use user and email from env for git config', async () => {
    const release = {
      new: {
        major: 1,
        minor: 0,
        gitHead: 'abc123'
      }
    }

    const user = {
      GIT_COMMITTER_NAME: 'custom.user',
      GIT_COMMITTER_EMAIL: 'custom.user@example.com'
    }

    process.env.GIT_COMMITTER_NAME = user.GIT_COMMITTER_NAME
    process.env.GIT_COMMITTER_EMAIL = user.GIT_COMMITTER_EMAIL

    const result = await setFloatingTags(release, { env: process.env })

    expect(core.info).toHaveBeenCalledWith('Setting up env pre tagging with user: ' + user.GIT_COMMITTER_NAME)
    expect(execa).toHaveBeenCalledWith('git', ['config', 'user.name', user.GIT_COMMITTER_NAME], {
      cwd: process.cwd(),
      env: process.env
    })
    expect(execa).toHaveBeenCalledWith('git', ['config', 'user.email', user.GIT_COMMITTER_EMAIL], {
      cwd: process.cwd(),
      env: process.env
    })
    expect(result).toEqual({ majorTag: 'v1', minorTag: 'v1.0' })

    delete process.env.GIT_COMMITTER_NAME
    delete process.env.GIT_COMMITTER_EMAIL
  })
})
