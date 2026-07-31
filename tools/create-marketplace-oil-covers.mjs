import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

const root = typeof process === 'undefined' ? nodeRepl.cwd : process.cwd();
const screenshotDir = path.join(root, 'output', 'marketplace');
const outputDir = path.join(root, 'output', 'marketplace-oil-covers');
const viewport = { width: 1280, height: 800 };
const chromeExecutablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const playwrightCliPackagePath = '/Users/franco/.deskclaw/node/lib/node_modules/@playwright/cli/package.json';

async function loadChromium() {
  try {
    const playwright = await import('playwright');
    return playwright.chromium;
  } catch {
    const require = createRequire(playwrightCliPackagePath);
    return require('playwright').chromium;
  }
}

const covers = [
  {
    id: '01',
    output: '01-tabs-under-control.png',
    screenshot: '01-all-tabs-overview-50-tabs.png',
    title: '50 个标签\n一眼看清',
    subtitle: '把失控的页面收回一张安静工作台。',
    oneGlance: '50 个标签被集中整理成可搜索、可切换的总览。',
    primaryEvidence: '总览列表、搜索框、全部/域名/窗口/重复视图计数。',
    sacrifice: '完整诗文背景、长列表底部和边缘小字。',
    accent: '#8e804b',
    accent2: '#229453',
    base: '#f5faf7',
    ink: '#172b27',
    muted: '#60706b',
    chip: '总览 / 搜索 / 50 tabs',
    serifWord: '50',
    highlight: '标签',
    mark: 'Tabs indexed',
    layout: 'left',
  },
  {
    id: '02',
    output: '02-sites-auto-grouped.png',
    screenshot: '03-domain-groups.png',
    title: '网页自动\n归队',
    subtitle: '按域名和窗口切开研究、开发、写作上下文。',
    oneGlance: '打开的网页自动变成一组组可扫描的域名卡片。',
    primaryEvidence: '域名分组卡片、分组数量、每组内的关键标签。',
    sacrifice: '完整窗口边框、底部诗句和不必要的列表细节。',
    accent: '#229453',
    accent2: '#158bb8',
    base: '#f4fbf7',
    ink: '#142b24',
    muted: '#5c7068',
    chip: '域名分组 / 窗口整理',
    serifWord: '自动',
    highlight: '归队',
    mark: 'Grouped by site',
    layout: 'left',
  },
  {
    id: '03',
    output: '03-theme-language-controls.png',
    screenshot: '06-settings-protection-theme.png',
    title: '主题语言\n随手切换',
    subtitle: '深色、中文、保护规则，都留在本地设置里。',
    oneGlance: '设置面板展示主题、语言和保护开关。',
    primaryEvidence: '右侧设置面板里的主题、语言、保护固定标签和音频标签开关。',
    sacrifice: '背后的完整标签列表和无关窗口内容。',
    accent: '#158bb8',
    accent2: '#ffc90c',
    base: '#111e1d',
    ink: '#edf6f4',
    muted: '#a9bbb6',
    chip: '深色 / 中文 / 保护',
    serifWord: '随手',
    highlight: '切换',
    mark: 'Local settings',
    layout: 'dark',
  },
  {
    id: '04',
    output: '04-duplicates-cleanup.png',
    screenshot: '05-duplicate-cleanup.png',
    title: '重复页\n不用再找',
    subtitle: '识别重复标签，留下重要页面，清掉可关闭的那部分。',
    oneGlance: '重复标签被标记出来，并提供清理重复的动作。',
    primaryEvidence: '重复视图计数、红色重复标签和清理重复按钮。',
    sacrifice: '完整页面背景、底部诗句和与重复无关的标签行。',
    accent: '#f03f24',
    accent2: '#c98aa1',
    base: '#fff8f5',
    ink: '#2f211d',
    muted: '#7b6560',
    chip: '重复识别 / 安全清理',
    serifWord: '重复',
    highlight: '不用',
    mark: '3 duplicates found',
    layout: 'left',
  },
  {
    id: '05',
    output: '05-eastern-palette-breathing.png',
    screenshot: '07-accent-palette.png',
    title: '效率之外\n也要呼吸',
    subtitle: '东方色盘、诗文角落和轻背景，让新标签页不冷冰冰。',
    oneGlance: '强调色面板和诗文背景说明它不是冷冰冰的工具。',
    primaryEvidence: '强调色列表、当前色名、主界面里的诗文背景。',
    sacrifice: '完整标签列表细节和窗口边缘小字。',
    accent: '#ad6598',
    accent2: '#ffc90c',
    base: '#fbf8ef',
    ink: '#2d252b',
    muted: '#756a70',
    chip: '东方色盘 / 诗文展示',
    serifWord: '呼吸',
    highlight: '效率',
    mark: 'Accent palette',
    layout: 'warm',
  },
];

async function dataUrl(filePath) {
  const buffer = await fs.readFile(filePath);
  return `data:image/png;base64,${buffer.toString('base64')}`;
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function titleHtml(cover) {
  return cover.title
    .split('\n')
    .map((line) => {
      const escapedLine = escapeHtml(line);
      if (!cover.highlight || !line.includes(cover.highlight)) {
        return `<span>${escapedLine}</span>`;
      }
      const start = line.indexOf(cover.highlight);
      const before = line.slice(0, start);
      const after = line.slice(start + cover.highlight.length);
      return `<span>${escapeHtml(before)}<em>${escapeHtml(cover.highlight)}</em>${escapeHtml(after)}</span>`;
    })
    .join('');
}

function css() {
  return `
    * { box-sizing: border-box; }
    html,
    body {
      margin: 0;
      width: 1280px;
      height: 800px;
      overflow: hidden;
      background: transparent;
      font-family: "SF Pro Display", "SF Pro Text", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", system-ui, sans-serif;
    }
    .cover {
      --base: #f5faf7;
      --ink: #172b27;
      --muted: #60706b;
      --accent: #8e804b;
      --accent-2: #229453;
      position: relative;
      width: 1280px;
      height: 800px;
      overflow: hidden;
      color: var(--ink);
      background:
        linear-gradient(90deg, rgba(255,255,255,.84), rgba(255,255,255,.44) 36%, rgba(255,255,255,.08) 74%),
        radial-gradient(680px 420px at 84% 16%, color-mix(in srgb, var(--accent-2) 16%, transparent), transparent 74%),
        radial-gradient(520px 320px at 28% 86%, color-mix(in srgb, var(--accent) 15%, transparent), transparent 78%),
        var(--base);
    }
    .cover.dark {
      background:
        linear-gradient(90deg, rgba(9,18,17,.96), rgba(9,18,17,.68) 38%, rgba(9,18,17,.10) 82%),
        radial-gradient(660px 420px at 78% 24%, color-mix(in srgb, var(--accent) 23%, transparent), transparent 72%),
        radial-gradient(560px 360px at 28% 96%, rgba(255,201,12,.12), transparent 76%),
        var(--base);
    }
    .grid {
      position: absolute;
      inset: 0;
      opacity: .24;
      background-image:
        linear-gradient(rgba(25,45,40,.07) 1px, transparent 1px),
        linear-gradient(90deg, rgba(25,45,40,.06) 1px, transparent 1px);
      background-size: 32px 32px;
      mask-image: linear-gradient(90deg, #000 0 62%, rgba(0,0,0,.50));
    }
    .dark .grid {
      opacity: .22;
      background-image:
        linear-gradient(rgba(238,246,241,.12) 1px, transparent 1px),
        linear-gradient(90deg, rgba(238,246,241,.10) 1px, transparent 1px);
    }
    .grain {
      position: absolute;
      inset: 0;
      pointer-events: none;
      opacity: .11;
      background-image:
        repeating-radial-gradient(circle at 20% 30%, rgba(21,31,28,.16) 0 1px, transparent 1px 5px);
      mix-blend-mode: multiply;
    }
    .dark .grain {
      opacity: .12;
      mix-blend-mode: screen;
    }
    .copy {
      position: absolute;
      z-index: 5;
      left: 72px;
      top: 72px;
      width: 390px;
    }
    .kicker {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      height: 34px;
      padding: 0 13px;
      border-radius: 999px;
      color: var(--accent);
      background: rgba(255,255,255,.72);
      border: 1px solid color-mix(in srgb, var(--accent) 22%, rgba(255,255,255,.7));
      font-size: 13px;
      font-weight: 800;
      letter-spacing: .08em;
      text-transform: uppercase;
      box-shadow: 0 12px 32px rgba(23,43,39,.08);
    }
    .dark .kicker {
      color: #e8dfbd;
      background: rgba(255,255,255,.10);
      border-color: rgba(255,255,255,.15);
      box-shadow: none;
    }
    h1 {
      display: flex;
      flex-direction: column;
      gap: 2px;
      margin: 28px 0 18px;
      font-size: 60px;
      line-height: 1.02;
      font-weight: 850;
      letter-spacing: 0;
    }
    h1 span {
      display: block;
      white-space: nowrap;
    }
    h1 em {
      position: relative;
      display: inline-block;
      padding: 0 .08em;
      color: var(--ink);
      font-style: normal;
    }
    h1 em::before {
      content: "";
      position: absolute;
      z-index: -1;
      left: -.04em;
      right: -.04em;
      bottom: .05em;
      height: .30em;
      border-radius: 8px;
      background: color-mix(in srgb, var(--accent) 18%, white);
      box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--accent) 20%, transparent);
    }
    .dark h1 em {
      color: #fffaf0;
    }
    .dark h1 em::before {
      background: color-mix(in srgb, var(--accent) 34%, transparent);
      box-shadow: inset 0 0 0 1px rgba(255,255,255,.12);
    }
    .subtitle {
      width: 350px;
      margin: 0;
      color: var(--muted);
      font-size: 19px;
      line-height: 1.58;
      font-weight: 620;
      letter-spacing: 0;
    }
    .ornament {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 26px;
      color: color-mix(in srgb, var(--accent) 82%, var(--ink));
      font-size: 14px;
      font-weight: 800;
      letter-spacing: .02em;
    }
    .ornament::before {
      content: "";
      width: 48px;
      height: 2px;
      border-radius: 999px;
      background: var(--accent);
    }
    .serif {
      display: none;
    }
    .screen-wrap {
      position: absolute;
      z-index: 3;
      right: 46px;
      top: 116px;
      width: 760px;
      height: 475px;
      border-radius: 24px;
      overflow: hidden;
      transform: perspective(1800px) rotateY(-3.5deg) rotateZ(.18deg);
      transform-origin: 60% 50%;
      border: 1px solid rgba(255,255,255,.78);
      background: rgba(255,255,255,.42);
      box-shadow:
        0 24px 58px rgba(30,35,40,.11),
        0 6px 16px rgba(30,35,40,.06),
        0 0 0 1px color-mix(in srgb, var(--accent) 16%, transparent);
    }
    .dark .screen-wrap {
      border-color: rgba(255,255,255,.16);
      background: rgba(255,255,255,.08);
      box-shadow:
        0 28px 70px rgba(0,0,0,.34),
        0 5px 18px rgba(0,0,0,.24),
        0 0 0 1px rgba(255,255,255,.08);
    }
    .screen {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: saturate(1.03) contrast(1.02);
    }
    .screen-shine {
      position: absolute;
      inset: 0;
      pointer-events: none;
      background:
        linear-gradient(100deg, rgba(255,255,255,.20), transparent 34%),
        linear-gradient(180deg, transparent 72%, color-mix(in srgb, var(--accent) 12%, transparent));
      mix-blend-mode: screen;
    }
    .screen-label {
      position: absolute;
      z-index: 5;
      right: 74px;
      top: 82px;
      display: inline-flex;
      align-items: center;
      gap: 9px;
      padding: 10px 14px;
      border-radius: 999px;
      color: color-mix(in srgb, var(--accent) 78%, var(--ink));
      background: rgba(255,255,255,.74);
      border: 1px solid color-mix(in srgb, var(--accent) 24%, rgba(255,255,255,.72));
      font-size: 14px;
      font-weight: 850;
      box-shadow: 0 14px 34px rgba(23,43,39,.08);
    }
    .screen-label::before {
      content: "";
      width: 8px;
      height: 8px;
      border-radius: 999px;
      background: var(--accent);
      box-shadow: 0 0 0 5px color-mix(in srgb, var(--accent) 18%, transparent);
    }
    .dark .screen-label {
      color: #eaf7f4;
      background: rgba(255,255,255,.12);
      border-color: rgba(255,255,255,.16);
      box-shadow: none;
    }
    .brand {
      position: absolute;
      z-index: 6;
      left: 72px;
      bottom: 56px;
      display: inline-flex;
      align-items: center;
      gap: 12px;
      height: 46px;
      padding: 0 13px 0 8px;
      border-radius: 999px;
      color: color-mix(in srgb, var(--ink) 62%, transparent);
      background: rgba(255,255,255,.58);
      border: 1px solid rgba(255,255,255,.66);
      font-size: 16px;
      font-weight: 800;
      letter-spacing: .04em;
      box-shadow: 0 14px 36px rgba(23,43,39,.08);
    }
    .logo {
      width: 35px;
      height: 35px;
      border-radius: 10px;
      box-shadow: 0 10px 24px rgba(23,43,39,.12);
    }
    .dark .brand {
      color: rgba(238,246,244,.68);
      background: rgba(255,255,255,.10);
      border-color: rgba(255,255,255,.14);
      box-shadow: none;
    }
    .cover.warm .screen-wrap {
      top: 116px;
    }
    .feature-strip {
      position: absolute;
      z-index: 6;
      right: 72px;
      bottom: 72px;
      display: grid;
      grid-template-columns: repeat(3, auto);
      gap: 8px;
      align-items: center;
      max-width: 780px;
    }
    .feature-pill {
      height: 34px;
      display: inline-flex;
      align-items: center;
      padding: 0 13px;
      border-radius: 999px;
      color: color-mix(in srgb, var(--ink) 70%, var(--accent));
      background: rgba(255,255,255,.62);
      border: 1px solid color-mix(in srgb, var(--accent) 18%, rgba(255,255,255,.7));
      font-size: 13px;
      font-weight: 760;
      box-shadow: 0 12px 30px rgba(23,43,39,.07);
    }
    .dark .feature-pill {
      color: rgba(238,246,244,.78);
      background: rgba(255,255,255,.10);
      border-color: rgba(255,255,255,.14);
      box-shadow: none;
    }
  `;
}

async function htmlFor(cover) {
  const screenshot = await dataUrl(path.join(screenshotDir, cover.screenshot));
  const logo = await dataUrl(path.join(root, 'public', 'icons', 'icon-128.png'));
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>${css()}</style>
  </head>
  <body>
    <main class="cover ${cover.layout}" style="--base:${cover.base};--ink:${cover.ink};--muted:${cover.muted};--accent:${cover.accent};--accent-2:${cover.accent2}">
      <div class="grid"></div>
      <div class="grain"></div>
      <div class="serif">${escapeHtml(cover.serifWord)}</div>
      <section class="copy">
        <div class="kicker">Tab Garden</div>
        <h1>${titleHtml(cover)}</h1>
        <p class="subtitle">${escapeHtml(cover.subtitle)}</p>
        <div class="ornament">${escapeHtml(cover.mark)}</div>
      </section>
      <div class="screen-label">${escapeHtml(cover.chip)}</div>
      <div class="screen-wrap">
        <img class="screen" src="${screenshot}" alt="" />
        <div class="screen-shine"></div>
      </div>
      <div class="feature-strip">
        ${cover.chip.split('/').map((item) => `<div class="feature-pill">${escapeHtml(item.trim())}</div>`).join('')}
      </div>
      <div class="brand">
        <img class="logo" src="${logo}" alt="" />
        <span>枝理 TAB</span>
      </div>
    </main>
  </body>
</html>`;
}

function promptFor(cover) {
  return `Use case: ads-marketing.
Asset type: Chrome Web Store screenshot/cover, exact 1280x800 horizontal 16:10 PNG, no alpha.
Input images: Image 1 is the real Tab Garden screen evidence screenshot "${cover.screenshot}". Image 2 is the Tab Garden app icon.
Primary request: Create one complete Apple-like browser extension store cover for Tab Garden / 枝理 Tab. Preserve real product identity and real screen evidence. No person, avatar, webcam bubble, watermark, hashtag, or fake unrelated UI.
Content attribution: main topic is "${cover.title.replace('\n', '')}"; main product is "Tab Garden / 枝理 Tab"; host interface is "Chrome new tab extension"; supporting brands are none.
Title text: "${cover.title.replace('\n', ' / ')}"; subtitle "${cover.subtitle}"; small product mark "枝理 TAB".
Composition: large title on the left, one screen/browser object on the right, screen enlarged and clipped by the canvas edge with subtle perspective tilt. Keep strict editorial alignment and readable store-carousel hierarchy.
Mandatory visible background: full-canvas clean base, visible fine grid, restrained low-opacity local gradient glow sampled from the selected image, very light grain.
Screen crop plan: show about 86-92% of one screen object; offset it to the right; clip the right edge by the canvas; keep only the screen object's own soft edge and browser/app content.
Screenshot distillation plan: treat the selected screenshot as evidence source, not a full screenshot to copy; extract only ${cover.primaryEvidence}; remove ${cover.sacrifice}; rebuild the screen area as a simplified real-feeling UI with generous whitespace and clear focal hierarchy.
Visual communication plan: one-glance subject is ${cover.oneGlance}; primary evidence is ${cover.primaryEvidence}; make it occupy 60-72% of the screen content area; supporting evidence must stay below 25%; sacrifice ${cover.sacrifice} if it makes the primary evidence smaller.
Text style: Chinese main title uses fixed Apple-like PingFang SC / SF Pro CJK; visible restrained serif accent on "${cover.serifWord}"; colors are deep ink with a soft highlight behind "${cover.highlight}" sampled from ${cover.accent}.
Title decoration: add a short workflow mark "${cover.mark}" aligned under the title and a soft highlight behind "${cover.highlight}".
Decoration: one small product chip "${cover.chip}" and app icon mark only; do not add callout boxes, focus rectangles, annotation frames, or highlight outlines over the product screenshot.
Avoid: full screenshot copy, unfiltered raw screenshot, dense tiny text, extra showcase frame, white backing card, phone frame, device shell, second container, fake UI, person/avatar/face, watermark, hashtags, unrelated logo, low-resolution artifacts, large misty gradient, neon cyberpunk, heavy black shadow.
`;
}

async function writeSidecars() {
  const analysis = `# Marketplace Oil-Cover Analysis

Target format: Chrome Web Store screenshots, 1280x800 PNG, no alpha.

Mode note: this run follows oil-cover's visual analysis and prompt sidecar workflow, but uses deterministic browser rendering because the current session does not expose the required image_gen reference-image tool.

## Shared attribution

- Main product: Tab Garden / 枝理 Tab.
- Host interface: Chrome new tab extension.
- Supporting brands: none.
- Logo/source asset: public/icons/icon-128.png.
- Screen evidence source directory: output/marketplace.

## Covers

${covers.map((cover) => `### ${cover.id} ${cover.output}

- One-glance subject: ${cover.oneGlance}
- Primary evidence: ${cover.primaryEvidence}
- Sacrifice / de-noise: ${cover.sacrifice}
- Title: ${cover.title.replace('\n', ' / ')}
- Subtitle: ${cover.subtitle}
- Reference screenshot: ${cover.screenshot}
`).join('\n')}
`;

  const plan = `# Marketplace Oil-Cover Plan

Canvas: 1280x800, opaque PNG.

Visual system:

- Full-canvas clean base, fine visible grid, restrained local gradient glow sampled from each screenshot/accent, and very light grain.
- Large left title as first visual anchor.
- One enlarged screen evidence object on the right, subtly tilted, clipped by the canvas edge.
- One small product chip and one workflow mark. No focus ring or callout rectangle.
- No people, avatars, hashtags, device shells, fake UI, or heavy shadows.

Output list:

${covers.map((cover) => `- ${cover.output}: ${cover.title.replace('\n', ' / ')}; evidence ${cover.screenshot}`).join('\n')}
`;

  await fs.writeFile(path.join(outputDir, 'analysis.md'), analysis, 'utf8');
  await fs.writeFile(path.join(outputDir, 'cover_plan.md'), plan, 'utf8');

  for (const cover of covers) {
    await fs.writeFile(path.join(outputDir, `${cover.output.replace(/\.png$/, '')}.prompt.md`), promptFor(cover), 'utf8');
  }
}

async function main() {
  await fs.mkdir(outputDir, { recursive: true });
  await writeSidecars();

  const chromium = await loadChromium();
  const browser = await chromium.launch({
    headless: true,
    executablePath: chromeExecutablePath,
  });
  const manifest = {
    generatedAt: new Date().toISOString(),
    format: '1280x800 PNG, opaque browser screenshot',
    mode: 'oil-cover-inspired deterministic browser render',
    note: 'The image_gen reference-image tool was unavailable in this session.',
    covers: [],
  };

  try {
    for (const cover of covers) {
      const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
      await page.setContent(await htmlFor(cover), { waitUntil: 'load' });
      await page.screenshot({
        path: path.join(outputDir, cover.output),
        fullPage: false,
        omitBackground: false,
      });
      await page.close();
      manifest.covers.push({
        output: cover.output,
        prompt: `${cover.output.replace(/\.png$/, '')}.prompt.md`,
        screenshot: cover.screenshot,
        title: cover.title,
        subtitle: cover.subtitle,
      });
    }
  } finally {
    await browser.close();
  }

  await fs.writeFile(path.join(outputDir, 'manifest.final.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
}

try {
  await main();
} catch (error) {
  console.error(error);
  if (typeof process !== 'undefined') {
    process.exitCode = 1;
  } else {
    throw error;
  }
}
