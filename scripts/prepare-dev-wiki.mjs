#!/usr/bin/env node
// Prepares the example wiki the development app shows (node_modules/.cache/dev-wiki), from the
// portal tests' fixture (plugins/techdocs-editor/e2e/portal/wiki-fixture).
//
// A copy, not the fixture itself: TechDocs' local generator rewrites mkdocs.yml in place for
// documentation in a local directory, and the fixture is also what the simulated GitHub serves.
// The copy is a Git repository with one commit at a fixed date, so the page dates
// (git-revision-date-localized) are the same on every machine and in CI.
import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const fixture = join(root, 'plugins/techdocs-editor/e2e/portal/wiki-fixture');
const target = join(root, 'node_modules/.cache/dev-wiki');

rmSync(target, { recursive: true, force: true });
mkdirSync(dirname(target), { recursive: true });
cpSync(fixture, target, { recursive: true });

const date = '2026-10-22T12:35:27-03:00';
const git = (...args) =>
  execFileSync('git', args, {
    cwd: target,
    stdio: 'ignore',
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: 'Dev wiki',
      GIT_AUTHOR_EMAIL: 'dev-wiki@example.com',
      GIT_COMMITTER_NAME: 'Dev wiki',
      GIT_COMMITTER_EMAIL: 'dev-wiki@example.com',
      GIT_AUTHOR_DATE: date,
      GIT_COMMITTER_DATE: date,
    },
  });
git('init', '-q', '-b', 'main');
git('add', '-A');
git('-c', 'commit.gpgsign=false', 'commit', '-q', '-m', 'docs: example wiki');
console.log(`Example wiki ready in ${target}`);
