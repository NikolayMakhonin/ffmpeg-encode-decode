module.exports = {
  require: [
    'tsconfig-paths/register',
    'ts-node/register',
    './src/helpers/test/register.ts',
  ],
  'watch-files': ['./src/**'],
  // 'loader': 'ts-node/esm',
  "node-option": [
    "experimental-wasm-threads",
    "experimental-wasm-bulk-memory",
  ],
}
