// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// El tooling de backend de Amplify (aws-cdk, data-construct, backend-cli) trae
// una cantidad enorme de archivos que Metro intenta vigilar → error ENOSPC
// (límite de file watchers del sistema). La app NO importa estas librerías; solo
// se usan para desplegar el backend. Las excluimos del vigilado de Metro.
const backendToolingBlockList = [
  /.*\/node_modules\/@aws-amplify\/backend\/.*/,
  /.*\/node_modules\/@aws-amplify\/backend-cli\/.*/,
  /.*\/node_modules\/@aws-amplify\/data-construct\/.*/,
  /.*\/node_modules\/aws-cdk-lib\/.*/,
  /.*\/node_modules\/@aws-cdk\/.*/,
];

const existing = config.resolver.blockList;
config.resolver.blockList = Array.isArray(existing)
  ? [...existing, ...backendToolingBlockList]
  : existing
    ? [existing, ...backendToolingBlockList]
    : backendToolingBlockList;

module.exports = config;
