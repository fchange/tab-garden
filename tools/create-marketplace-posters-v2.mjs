import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const screenshotDir = path.join(root, 'output', 'marketplace');
const outputDir = path.join(root, 'output', 'marketplace-posters-v2');
const backgroundDir = path.join(outputDir, 'backgrounds');
const viewport = { width: 1280, height: 800 };

const posters = [
  {
    id: '01',
    output: '01-calm-workbench.png',
    screenshot: '01-all-tabs-overview-50-tabs.png',
    background: '01-calm-paper.png',
    title: '50 个标签，<br/>回到一张工作台',
    subtitle: '当窗口和页面开始失控，枝理 Tab 先帮你看清全局。',
    meta: '总览 / 搜索 / 视图切换',
    layout: 'wide',
    tone: 'light',
    accent: '#8E804B',
    accentSoft: '#E8E1B5'
  },
  {
    id: '02',
    output: '02-auto-grouping.png',
    screenshot: '03-domain-groups.png',
    background: '01-calm-paper.png',
    title: '网页会自己<br/>归队',
    subtitle: '按域名和窗口自动汇总，把研究、开发、写作的上下文分开。',
    meta: '域名分组 / 窗口整理',
    layout: 'portrait',
    tone: 'light',
    accent: '#2F8C5F',
    accentSoft: '#BFE5CB'
  },
  {
    id: '03',
    output: '03-theme-language.png',
    screenshot: 'personalization-raw/light-zh-settings.png',
    darkScreenshot: 'personalization-raw/dark-en-settings.png',
    background: '03-split-theme.png',
    title: '浅色、深色，跟随你的状态',
    subtitle: '点缀色和语言也能切换；工具可以安静，也可以有自己的气质。',
    meta: '主题切换 / 点缀色 / 多语言',
    layout: 'full',
    tone: 'split',
    accent: '#158BB8',
    accentSoft: '#9AD8EE'
  },
  {
    id: '04',
    output: '04-dedupe.png',
    screenshot: '05-duplicate-cleanup.png',
    background: '04-dedupe-focus.png',
    title: '重复页，<br/>不再一页页找',
    subtitle: '识别重复标签，保留重要页面，清掉可以安全关闭的那部分。',
    meta: '重复识别 / 安全清理',
    layout: 'focus',
    tone: 'light',
    accent: '#C05A42',
    accentSoft: '#F0C5B4'
  },
  {
    id: '05',
    output: '05-eastern-palette.png',
    screenshot: '07-accent-palette.png',
    background: '05-eastern-palette.png',
    title: '不只是效率，<br/>也要留一点呼吸',
    subtitle: '东方色盘、诗文角落和轻盈背景，让新标签页不再冷冰冰。',
    meta: '国风审美 / 诗文展示',
    layout: 'wide',
    tone: 'warm',
    accent: '#B45C9E',
    accentSoft: '#E8BBD8'
  }
];

async function dataUrl(filePath) {
  const buffer = await fs.readFile(filePath);
  return `data:image/png;base64,${buffer.toString('base64')}`;
}

async function optionalDataUrl(filePath) {
  try {
    return await dataUrl(filePath);
  } catch {
    return null;
  }
}

function css() {
  return `
    * { box-sizing: border-box; }
    body {
      margin: 0;
      width: 1280px;
      height: 800px;
      overflow: hidden;
      font-family: "PingFang SC", "Hiragino Sans GB", "Songti SC", serif;
      color: #1f302c;
      background: #f7faf6;
    }
    .poster {
      --accent: #8e804b;
      --accent-soft: #e8e1b5;
      position: relative;
      width: 1280px;
      height: 800px;
      overflow: hidden;
      background:
        radial-gradient(circle at 77% 23%, color-mix(in srgb, var(--accent-soft) 45%, transparent), transparent 32%),
        radial-gradient(circle at 20% 20%, rgba(255,255,255,.92), transparent 32%),
        linear-gradient(135deg, #f7faf6, #edf4ef 52%, #e5e0c8);
    }
    .poster.dark,
    .poster.split {
      color: #eef6f1;
      background:
        radial-gradient(circle at 78% 30%, rgba(21,139,184,.20), transparent 34%),
        linear-gradient(135deg, #101b18, #172722 58%, #314037);
    }
    .poster.warm {
      background:
        radial-gradient(circle at 72% 30%, rgba(255,201,12,.14), transparent 36%),
        linear-gradient(135deg, #fbfaf2, #f3f0df 58%, #dfd6ad);
    }
    .bg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .fallback-grain {
      position: absolute;
      inset: 0;
      opacity: .22;
      background-image:
        linear-gradient(rgba(31,48,44,.08) 1px, transparent 1px),
        linear-gradient(90deg, rgba(31,48,44,.06) 1px, transparent 1px);
      background-size: 46px 46px;
      mix-blend-mode: multiply;
    }
    .copy {
      position: absolute;
      z-index: 3;
      left: 62px;
      top: 66px;
      width: 320px;
    }
    .full .copy {
      top: 38px;
      width: 760px;
    }
    .kicker {
      display: inline-flex;
      padding: 7px 11px;
      border-radius: 999px;
      background: rgba(255,255,255,.62);
      border: 1px solid rgba(31,48,44,.12);
      color: var(--accent);
      font: 700 12px/1 "Avenir Next", "PingFang SC", sans-serif;
      letter-spacing: .10em;
    }
    .split .kicker {
      background: rgba(255,255,255,.12);
      border-color: rgba(255,255,255,.14);
      color: #d8ceb1;
    }
    h1 {
      margin: 24px 0 15px;
      font-family: "Songti SC", "STSong", "Noto Serif CJK SC", serif;
      font-size: 42px;
      line-height: 1.08;
      font-weight: 700;
      letter-spacing: 0;
      text-wrap: balance;
    }
    .full h1 {
      max-width: 560px;
      font-size: 42px;
      margin: 18px 0 10px;
    }
    .full p {
      max-width: 760px;
      font-size: 18px;
    }
    p {
      margin: 0;
      max-width: 304px;
      color: rgba(31,48,44,.66);
      font: 600 18px/1.55 "PingFang SC", sans-serif;
      text-wrap: pretty;
    }
    .split p {
      color: rgba(238,246,241,.72);
    }
    .plate {
      position: absolute;
      z-index: 2;
      overflow: hidden;
      border-radius: 30px;
      border: 1px solid rgba(255,255,255,.66);
      background: rgba(255,255,255,.42);
      box-shadow:
        0 34px 120px rgba(24, 43, 37, .22),
        0 0 0 1px color-mix(in srgb, var(--accent) 18%, transparent);
      padding: 10px;
    }
    .plate img {
      width: 100%;
      height: 100%;
      display: block;
      object-fit: contain;
      border-radius: 22px;
    }
    .diagonal-theme .plate {
      left: 220px;
      top: 188px;
      width: 960px;
      height: 600px;
      padding: 0;
      background: rgba(255,255,255,.20);
      border-color: rgba(255,255,255,.22);
      box-shadow: 0 38px 140px rgba(0,0,0,.36);
    }
    .diagonal-wrap {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      border-radius: 30px;
    }
    .diagonal-wrap img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: contain;
      border-radius: 0;
      background: transparent;
    }
    .diagonal-light {
      clip-path: polygon(0 0, 70% 0, 30% 100%, 0 100%);
    }
    .diagonal-dark {
      clip-path: polygon(70% 0, 100% 0, 100% 100%, 30% 100%);
    }
    .diagonal-line {
      position: absolute;
      inset: 0;
      pointer-events: none;
      clip-path: polygon(69.75% 0, 70.25% 0, 30.25% 100%, 29.75% 100%);
      background: rgba(255,255,255,.68);
      filter: drop-shadow(0 0 14px rgba(255,255,255,.38));
    }
    .diagonal-theme .copy {
      top: 42px;
      left: 70px;
      width: 760px;
    }
    .diagonal-theme h1 {
      font-size: 38px;
      max-width: 680px;
      margin: 18px 0 8px;
    }
    .diagonal-theme p {
      color: rgba(238,246,241,.72);
      max-width: 720px;
      font-size: 17px;
    }
    .diagonal-theme .meta {
      left: auto;
      right: 70px;
      top: 80px;
      bottom: auto;
    }
    .wide .plate {
      right: 36px;
      top: 116px;
      width: 900px;
      height: 562px;
    }
    .portrait .plate {
      right: 36px;
      top: 116px;
      width: 900px;
      height: 562px;
    }
    .focus .plate {
      right: 46px;
      top: 122px;
      width: 880px;
      height: 550px;
      transform: rotate(-.6deg);
    }
    .full .plate {
      left: 60px;
      right: 60px;
      bottom: 46px;
      width: 1160px;
      height: 505px;
      border-radius: 32px;
    }
    .split .plate {
      border-color: rgba(255,255,255,.18);
      box-shadow: 0 34px 130px rgba(0,0,0,.34);
    }
    .meta {
      position: absolute;
      z-index: 3;
      left: 62px;
      bottom: 54px;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 12px 15px;
      border-radius: 999px;
      background: rgba(255,255,255,.64);
      border: 1px solid color-mix(in srgb, var(--accent) 24%, rgba(255,255,255,.68));
      color: rgba(31,48,44,.72);
      font: 700 15px/1 "PingFang SC", sans-serif;
      box-shadow: 0 18px 60px rgba(24,43,37,.10);
    }
    .full .meta {
      top: 198px;
      bottom: auto;
      left: 70px;
    }
    .diagonal-theme.full .meta {
      left: auto;
      right: 70px;
      top: 80px;
      bottom: auto;
    }
    .split .meta {
      color: rgba(238,246,241,.82);
      background: rgba(255,255,255,.12);
      border-color: rgba(255,255,255,.18);
    }
    .brand {
      position: absolute;
      right: 72px;
      bottom: 58px;
      z-index: 3;
      color: rgba(31,48,44,.48);
      font: 700 14px/1 "Avenir Next", sans-serif;
      letter-spacing: .08em;
    }
    .split .brand { color: rgba(238,246,241,.48); }
  `;
}

async function htmlFor(poster) {
  const screenshot = await dataUrl(path.join(screenshotDir, poster.screenshot));
  const darkScreenshot = poster.darkScreenshot
    ? await dataUrl(path.join(screenshotDir, poster.darkScreenshot))
    : null;
  const bg = await optionalDataUrl(path.join(backgroundDir, poster.background));
  const bgMarkup = bg ? `<img class="bg" src="${bg}" />` : '<div class="fallback-grain"></div>';
  const plateMarkup = darkScreenshot
    ? `<div class="plate">
        <div class="diagonal-wrap">
          <img class="diagonal-light" src="${screenshot}" />
          <img class="diagonal-dark" src="${darkScreenshot}" />
          <div class="diagonal-line"></div>
        </div>
      </div>`
    : `<div class="plate">
        <img src="${screenshot}" />
      </div>`;

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>${css()}</style>
  </head>
  <body>
    <main class="poster ${poster.layout} ${poster.tone} ${darkScreenshot ? 'diagonal-theme' : ''}" style="--accent: ${poster.accent}; --accent-soft: ${poster.accentSoft};">
      ${bgMarkup}
      <section class="copy">
        <div class="kicker">TAB GARDEN</div>
        <h1>${poster.title}</h1>
        <p>${poster.subtitle}</p>
      </section>
      ${plateMarkup}
      <div class="meta">${poster.meta}</div>
      <div class="brand">枝理 TAB</div>
    </main>
  </body>
</html>`;
}

async function main() {
  await fs.mkdir(outputDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });

  try {
    for (const poster of posters) {
      const page = await browser.newPage({ viewport });
      await page.setContent(await htmlFor(poster), { waitUntil: 'networkidle' });
      await page.screenshot({
        path: path.join(outputDir, poster.output),
        fullPage: false
      });
      await page.close();
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
