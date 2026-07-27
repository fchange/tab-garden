import { useEffect, useLayoutEffect, useRef } from 'react';
import {
  animate,
  useMotionValue,
  type AnimationPlaybackControls,
  type MotionValue,
} from 'motion/react';

const DEFAULT_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export interface TokenDrivenMotionYOptions {
  /** When true, animate/snap to `getActiveY()`; when false, to 0. */
  active: boolean;
  /**
   * Target y in px while active. Called when `active` flips on, and on resize
   * while active (snap after stopping any in-flight tween). Must read live
   * CSS tokens / layout.
   */
  getActiveY: () => number;
  duration?: number;
  /** Applied only when becoming active (expand/lift). */
  enterDelay?: number;
  ease?: [number, number, number, number];
}

/**
 * Drive a Motion `y` value from CSS layout tokens without embedding `var()` in
 * animate strings (Motion leaves residual offsets like `calc(0 - var(--x))`).
 *
 * Contract:
 * - Token definitions in `styles.css` are the single source of truth.
 * - Timed animation runs only when `active` flips.
 * - Resize while active: stop any in-flight tween, then snap via `y.set`
 *   (otherwise the old animation would keep writing a stale target).
 * - Prefer `style={{ y }}` over `animate={{ y: 'calc(... var(--x))' }}`.
 */
export function useTokenDrivenMotionY({
  active,
  getActiveY,
  duration = 0.74,
  enterDelay = 0,
  ease = DEFAULT_EASE,
}: TokenDrivenMotionYOptions): MotionValue<number> {
  const y = useMotionValue(0);
  const getActiveYRef = useRef(getActiveY);
  getActiveYRef.current = getActiveY;
  const didInitRef = useRef(false);
  const controlsRef = useRef<AnimationPlaybackControls | null>(null);

  const stopInFlight = () => {
    controlsRef.current?.stop();
    controlsRef.current = null;
  };

  useLayoutEffect(() => {
    if (!didInitRef.current) {
      didInitRef.current = true;
      // Honor default-expanded without a false 0 → target tween on first paint.
      y.set(active ? getActiveYRef.current() : 0);
      return;
    }

    stopInFlight();
    const controls = animate(y, active ? getActiveYRef.current() : 0, {
      duration,
      delay: active ? enterDelay : 0,
      ease,
    });
    controlsRef.current = controls;
    return () => {
      controls.stop();
      if (controlsRef.current === controls) {
        controlsRef.current = null;
      }
    };
  }, [active, duration, enterDelay, ease, y]);

  useEffect(() => {
    if (!active) return;

    const snap = () => {
      // Must stop first: otherwise the enter tween keeps writing the old target.
      stopInFlight();
      y.set(getActiveYRef.current());
    };
    window.addEventListener('resize', snap);
    return () => window.removeEventListener('resize', snap);
  }, [active, y]);

  return y;
}
