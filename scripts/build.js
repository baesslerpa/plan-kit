// Baut dist/plan-kit.js (ES-Modul, Lit gebündelt, CSS inline) und dist/plan-kit.css (nur Basis-Stylesheet).
// Mermaid und der Syntax-Highlighter landen als nachladbare Chunks in dist/chunks/ und werden nur bei Bedarf geladen.
import * as esbuild from 'esbuild';
import { readFile, writeFile, mkdir, rm, readdir } from 'node:fs/promises';

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

await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });

const options = {
  entryPoints: ['src/plan-kit.js'],
  outdir: 'dist',
  entryNames: '[name]',
  chunkNames: 'chunks/[name]-[hash]',
  splitting: true,
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
  await dropChunkSourcemaps();
  const css = (await minifyCss('src/base.css')) + (await minifyCss('src/lib/tokens.css'));
  await writeFile('dist/plan-kit.css', `/*! plan-kit ${pkg.version} */\n${css}`);
  console.log(`plan-kit ${pkg.version} → dist/`);
}

// Sourcemaps nur für unseren eigenen Code behalten. Die Chunks (Mermaid, Highlighter) brächten
// sonst rund 20 MB pro Version auf GitHub Pages, ohne beim Debuggen von plan-kit zu helfen.
async function dropChunkSourcemaps() {
  for (const name of await readdir('dist/chunks')) {
    const path = `dist/chunks/${name}`;
    if (name.endsWith('.map')) await rm(path);
    else if (name.endsWith('.js')) {
      const code = await readFile(path, 'utf8');
      await writeFile(path, code.replace(/\n\/\/# sourceMappingURL=\S+\s*$/, '\n'));
    }
  }
}
