#!/usr/bin/env node
/* eslint-disable no-console */
// Gera src/vendor/crepe-theme.css: o tema do Milkdown Crepe (common + frame) num só arquivo, com os
// @import resolvidos. O build do Backstage transforma o CSS do pacote num módulo que injeta um
// <style>, e um `@import '@milkdown/crepe/...'` ali dentro chegava literal ao navegador, que não
// resolve nome de pacote: quem instalava pelo npm via o editor sem estilo. Importar o CSS do Crepe
// direto também não serve, porque o pacote dele declara "sideEffects": false e o bundler descarta.
//
// Rodar depois de mudar a versão do @milkdown/crepe: `yarn bundle:crepe-theme`. O CI confere que o
// arquivo está atualizado (`yarn bundle:crepe-theme --check`).
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, '../src/vendor/crepe-theme.css');
const require = createRequire(join(here, '../package.json'));
// O pacote não exporta o package.json: sobe a partir da entrada até a pasta dele
let crepeDir = dirname(require.resolve('@milkdown/crepe'));
while (!existsSync(join(crepeDir, 'package.json')) || JSON.parse(readFileSync(join(crepeDir, 'package.json'), 'utf8')).name !== '@milkdown/crepe') {
  crepeDir = dirname(crepeDir);
}
const crepe = JSON.parse(readFileSync(join(crepeDir, 'package.json'), 'utf8'));
const license = readFileSync(join(crepeDir, 'LICENSE'), 'utf8').trim();

const result = await build({
  stdin: {
    contents: "@import '@milkdown/crepe/theme/common/style.css';\n@import '@milkdown/crepe/theme/frame.css';\n",
    resolveDir: join(here, '..'),
    loader: 'css',
  },
  bundle: true,
  write: false,
  logLevel: 'silent',
  plugins: [
    {
      // O editor desliga o LaTeX (Crepe.Feature.Latex): o CSS do KaTeX, com as fontes, fica de fora
      name: 'sem-katex',
      setup(b) {
        b.onResolve({ filter: /katex.*\.css$/ }, args => ({ path: args.path, namespace: 'sem-katex' }));
        b.onLoad({ filter: /.*/, namespace: 'sem-katex' }, () => ({ contents: '', loader: 'css' }));
      },
    },
  ],
});

const css = `/*
 * Gerado por scripts/bundle-crepe-theme.mjs a partir de @milkdown/crepe@${crepe.version}
 * (temas common e frame, sem o CSS do KaTeX: o editor desliga o LaTeX). Não editar à mão.
 *
${license.split('\n').map(line => ` * ${line}`.trimEnd()).join('\n').replaceAll('*/', '* /')}
 */
${result.outputFiles[0].text}`;

if (process.argv.includes('--check')) {
  if (readFileSync(out, 'utf8') !== css) {
    console.error('src/vendor/crepe-theme.css está desatualizado: rode yarn bundle:crepe-theme');
    process.exit(1);
  }
  console.log(`src/vendor/crepe-theme.css confere com @milkdown/crepe@${crepe.version}`);
} else {
  writeFileSync(out, css);
  console.log(`src/vendor/crepe-theme.css gerado de @milkdown/crepe@${crepe.version} (${css.length} bytes)`);
}
