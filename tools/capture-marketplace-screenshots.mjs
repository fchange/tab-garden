import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const extensionPath = path.join(root, '.output', 'chrome-mv3');
const outputDir = path.join(root, 'output', 'marketplace');
const profileDir = path.join(root, 'output', 'playwright', 'cdp-profile');
const chromePath = process.env.CHROME_PATH || chromium.executablePath();
const cdpPort = Number(process.env.TAB_GARDEN_CDP_PORT || 9333);
const useExternalCdp = process.env.TAB_GARDEN_USE_EXTERNAL_CDP === '1';
const viewport = { width: 1280, height: 800 };
const settingsKey = 'zhi-li-tab:settings';
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
  showPoemDynasty: false,
};
const shotAccents = {
  overview: '#8e804b',
  search: '#158bb8',
  domain: '#229453',
  window: '#8076a3',
  duplicate: '#f03f24',
  settings: '#6e8b74',
  palette: '#ad6598',
  webSearch: '#fca104',
};

const tabSets = [
  [
    'https://github.com/fchange/tab-garden',
    'https://github.com/fchange/tab-garden?utm_source=market',
    'https://github.com/fchange/tab-garden#readme',
    'https://github.com/openai/openai-cookbook',
    'https://github.com/microsoft/playwright',
    'https://developer.chrome.com/docs/extensions',
    'https://developer.mozilla.org/en-US/docs/Web/API',
    'https://web.dev/articles',
    'https://react.dev/learn',
    'https://vite.dev/guide/',
  ],
  [
    'https://docs.google.com/document/u/0/',
    'https://calendar.google.com/calendar/u/0/r',
    'https://mail.google.com/mail/u/0/',
    'https://drive.google.com/drive/my-drive',
    'https://www.notion.so/product',
    'https://linear.app/',
    'https://www.figma.com/',
    'https://www.canva.com/',
    'https://www.dropbox.com/',
    'https://www.slack.com/',
  ],
  [
    'https://chatgpt.com/',
    'https://chatgpt.com/?utm_source=market',
    'https://claude.ai/',
    'https://gemini.google.com/',
    'https://perplexity.ai/',
    'https://huggingface.co/',
    'https://replicate.com/',
    'https://www.kaggle.com/',
    'https://paperswithcode.com/',
    'https://arxiv.org/',
  ],
  [
    'https://www.youtube.com/',
    'https://www.bilibili.com/',
    'https://www.netflix.com/',
    'https://open.spotify.com/',
    'https://music.apple.com/',
    'https://www.theverge.com/',
    'https://www.wired.com/',
    'https://www.nytimes.com/',
    'https://www.bbc.com/news',
    'https://www.wikipedia.org/',
  ],
  [
    'https://www.amazon.com/',
    'https://www.apple.com/',
    'https://www.microsoft.com/',
    'https://www.cloudflare.com/',
    'https://vercel.com/',
    'https://www.netlify.com/',
    'https://www.producthunt.com/',
    'https://news.ycombinator.com/',
    'https://stackoverflow.com/',
    'https://www.reddit.com/r/webdev/',
  ],
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function requestJson(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`${url} returned ${res.statusCode}`));
          return;
        }
        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(error);
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(1000, () => {
      req.destroy(new Error(`Timed out requesting ${url}`));
    });
  });
}

async function waitForCdp(port) {
  const deadline = Date.now() + 20000;
  const versionUrl = `http://127.0.0.1:${port}/json/version`;

  while (Date.now() < deadline) {
    try {
      return await requestJson(versionUrl);
    } catch {
      await sleep(250);
    }
  }

  throw new Error(`Chrome DevTools endpoint did not become ready on port ${port}`);
}

async function launchChromeForCdp() {
  await fs.rm(profileDir, { recursive: true, force: true });
  await fs.mkdir(profileDir, { recursive: true });
  await fs.mkdir(outputDir, { recursive: true });

  const args = [
    `--remote-debugging-port=${cdpPort}`,
    '--remote-debugging-address=127.0.0.1',
    `--remote-allow-origins=http://127.0.0.1:${cdpPort}`,
    `--user-data-dir=${profileDir}`,
    `--disable-extensions-except=${extensionPath}`,
    `--load-extension=${extensionPath}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-session-crashed-bubble',
    '--disable-features=Translate,OptimizationHints',
    'about:blank',
  ];

  const chrome = spawn(chromePath, args, {
    detached: false,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  chrome.on('error', (error) => {
    throw error;
  });
  chrome.stdout.on('data', (chunk) => process.stdout.write(chunk));
  chrome.stderr.on('data', (chunk) => process.stderr.write(chunk));

  try {
    await waitForCdp(cdpPort);
  } catch (error) {
    chrome.kill('SIGTERM');
    throw error;
  }
  return chrome;
}

async function resolveExtensionPage(context) {
  const existingPages = context.pages();
  for (const page of existingPages) {
    if (/^chrome-extension:\/\/[^/]+\/newtab\.html/.test(page.url())) {
      return page;
    }
  }

  const page = existingPages[0] ?? await context.newPage();
  await page.goto('chrome://newtab');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000);

  if (/^chrome-extension:\/\/[^/]+\/newtab\.html/.test(page.url())) {
    return page;
  }

  const targets = await requestJson(`http://127.0.0.1:${cdpPort}/json/list`);
  const extensionTarget = targets.find((target) =>
    typeof target.url === 'string' && /^chrome-extension:\/\/[^/]+\/newtab\.html/.test(target.url),
  );
  if (extensionTarget) {
    const extensionPage = context.pages().find((candidate) => candidate.url() === extensionTarget.url);
    if (extensionPage) return extensionPage;
  }

  throw new Error(`New tab override did not load. Current page URL: ${page.url()}`);
}

async function createDemoWindows(page) {
  await page.evaluate(async (sets) => {
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const waitForTabReady = (tabId, timeout = 8000) =>
      new Promise((resolve) => {
        const startedAt = Date.now();
        const tick = () => {
          chrome.tabs.get(tabId, (tab) => {
            const err = chrome.runtime.lastError;
            if (err || !tab) {
              resolve();
              return;
            }

            const hasCommittedUrl = !!tab.url && /^https?:\/\//.test(tab.url);
            const hasIdentity = !!tab.title || !!tab.favIconUrl;
            if ((tab.status === 'complete' && hasCommittedUrl) || (hasCommittedUrl && hasIdentity)) {
              resolve();
              return;
            }

            if (Date.now() - startedAt > timeout) {
              resolve();
              return;
            }

            setTimeout(tick, 250);
          });
        };
        tick();
      });
    const createWindow = (url, index) =>
      new Promise((resolve, reject) => {
        chrome.windows.create(
          {
            url,
            focused: index === 0,
            width: 1200,
            height: 820,
          },
          (window) => {
            const err = chrome.runtime.lastError;
            if (err) reject(new Error(err.message));
            else resolve(window);
          },
        );
      });
    const createTab = (windowId, url) =>
      new Promise((resolve, reject) => {
        chrome.tabs.create({ windowId, url, active: true }, (tab) => {
          const err = chrome.runtime.lastError;
          if (err) reject(new Error(err.message));
          else resolve(tab);
        });
      });
    const removeBlankTabs = () =>
      new Promise((resolve) => {
        chrome.tabs.getCurrent((currentTab) => {
          const currentTabId = currentTab?.id;
          chrome.tabs.query({}, (tabs) => {
            const blankIds = tabs
              .filter((tab) => tab.id !== currentTabId)
              .filter((tab) =>
                tab.url === 'about:blank' ||
                tab.url === 'chrome://newtab/' ||
                tab.url === 'chrome://new-tab-page/'
              )
              .map((tab) => tab.id)
              .filter((id) => typeof id === 'number');

            if (!blankIds.length) {
              resolve();
              return;
            }

            chrome.tabs.remove(blankIds, () => resolve());
          });
        });
      });

    for (let index = 0; index < sets.length; index += 1) {
      const [firstUrl, ...restUrls] = sets[index];
      const window = await createWindow(firstUrl, index);
      if (window.tabs?.[0]?.id) {
        await waitForTabReady(window.tabs[0].id, 10000);
      }
      for (const url of restUrls) {
        const tab = await createTab(window.id, url);
        if (tab.id) {
          await waitForTabReady(tab.id, 10000);
        }
        await wait(350);
      }
    }

    await removeBlankTabs();
  }, tabSets);
}

async function waitForUsableTabs(page, expectedCount) {
  await page.waitForFunction(
    (count) =>
      new Promise((resolve) => {
        chrome.tabs.query({}, (tabs) => {
          const usableTabs = tabs.filter((tab) =>
            tab.url &&
            tab.url !== 'about:blank' &&
            tab.url !== 'chrome://newtab/' &&
            tab.url !== 'chrome://new-tab-page/' &&
            !tab.url.startsWith('chrome-extension://')
          );
          resolve(usableTabs.length >= count);
        });
      }),
    expectedCount,
    { timeout: 45000, polling: 500 },
  );
}

async function waitForRealTabAssets(page, expectedCount) {
  await page.waitForFunction(
    (count) =>
      new Promise((resolve) => {
        chrome.tabs.query({}, (tabs) => {
          const realTabs = tabs.filter((tab) =>
            tab.url &&
            /^https?:\/\//.test(tab.url) &&
            !tab.url.startsWith('chrome-extension://')
          );
          const readyTabs = realTabs.filter((tab) => tab.status === 'complete' || tab.title);
          const faviconTabs = realTabs.filter((tab) => !!tab.favIconUrl);
          resolve(realTabs.length >= count && readyTabs.length >= Math.min(count, 42) && faviconTabs.length >= 30);
        });
      }),
    expectedCount,
    { timeout: 90000, polling: 1000 },
  ).catch(async () => {
    const stats = await page.evaluate(
      () =>
        new Promise((resolve) => {
          chrome.tabs.query({}, (tabs) => {
            const realTabs = tabs.filter((tab) => tab.url && /^https?:\/\//.test(tab.url));
            resolve({
              real: realTabs.length,
              complete: realTabs.filter((tab) => tab.status === 'complete').length,
              favicon: realTabs.filter((tab) => !!tab.favIconUrl).length,
            });
          });
        }),
    );
    console.warn('Continuing after waiting for real tab assets:', stats);
  });
}

async function warmRealTabs(page) {
  await page.evaluate(async () => {
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const queryTabs = () =>
      new Promise((resolve) => {
        chrome.tabs.query({}, (tabs) => resolve(tabs));
      });
    const activateTab = (tab) =>
      new Promise((resolve) => {
        chrome.windows.update(tab.windowId, { focused: true }, () => {
          chrome.tabs.update(tab.id, { active: true }, () => resolve());
        });
      });

    const tabs = (await queryTabs())
      .filter((tab) => tab.id && tab.url && /^https?:\/\//.test(tab.url))
      .slice(0, 50);

    for (const tab of tabs) {
      await activateTab(tab);
      await wait(900);
    }
  });
}

async function screenshot(page, name) {
  await page.screenshot({
    path: path.join(outputDir, `${name}.png`),
    fullPage: false,
  });
}

async function setAccent(page, accentColor, extraSettings = {}) {
  await page.evaluate(
    ({ key, settings }) =>
      new Promise((resolve) => {
        chrome.storage.local.set({ [key]: settings }, resolve);
      }),
    {
      key: settingsKey,
      settings: {
        ...baseSettings,
        ...extraSettings,
        defaultAccentColor: accentColor,
      },
    },
  );
  await page.reload();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
}

async function clickView(page, label) {
  await page.getByRole('tab', { name: new RegExp(label) }).click();
  await page.waitForTimeout(650);
}

async function revealFloatingControls(page) {
  await page.locator('.group.fixed.bottom-4.right-5').hover({ force: true });
  await page.waitForTimeout(250);
}

async function main() {
  let chrome = null;
  let browser = null;
  let context;

  if (useExternalCdp) {
    chrome = await launchChromeForCdp();
    browser = await chromium.connectOverCDP(`http://127.0.0.1:${cdpPort}`);
    context = browser.contexts()[0];
  } else {
    await fs.rm(profileDir, { recursive: true, force: true });
    await fs.mkdir(outputDir, { recursive: true });
    context = await chromium.launchPersistentContext(profileDir, {
      headless: false,
      viewport,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        '--no-first-run',
        '--no-default-browser-check',
      ],
    });
  }

  try {
    const page = await resolveExtensionPage(context);
    await page.setViewportSize(viewport);
    await createDemoWindows(page);
    await waitForUsableTabs(page, 50);
    await page.waitForTimeout(12000);
    await warmRealTabs(page);
    await page.waitForTimeout(8000);
    await waitForRealTabAssets(page, 50);
    await page.bringToFront();
    await setAccent(page, shotAccents.overview);

    await screenshot(page, '01-all-tabs-overview-50-tabs');

    await setAccent(page, shotAccents.search);
    await page.getByPlaceholder('搜索标签...').fill('github');
    await page.waitForTimeout(450);
    await screenshot(page, '02-search-open-tabs-github');
    await page.getByPlaceholder('搜索标签...').fill('');
    await page.waitForTimeout(300);

    await setAccent(page, shotAccents.domain);
    await clickView(page, '域名');
    await screenshot(page, '03-domain-groups');

    await setAccent(page, shotAccents.window);
    await clickView(page, '窗口');
    await screenshot(page, '04-window-groups');

    await setAccent(page, shotAccents.duplicate);
    await clickView(page, '重复');
    await screenshot(page, '05-duplicate-cleanup');

    await setAccent(page, shotAccents.settings);
    await clickView(page, '重复');
    await revealFloatingControls(page);
    await page.locator('[title="设置"]').click();
    await page.waitForTimeout(650);
    await screenshot(page, '06-settings-protection-theme');

    await page.getByRole('button', { name: 'Close' }).click();
    await page.waitForTimeout(600);
    await setAccent(page, shotAccents.palette);
    await page.locator('button[title="选择点缀色"], button[title="Choose accent color"]').click();
    await page.waitForTimeout(550);
    await screenshot(page, '07-accent-palette');

    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    await setAccent(page, shotAccents.webSearch);
    await page.locator('[title="切换搜索模式"]').click();
    await page.waitForTimeout(450);
    await page.getByPlaceholder('网络搜索...').fill('tab garden browser extension');
    await page.waitForTimeout(450);
    await screenshot(page, '08-web-search-mode');
  } finally {
    if (browser) {
      await browser.close();
    } else {
      await context.close();
    }
    chrome?.kill('SIGTERM');
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
