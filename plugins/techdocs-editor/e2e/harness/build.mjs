// Gera a página de teste do editor (dist/) com esbuild e, com --serve, serve em http://localhost:PORT.
import { build } from 'esbuild';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, 'dist');
const port = Number(process.env.EDITOR_HARNESS_PORT ?? 4319);

await mkdir(out, { recursive: true });
await build({
  entryPoints: [join(here, 'main.tsx')],
  bundle: true,
  outdir: out,
  format: 'esm',
  jsx: 'automatic',
  sourcemap: true,
  define: { 'process.env.NODE_ENV': '"development"' },
  // Lado navegador do markdownlint (sem fs/os)
  conditions: ['browser'],
  platform: 'browser',
  loader: { '.woff': 'dataurl', '.woff2': 'dataurl', '.ttf': 'dataurl', '.svg': 'dataurl', '.png': 'dataurl', '.yaml': 'text' },
  logLevel: 'warning',
});
await writeFile(
  join(out, 'index.html'),
  `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Editor de docs (teste)</title>
<link rel="stylesheet" href="main.css">
<style>body { margin: 0; padding: 16px 16px 16px 56px; font-family: sans-serif; }</style>
</head>
<body><div id="root"></div><script type="module" src="main.js"></script></body>
</html>
`,
);

if (process.argv.includes('--serve')) {
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.map': 'application/json' };
  createServer(async (req, res) => {
    const path = new URL(req.url, 'http://x').pathname;
    const file = join(out, path === '/' ? 'index.html' : path);
    try {
      const body = await readFile(file);
      res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' });
      res.end(body);
    } catch {
      res.writeHead(404).end();
    }
  // eslint-disable-next-line no-console
  }).listen(port, () => console.log(`Editor de teste em http://localhost:${port}`));
}
