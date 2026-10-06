#!/usr/bin/env node
// Read a pinned Git revision using the repository's existing frontmatter parser.
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { resolve, join } from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';

const help = 'Usage: node snapshot_site.mjs --repo <contributions checkout> --ref <Git revision> --year <YYYY> --output <directory>';
const argv = process.argv.slice(2);
if (argv.includes('--help')) { console.log(help); process.exit(0); }
const options = {};
for (let i = 0; i < argv.length; i += 2) {
  if (!['--repo', '--ref', '--year', '--output'].includes(argv[i]) || !argv[i + 1]) {
    console.error(help); process.exit(2);
  }
  options[argv[i].slice(2)] = argv[i + 1];
}
if (!options.repo || !options.ref || !/^\d{4}$/.test(options.year || '') || !options.output) {
  console.error(help); process.exit(2);
}
try {
  const repo = resolve(options.repo);
  const require = createRequire(join(repo, 'package.json'));
  const matter = require('gray-matter');
  const git = (...args) => execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 }).trim();
  const sha = git('rev-parse', '--verify', `${options.ref}^{commit}`);
  const files = git('ls-tree', '-r', '--name-only', sha, '--', 'data/contributions').split('\n');
  const records = [];
  for (const file of files) {
    if (!file.endsWith('.md') || file.endsWith('/template.md')) continue;
    const data = matter(git('show', `${sha}:${file}`)).data;
    const isoDate = value => value instanceof Date ? value.toISOString().slice(0, 10) : String(value || '');
    const created = isoDate(data.date);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(created) || Number.isNaN(Date.parse(created))) {
      throw new Error(`Invalid archive date: ${file}`);
    }
    if (!created.startsWith(`${options.year}-`)) continue;
    records.push({ id: file.split('/').at(-1).slice(0, -3), date: created,
      status: data.status, author: data.author, title: data.title,
      url: data.contribution_url, repo: data.repo || 'chromium/src',
      projectSource: data.repo ? 'archive' : 'archive-default',
      resolvedDate: data.resolvedDate ? isoDate(data.resolvedDate) : null,
      module: data.module, kind: data.kind, keywords: data.keywords || [], path: file });
  }
  const output = resolve(options.output);
  mkdirSync(output, { recursive: true });
  writeFileSync(join(output, 'site-records.json'), JSON.stringify(records, null, 2) + '\n');
  writeFileSync(join(output, 'snapshot.json'), JSON.stringify({ sha, year: Number(options.year), records: records.length,
    statuses: records.reduce((counts, r) => ({ ...counts, [r.status]: (counts[r.status] || 0) + 1 }), {}),
    checkedAt: new Date().toISOString() }, null, 2) + '\n');
  console.log(JSON.stringify({ sha, year: Number(options.year), records: records.length, output }));
} catch (error) { console.error(error.message); process.exit(2); }
