import { cosmiconfig } from 'cosmiconfig'
import * as core from '@actions/core'
import { fileURLToPath } from 'url'
import path from 'path'
import { promises as fs } from 'fs'
import { parseInput } from './utils.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const defaultConfigPath = path.resolve(__dirname, '..', '.releaserc.default')

const CONFIG_NAME = 'release'

async function getDefaultConfig() {
  try {
    const data = await fs.readFile(defaultConfigPath, 'utf8')
    return parseInput(data.toString())
  } catch (err) {
    core.error(`Error reading the default config file: ${err}`)
    return {}
  }
}

export const getConfig = async (workDir) => {
  let defaultConfigEnabled = core.getBooleanInput('default-config-enabled', {
    required: false
  })
  core.info(`defaultConfigEnabled: ${defaultConfigEnabled}`)
  defaultConfigEnabled = defaultConfigEnabled !== '' ? defaultConfigEnabled === true : ''
  const config = await cosmiconfig(CONFIG_NAME)
    .search(workDir)
    .then((result) => {
      return result?.config
    })
  if (!config && defaultConfigEnabled) {
    core.info('No config file found, using the default config')
    return await getDefaultConfig()
  }
  return config
}
