// See: https://rollupjs.org/introduction/

import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import json from '@rollup/plugin-json'
import analyzer from 'rollup-plugin-analyzer'

const config = {
  input: 'src/index.js',
  output: {
    esModule: true,
    dir: 'dist',
    format: 'es',
    sourcemap: true,
    inlineDynamicImports: true
  },
  plugins: [commonjs(), nodeResolve({ preferBuiltins: true }), json(), analyzer({ summaryOnly: true })],
  external: ['unicorn-magic']
}

export default config
