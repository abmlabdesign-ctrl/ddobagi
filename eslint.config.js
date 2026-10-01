const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  ...expoConfig,
  {
    // docs/design holds the comps' generated runtime (support.js), not app code.
    ignores: ['dist/*', 'node_modules/*', '.expo/*', 'docs/**'],
  },
];
