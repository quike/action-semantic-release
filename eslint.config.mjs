import { fixupPluginRules } from '@eslint/compat'
import js from '@eslint/js'
// import _import from 'eslint-plugin-import'
import prettier from 'eslint-plugin-prettier'
import globals from 'globals'

export default [
  {
    ignores: ['**/coverage', '**/dist', '**/linter', '**/node_modules']
  },
  js.configs.recommended,
  {
    plugins: {
      import: fixupPluginRules(_import),
      prettier
    },

    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly'
      },
      ecmaVersion: 2023,
      sourceType: 'module'
    },

    rules: {
      camelcase: 'off',
      // 'import/no-namespace': 'off',
      'no-console': 'off',
      'no-shadow': 'off',
      'no-unused-vars': 'off',
      'prettier/prettier': 'error'
    }
  }
]
