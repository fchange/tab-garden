import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getBaseDomain, getChromeFaviconUrl, getDisplayUrl, getFaviconUrl, getSpecialPageType } from '../src/lib/url.ts';

describe('getSpecialPageType', () => {
  it('recognizes blank pages independently of query strings and fragments', () => {
    for (const url of ['about:blank', 'about:blank#section', 'about:blank?x=1', 'ABOUT:blank']) {
      assert.equal(getSpecialPageType(url), 'blank');
    }
  });

  it('classifies Chrome and Edge internal pages by their exact host', () => {
    for (const protocol of ['chrome', 'edge']) {
      assert.equal(getSpecialPageType(`${protocol}://newtab/`), 'new-tab');
      assert.equal(getSpecialPageType(`${protocol}://new-tab-page/`), 'new-tab');
      assert.equal(getSpecialPageType(`${protocol}://settings/privacy?search=cookies`), 'settings');
      assert.equal(getSpecialPageType(`${protocol}://extensions/?id=abc`), 'extensions');
      assert.equal(getSpecialPageType(`${protocol}://history/syncedTabs`), 'history');
      assert.equal(getSpecialPageType(`${protocol}://downloads/`), 'downloads');
      assert.equal(getSpecialPageType(`${protocol}://bookmarks/?id=1`), 'bookmarks');
      assert.equal(getSpecialPageType(`${protocol}://flags/`), 'internal');
      assert.equal(getSpecialPageType(`${protocol}://settings-other/`), 'internal');
    }
    assert.equal(getSpecialPageType('CHROME://SETTINGS/'), 'settings');
  });

  it('distinguishes extension pages and other about pages', () => {
    assert.equal(getSpecialPageType('chrome-extension://abcdef/options.html'), 'extension');
    assert.equal(getSpecialPageType('about:newtab'), 'new-tab');
    assert.equal(getSpecialPageType('about:home'), 'new-tab');
    assert.equal(getSpecialPageType('about:config'), 'internal');
  });

  it('does not replace icons for normal websites or malformed URLs', () => {
    for (const url of [
      'https://example.com/settings', 'https://chrome.example/',
      'https://example.com/?next=chrome://settings', 'file:///tmp/page.html',
      '', 'not a URL',
    ]) {
      assert.equal(getSpecialPageType(url), null);
    }
    assert.equal(getSpecialPageType(undefined), null);
  });
});

describe('getFaviconUrl', () => {
  it('preserves supplied icons for websites and third-party extensions', () => {
    const favicon = 'data:image/png;base64,example';
    assert.equal(getFaviconUrl('https://example.com/', favicon), favicon);
    assert.equal(getFaviconUrl('chrome-extension://abcdef/options.html', favicon), favicon);
  });
});

describe('getBaseDomain', () => {
  it('keeps the registrable domain for multi-part public suffixes', () => {
    assert.equal(getBaseDomain('https://www.google.com.hk/search?q=test'), 'google.com.hk');
    assert.equal(getBaseDomain('https://mail.google.co.uk/inbox'), 'google.co.uk');
  });

  it('keeps existing behavior for regular hostnames and local URLs', () => {
    assert.equal(getBaseDomain('https://docs.google.com/document/d/123'), 'google.com');
    assert.equal(getBaseDomain('https://localhost:3000/settings'), 'localhost');
    assert.equal(getBaseDomain('http://192.168.1.12:8080'), '192.168.1.12');
  });

  it('uses readable labels for browser internal pages', () => {
    assert.equal(getBaseDomain('chrome://extensions/'), 'chrome');
    assert.equal(getBaseDomain('edge://extensions/'), 'edge');
    assert.equal(getBaseDomain('chrome-extension://abcdef/options.html'), 'extension');
    assert.equal(getBaseDomain('about:blank'), 'Blank page');
    assert.equal(getBaseDomain('about:blank', '未命名页面', '空白页'), '空白页');
    assert.equal(getDisplayUrl('about:blank', '空白页'), '空白页');
    assert.equal(getDisplayUrl('chrome://extensions/', '空白页'), 'chrome://extensions/');
  });
});

describe('getChromeFaviconUrl', () => {
  it('stays empty outside an extension runtime', () => {
    assert.equal(getChromeFaviconUrl('https://example.com/page'), '');
  });

  it('builds Chrome extension favicon URLs when runtime support exists', () => {
    const originalChrome = globalThis.chrome;
    globalThis.chrome = {
      runtime: {
        getURL: (path: string) => `chrome-extension://extension-id${path}`,
      },
    } as typeof chrome;

    try {
      assert.equal(
        getChromeFaviconUrl('https://example.com/page?q=1', 48),
        'chrome-extension://extension-id/_favicon/?pageUrl=https%3A%2F%2Fexample.com%2Fpage%3Fq%3D1&size=48',
      );
      assert.equal(getChromeFaviconUrl('chrome://extensions/'), '');
    } finally {
      globalThis.chrome = originalChrome;
    }
  });
});
