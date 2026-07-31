interface CollisionSafeHeightInput {
  configuredMaxHeight: number;
  minimumHeight: number;
  panelBottomInset: number;
  poemTop: number;
  safeGap: number;
  viewportTop: number;
}

/** Keep a scroll viewport below its configured cap and above the docked poem. */
export function calculateCollisionSafeHeight({
  configuredMaxHeight,
  minimumHeight,
  panelBottomInset,
  poemTop,
  safeGap,
  viewportTop,
}: CollisionSafeHeightInput): number {
  const collisionMaxHeight =
    poemTop - viewportTop - panelBottomInset - safeGap;

  return Math.max(
    minimumHeight,
    Math.min(configuredMaxHeight, collisionMaxHeight),
  );
}
