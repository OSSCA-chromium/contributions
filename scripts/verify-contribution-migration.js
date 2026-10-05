const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { isDeepStrictEqual } = require('util');
const matter = require('gray-matter');
const { extractRawDate } = require('./validate-contributions');

const RECORD_DIR = 'data/contributions';
const PRESERVED_FIELDS = ['title', 'date', 'author', 'contribution_url', 'status'];

function lineEndingStyle(text) {
  const crlf = (text.match(/\r\n/g) || []).length;
  const bareLf = (text.match(/(?<!\r)\n/g) || []).length;
  if (crlf && bareLf) return 'mixed';
  if (crlf) return 'CRLF';
  if (bareLf) return 'LF';
  return 'none';
}

function parseRecord(name, source, errors) {
  try {
    return matter(source);
  } catch (error) {
    errors.push(`${name}: invalid frontmatter: ${error.message}`);
    return null;
  }
}

function verifyMigration(beforeFiles, afterFiles) {
  const errors = [];
  const beforeNames = new Set(beforeFiles.keys());
  const afterNames = new Set(afterFiles.keys());

  for (const name of beforeNames) {
    if (!afterNames.has(name)) errors.push(`${name}: record removed`);
  }
  for (const name of afterNames) {
    if (!beforeNames.has(name)) errors.push(`${name}: record added`);
  }

  for (const name of beforeNames) {
    if (!afterNames.has(name)) continue;
    const original = beforeFiles.get(name);
    const migrated = afterFiles.get(name);
    const before = parseRecord(name, original, errors);
    const after = parseRecord(name, migrated, errors);
    if (!before || !after) continue;

    if (lineEndingStyle(original) !== lineEndingStyle(migrated)) {
      errors.push(`${name}: line endings changed`);
    }
    if (before.content !== after.content) {
      errors.push(`${name}: body changed`);
    }

    for (const field of PRESERVED_FIELDS) {
      const oldValue = field === 'date'
        ? extractRawDate(before.matter)
        : before.data[field];
      const newValue = field === 'date'
        ? extractRawDate(after.matter)
        : after.data[field];
      if (!isDeepStrictEqual(oldValue, newValue)) {
        errors.push(`${name}: ${field} changed`);
      }
    }

    for (const [field, oldValue] of Object.entries(before.data)) {
      if (PRESERVED_FIELDS.includes(field) || field === 'labels') continue;
      if (!isDeepStrictEqual(oldValue, after.data[field])) {
        errors.push(`${name}: existing ${field} changed`);
      }
    }

    if (Array.isArray(before.data.labels) &&
        !isDeepStrictEqual(before.data.labels, after.data.keywords)) {
      errors.push(`${name}: keywords do not preserve labels`);
    }
    if (after.data.labels !== undefined) {
      errors.push(`${name}: labels remain in canonical record`);
    }
    for (const field of ['module', 'kind']) {
      if (typeof after.data[field] !== 'string' || !after.data[field].trim()) {
        errors.push(`${name}: missing canonical ${field}`);
      }
    }
    if (!Array.isArray(after.data.keywords) || after.data.keywords.length === 0 ||
        !after.data.keywords.every((keyword) =>
          typeof keyword === 'string' && keyword.trim())) {
      errors.push(`${name}: missing canonical keywords`);
    }
  }

  return errors;
}

function loadBaseline(ref) {
  const files = new Map();
  const names = execFileSync('git',
    ['ls-tree', '-r', '--name-only', ref, '--', RECORD_DIR],
    { encoding: 'utf8' }).trim().split('\n');
  for (const name of names) {
    if (!name.endsWith('.md') || name.endsWith('/template.md')) continue;
    files.set(path.basename(name), execFileSync('git', ['show', `${ref}:${name}`],
      { encoding: 'utf8' }));
  }
  return files;
}

function loadCurrent() {
  const files = new Map();
  for (const name of fs.readdirSync(RECORD_DIR)) {
    if (!name.endsWith('.md') || name === 'template.md') continue;
    files.set(name, fs.readFileSync(path.join(RECORD_DIR, name), 'utf8'));
  }
  return files;
}

module.exports = { verifyMigration };

if (require.main === module) {
  const ref = process.argv[2];
  if (!ref) {
    console.error('Usage: node scripts/verify-contribution-migration.js <baseline-ref>');
    process.exit(2);
  }
  try {
    const baseline = loadBaseline(ref);
    const violations = verifyMigration(baseline, loadCurrent());
    if (violations.length > 0) {
      for (const violation of violations) console.error(violation);
      process.exit(1);
    }
    console.log(`✓ ${baseline.size} contribution records preserve baseline ${ref}`);
  } catch (error) {
    console.error(`Migration verification failed: ${error.message}`);
    process.exit(2);
  }
}
