/* global __dirname */
/**
 * Prints src/data/licenses.ts from the runtime dependencies in package.json.
 * Run after adding or upgrading a package: node scripts/licenses.js > src/data/licenses.ts
 */
const path = require('path');

const root = path.join(__dirname, '..');
const pkg = require(path.join(root, 'package.json'));

const rows = Object.keys(pkg.dependencies)
  .sort()
  .map((name) => {
    const meta = require(path.join(root, 'node_modules', name, 'package.json'));
    const license =
      typeof meta.license === 'string' ? meta.license : (meta.license?.type ?? 'See package');
    return `  { name: '${name}', version: '${meta.version}', license: '${license}' },`;
  });

process.stdout.write(`/**
 * MY-3 › About › Open-source licenses. Generated from package.json — rerun
 * \`node scripts/licenses.js > src/data/licenses.ts\` when dependencies change.
 */
export const licenses: { name: string; version: string; license: string }[] = [
${rows.join('\n')}
];

/** Bundled fonts (assets/fonts). */
export const fontLicenses = [
  { name: 'Pretendard', license: 'SIL Open Font License 1.1' },
  { name: 'Inter', license: 'SIL Open Font License 1.1' },
];
`);
