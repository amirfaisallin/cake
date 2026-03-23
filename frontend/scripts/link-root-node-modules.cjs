const fs = require('fs')
const path = require('path')

const projectDir = path.resolve(__dirname, '..')
const sourceNodeModules = path.join(projectDir, 'node_modules')
const rootNodeModules = path.resolve(projectDir, '..', 'node_modules')

try {
  if (!fs.existsSync(sourceNodeModules)) {
    console.log('[link-root-node-modules] frontend/node_modules not found, skipping')
    process.exit(0)
  }

  if (fs.existsSync(rootNodeModules)) {
    console.log('[link-root-node-modules] root node_modules already exists, skipping')
    process.exit(0)
  }

  fs.symlinkSync(sourceNodeModules, rootNodeModules, 'dir')
  console.log('[link-root-node-modules] linked root node_modules -> frontend/node_modules')
} catch (error) {
  console.warn('[link-root-node-modules] could not create symlink:', error && error.message)
}

