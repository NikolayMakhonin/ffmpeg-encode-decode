import resolve from '@rollup/plugin-node-resolve'
import multiInput from 'rollup-plugin-multi-input'
import del from 'rollup-plugin-delete'
import typescript from '@rollup/plugin-typescript'
import alias from '@rollup/plugin-alias'
import replace from '@rollup/plugin-replace'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import path from "path"
import pkg from './package.json'

const dev = !!process.env.ROLLUP_WATCH

const onwarnRollup = (warning, onwarn) => {
  // prevent warn: (!) `this` has been rewritten to `undefined`
  // if ( warning.code === 'THIS_IS_UNDEFINED' ) {
  //   return false
  // }
  // if ( warning.code === 'EVAL' ) {
  //   return false
  // }
  // if ( warning.code === 'SOURCEMAP_ERROR' ) {
  //   return false
  // }
  // if ( warning.plugin === 'typescript' && /Rollup 'sourcemap' option must be set to generate source maps/.test(warning.message)) {
  //   return false
  // }

  console.warn('onwarnRollup',
    [
      `${warning.code}: ${warning.message}`,
      warning.loc && `${warning.loc.file}:${warning.loc.line}:${warning.loc.column}`,
      warning.plugin && `plugin: ${warning.plugin}`,
      warning.pluginCode && `pluginCode: ${warning.pluginCode}`,
      warning.hook && `hook: ${warning.hook}`,
      warning.frame,
    ]
      .map(o => o?.toString()?.trim())
      .filter(o => o)
      .join('\r\n') + '\r\n'
  )

  return false
}

const aliasOptions = {
  entries: [
    {
      find: 'src',
      replacement: path.resolve(__dirname, 'src')
    },
  ],
}

const serverConfig = {
  cache: true,
  input: [
    'src/**/*.ts'
  ],
  output: {
    dir: 'dist',
    format: 'cjs',
    exports: 'named',
    entryFileNames: `[name].cjs`,
    chunkFileNames: '[name].cjs',
  },
  plugins: [
    del({ targets: 'dist/*' }),
    multiInput(),
    alias(aliasOptions),
    json(),
    replace({
      preventAssignment: true,
    }),
    resolve(),
    commonjs({
      transformMixedEsModules: true,
    }),
    typescript({
      sourceMap: dev,
    }),
  ],
  onwarn: onwarnRollup,
  external: Object.keys(pkg.dependencies)
    .concat(Object.keys(pkg.devDependencies))
    .concat(require('module').builtinModules || Object.keys(process.binding('natives'))),
}

export default [serverConfig]
