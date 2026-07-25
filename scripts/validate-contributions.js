const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const REQUIRED = ['title', 'date', 'author', 'contribution_url', 'labels', 'status'];
const STATUSES = ['in review', 'merged', 'draft'];

// YYYY-MM-DD 문자열이 실제로 존재하는 날짜인지 확인(2025-13-40, 2025-02-30 등 배제)
function isRealDate(str) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const dt = new Date(Date.UTC(y, mo - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === mo - 1 &&
    dt.getUTCDate() === d
  );
}

// frontmatter 객체를 검증해 위반 사유 문자열 배열을 반환(빈 배열이면 통과)
function validateFrontmatter(data) {
  const errors = [];

  for (const key of REQUIRED) {
    if (data[key] === undefined || data[key] === null || data[key] === '') {
      errors.push(`missing required field: ${key}`);
    }
  }

  if (data.title !== undefined && typeof data.title !== 'string') {
    errors.push('title must be a string');
  }
  if (data.author !== undefined && typeof data.author !== 'string') {
    errors.push('author must be a string');
  }
  if (data.contribution_url !== undefined) {
    if (typeof data.contribution_url !== 'string') {
      errors.push('contribution_url must be a string');
    } else {
      let url;
      try {
        url = new URL(data.contribution_url);
      } catch {
        url = null;
      }
      if (!url) {
        errors.push('contribution_url must be a valid URL');
      } else if (url.protocol !== 'https:') {
        errors.push('contribution_url must use https');
      }
    }
  }

  if (data.date !== undefined && data.date !== '') {
    const d = data.date;
    const ok =
      (typeof d === 'string' && isRealDate(d)) ||
      (d instanceof Date && !Number.isNaN(d.getTime()));
    if (!ok) errors.push('date must be a valid YYYY-MM-DD');
  }

  if (data.labels !== undefined) {
    if (!Array.isArray(data.labels) || data.labels.length === 0) {
      errors.push('labels must be a non-empty array');
    } else if (
      !data.labels.every((l) => typeof l === 'string' && l.trim() !== '')
    ) {
      errors.push('labels must contain only non-empty strings');
    }
  }

  if (data.status !== undefined && !STATUSES.includes(data.status)) {
    errors.push(`status must be one of: ${STATUSES.join(', ')}`);
  }

  return errors;
}

// raw frontmatter 텍스트에서 date 스칼라를 원본 그대로 추출한다.
// - 따옴표로 감싼 값: 따옴표 안 내용을 그대로 반환(내부 #를 주석으로 보지 않음)
// - 따옴표 없는 값: 인라인 YAML 주석(# ...)만 제거
// date 줄이 없으면 undefined.
function extractRawDate(matterText) {
  const m = /^date:\s*(.+?)\s*$/m.exec(matterText || '');
  if (!m) return undefined;
  const raw = m[1].trim();
  const quoted = /^(['"])([\s\S]*?)\1/.exec(raw);
  if (quoted) return quoted[2];
  return raw.replace(/\s*#.*$/, '');
}

// 디렉터리의 컨트리뷰션 .md(template.md 제외)를 모두 검사
function validateAll(dir) {
  const results = [];
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md') && f !== 'template.md');
  for (const file of files) {
    const full = path.join(dir, file);
    let errors = [];
    try {
      const parsed = matter(fs.readFileSync(full, 'utf8'));
      const data = { ...parsed.data };
      // gray-matter는 따옴표 없는 date를 Date 객체로 파싱하면서 2025-02-30 같은
      // 잘못된 날짜를 롤오버해 버린다. raw frontmatter에서 원본 문자열을 그대로
      // 뽑아 검증해야 형식·실존 여부를 정확히 잡는다.
      const rawDate = extractRawDate(parsed.matter);
      if (rawDate !== undefined) data.date = rawDate;
      errors = validateFrontmatter(data);
    } catch (e) {
      errors = [`YAML parse error: ${e.message}`];
    }
    if (errors.length > 0) results.push({ file, errors });
  }
  return results;
}

module.exports = { validateFrontmatter, validateAll, extractRawDate };

// 직접 실행 시 검사 + 결과 출력 + exit
if (require.main === module) {
  const dir = path.join(process.cwd(), 'data/contributions');
  const results = validateAll(dir);
  if (results.length > 0) {
    for (const { file, errors } of results) {
      for (const err of errors) console.error(`${file}: ${err}`);
    }
    console.error(`\n✖ ${results.length} file(s) with errors`);
    process.exit(1);
  }
  console.log('✓ All contribution frontmatter valid');
}
