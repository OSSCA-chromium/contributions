const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const {
  SLIDES_DIR,
  WIDTH,
  HEIGHT,
  findChrome,
  runChrome,
  withProfile,
  deckHtmlPath,
  deckSlugs,
  readDeck,
} = require('./render-slides');

// PNG를 한 쪽에 한 장씩 깔아 놓은 인쇄용 HTML.
function buildSheet(pngPaths) {
  const pages = pngPaths.map((png) => `<img src="${pathToFileURL(png).href}" />`).join('');
  return (
    '<!doctype html><style>' +
    `@page { size: ${WIDTH}px ${HEIGHT}px; margin: 0; } body { margin: 0; } ` +
    `img { display: block; width: ${WIDTH}px; height: ${HEIGHT}px; } img + img { break-before: page; }` +
    `</style>${pages}`
  );
}

// 덱의 preview/*.png를 묶어 현재 디렉터리에 <slug>.pdf를 만든다(커밋하지 않는 공유용).
// 덱을 다시 렌더하지 않으므로 PDF는 리뷰한 미리보기와 똑같다.
function exportPdf(chrome, slug) {
  const previewDir = path.join(SLIDES_DIR, slug, 'preview');
  const pngs = fs.existsSync(previewDir)
    ? fs.readdirSync(previewDir).filter((name) => name.endsWith('.png')).sort()
    : [];
  const { count } = readDeck(fs.readFileSync(deckHtmlPath(slug), 'utf8'));
  if (pngs.length === 0 || pngs.length !== count) {
    throw new Error(
      `${slug}: 미리보기 ${pngs.length}장, 슬라이드 ${count}장입니다. 먼저 npm run slides:render 를 실행하세요.`
    );
  }

  const out = path.resolve(`${slug}.pdf`);
  withProfile((profileDir) => {
    const sheet = path.join(profileDir, 'sheet.html');
    fs.writeFileSync(sheet, buildSheet(pngs.map((name) => path.join(previewDir, name))));
    runChrome(chrome, profileDir, ['--no-pdf-header-footer', `--print-to-pdf=${out}`, pathToFileURL(sheet).href]);
  });
  if (!fs.existsSync(out)) throw new Error(`${slug}: PDF를 만들지 못했습니다.`);
  console.log(`${slug}: ${pngs.length} pages → ${path.relative(process.cwd(), out)}`);
}

// 사용법: export-slides-pdf.js [slug...] — slug가 없으면 모든 덱을 내보낸다.
function main() {
  const slugs = deckSlugs(process.argv.slice(2));
  if (slugs.length === 0) {
    console.log('public/slides 아래에 덱이 없습니다.');
    return;
  }
  const chrome = findChrome();
  for (const slug of slugs) exportPdf(chrome, slug);
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

module.exports = { buildSheet };
