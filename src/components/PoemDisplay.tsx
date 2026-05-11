import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

import { DEFAULT_POEM, loadPoem, type PoemLine } from '../lib/jinrishici';
import { cn } from '../lib/cn';

interface PoemDisplayProps {
  show: boolean;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
}

function getPoemCredit(poem: PoemLine) {
  const parts = [poem.origin?.dynasty, poem.origin?.author].filter(Boolean);
  return parts.join(' · ') || poem.origin?.title || DEFAULT_POEM.origin?.author || '';
}

function getPoemLines(poem: PoemLine) {
  const originContent = poem.origin?.content?.filter((line) => line.trim());
  return originContent?.length ? originContent : [poem.content];
}

const TITLE_WIDTH_TOLERANCE = 48;
const POEM_LIFT_DELAY = 120;
const HEAD_RESET_DELAY = 360;

export function PoemDisplay({ show, expanded, onExpandedChange }: PoemDisplayProps) {
  const [poem, setPoem] = useState<PoemLine>(DEFAULT_POEM);
  const [showExpandedHead, setShowExpandedHead] = useState(false);
  const [poemLifted, setPoemLifted] = useState(false);
  const collapsedTitleRef = useRef<HTMLSpanElement>(null);
  const expandedTitleRef = useRef<HTMLSpanElement>(null);
  const [titleWidths, setTitleWidths] = useState({ collapsed: 0, expanded: 0 });
  const title = poem.origin?.title;

  useEffect(() => {
    if (!show) return;

    let cancelled = false;

    loadPoem()
      .then((nextPoem) => {
        if (!cancelled) {
          setPoem(nextPoem);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPoem(DEFAULT_POEM);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [show]);

  useEffect(() => {
    if (expanded) {
      setShowExpandedHead(true);
      const liftTimeout = window.setTimeout(() => setPoemLifted(true), POEM_LIFT_DELAY);
      return () => window.clearTimeout(liftTimeout);
    }

    setPoemLifted(false);
    const headTimeout = window.setTimeout(() => setShowExpandedHead(false), HEAD_RESET_DELAY);
    return () => window.clearTimeout(headTimeout);
  }, [expanded]);

  useLayoutEffect(() => {
    let frame = 0;
    let cancelled = false;

    const updateTitleWidths = () => {
      const nextWidths = {
        collapsed: Math.ceil((collapsedTitleRef.current?.offsetWidth ?? 0) + TITLE_WIDTH_TOLERANCE),
        expanded: Math.ceil((expandedTitleRef.current?.offsetWidth ?? 0) + TITLE_WIDTH_TOLERANCE),
      };

      setTitleWidths((currentWidths) => {
        if (currentWidths.collapsed === nextWidths.collapsed && currentWidths.expanded === nextWidths.expanded) {
          return currentWidths;
        }

        return nextWidths;
      });
    };

    frame = window.requestAnimationFrame(updateTitleWidths);

    void document.fonts?.ready.then(() => {
      if (!cancelled) updateTitleWidths();
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
    };
  }, [poem.content, title]);

  if (!show) return null;

  const credit = getPoemCredit(poem);
  const poemLines = getPoemLines(poem);
  const titleWidth = titleWidths[showExpandedHead ? 'expanded' : 'collapsed'] || 'auto';

  return (
    <motion.button
      type="button"
      className={cn(
        'bottom-poem font-ornament-1 z-10 w-[min(760px,calc(100vw-48px))] leading-relaxed tracking-[0.08em] max-[720px]:px-4',
        poemLifted && 'bottom-poem-expanded',
      )}
      aria-expanded={expanded}
      aria-label={expanded ? `收起诗文：${title || poem.content}` : `展开诗文：${poem.content}`}
      title={expanded ? '收起诗文' : '展开诗文'}
      onClick={() => onExpandedChange(!expanded)}
      initial={false}
      animate={{
        x: '-50%',
        y: poemLifted ? 'calc(-100vh + clamp(230px, 34vh, 330px))' : 0,
      }}
      transition={{ duration: 0.74, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="poem-head">
        <motion.span
          className="poem-title-stack"
          aria-hidden="true"
          animate={{ width: titleWidth }}
          transition={{ duration: 0 }}
        >
          <motion.span
            className="poem-title-layer"
            animate={{ opacity: showExpandedHead ? 0 : 1 }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          >
            {poem.content}
          </motion.span>
          <motion.span
            className="poem-title-layer"
            animate={{ opacity: showExpandedHead ? 1 : 0 }}
            transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
          >
            {title || poem.content}
          </motion.span>
          <span ref={collapsedTitleRef} className="poem-title-measure">
            {poem.content}
          </span>
          <span ref={expandedTitleRef} className="poem-title-measure">
            {title || poem.content}
          </span>
        </motion.span>
        {credit && (
          <motion.span
            className="poem-stamp font-ornament-1"
            animate={{ opacity: showExpandedHead ? 1 : 0.88 }}
            transition={{ duration: 0.74, ease: [0.22, 1, 0.36, 1] }}
          >
            {credit}
          </motion.span>
        )}
      </span>

      <motion.span
        className={cn('poem-body', expanded && 'poem-body-expanded')}
        aria-hidden={!poemLifted}
        animate={{
          opacity: poemLifted ? 1 : 0,
          y: poemLifted ? 0 : 96,
          filter: poemLifted ? 'blur(0px)' : 'blur(5px)',
          maxHeight: poemLifted ? 'calc(100vh - 360px)' : 0,
        }}
        transition={{ duration: 0.78, ease: [0.22, 1, 0.36, 1] }}
      >
        {poemLines.map((line, index) => (
          <span key={`${line}-${index}`}>{line}</span>
        ))}
      </motion.span>
    </motion.button>
  );
}
