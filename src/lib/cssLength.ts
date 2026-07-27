/**
 * Resolve a CSS length (px/rem/clamp/calc/var/…) to device pixels via a probe element.
 * Used so Motion can animate numeric `y` / `maxHeight` while layout tokens stay in CSS.
 */
export function resolveCssLength(length: string): number {
  if (typeof document === 'undefined') return 0;

  const probe = document.createElement('div');
  probe.style.cssText =
    `position:absolute;visibility:hidden;pointer-events:none;height:${length};width:0;margin:0;padding:0;border:0;`;
  document.documentElement.appendChild(probe);
  const px = probe.offsetHeight;
  probe.remove();
  return px;
}

/** Read a CSS custom property as pixels (e.g. `--poem-lift-inset`). */
export function readCssVarPx(varName: string): number {
  const name = varName.startsWith('--') ? varName : `--${varName}`;
  return resolveCssLength(`var(${name})`);
}
