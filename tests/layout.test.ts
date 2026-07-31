import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { calculateCollisionSafeHeight } from '../src/lib/layout.ts';

describe('calculateCollisionSafeHeight', () => {
  it('shrinks the viewport enough to clear the poem and safe gap', () => {
    assert.equal(
      calculateCollisionSafeHeight({
        configuredMaxHeight: 451,
        minimumHeight: 120,
        panelBottomInset: 21,
        poemTop: 703,
        safeGap: 20,
        viewportTop: 239.5,
      }),
      422.5,
    );
  });

  it('keeps the configured cap when there is already enough room', () => {
    assert.equal(
      calculateCollisionSafeHeight({
        configuredMaxHeight: 451,
        minimumHeight: 120,
        panelBottomInset: 21,
        poemTop: 900,
        safeGap: 20,
        viewportTop: 239.5,
      }),
      451,
    );
  });

  it('keeps a usable minimum in extremely short windows', () => {
    assert.equal(
      calculateCollisionSafeHeight({
        configuredMaxHeight: 80,
        minimumHeight: 120,
        panelBottomInset: 21,
        poemTop: 250,
        safeGap: 20,
        viewportTop: 200,
      }),
      120,
    );
  });
});
