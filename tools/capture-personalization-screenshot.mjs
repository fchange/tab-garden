import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const extensionPath = path.join(root, '.output', 'chrome-mv3');
const outputDir = path.join(root, 'output', 'marketplace');
const profileDir = path.join(root, 'output', 'playwright', 'personalization-profile');
const rawDir = path.join(root, 'output', 'marketplace', 'personalization-raw');
const viewport = { width: 1280, height: 800 };
const settingsKey = 'zhi-li-tab:settings';

const sampleTabs = [
  'https://github.com/fchange/tab-garden',
  'https://developer.chrome.com/docs/extensions',
  'https://react.dev/learn',
  'https://www.notion.so/product',
  'https://www.figma.com/',
  'https://chatgpt.com/',
  'https://www.apple.com/',
  'https://vercel.com/',
];

const baseSettings = {
  defaultView: 'all',
  protectPinned: true,
  protectAudible: true,
  protectActive: true,
  whitelistDomains: ['mail.google.com', 'calendar.google.com'],
  randomAccentColor: false,
  animationEnabled: true,
  searchToggleDisplay: 'detailed',
  showPoem: true,
  showPoemDynasty: false,
};

async function resolveExtensionPage(context) {
  const page = context.pages()[0] ?? await context.newPage();
  await page.goto('chrome://newtab');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForURL(/chrome-extension:\/\/[^/]+\/newtab\.html/, { timeout: 15000 });
  return page;
}

async function openSampleTabs(page) {
  await page.evaluate(async (urls) => {
    const createTab = (url) =>
      new Promise((resolve) => {
        chrome.tabs.create({ url, active: true }, (tab) => resolve(tab));
      });
    const waitForTabReady = (tabId, timeout = 12000) =>
      new Promise((resolve) => {
        const startedAt = Date.now();
        const tick = () => {
          chrome.tabs.get(tabId, (tab) => {
            const err = chrome.runtime.lastError;
            if (err || !tab) {
              resolve();
              return;
            }

            const hasUrl = !!tab.url && /^https?:\/\//.test(tab.url);
            const hasTitle = !!tab.title && tab.title !== 'New Tab';
            const hasIcon = !!tab.favIconUrl;
            if (hasUrl && tab.status === 'complete' && (hasTitle || hasIcon)) {
              resolve();
              return;
            }

            if (Date.now() - startedAt > timeout) {
              resolve();
              return;
            }

            setTimeout(tick, 300);
          });
        };
        tick();
      });
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    for (const url of urls) {
      const tab = await createTab(url);
      if (tab.id) {
        await waitForTabReady(tab.id);
      }
      await wait(1200);
    }
  }, sampleTabs);
}

async function warmSampleTabs(page) {
  await page.evaluate(async () => {
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const tabs = await new Promise((resolve) => {
      chrome.tabs.query({}, (allTabs) => {
        resolve(allTabs.filter((tab) => tab.id && tab.url && /^https?:\/\//.test(tab.url)).slice(0, 12));
      });
    });

    for (const tab of tabs) {
      await new Promise((resolve) => {
        chrome.windows.update(tab.windowId, { focused: true }, () => {
          chrome.tabs.update(tab.id, { active: true }, () => resolve());
        });
      });
      await wait(1500);
    }
  });
}

async function setSettings(page, settings) {
  await page.evaluate(
    ({ key, value }) =>
      new Promise((resolve) => {
        chrome.storage.local.set({ [key]: value }, resolve);
      }),
    { key: settingsKey, value: settings },
  );
}

async function captureState(page, name, settings, openSettings = false) {
  await setSettings(page, settings);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2500);

  if (openSettings) {
    await page.locator('.group.fixed.bottom-4.right-5').hover({ force: true });
    await page.waitForTimeout(200);
    await page.locator('[title="设置"], [title="Settings"]').click();
    await page.waitForTimeout(1500);
  }

  await page.waitForTimeout(1000);

  const output = path.join(rawDir, `${name}.png`);
  await page.screenshot({ path: output, fullPage: false });
  return output;
}

async function buildComposite(lightPath, darkPath, outputPath) {
  const light = (await fs.readFile(lightPath)).toString('base64');
  const dark = (await fs.readFile(darkPath)).toString('base64');
  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      width: 1280px;
      height: 800px;
      overflow: hidden;
      background:
        linear-gradient(90deg, #f7faf6 0 50%, #18231f 50% 100%);
      font-family: "PingFang SC", "Hiragino Sans GB", "Songti SC", serif;
      color: #20332e;
    }
    .frame {
      position: relative;
      width: 1280px;
      height: 800px;
      padding: 54px 58px;
    }
    .title {
      position: absolute;
      z-index: 4;
      left: 64px;
      top: 42px;
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 12px 16px;
      border-radius: 999px;
      background: rgba(255,255,255,.72);
      border: 1px solid rgba(30,50,45,.12);
      box-shadow: 0 14px 42px rgba(23,39,35,.08);
      font-size: 18px;
      font-weight: 700;
    }
    .title span {
      color: #8e804b;
    }
    .card {
      position: absolute;
      overflow: hidden;
      border-radius: 28px;
      box-shadow: 0 28px 90px rgba(20,31,27,.22);
      border: 1px solid rgba(255,255,255,.62);
      background: rgba(255,255,255,.52);
    }
    .light {
      left: 58px;
      top: 112px;
      width: 620px;
      height: 562px;
    }
    .dark {
      right: 58px;
      top: 112px;
      width: 620px;
      height: 562px;
      border-color: rgba(255,255,255,.16);
      box-shadow: 0 28px 90px rgba(0,0,0,.36);
    }
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .label {
      position: absolute;
      z-index: 4;
      top: 690px;
      display: flex;
      gap: 10px;
      align-items: center;
      font-size: 18px;
      font-weight: 700;
    }
    .label.light-label { left: 78px; color: #20332e; }
    .label.dark-label { right: 78px; color: rgba(255,255,255,.88); }
    .pill {
      padding: 8px 12px;
      border-radius: 999px;
      background: rgba(255,255,255,.68);
      border: 1px solid rgba(255,255,255,.55);
      font-size: 14px;
    }
    .dark-label .pill {
      background: rgba(255,255,255,.12);
      border-color: rgba(255,255,255,.16);
    }
    .split-line {
      position: absolute;
      left: 50%;
      top: 0;
      bottom: 0;
      width: 1px;
      background: linear-gradient(transparent, rgba(255,255,255,.52), transparent);
    }
  </style>
</head>
<body>
  <main class="frame">
    <div class="split-line"></div>
    <div class="title"><span>个性化</span> 浅色、深色、点缀色、多语言</div>
    <div class="card light"><img src="data:image/png;base64,${light}" /></div>
    <div class="card dark"><img src="data:image/png;base64,${dark}" /></div>
    <div class="label light-label">
      <span class="pill">浅色</span>
      <span class="pill">草灰绿点缀</span>
      <span class="pill">中文</span>
    </div>
    <div class="label dark-label">
      <span class="pill">Dark</span>
      <span class="pill">Iris blue accent</span>
      <span class="pill">English</span>
    </div>
  </main>
</body>
</html>`;

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport });
    await page.setContent(html, { waitUntil: 'networkidle' });
    await page.screenshot({ path: outputPath, fullPage: false });
  } finally {
    await browser.close();
  }
}

async function main() {
  await fs.rm(profileDir, { recursive: true, force: true });
  await fs.mkdir(outputDir, { recursive: true });
  await fs.mkdir(rawDir, { recursive: true });

  const context = await chromium.launchPersistentContext(profileDir, {
    headless: false,
    viewport,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
      '--no-first-run',
      '--no-default-browser-check',
    ],
  });

  try {
    const page = await resolveExtensionPage(context);
    await openSampleTabs(page);
    await warmSampleTabs(page);
    await page.bringToFront();
    await page.waitForTimeout(2500);

    const lightPath = await captureState(page, 'light-zh-settings', {
      ...baseSettings,
      language: 'zh',
      theme: 'light',
      defaultAccentColor: '#8e804b',
    }, true);

    await page.getByRole('button', { name: 'Close' }).click();
    await page.waitForTimeout(400);

    const darkPath = await captureState(page, 'dark-en-settings', {
      ...baseSettings,
      language: 'en',
      theme: 'dark',
      defaultAccentColor: '#158bb8',
    }, true);

    await buildComposite(lightPath, darkPath, path.join(outputDir, '09-personalization-theme-language.png'));
  } finally {
    await context.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
