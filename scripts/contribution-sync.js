const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const matter = require('gray-matter');
const modules = require('../src/lib/module-taxonomy.json');
const { validateFrontmatter, extractRawDate } = require('./validate-contributions');

const KINDS = ['fix', 'feature', 'refactor', 'test', 'docs', 'cleanup'];

function dateString(value) {
  return value instanceof Date ? value.toISOString().slice(0, 10) : value;
}

function metadataHash(data) {
  return crypto.createHash('sha256').update(JSON.stringify({
    contribution_url: data.contribution_url,
    date: dateString(data.date),
    status: data.status,
    resolvedDate: dateString(data.resolvedDate) ?? null,
  })).digest('hex');
}

function sourceFor(data, slug) {
  const url = new URL(data.contribution_url);
  if (url.protocol !== 'https:') throw new Error('Source must use HTTPS');
  let match;
  if (url.hostname === 'crrev.com') match = /^\/c\/([1-9]\d*)\/?$/.exec(url.pathname);
  if (url.hostname === 'chromium-review.googlesource.com') {
    match = /^\/c\/.+\/\+\/([1-9]\d*)(?:\/\d+)?\/?$/.exec(url.pathname);
  }
  if (match) {
    if (match[1] !== slug) throw new Error('Gerrit review ID must match the record filename');
    return { type: 'gerrit', id: Number(match[1]), url: url.href };
  }
  if (url.hostname === 'github.com') {
    match = /^\/([\w.-]+)\/([\w.-]+)\/pull\/([1-9]\d*)\/?$/.exec(url.pathname);
    if (match) return { type: 'github', repo: `${match[1]}/${match[2]}`, id: Number(match[3]), url: url.href };
  }
  throw new Error('Unsupported contribution source URL');
}

function validationErrors(data, allowLegacyModule = false) {
  return validateFrontmatter(data).filter(error =>
    !allowLegacyModule || !error.startsWith('module must be one of:'));
}

function readRecords(directory, allowLegacyModule = false) {
  return fs.readdirSync(directory).filter(file => file.endsWith('.md') && file !== 'template.md')
    .sort().map(file => {
      const filename = path.join(directory, file);
      const raw = fs.readFileSync(filename, 'utf8');
      const parsed = matter(raw);
      const data = { ...parsed.data };
      for (const field of ['date', 'resolvedDate']) {
        const value = extractRawDate(parsed.matter, field);
        if (value !== undefined) data[field] = value;
      }
      const errors = validationErrors(data, allowLegacyModule);
      if (errors.length) throw new Error(`${file}: ${errors.join('; ')}`);
      const slug = file.slice(0, -3);
      return { slug, filename, raw, data, source: sourceFor(data, slug) };
    });
}

function readState(filename) {
  if (!fs.existsSync(filename)) return { version: 1, records: {} };
  const state = JSON.parse(fs.readFileSync(filename, 'utf8'));
  if (state.version !== 1 || !state.records || typeof state.records !== 'object' || Array.isArray(state.records)) {
    throw new Error('Unsupported contribution sync state');
  }
  return state;
}

function isFinalized(record, state) {
  const entry = state.records[record.slug];
  return record.data.status === 'merged' && entry?.finalized === true &&
    entry.sourceUrl === record.source.url && entry.metadataHash === metadataHash(record.data);
}

function utcTimestamp(value) {
  if (typeof value !== 'string') throw new Error('Missing source timestamp');
  // Gerrit timestamps are UTC with nine fractional digits and no zone suffix.
  const normalized = value.replace(/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2})\.(\d+)$/, (_, day, time, fraction) =>
    `${day}T${time}.${fraction.slice(0, 3).padEnd(3, '0')}Z`);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(normalized)) {
    throw new Error('Source timestamp must be an exact UTC instant');
  }
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value.slice(0, 10)) {
    throw new Error('Invalid source timestamp');
  }
  return parsed.toISOString();
}

function metadataFromSource(source) {
  const date = utcTimestamp(source.createdAt).slice(0, 10);
  if (!['in review', 'merged', 'abandoned'].includes(source.status)) throw new Error('Invalid source status');
  let resolvedDate;
  if (source.status !== 'in review') {
    const resolved = utcTimestamp(source.resolvedAt);
    if (resolved < utcTimestamp(source.createdAt)) throw new Error('Resolution precedes review creation');
    resolvedDate = resolved.slice(0, 10);
  }
  return { date, status: source.status, resolvedDate };
}

function validateClassifications(value, records) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Classifications must be an object keyed by record ID');
  const slugs = new Set(records.map(record => record.slug));
  for (const [slug, classification] of Object.entries(value)) {
    if (!slugs.has(slug)) throw new Error(`Unknown classification record: ${slug}`);
    if (!classification || typeof classification !== 'object' || Array.isArray(classification) ||
        Object.keys(classification).length === 0 || Object.keys(classification).some(key => !['module', 'kind'].includes(key))) {
      throw new Error(`${slug}: classification accepts only module and kind`);
    }
    if (classification.module !== undefined && (typeof classification.module !== 'string' || !Object.prototype.hasOwnProperty.call(modules, classification.module))) {
      throw new Error(`${slug}: module is outside the canonical taxonomy`);
    }
    if (classification.kind !== undefined && !KINDS.includes(classification.kind)) {
      throw new Error(`${slug}: invalid change kind`);
    }
  }
  return value;
}

function patchFrontmatter(raw, fields) {
  const match = /^(\uFEFF?---[^\S\r\n]*\r?\n)([\s\S]*?)(\r?\n---[^\S\r\n]*(?:\r?\n|$))/.exec(raw);
  if (!match) throw new Error('Missing YAML frontmatter');
  let header = match[2];
  const eol = match[1].endsWith('\r\n') ? '\r\n' : '\n';
  for (const [key, value] of Object.entries(fields)) {
    const scalar = Array.isArray(value) ? JSON.stringify(value) : value;
    // Top-level key boundaries also cover indentless and multiline flow arrays.
    const keys = [...header.matchAll(/^([A-Za-z_][\w.-]*|'[^'\r\n]+'|"[^"\r\n]+"):[^\r\n]*/gm)];
    const index = keys.findIndex(token => [key, `'${key}'`, JSON.stringify(key)].includes(token[1]));
    if (index >= 0) {
      const start = keys[index].index;
      const end = keys[index + 1]?.index ?? header.length;
      const current = header.slice(start, end);
      const trailing = /((?:\r?\n[ \t]*(?:#[^\r\n]*)?)*\r?\n?)$/.exec(current)[0];
      header = header.slice(0, start) + (value === undefined ? '' : `${key}: ${scalar}`) + trailing + header.slice(end);
    } else if (value !== undefined) {
      header += `${header ? eol : ''}${key}: ${scalar}`;
    }
  }
  return match[1] + header + match[3] + raw.slice(match[0].length);
}

function planRecord(record, source, classification, verifiedAt, allowLegacyModule = false) {
  const facts = metadataFromSource(source);
  const next = { ...record.data, ...facts, ...classification };
  const fields = {};
  const changes = {};
  for (const key of ['date', 'status', 'resolvedDate', 'module', 'kind']) {
    const before = dateString(record.data[key]);
    const after = dateString(next[key]);
    if (before !== after) {
      fields[key] = after;
      changes[key] = { before: before ?? null, after: after ?? null };
    }
  }
  const keywords = record.data.keywords ?? record.data.labels;
  if (changes.module && record.data.module && !keywords.includes(record.data.module)) {
    next.keywords = [...keywords, record.data.module];
    fields.keywords = next.keywords;
  }
  const raw = patchFrontmatter(record.raw, fields);
  const parsed = matter(raw);
  const errors = validationErrors(parsed.data, allowLegacyModule);
  if (errors.length) throw new Error(errors.join('; '));
  if (matter(record.raw).content !== parsed.content) throw new Error('Contribution body changed during metadata update');
  if (metadataHash(parsed.data) !== metadataHash(next)) throw new Error('Written metadata differs from the verified source');
  const needsClassification = typeof parsed.data.module === 'string' && !Object.prototype.hasOwnProperty.call(modules, parsed.data.module);
  return { record, raw, changes, needsClassification, state: {
    sourceUrl: record.source.url,
    sourceRevision: source.revision,
    verifiedAt,
    metadataHash: metadataHash(next),
    finalized: facts.status === 'merged' && !needsClassification,
  } };
}

function atomicWrite(filename, content) {
  fs.mkdirSync(path.dirname(filename), { recursive: true });
  const temporary = `${filename}.${process.pid}.tmp`;
  const mode = fs.existsSync(filename) ? fs.statSync(filename).mode : 0o644;
  try {
    fs.writeFileSync(temporary, content, { mode });
    fs.renameSync(temporary, filename);
  } finally {
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
  }
}

module.exports = {
  atomicWrite, dateString, isFinalized, metadataHash, planRecord,
  readRecords, readState, utcTimestamp, validateClassifications,
};
