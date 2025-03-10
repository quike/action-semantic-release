const USER_NAME = 'github-actions[bot]'
const USER_EMAIL = 'github-actions[bot]@users.noreply.github.com'

export const DEFAULT_USER = {
  USER_NAME,
  USER_EMAIL
}

const DRY_RUN = { name: 'dry-run', required: false, default: false }
const DEBUG_MODE = { name: 'debug-mode', required: false, default: true }
const CI = { name: 'ci', required: false, default: true }
const FLOATING_TAGS = { name: 'floating-tags', required: false, default: false }
const ADD_SUMMARY = { name: 'add-summary', required: false, default: true }
const DEFAULT_CONFIG = { name: 'default-config', required: false, default: true }
const DEFAULT_PRESET_INFO = { name: 'default-preset-info', required: false, default: true }
const WORKING_PATH = { name: 'working-path', required: false, default: '{}' }

export const INPUTS = {
  DRY_RUN,
  DEBUG_MODE,
  CI,
  FLOATING_TAGS,
  ADD_SUMMARY,
  DEFAULT_CONFIG,
  DEFAULT_PRESET_INFO,
  WORKING_PATH
}
