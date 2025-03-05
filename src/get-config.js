import { cosmiconfig } from 'cosmiconfig'
import * as core from '@actions/core'
import { fileURLToPath } from 'url'
import path from 'path'
import { promises as fs } from 'fs'
import { getBooleanInput, parseInput } from './utils.js'
import { INPUTS } from './constants.js'

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

/**
 * Retrieves the configuration object for the semantic release action.
 *
 * @param {string} workDir - The working directory.
 * @returns {Promise<Object>} The configuration object.
 */
export const getConfig = async (workDir) => {
  let defaultConfig = getBooleanInput(INPUTS.DEFAULT_CONFIG)
  core.info(`default-config-enabled: ${defaultConfig}`)
  defaultConfig = defaultConfig !== '' ? defaultConfig === true : ''
  const config = await cosmiconfig(CONFIG_NAME)
    .search(workDir)
    .then((result) => {
      return result?.config
    })
  if (!config && defaultConfig) {
    core.info('No config file found, using the default config')
    return await getDefaultConfig()
  }
  return config
}
