const { verifyMigration } = require('../../scripts/verify-contribution-migration');

const before = [
  '---',
  'title: Fix a link',
  'date: 2025-05-15',
  'author: contributor',
  'contribution_url: https://crrev.com/c/1',
  'labels: ["docs", "fix", "uncertain-tag"]',
  'status: in review',
  '---',
  '',
  'Original body.',
  '',
].join('\r\n');

const after = [
  '---',
  'title: Fix a link',
  'date: 2025-05-15',
  'author: contributor',
  'contribution_url: https://crrev.com/c/1',
  'module: docs',
  'kind: fix',
  'keywords: ["docs", "fix", "uncertain-tag"]',
  'status: in review',
  '---',
  '',
  'Original body.',
  '',
].join('\r\n');

function violations(original, migrated) {
  return verifyMigration(new Map([['1.md', original]]), new Map([['1.md', migrated]]));
}

describe('verifyMigration', () => {
  test('accepts canonical fields while preserving a CRLF record', () => {
    expect(violations(before, after)).toEqual([]);
  });

  test.each([
    ['title', 'Fix a link', 'Fix another link'],
    ['date', '2025-05-15', '2025-05-16'],
    ['author', 'contributor', 'someone-else'],
    ['contribution_url', 'https://crrev.com/c/1', 'https://crrev.com/c/2'],
    ['status', 'in review', 'merged'],
  ])('rejects a changed %s', (field, original, changed) => {
    expect(violations(before, after.replace(`${field}: ${original}`, `${field}: ${changed}`)))
      .toEqual(expect.arrayContaining([expect.stringContaining(field)]));
  });

  test('rejects a changed body', () => {
    expect(violations(before, after.replace('Original body.', 'Rewritten body.')))
      .toEqual(expect.arrayContaining([expect.stringContaining('body')]));
  });

  test('rejects CRLF normalization even if the body is textually unchanged', () => {
    expect(violations(before, after.replace(/\r\n/g, '\n')))
      .toEqual(expect.arrayContaining([expect.stringContaining('line endings')]));
  });

  test('rejects reordered or dropped labels in keywords', () => {
    expect(violations(before, after.replace('"docs", "fix", "uncertain-tag"', '"fix", "docs"')))
      .toEqual(expect.arrayContaining([expect.stringContaining('keywords')]));
  });

  test('rejects changed existing optional metadata', () => {
    const original = before.replace('status: in review', 'issue: 31\r\nstatus: in review');
    const migrated = after.replace('status: in review', 'issue: 32\r\nstatus: in review');
    expect(violations(original, migrated))
      .toEqual(expect.arrayContaining([expect.stringContaining('issue')]));
  });

  test('rejects missing canonical fields and remaining labels', () => {
    const migrated = after.replace('module: docs\r\n', '').replace('kind: fix\r\n', '')
      .replace('keywords:', 'labels:');
    const result = violations(before, migrated);
    for (const field of ['module', 'kind', 'keywords', 'labels']) {
      expect(result).toEqual(expect.arrayContaining([expect.stringContaining(field)]));
    }
  });

  test('rejects added or removed review IDs', () => {
    expect(verifyMigration(new Map([['1.md', before]]), new Map()))
      .toEqual(expect.arrayContaining([expect.stringContaining('1.md')]));
    expect(verifyMigration(new Map(), new Map([['1.md', after]])))
      .toEqual(expect.arrayContaining([expect.stringContaining('1.md')]));
  });
});
