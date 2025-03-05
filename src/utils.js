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
  const input = core.getBooleanInput(name, { required })
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
  const input = core.getInput(name, { required })
  core.info(`${name}: ${input}`)
  return input !== undefined && input !== '' ? input : defaultValue
}
