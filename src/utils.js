import * as core from '@actions/core'

/**
 * Parses a JSON string input and returns the corresponding object.
 * If the input is not a valid JSON string, it returns the default value or the input itself.
 *
 * @param {string} input - The JSON string to parse.
 * @param {*} [defaultValue=''] - The default value to return if parsing fails.
 * @returns {*} - The parsed object, or the default value/input if parsing fails.
 */
export const parseInput = (input, defaultValue = '') => {
  try {
    core.info(`Parsing input: ${input}`)
    return JSON.parse(input)
  } catch (err) {
    core.error(`Error parsing input: ${err}`)
    return defaultValue || input
  }
}

/**
 * Recursively cleans an object by removing empty strings, undefined values, empty arrays,
 * and empty objects. Nested objects are also cleaned recursively.
 *
 * @param {Object} obj - The object to clean.
 * @returns {Object} - The cleaned object.
 */
export const cleanObject = (obj) => {
  Object.keys(obj).forEach((key) => {
    const value = obj[key]

    // Recursively clean nested objects
    if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
      cleanObject(value) // Clean nested object
      if (Object.keys(value).length === 0) {
        delete obj[key] // Remove empty objects
      }
    }

    // Remove empty strings, undefined, and empty arrays
    if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
      delete obj[key]
    }
  })

  return obj
}

/**
 * Retrieves a boolean input value from the GitHub Actions input.
 *
 * @param {*} config - The name of the input to retrieve.
 * @returns {boolean} - The boolean value of the input.
 */
export const getBooleanInput = (config) => {
  const { name, required, default: defaultValue } = config
  const input = core.getBooleanInput(isGitLabCi() ? transformKey(name) : name, { required })
  core.info(`${name}: ${input}`)
  return input !== undefined ? input : defaultValue
}

/**
 * Retrieves an input value from the GitHub Actions input.
 *
 * @param {*} config - The name of the input to retrieve.
 * @returns {*} - The value of the input, or the default value if the input is not provided.
 */
export const getInput = (config) => {
  const { name, required, default: defaultValue } = config
  const input = core.getInput(isGitLabCi() ? transformKey(name) : name, { required })
  core.info(`${name}: ${input}`)
  return input !== undefined && input !== '' ? input : defaultValue
}

/**
 * Determines if the current environment is a GitLab CI environment.
 *
 * @returns {boolean} - Returns `true` if the environment variables indicate a GitLab CI environment, otherwise `false`.
 */
export const isGitLabCi = () => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env.CI === 'true' && process.env.GITLAB_CI === 'true'
  } else {
    return false
  }
}

/**
 * Transforms a string key into an uppercase, underscore-separated format.
 * This is useful for converting keys to a format compatible with environment variables.
 *
 * @param {string} key - The key to transform.
 * @returns {string} - The transformed key in uppercase with spaces and hyphens replaced by underscores.
 */
export const transformKey = (key) => {
  if (typeof key !== 'string') {
    return key
  }
  return key.replace(/[- ]/g, '_').toUpperCase()
}

/**
 * Retrieves a var from the environment or defaults.
 *
 * @param {string} envVar - The environment variable to check.
 * @param {string} defaultValue - The default value to return if the environment variable is not set.
 * @returns {string} The var value.
 */
export const getEnvVar = (envVar, defaultValue) => {
  return process.env[envVar] || defaultValue
}
