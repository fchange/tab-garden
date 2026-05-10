import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getBaseDomain, getDisplayUrl } from '../src/lib/url.ts';

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
