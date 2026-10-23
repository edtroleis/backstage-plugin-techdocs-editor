#!/usr/bin/env node
/* eslint-disable no-console */
// Publishes the plugin packages whose version is not on npm yet (release.yml, after the
// "Version Packages" pull request is merged).
//
// For each pending package:
//   1. `yarn pack`: turns `workspace:^` into the real version and runs the Backstage prepack
//      (main/types pointing to dist);
//   2. npm, with provenance, in one of two modes (NPM_PUBLISH_MODE):
//      - `stage` (default): `npm stage publish` submits the version; a maintainer approves it on
//        npmjs.com (Staged Packages) or with `npm stage approve <id>`, always with 2FA. A leaked
//        CI credential can at most queue a version nobody approves;
//      - `publish`: `npm publish`, live right away.
//      Auth: npm trusted publishing (OIDC, no secret) or the NPM_TOKEN secret (first release, a
//      "stage only" token).
// Then, for every package version that is live on npm without a git tag yet (so also versions
// approved after an earlier run): git tag `<name>@<version>` and a GitHub release with that
// version's CHANGELOG section. Safe to run again.
//
// Usage: node scripts/publish.mjs [--dry-run]   (--dry-run: builds and packs and shows what npm
// would publish, without provenance, tags or releases; works locally)
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const dryRun = process.argv.includes('--dry-run');
const mode = process.env.NPM_PUBLISH_MODE || 'stage';
if (!['stage', 'publish'].includes(mode)) throw new Error(`NPM_PUBLISH_MODE must be stage or publish, not ${mode}`);
const root = new URL('..', import.meta.url).pathname;
const run = (cmd, args, opts = {}) =>
  execFileSync(cmd, args, { cwd: root, stdio: ['ignore', 'pipe', 'inherit'], encoding: 'utf8', ...opts });
const succeeds = (cmd, args) => {
  try {
    run(cmd, args, { stdio: ['ignore', 'pipe', 'ignore'] });
    return true;
  } catch {
    return false;
  }
};

// A version waiting for approval is not live: `npm view` only sees approved versions
const isLive = pkg => succeeds('npm', ['view', `${pkg.name}@${pkg.version}`, 'version']);
const tagOf = pkg => `${pkg.name}@${pkg.version}`;

/** The section of CHANGELOG.md for `version` (written by `changeset version`). */
const changelogSection = pkg => {
  const file = join(pkg.dir, 'CHANGELOG.md');
  if (!existsSync(file)) return 'First release.';
  const text = readFileSync(file, 'utf8');
  const start = text.indexOf(`## ${pkg.version}\n`);
  if (start < 0) return tagOf(pkg);
  const next = text.indexOf('\n## ', start + 1);
  return text.slice(start, next < 0 ? undefined : next).replace(/^## .*\n/, '').trim() || tagOf(pkg);
};

const packages = readdirSync(join(root, 'plugins'), { withFileTypes: true })
  .filter(entry => entry.isDirectory() && existsSync(join(root, 'plugins', entry.name, 'package.json')))
  .map(entry => {
    const dir = join(root, 'plugins', entry.name);
    return { dir, ...JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')) };
  })
  .filter(pkg => !pkg.private);

const pending = packages.filter(pkg => !isLive(pkg));
if (pending.length > 0) {
  // The packages import each other: build all of them before packing
  run('yarn', ['workspaces', 'foreach', '-At', '--include', '@edtroleis/*', 'run', 'build'], { stdio: 'inherit' });
  const out = mkdtempSync(join(tmpdir(), 'techdocs-editor-pack-'));
  for (const pkg of pending) {
    const tarball = join(out, `${pkg.name.replace('@', '').replace('/', '-')}-${pkg.version}.tgz`);
    run('yarn', ['pack', '--out', tarball], { cwd: pkg.dir, stdio: 'inherit' });
    // Provenance needs the GitHub Actions OIDC token: only in the release workflow
    const flags = ['--access', 'public', ...(dryRun ? ['--dry-run'] : ['--provenance'])];
    if (mode === 'publish') {
      run('npm', ['publish', tarball, ...flags], { stdio: 'inherit' });
    } else {
      // `npm stage publish` packs the current directory: run it in the unpacked tarball, whose
      // package.json is already the published one (no scripts to run again)
      const unpacked = join(out, `${pkg.name.replace('/', '-')}-unpacked`);
      mkdirSync(unpacked);
      run('tar', ['xzf', tarball, '-C', unpacked, '--strip-components', '1']);
      run('npm', ['stage', 'publish', '--ignore-scripts', ...flags], { cwd: unpacked, stdio: 'inherit' });
    }
    console.log(
      mode === 'stage'
        ? `Submitted ${tagOf(pkg)}: approve it on npmjs.com (Staged Packages) with 2FA, then run the Release workflow again to tag it`
        : `Published ${tagOf(pkg)}`,
    );
  }
}

if (dryRun) process.exit(0);
for (const pkg of packages) {
  const tag = tagOf(pkg);
  if (!isLive(pkg) || succeeds('git', ['rev-parse', '--verify', '--quiet', `refs/tags/${tag}`])) continue;
  run('git', ['tag', tag]);
  run('git', ['push', 'origin', tag], { stdio: 'inherit' });
  run('gh', ['release', 'create', tag, '--title', tag, '--notes', changelogSection(pkg)], { stdio: 'inherit' });
  console.log(`Tagged and released ${tag}`);
}
