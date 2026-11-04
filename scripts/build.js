// Baut dist/plan-kit.js (ES-Modul, Lit gebündelt, CSS inline) und dist/plan-kit.css (nur Basis-Stylesheet).
import * as esbuild from 'esbuild';
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url)));
const watch = process.argv.includes('--watch');

// Mindest-Browser: light-dark() ist die jüngste genutzte Funktion. Diese Ziele können auch
// natives CSS-Nesting – esbuild lässt es deshalb unverändert stehen und minifiziert nur.
const target = ['es2022', 'chrome123', 'firefox120', 'safari17.5'];

const minifyCss = async (path) =>
  (await esbuild.transform(await readFile(path, 'utf8'), { loader: 'css', minify: !watch, target })).code;

// CSS-Importe als minifizierten String ins JS-Bundle übernehmen.
const cssAsText = {
  name: 'css-as-text',
  setup(build) {
    build.onLoad({ filter: /\.css$/ }, async (args) => ({ contents: await minifyCss(args.path), loader: 'text' }));
  },
};

await mkdir('dist', { recursive: true });

const options = {
  entryPoints: ['src/plan-kit.js'],
  outfile: 'dist/plan-kit.js',
  bundle: true,
  format: 'esm',
  target,
  minify: !watch,
  sourcemap: true,
  legalComments: 'eof',
  plugins: [cssAsText],
  define: { __PK_VERSION__: JSON.stringify(pkg.version) },
  banner: { js: `/*! plan-kit ${pkg.version} */` },
};

if (watch) {
  const ctx = await esbuild.context(options);
  await ctx.watch();
  console.log('plan-kit: watching src/ …');
} else {
  await esbuild.build(options);
  await writeFile('dist/plan-kit.css', `/*! plan-kit ${pkg.version} */\n${await minifyCss('src/base.css')}`);
  console.log(`plan-kit ${pkg.version} → dist/`);
}
