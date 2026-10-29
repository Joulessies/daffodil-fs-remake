const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

// 1. Watch only the mobile folder
config.watchFolders = [projectRoot];

// 2. Resolve node modules strictly from mobile/node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
];

// 3. Block parent root web files, parent node_modules, and .next
const parentDir = path.resolve(projectRoot, '..');
const escapedParent = parentDir.replace(/\\/g, '\\\\');

config.resolver.blockList = [
  new RegExp('^' + escapedParent + '\\\\node_modules(?:\\\\.*)?$'),
  new RegExp('^' + escapedParent + '\\\\.next(?:\\\\.*)?$'),
  new RegExp('^' + escapedParent + '\\\\src(?:\\\\.*)?$'),
];

// 4. Ensure react and react-native are strictly locked to mobile's versions
config.resolver.extraNodeModules = {
  react: path.resolve(projectRoot, 'node_modules/react'),
  'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
};

module.exports = config;
