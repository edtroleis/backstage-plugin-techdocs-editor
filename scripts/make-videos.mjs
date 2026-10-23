#!/usr/bin/env node
/* eslint-disable no-console */
// Grava os vídeos curtos do README e converte em GIF (docs/media/*.gif), que o GitHub e o npm mostram
// direto no README. Precisa da app de desenvolvimento rodando (yarn start) e do ffmpeg.
//
// Uso: yarn record:videos
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const raw = join(root, 'node_modules/.cache/editor-videos');
const out = join(root, 'docs/media');

rmSync(raw, { recursive: true, force: true });
execFileSync('yarn', ['playwright', 'test', '-c', 'plugins/techdocs-editor/e2e/videos/playwright.config.ts'], {
  cwd: root,
  stdio: 'inherit',
});

const starts = JSON.parse(readFileSync(join(raw, 'starts.json'), 'utf8'));
mkdirSync(out, { recursive: true });
for (const file of readdirSync(raw).filter(name => name.endsWith('.webm'))) {
  const name = file.replace(/\.webm$/, '');
  const gif = join(out, `${name}.gif`);
  // 960 px de largura e 10 quadros por segundo, com paleta própria: legível e com poucos MB
  execFileSync('ffmpeg', [
    '-y', '-loglevel', 'error',
    '-ss', String(Math.max(0, (starts[name] ?? 0) - 0.3)),
    '-i', join(raw, file),
    '-vf', 'fps=10,scale=960:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=96:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle',
    '-loop', '0',
    gif,
  ]);
  console.log(`docs/media/${name}.gif (${(statSync(gif).size / 1024 / 1024).toFixed(1)} MB)`);
}
