import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const screenshotDir = path.join(root, 'output', 'marketplace');
const posterDir = path.join(root, 'output', 'marketplace-posters');
const viewport = { width: 1280, height: 800 };

const shots = [
  {
    id: '01',
    source: '01-all-tabs-overview-50-tabs.png',
    title: '标签越开越乱？',
    subtitle: '枝理 Tab 把 50 个打开页面收回到一张安静的工作台。',
    kicker: 'TAB OVERLOAD',
    note: '总览 / 搜索 / 视图切换',
    theme: 'sage',
    layout: 'hero',
  },
  {
    id: '02',
    source: '02-search-open-tabs-github.png',
    title: '不用再翻遍窗口找页面',
    subtitle: '直接搜索标题和 URL，在已经打开的标签里快速回到上下文。',
    kicker: 'FIND FAST',
    note: '标签搜索',
    theme: 'mist',
    layout: 'tilt',
  },
  {
    id: '03',
    source: '03-domain-groups.png',
    title: '自动按网站归拢',
    subtitle: 'GitHub、Google、设计工具和资料页自动聚成组，混乱会变得可读。',
    kicker: 'AUTO GROUP',
    note: '域名汇总',
    theme: 'bamboo',
    layout: 'hero',
  },
  {
    id: '04',
    source: '04-window-groups.png',
    title: '多窗口也能一眼看清',
    subtitle: '按浏览器窗口整理不同项目，适合研究、开发、写作同时进行的工作流。',
    kicker: 'WINDOW MAP',
    note: '窗口分组',
    theme: 'ink',
    layout: 'split',
  },
  {
    id: '05',
    source: '05-duplicate-cleanup.png',
    title: '重复标签不用手动清',
    subtitle: '识别重复页面，保留该留的，清掉能安全关闭的。',
    kicker: 'DEDUPLICATE',
    note: '重复整理',
    theme: 'plum',
    layout: 'focus',
  },
  {
    id: '06',
    source: '06-settings-protection-theme.png',
    title: '外观跟着工作节奏走',
    subtitle: '浅色、深色、跟随系统，中英切换和保护规则都在本地设置里。',
    kicker: 'THEME & LANGUAGE',
    note: '主题切换 / 多语言 / 保护规则',
    theme: 'night',
    layout: 'settings',
  },
  {
    id: '07',
    source: '07-accent-palette.png',
    title: '不是又一个冷冰冰的新标签页',
    subtitle: '东方色盘、山形波纹和诗文角落，让整理标签也保留一点呼吸感。',
    kicker: 'EASTERN PALETTE',
    note: '国风审美 / 诗文展示',
    theme: 'gold',
    layout: 'palette',
  },
  {
    id: '08',
    source: '08-web-search-mode.png',
    title: '查标签，也能查网页',
    subtitle: '在已打开标签和浏览器默认搜索之间切换，不打断当前的新标签页节奏。',
    kicker: 'SEARCH MODE',
    note: '标签搜索 / 网络搜索',
    theme: 'blue',
    layout: 'tilt',
  },
];

async function imageDataUrl(file) {
  const buffer = await fs.readFile(path.join(screenshotDir, file));
  return `data:image/png;base64,${buffer.toString('base64')}`;
}

function css() {
  return `
    :root {
      --paper: #f7faf7;
      --ink: #1f302c;
      --muted: rgba(31, 48, 44, 0.62);
      --line: rgba(74, 86, 72, 0.16);
      --accent: #8e804b;
      --accent-2: #8fbfaf;
      --deep: #25372f;
    }

    * { box-sizing: border-box; }
    body {
      margin: 0;
      width: 1280px;
      height: 800px;
      overflow: hidden;
      background: #eef4f0;
      font-family: "Songti SC", "Noto Serif CJK SC", "STSong", "PingFang SC", serif;
      color: var(--ink);
    }

    .poster {
      position: relative;
      width: 1280px;
      height: 800px;
      overflow: hidden;
      background:
        radial-gradient(circle at 15% 12%, rgba(255,255,255,0.94), transparent 30%),
        linear-gradient(135deg, var(--paper), color-mix(in srgb, var(--accent-2) 16%, #f7faf7));
    }

    .poster::before,
    .poster::after {
      content: "";
      position: absolute;
      left: -6%;
      width: 112%;
      height: 230px;
      bottom: -70px;
      background: color-mix(in srgb, var(--accent) 32%, transparent);
      border-radius: 52% 48% 0 0 / 35% 45% 0 0;
      transform: rotate(-2deg);
      opacity: 0.68;
    }

    .poster::after {
      bottom: -118px;
      background: color-mix(in srgb, var(--deep) 34%, transparent);
      transform: rotate(3deg);
      opacity: 0.50;
    }

    .grain {
      position: absolute;
      inset: 0;
      pointer-events: none;
      opacity: 0.18;
      background-image:
        linear-gradient(rgba(255,255,255,0.18) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.14) 1px, transparent 1px);
      background-size: 38px 38px;
      mix-blend-mode: overlay;
    }

    .copy {
      position: absolute;
      z-index: 5;
      left: 76px;
      top: 66px;
      width: 430px;
    }

    .kicker {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      border-radius: 999px;
      border: 1px solid var(--line);
      background: rgba(255,255,255,0.42);
      color: color-mix(in srgb, var(--accent) 86%, #101818);
      font: 700 12px/1.1 "Avenir Next", "PingFang SC", sans-serif;
      letter-spacing: .12em;
    }

    .kicker::before {
      content: "";
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--accent);
      box-shadow: 0 0 0 5px color-mix(in srgb, var(--accent) 16%, transparent);
    }

    h1 {
      margin: 28px 0 18px;
      font-size: 58px;
      line-height: 1.02;
      letter-spacing: 0;
      font-weight: 700;
      text-wrap: balance;
    }

    .subtitle {
      margin: 0;
      max-width: 410px;
      color: var(--muted);
      font: 500 22px/1.55 "PingFang SC", "Hiragino Sans GB", sans-serif;
      letter-spacing: 0;
    }

    .note {
      position: absolute;
      z-index: 5;
      left: 76px;
      bottom: 58px;
      display: inline-flex;
      align-items: center;
      gap: 12px;
      padding: 13px 16px;
      border-radius: 16px;
      background: rgba(255,255,255,0.56);
      border: 1px solid rgba(255,255,255,0.6);
      box-shadow: 0 18px 50px rgba(28, 47, 42, 0.10);
      font: 600 17px/1 "PingFang SC", sans-serif;
      color: rgba(31,48,44,.76);
    }

    .note::before {
      content: "枝理 Tab";
      padding: 6px 9px;
      border-radius: 9px;
      color: white;
      background: var(--accent);
      font-size: 13px;
    }

    .shot {
      position: absolute;
      z-index: 4;
      overflow: hidden;
      border-radius: 28px;
      background: rgba(255,255,255,.44);
      border: 1px solid rgba(255,255,255,.72);
      box-shadow: 0 34px 90px rgba(30, 48, 44, .22);
    }

    .shot img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .hero .shot {
      right: 62px;
      top: 108px;
      width: 690px;
      height: 520px;
    }

    .tilt .shot {
      right: 56px;
      top: 104px;
      width: 718px;
      height: 510px;
      transform: rotate(-2deg);
    }

    .split .copy {
      width: 405px;
    }

    .split .shot {
      right: 58px;
      top: 70px;
      width: 690px;
      height: 580px;
    }

    .focus .shot {
      right: 70px;
      top: 88px;
      width: 690px;
      height: 540px;
      transform: rotate(1.2deg);
    }

    .settings .poster {
      background: linear-gradient(135deg, #182521, #445443 46%, #f0f3ec);
      color: #f7fbf7;
    }

    .settings .copy { width: 470px; }
    .settings h1 { color: #fbfff9; }
    .settings .subtitle { color: rgba(247,251,247,.72); }
    .settings .kicker {
      background: rgba(255,255,255,.10);
      border-color: rgba(255,255,255,.18);
      color: #e6dcc1;
    }
    .settings .note {
      color: rgba(255,255,255,.82);
      background: rgba(255,255,255,.12);
      border-color: rgba(255,255,255,.20);
    }
    .settings .shot {
      right: 58px;
      top: 44px;
      width: 585px;
      height: 690px;
      box-shadow: 0 34px 100px rgba(0,0,0,.34);
    }

    .palette .shot {
      right: 54px;
      top: 92px;
      width: 720px;
      height: 528px;
    }

    .badge-row {
      position: absolute;
      z-index: 5;
      right: 82px;
      bottom: 58px;
      display: flex;
      gap: 10px;
    }

    .mini-badge {
      padding: 10px 13px;
      border-radius: 999px;
      background: rgba(255,255,255,.55);
      border: 1px solid rgba(255,255,255,.58);
      color: rgba(31,48,44,.70);
      font: 700 13px/1 "PingFang SC", sans-serif;
    }

    .settings .mini-badge {
      color: rgba(255,255,255,.80);
      background: rgba(255,255,255,.12);
      border-color: rgba(255,255,255,.18);
    }

    .sage { --accent: #8e804b; --accent-2: #8fbfaf; --paper: #f7faf7; --deep: #3c4a34; }
    .mist { --accent: #3a6b73; --accent-2: #8eb0c9; --paper: #f4f9fa; --deep: #253f48; }
    .bamboo { --accent: #229453; --accent-2: #8fbfaf; --paper: #f6fbf5; --deep: #2e4a39; }
    .ink { --accent: #517c73; --accent-2: #a7bbb3; --paper: #f4f7f5; --deep: #213532; }
    .plum { --accent: #ad6598; --accent-2: #c98aa1; --paper: #fbf6fa; --deep: #56394e; }
    .night { --accent: #8e804b; --accent-2: #3a6b73; --paper: #202b27; --deep: #0f1b18; }
    .gold { --accent: #8e804b; --accent-2: #ffc90c; --paper: #fbfaf2; --deep: #5c5030; }
    .blue { --accent: #158bb8; --accent-2: #8eb0c9; --paper: #f3f8fb; --deep: #24475a; }
  `;
}

async function htmlFor(shot) {
  const imageSrc = await imageDataUrl(shot.source);
  const badges = shot.id === '06'
    ? ['浅色 / 深色', '跟随系统', '中英切换']
    : shot.id === '07'
      ? ['东方色盘', '诗文角落', '轻盈山形背景']
      : ['真实截图', 'Chrome / Edge', '本地整理'];

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>${css()}</style>
  </head>
  <body>
    <section class="${shot.layout} ${shot.theme}">
      <div class="poster">
        <div class="grain"></div>
        <div class="copy">
          <div class="kicker">${shot.kicker}</div>
          <h1>${shot.title}</h1>
          <p class="subtitle">${shot.subtitle}</p>
        </div>
        <div class="shot">
          <img src="${imageSrc}" />
        </div>
        <div class="note">${shot.note}</div>
        <div class="badge-row">
          ${badges.map((badge) => `<span class="mini-badge">${badge}</span>`).join('')}
        </div>
      </div>
    </section>
  </body>
</html>`;
}

async function main() {
  await fs.mkdir(posterDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });

  try {
    for (const shot of shots) {
      const page = await browser.newPage({ viewport });
      await page.setContent(await htmlFor(shot), { waitUntil: 'networkidle' });
      await page.screenshot({
        path: path.join(posterDir, `${shot.id}-${shot.kicker.toLowerCase().replaceAll(' ', '-')}.png`),
        fullPage: false,
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
