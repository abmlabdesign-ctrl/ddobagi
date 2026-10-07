// Lists the learning-aid strings each native-language catalog is missing.
//   node --experimental-strip-types scripts/i18n-check.mjs [--json]
// Data modules are TypeScript with `@/` imports, so a small resolve hook maps
// those onto src/ before importing them.
import { register } from 'node:module';

register(
  'data:text/javascript,' +
    encodeURIComponent(`
import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
const root = ${JSON.stringify(new URL('../', import.meta.url).href)};
export async function resolve(spec, ctx, next) {
  let url = null;
  if (spec.startsWith('@/')) url = new URL('src/' + spec.slice(2), root).href;
  else if ((spec.startsWith('./') || spec.startsWith('../')) && ctx.parentURL?.startsWith('file:'))
    url = new URL(spec, ctx.parentURL).href;
  if (url) {
    const path = fileURLToPath(url);
    for (const ext of ['', '.ts', '.tsx', '/index.ts']) {
      if (existsSync(path + ext) && !(ext === '' && !/\\.(ts|tsx|js|mjs)$/.test(path))) {
        return { url: pathToFileURL(path + ext).href, shortCircuit: true };
      }
    }
  }
  return next(spec, ctx);
}`),
);

const { learningStrings } = await import('../src/i18n/sources.ts');
const { catalogs } = await import('../src/i18n/catalogs/index.ts');

const strings = learningStrings();
const report = {};
for (const [language, catalog] of Object.entries(catalogs)) {
  const missing = strings.filter((key) => !catalog[key]);
  const stale = Object.keys(catalog).filter((key) => !strings.includes(key));
  report[language] = { total: strings.length, missing, stale };
}

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ strings, report }, null, 2));
} else {
  console.log(`${strings.length} learning-aid strings`);
  for (const [language, { total, missing, stale }] of Object.entries(report)) {
    console.log(`\n${language}: ${total - missing.length}/${total} translated` +
      (stale.length ? `, ${stale.length} stale` : ''));
    missing.forEach((key) => console.log(`  missing: ${key}`));
    stale.forEach((key) => console.log(`  stale:   ${key}`));
  }
}
