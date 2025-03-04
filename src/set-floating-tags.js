import * as core from '@actions/core'
import { tag } from 'semantic-release/lib/git'

export const setFloatingTags = async (release, { cwd = process.cwd(), env = process.env }) => {
  if (!release) {
    core.debug('Floating tags cannot be set.')
    return {}
  }

  if (release?.new?.major && release?.new?.minor && release?.new?.gitHead) {
    const majorTag = `v${release?.new?.major}`
    const minorTag = `v${release?.new?.major}.${release?.new?.minor}`
    const gitHead = release?.new?.gitHead
    core.info(`Setting floating major tag: ${majorTag}`)
    await tag(majorTag, '-d', { cwd, env })
    await tag(majorTag, gitHead, { cwd, env })
    core.info(`Setting floating minor tag: ${minorTag}`)
    await tag(minorTag, '-d', { cwd, env })
    await tag(minorTag, gitHead, { cwd, env })
    return { majorTag, minorTag }
  }
}
