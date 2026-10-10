const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { pathToFileURL } = require('url');

const SLIDES_DIR = path.join(__dirname, '..', 'public', 'slides');
const SITE_URL = 'https://ossca-chromium.github.io/contributions/slides';
const WIDTH = 1280;
const HEIGHT = 720;

const CHROME_CANDIDATES = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
];

// CHROME_PATH가 있으면 그것을, 없으면 알려진 설치 경로에서 Chrome을 찾는다.
function findChrome() {
  const chrome = process.env.CHROME_PATH || CHROME_CANDIDATES.find((p) => fs.existsSync(p));
  if (!chrome) {
    throw new Error('Chrome을 찾지 못했습니다. CHROME_PATH로 실행 파일 경로를 지정하세요.');
  }
  return chrome;
}

// 덱 HTML에서 슬라이드 수, 제목, 한 줄 소개(<meta name="description">)를 읽는다.
function readDeck(html) {
  const count = (html.match(/<section\b[^>]*\bclass="slide\b/g) || []).length;
  const title = (/<title>([^<]*)<\/title>/.exec(html) || [])[1] || '발표 자료';
  const description = (/<meta\s+name="description"\s+content="([^"]*)"/.exec(html) || [])[1] || '';
  return { count, title: title.trim(), description: description.trim() };
}

function previewName(n) {
  return `slide-${String(n).padStart(2, '0')}.png`;
}

// GitHub에서 덱 디렉터리를 열었을 때 보이는 안내문을 만든다.
function buildReadme(slug, { count, title, description }) {
  const lines = [
    `# ${title}`,
    '',
    '<!-- npm run slides:render 가 생성한 파일입니다. 직접 수정하지 마세요. -->',
    '',
    ...(description ? [description, ''] : []),
    '- 원본: [`index.html`](index.html) — 수정한 뒤 `npm run slides:render`로 미리보기를 다시 만듭니다.',
    `- 미리보기: [\`preview/\`](preview) — 슬라이드별 PNG (\`${previewName(1)}\` ~ \`${previewName(count)}\`)`,
    `- 웹에서 보기: ${SITE_URL}/${slug}/`,
  ];
  return `${lines.join('\n')}\n`;
}

function renderDeck(chrome, slug) {
  const deckDir = path.join(SLIDES_DIR, slug);
  const htmlPath = path.join(deckDir, 'index.html');
  const deck = readDeck(fs.readFileSync(htmlPath, 'utf8'));
  const { count } = deck;
  if (count === 0) throw new Error(`${slug}: <section class="slide">가 없습니다.`);

  // 슬라이드 수가 줄었을 때 예전 PNG가 남지 않도록 비우고 다시 만든다.
  const previewDir = path.join(deckDir, 'preview');
  fs.rmSync(previewDir, { recursive: true, force: true });
  fs.mkdirSync(previewDir, { recursive: true });

  // 실행 중인 Chrome 프로필과 충돌하지 않도록 임시 프로필을 쓴다.
  const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), 'render-slides-'));
  try {
    const deckUrl = pathToFileURL(htmlPath).href;
    for (let n = 1; n <= count; n++) {
      const out = path.join(previewDir, previewName(n));
      execFileSync(
        chrome,
        [
          '--headless=new',
          '--hide-scrollbars',
          '--force-device-scale-factor=1',
          `--user-data-dir=${profileDir}`,
          `--window-size=${WIDTH},${HEIGHT}`,
          `--screenshot=${out}`,
          `${deckUrl}?theme=light#${n}`,
        ],
        { stdio: 'ignore' }
      );
      if (!fs.existsSync(out)) throw new Error(`${slug}: ${n}번 슬라이드를 렌더하지 못했습니다.`);
    }
  } finally {
    fs.rmSync(profileDir, { recursive: true, force: true });
  }

  fs.writeFileSync(path.join(deckDir, 'README.md'), buildReadme(slug, deck));
  console.log(`${slug}: ${count} slides → ${path.relative(process.cwd(), previewDir)}`);
}

function main() {
  const requested = process.argv.slice(2);
  const slugs = requested.length
    ? requested
    : fs
        .readdirSync(SLIDES_DIR)
        .filter((name) => fs.existsSync(path.join(SLIDES_DIR, name, 'index.html')));
  if (slugs.length === 0) {
    console.log('public/slides 아래에 덱이 없습니다.');
    return;
  }
  const chrome = findChrome();
  for (const slug of slugs) renderDeck(chrome, slug);
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

module.exports = { readDeck, buildReadme, previewName };
