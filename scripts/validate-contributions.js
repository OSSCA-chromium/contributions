const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const REQUIRED = ['title', 'date', 'author', 'contribution_url', 'labels', 'status'];
const STATUSES = ['in review', 'merged', 'draft'];

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
  if (data.contribution_url !== undefined && typeof data.contribution_url !== 'string') {
    errors.push('contribution_url must be a string');
  }

  if (data.date !== undefined && data.date !== '') {
    const d = data.date;
    const ok =
      (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) ||
      (d instanceof Date && !Number.isNaN(d.getTime()));
    if (!ok) errors.push('date must be YYYY-MM-DD');
  }

  if (data.labels !== undefined) {
    if (!Array.isArray(data.labels) || data.labels.length === 0) {
      errors.push('labels must be a non-empty array');
    }
  }

  if (data.status !== undefined && !STATUSES.includes(data.status)) {
    errors.push(`status must be one of: ${STATUSES.join(', ')}`);
  }

  return errors;
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
      const { data } = matter(fs.readFileSync(full, 'utf8'));
      errors = validateFrontmatter(data);
    } catch (e) {
      errors = [`YAML parse error: ${e.message}`];
    }
    if (errors.length > 0) results.push({ file, errors });
  }
  return results;
}

module.exports = { validateFrontmatter, validateAll };

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
