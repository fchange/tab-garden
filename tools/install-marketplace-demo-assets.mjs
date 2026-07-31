import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const root = process.cwd();
const assetRoot = path.join(root, 'output', 'marketplace', 'demo-assets');
const fontRoot = path.join(assetRoot, 'fonts');
const faviconRoot = path.join(assetRoot, 'favicons');
const defaultProxy = 'http://127.0.0.1:7897';

const fontSources = [
  { id: '256', url: 'https://fontsapi.zeoseven.com/256/main/result.css' },
  { id: '437', url: 'https://fontsapi.zeoseven.com/437/main/result.css' },
  { id: '292', url: 'https://fontsapi.zeoseven.com/292/main/result.css' },
];

const faviconDomains = [
  'github.com',
  'playwright.dev',
  'developer.chrome.com',
  'developer.mozilla.org',
  'react.dev',
  'vite.dev',
  'docs.google.com',
  'calendar.google.com',
  'mail.google.com',
  'linear.app',
  'www.figma.com',
  'www.notion.so',
  'www.canva.com',
  'www.dropbox.com',
  'app.slack.com',
  'chatgpt.com',
  'claude.ai',
  'gemini.google.com',
  'www.perplexity.ai',
  'huggingface.co',
  'replicate.com',
  'www.kaggle.com',
  'paperswithcode.com',
  'arxiv.org',
  'www.youtube.com',
  'www.bilibili.com',
  'www.netflix.com',
  'open.spotify.com',
  'music.apple.com',
  'www.theverge.com',
  'www.wired.com',
  'www.nytimes.com',
  'www.bbc.com',
  'www.wikipedia.org',
  'www.amazon.com',
  'www.apple.com',
  'www.microsoft.com',
  'www.cloudflare.com',
  'vercel.com',
  'www.netlify.com',
  'www.producthunt.com',
  'news.ycombinator.com',
  'stackoverflow.com',
];

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

function safeAssetName(name, fallback) {
  const cleaned = name.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/^-+|-+$/g, '');
  return cleaned || fallback;
}

function faviconFilename(domain) {
  return `${safeAssetName(domain, 'site')}.png`;
}

async function downloadFontSource(source) {
  const outputDir = path.join(fontRoot, source.id);
  await fs.mkdir(outputDir, { recursive: true });

  const cssBuffer = await curl(source.url);
  const css = cssBuffer.toString('utf8');
  const seen = new Set();
  const fontFiles = {};
  let assetIndex = 0;

  const rewrittenCss = css.replace(/url\((["']?)([^"')]+)\1\)/g, (match, _quote, rawUrl) => {
    if (!rawUrl || rawUrl.startsWith('data:') || rawUrl.startsWith('#')) return match;

    const resolved = new URL(rawUrl, source.url);
    const basename = safeAssetName(path.basename(resolved.pathname), `font-${assetIndex}.woff2`);
    assetIndex += 1;

    if (!seen.has(resolved.toString())) {
      seen.add(resolved.toString());
      fontFiles[basename] = resolved.toString();
    }

    return `url("./${basename}")`;
  });

  await fs.writeFile(path.join(outputDir, 'result.css'), rewrittenCss);
  await fs.writeFile(path.join(outputDir, 'font-files.json'), `${JSON.stringify(fontFiles, null, 2)}\n`);

  return {
    id: source.id,
    css: path.relative(root, path.join(outputDir, 'result.css')),
    files: Object.keys(fontFiles).length,
  };
}

async function downloadFavicon(domain) {
  const url = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
  const filePath = path.join(faviconRoot, faviconFilename(domain));
  const image = await curl(url);
  await fs.writeFile(filePath, image);
  return path.relative(root, filePath);
}

async function main() {
  await fs.mkdir(fontRoot, { recursive: true });
  await fs.mkdir(faviconRoot, { recursive: true });

  const fontResults = [];
  for (const source of fontSources) {
    fontResults.push(await downloadFontSource(source));
  }

  const faviconResults = [];
  for (const domain of faviconDomains) {
    faviconResults.push(await downloadFavicon(domain));
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    proxy: process.env.all_proxy || process.env.ALL_PROXY || defaultProxy,
    fonts: fontResults,
    favicons: faviconResults,
  };

  await fs.writeFile(
    path.join(assetRoot, 'manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );

  console.log(`Installed ${fontResults.length} font CSS mirrors and ${faviconResults.length} favicons.`);
  console.log(path.relative(root, assetRoot));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
