import fs from 'node:fs/promises';
import http from 'node:http';
import { execFile } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { promisify } from 'node:util';

const root = process.cwd();
const extensionPath = path.join(root, '.output', 'chrome-mv3');
const outputDir = path.join(root, 'output', 'marketplace');
const demoAssetsDir = path.join(outputDir, 'demo-assets');
const profileDir = path.join(root, 'output', 'playwright', 'marketplace-demo-profile');
const viewport = { width: 1280, height: 800 };
const settingsKey = 'zhi-li-tab:settings';
const chromeExecutablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const playwrightCliPackagePath = '/Users/franco/.deskclaw/node/lib/node_modules/@playwright/cli/package.json';
const staticPort = Number(process.env.TAB_GARDEN_DEMO_PORT || 4179);
const execFileAsync = promisify(execFile);
const defaultProxy = 'http://127.0.0.1:7897';

const baseSettings = {
  language: 'zh',
  defaultView: 'all',
  protectPinned: true,
  protectAudible: true,
  protectActive: true,
  whitelistDomains: ['mail.google.com', 'calendar.google.com'],
  theme: 'light',
  defaultAccentColor: '#8e804b',
  randomAccentColor: false,
  animationEnabled: true,
  searchToggleDisplay: 'detailed',
  showPoem: true,
  openPoemExpandedByDefault: false,
  showPoemDynasty: false,
  showBookmarksBar: false,
  bookmarksBarStyle: 'standard',
};

const shotAccents = {
  overview: '#8e804b',
  search: '#158bb8',
  domain: '#229453',
  window: '#8076a3',
  duplicate: '#f03f24',
  settings: '#6e8b74',
  palette: '#ad6598',
  poem: '#c45a65',
};

const fontImportRewrites = [
  ['256', 'https://fontsapi.zeoseven.com/256/main/result.css'],
  ['437', 'https://fontsapi.zeoseven.com/437/main/result.css'],
  ['292', 'https://fontsapi.zeoseven.com/292/main/result.css'],
];

const demoWindows = [
  [
    ['GitHub - fchange/tab-garden', 'https://github.com/fchange/tab-garden', { active: true }],
    ['GitHub - fchange/tab-garden README', 'https://github.com/fchange/tab-garden#readme'],
    ['GitHub - fchange/tab-garden Issues', 'https://github.com/fchange/tab-garden/issues'],
    ['GitHub - fchange/tab-garden Pull requests', 'https://github.com/fchange/tab-garden/pulls'],
    ['OpenAI Cookbook', 'https://github.com/openai/openai-cookbook'],
    ['Playwright documentation', 'https://playwright.dev/docs/intro'],
    ['Chrome Extensions Docs', 'https://developer.chrome.com/docs/extensions'],
    ['MDN Web APIs', 'https://developer.mozilla.org/en-US/docs/Web/API'],
    ['React Quick Start', 'https://react.dev/learn'],
    ['Vite Guide', 'https://vite.dev/guide/'],
  ],
  [
    ['Product Requirements - Google Docs', 'https://docs.google.com/document/d/demo-product-plan', { pinned: true }],
    ['Product Requirements - Google Docs', 'https://docs.google.com/document/d/demo-product-plan?utm_source=slack'],
    ['Launch Calendar', 'https://calendar.google.com/calendar/u/0/r'],
    ['Inbox - Gmail', 'https://mail.google.com/mail/u/0/#inbox', { pinned: true }],
    ['Project Board - Linear', 'https://linear.app/tab-garden/project/marketplace'],
    ['Design Review - Figma', 'https://www.figma.com/file/tab-garden-marketplace'],
    ['Notion Workspace', 'https://www.notion.so/product'],
    ['Canva Brand Assets', 'https://www.canva.com/brand'],
    ['Dropbox Shared Screenshots', 'https://www.dropbox.com/home/screenshots'],
    ['Slack - #launch', 'https://app.slack.com/client/T-demo/C-launch', { audible: true }],
  ],
  [
    ['ChatGPT', 'https://chatgpt.com/', { pinned: true }],
    ['ChatGPT', 'https://chatgpt.com/?utm_source=launcher'],
    ['Claude', 'https://claude.ai/'],
    ['Gemini', 'https://gemini.google.com/'],
    ['Perplexity', 'https://www.perplexity.ai/'],
    ['Hugging Face Papers', 'https://huggingface.co/papers'],
    ['Replicate Explore', 'https://replicate.com/explore'],
    ['Kaggle Datasets', 'https://www.kaggle.com/datasets'],
    ['Papers with Code', 'https://paperswithcode.com/'],
    ['arXiv Search', 'https://arxiv.org/search/'],
  ],
  [
    ['YouTube', 'https://www.youtube.com/'],
    ['Bilibili', 'https://www.bilibili.com/'],
    ['Netflix', 'https://www.netflix.com/', { discarded: true }],
    ['Spotify Web Player', 'https://open.spotify.com/', { audible: true }],
    ['Apple Music', 'https://music.apple.com/'],
    ['The Verge', 'https://www.theverge.com/'],
    ['WIRED', 'https://www.wired.com/'],
    ['New York Times', 'https://www.nytimes.com/'],
    ['BBC News', 'https://www.bbc.com/news'],
    ['Wikipedia', 'https://www.wikipedia.org/', { discarded: true }],
  ],
  [
    ['Amazon', 'https://www.amazon.com/'],
    ['Apple', 'https://www.apple.com/'],
    ['Microsoft', 'https://www.microsoft.com/'],
    ['Cloudflare', 'https://www.cloudflare.com/'],
    ['Vercel', 'https://vercel.com/', { discarded: true }],
    ['Vercel Dashboard', 'https://vercel.com/dashboard'],
    ['Netlify', 'https://www.netlify.com/'],
    ['Product Hunt', 'https://www.producthunt.com/'],
    ['Hacker News', 'https://news.ycombinator.com/'],
    ['Stack Overflow', 'https://stackoverflow.com/questions/ask', { discarded: true }],
  ],
];

async function loadChromium() {
  try {
    const playwright = await import('playwright');
    return playwright.chromium;
  } catch {
    const require = createRequire(playwrightCliPackagePath);
    return require('playwright').chromium;
  }
}

function contentType(filePath) {
  const ext = path.extname(filePath);
  if (ext === '.html') return 'text/html; charset=utf-8';
  if (ext === '.js') return 'text/javascript; charset=utf-8';
  if (ext === '.css') return 'text/css; charset=utf-8';
  if (ext === '.json') return 'application/json; charset=utf-8';
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.svg') return 'image/svg+xml';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.ico') return 'image/x-icon';
  if (ext === '.woff2') return 'font/woff2';
  if (ext === '.woff') return 'font/woff';
  return 'application/octet-stream';
}

function safeAssetName(name, fallback) {
  const cleaned = name.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/^-+|-+$/g, '');
  return cleaned || fallback;
}

function faviconFilename(domain) {
  return `${safeAssetName(domain, 'site')}.png`;
}

function localFaviconUrl(tabUrl) {
  const hostname = new URL(tabUrl).hostname;
  return `http://127.0.0.1:${staticPort}/demo-assets/favicons/${faviconFilename(hostname)}`;
}

function getDemoHostnames() {
  return [...new Set(demoWindows.flatMap((tabs) => tabs.map(([, url]) => new URL(url).hostname)))];
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function proxyEnv() {
  const proxy = process.env.all_proxy || process.env.ALL_PROXY || defaultProxy;
  return {
    ...process.env,
    all_proxy: proxy,
    ALL_PROXY: proxy,
    http_proxy: process.env.http_proxy || proxy,
    HTTP_PROXY: process.env.HTTP_PROXY || proxy,
    https_proxy: process.env.https_proxy || proxy,
    HTTPS_PROXY: process.env.HTTPS_PROXY || proxy,
  };
}

async function curl(url) {
  const { stdout } = await execFileAsync(
    'curl',
    ['-fL', '--retry', '2', '--connect-timeout', '20', '--max-time', '180', url],
    {
      encoding: 'buffer',
      env: proxyEnv(),
      maxBuffer: 80 * 1024 * 1024,
    },
  );
  return stdout;
}

async function assertDemoAssets() {
  const required = [
    ...fontImportRewrites.map(([id]) => path.join(demoAssetsDir, 'fonts', id, 'result.css')),
    ...fontImportRewrites.map(([id]) => path.join(demoAssetsDir, 'fonts', id, 'font-files.json')),
    ...getDemoHostnames().map((hostname) => path.join(demoAssetsDir, 'favicons', faviconFilename(hostname))),
  ];
  const missing = [];

  for (const filePath of required) {
    if (!(await fileExists(filePath))) {
      missing.push(path.relative(root, filePath));
    }
  }

  if (missing.length > 0) {
    throw new Error(
      [
        'Missing local marketplace demo assets.',
        'Run: all_proxy=http://127.0.0.1:7897 node tools/install-marketplace-demo-assets.mjs',
        `Missing examples: ${missing.slice(0, 8).join(', ')}${missing.length > 8 ? '...' : ''}`,
      ].join('\n'),
    );
  }
}

async function maybeCacheFontFile(requestPath, filePath) {
  const match = requestPath.match(/^fonts\/([^/]+)\/([^/]+\.woff2?)$/);
  if (!match || await fileExists(filePath)) return;

  const [, fontId, filename] = match;
  const mapPath = path.join(demoAssetsDir, 'fonts', fontId, 'font-files.json');
  const map = JSON.parse(await fs.readFile(mapPath, 'utf8'));
  const sourceUrl = map[filename];
  if (!sourceUrl) return;

  const body = await curl(sourceUrl);
  await fs.writeFile(filePath, body);
}

function resolveSafeFile(rootDir, requestPath) {
  const normalized = path.normalize(requestPath).replace(/^(\.\.[/\\])+/, '');
  const filePath = path.join(rootDir, normalized);
  const relative = path.relative(rootDir, filePath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) return null;
  return filePath;
}

async function readServedFile(filePath) {
  const body = await fs.readFile(filePath);
  if (!filePath.endsWith('.css') || !filePath.startsWith(extensionPath)) return body;

  let css = body.toString('utf8');
  for (const [id, remoteUrl] of fontImportRewrites) {
    const escapedUrl = remoteUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    css = css.replace(
      new RegExp(`@import\\s+(?:url\\()?["']${escapedUrl}["']\\)?;?`, 'g'),
      `@import url("/demo-assets/fonts/${id}/result.css");`,
    );
  }
  return Buffer.from(css);
}

function startStaticServer() {
  const server = http.createServer(async (req, res) => {
    try {
      const rawPath = decodeURIComponent(new URL(req.url ?? '/', `http://127.0.0.1:${staticPort}`).pathname);
      const isDemoAsset = rawPath.startsWith('/demo-assets/');
      const rootDir = isDemoAsset ? demoAssetsDir : extensionPath;
      const requestPath = isDemoAsset
        ? rawPath.slice('/demo-assets/'.length)
        : rawPath === '/' ? 'newtab.html' : rawPath.slice(1);
      const filePath = resolveSafeFile(rootDir, requestPath);

      if (!filePath) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }
      if (isDemoAsset) {
        await maybeCacheFontFile(requestPath, filePath);
      }
      const body = await readServedFile(filePath);
      res.writeHead(200, { 'content-type': contentType(filePath) });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end('Not found');
    }
  });

  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(staticPort, '127.0.0.1', () => {
      server.off('error', reject);
      resolve(server);
    });
  });
}

function buildDemoTabs() {
  const startedAt = Date.now();
  let id = 7000;

  return demoWindows.flatMap((tabs, windowIndex) =>
    tabs.map(([title, url, flags = {}], index) => {
      id += 1;
      const hostname = new URL(url).hostname;
      return {
        id,
        title,
        url,
        favIconUrl: localFaviconUrl(url),
        windowId: windowIndex + 1,
        active: !!flags.active,
        pinned: !!flags.pinned,
        audible: !!flags.audible,
        discarded: !!flags.discarded,
        lastAccessed: startedAt - (windowIndex * 10 + index) * 70_000,
        index,
      };
    }),
  );
}

async function setSettings(page, settings) {
  await page.evaluate(
    ({ key, value }) => {
      localStorage.setItem(key, JSON.stringify(value));
      if (!globalThis.chrome?.storage?.local) return;
      return new Promise((resolve) => {
        chrome.storage.local.set({ [key]: value }, resolve);
      });
    },
    { key: settingsKey, value: settings },
  );
}

async function applyState(page, settings) {
  await setSettings(page, { ...baseSettings, ...settings });
  await page.reload();
  await page.waitForLoadState('domcontentloaded');
  await waitForAppReady(page);
  await page.waitForTimeout(900);
}

async function screenshot(page, name) {
  await waitForAppReady(page);
  await page.screenshot({
    path: path.join(outputDir, `${name}.png`),
    fullPage: false,
  });
}

async function waitForAppReady(page) {
  await page.waitForTimeout(500);
  await page.waitForSelector('input', { timeout: 15000 });
  await page.waitForSelector('[role="tab"]', { timeout: 15000 });
  await page.evaluate(() => document.fonts.ready).catch(() => {});
  await page.waitForTimeout(300);
}

async function clickView(page, label) {
  await page.getByRole('tab', { name: new RegExp(label) }).click();
  await page.waitForTimeout(500);
}

async function revealFloatingControls(page) {
  await page.locator('.group.fixed.bottom-4.right-5').hover({ force: true });
  await page.waitForTimeout(250);
}

async function main() {
  const chromium = await loadChromium();
  await assertDemoAssets();
  const demoTabs = buildDemoTabs();
  const server = await startStaticServer();

  await fs.rm(profileDir, { recursive: true, force: true });
  await fs.mkdir(outputDir, { recursive: true });

  const context = await chromium.launchPersistentContext(profileDir, {
    headless: false,
    executablePath: chromeExecutablePath,
    viewport,
    args: [
      '--no-first-run',
      '--no-default-browser-check',
    ],
  });

  try {
    await context.addInitScript((tabs) => {
      window.__TAB_GARDEN_DEMO_TABS__ = tabs;
    }, demoTabs);

    const page = context.pages()[0] ?? await context.newPage();
    page.on('console', (message) => {
      if (message.type() === 'error') {
        console.warn(`browser console error: ${message.text()}`);
      }
    });
    page.on('pageerror', (error) => {
      console.warn(`browser page error: ${error.message}`);
    });
    await page.goto(`http://127.0.0.1:${staticPort}/newtab.html`, { waitUntil: 'load' });
    await page.setViewportSize(viewport);
    await waitForAppReady(page);

    await applyState(page, {
      defaultView: 'all',
      theme: 'light',
      defaultAccentColor: shotAccents.overview,
      showPoem: true,
    });
    await screenshot(page, '01-all-tabs-overview-50-tabs');

    await applyState(page, {
      defaultView: 'all',
      theme: 'light',
      defaultAccentColor: shotAccents.search,
      showPoem: true,
    });
    await page.locator('input').first().fill('github');
    await page.waitForTimeout(350);
    await screenshot(page, '02-search-open-tabs-github');

    await applyState(page, {
      defaultView: 'domain',
      theme: 'light',
      defaultAccentColor: shotAccents.domain,
      showPoem: true,
    });
    await clickView(page, '域名');
    await screenshot(page, '03-domain-groups');

    await applyState(page, {
      defaultView: 'window',
      theme: 'light',
      defaultAccentColor: shotAccents.window,
      showPoem: true,
    });
    await clickView(page, '窗口');
    await screenshot(page, '04-window-groups');

    await applyState(page, {
      defaultView: 'duplicate',
      theme: 'light',
      defaultAccentColor: shotAccents.duplicate,
      showPoem: true,
    });
    await clickView(page, '重复');
    await screenshot(page, '05-duplicate-cleanup');

    await applyState(page, {
      defaultView: 'duplicate',
      theme: 'dark',
      defaultAccentColor: shotAccents.settings,
      language: 'zh',
      showPoem: true,
      openPoemExpandedByDefault: false,
    });
    await revealFloatingControls(page);
    await page.locator('[title="设置"]').click();
    await page.waitForTimeout(650);
    await screenshot(page, '06-settings-protection-theme');

    await page.keyboard.press('Escape');
    await page.waitForTimeout(350);
    await applyState(page, {
      defaultView: 'all',
      theme: 'light',
      defaultAccentColor: shotAccents.palette,
      showPoem: true,
    });
    await page.locator('button[title="选择点缀色"], button[title="Choose accent color"]').click();
    await page.waitForTimeout(550);
    await screenshot(page, '07-accent-palette');

    await page.keyboard.press('Escape');
    await page.waitForTimeout(350);
    await applyState(page, {
      defaultView: 'all',
      theme: 'dark',
      defaultAccentColor: shotAccents.poem,
      showPoem: true,
      openPoemExpandedByDefault: true,
      showPoemDynasty: true,
    });
    await page.waitForTimeout(900);
    await screenshot(page, '08-poem-dark-expanded');
  } finally {
    await context.close();
    await new Promise((resolve) => server.close(resolve));
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
