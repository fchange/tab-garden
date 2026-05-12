import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowLeft, Copy, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

import { DEFAULT_POEM, loadPoem, type PoemLine } from '../lib/jinrishici';
import { cn } from '../lib/cn';
import { queryDefaultSearchProvider } from '../lib/defaultSearch';
import type { AppCopy } from '../lib/i18n';

interface PoemDisplayProps {
  show: boolean;
  expanded: boolean;
  copy: AppCopy['poem'];
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

function formatPoemText(poem: PoemLine, lines: string[]) {
  const title = poem.origin?.title;
  const credit = getPoemCredit(poem);
  return [title, credit, ...lines].filter(Boolean).join('\n');
}

function getPoemSearchQuery(poem: PoemLine) {
  return [poem.origin?.title, poem.origin?.author, poem.content].filter(Boolean).join(' ');
}

const TITLE_WIDTH_TOLERANCE = 48;
const POEM_LIFT_DELAY = 120;
const HEAD_RESET_DELAY = 360;

export function PoemDisplay({ show, expanded, copy, onExpandedChange }: PoemDisplayProps) {
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

  const handleCopyPoem = async () => {
    try {
      await navigator.clipboard.writeText(formatPoemText(poem, poemLines));
      toast(copy.copied);
    } catch {
      toast(copy.copyFailed);
    }
  };

  const handleSearchPoem = () => {
    void queryDefaultSearchProvider(getPoemSearchQuery(poem));
  };

  return (
    <motion.div
      className={cn(
        'group/poem absolute left-[50vw] top-[calc(100%-54px)] z-10 flex w-[min(760px,calc(100vw-48px))] flex-col items-center justify-center gap-0 bg-transparent p-0 text-center font-ornament-1 text-[30px] leading-relaxed tracking-[0.08em] text-[rgb(17,17,17)] opacity-80 transition-[color,opacity] duration-300 ease-in animate-[poem-fade-in_1s_ease-in] dark:text-white max-[720px]:px-4',
        poemLifted && 'opacity-[0.92]',
      )}
      aria-expanded={expanded}
      initial={false}
      animate={{
        x: '-50%',
        y: poemLifted ? 'calc(-100vh + clamp(230px, 34vh, 330px))' : 0,
      }}
      transition={{ duration: 0.74, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="flex min-h-[1.5em] w-full max-w-full flex-wrap items-center justify-center gap-x-2.5 gap-y-0">
        <button
          type="button"
          className="inline-flex min-w-0 flex-wrap items-center justify-center gap-x-[0.55em] gap-y-0 border-0 bg-transparent p-0 text-center [font:inherit] [letter-spacing:inherit] text-inherit outline-none cursor-pointer focus-visible:rounded-full focus-visible:outline-2 focus-visible:outline-offset-[5px] focus-visible:outline-[color-mix(in_srgb,var(--accent,#8fbfaf)_70%,transparent)]"
          aria-label={expanded ? `收起诗文：${title || poem.content}` : `展开诗文：${poem.content}`}
          title={expanded ? '收起诗文' : '展开诗文'}
          onClick={() => onExpandedChange(!expanded)}
        >
          <motion.span
            className="relative inline-grid min-w-0 max-w-[calc(100%-4.5em)] flex-[0_1_auto] place-items-center overflow-hidden"
            aria-hidden="true"
            animate={{ width: titleWidth }}
            transition={{ duration: 0 }}
          >
            <motion.span
              className="col-start-1 row-start-1 inline-block max-w-full overflow-hidden text-ellipsis whitespace-nowrap"
              animate={{ opacity: showExpandedHead ? 0 : 1 }}
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            >
              {poem.content}
            </motion.span>
            <motion.span
              className="col-start-1 row-start-1 inline-block max-w-full overflow-hidden text-ellipsis whitespace-nowrap"
              animate={{ opacity: showExpandedHead ? 1 : 0 }}
              transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
            >
              {title || poem.content}
            </motion.span>
            <span ref={collapsedTitleRef} className="pointer-events-none absolute col-start-1 row-start-1 whitespace-nowrap opacity-0 [font:inherit]">
              {poem.content}
            </span>
            <span ref={expandedTitleRef} className="pointer-events-none absolute col-start-1 row-start-1 whitespace-nowrap opacity-0 [font:inherit]">
              {title || poem.content}
            </span>
          </motion.span>
          {credit && (
            <motion.span
              className="rounded-[3px] bg-[#c20000] py-1 pr-[5px] pl-1 font-ornament-1 text-[13px] leading-none tracking-[-1px] text-white"
              animate={{ opacity: showExpandedHead ? 1 : 0.88 }}
              transition={{ duration: 0.74, ease: [0.22, 1, 0.36, 1] }}
            >
              {credit}
            </motion.span>
          )}
        </button>
        <span
          className={cn(
            'inline-flex flex-[0_0_auto] -translate-x-1 items-center gap-0.5 rounded-lg bg-black/[0.045] p-0.5 opacity-0 transition-[opacity,transform] duration-150 ease-in pointer-events-none focus-within:pointer-events-auto focus-within:translate-x-0 focus-within:opacity-100 dark:bg-white/[0.07]',
            poemLifted && 'group-hover/poem:pointer-events-auto group-hover/poem:translate-x-0 group-hover/poem:opacity-100',
          )}
          aria-hidden={!poemLifted}
        >
          <button
            type="button"
            className="flex size-7 items-center justify-center rounded-md border-0 bg-transparent p-0 text-black/35 opacity-70 transition-[background,opacity,transform] duration-100 ease-in cursor-pointer hover:scale-105 hover:bg-black/[0.045] hover:text-black/55 hover:opacity-100 active:scale-95 focus-visible:rounded-full focus-visible:outline-2 focus-visible:outline-offset-[5px] focus-visible:outline-black/20 dark:text-white/40 dark:hover:bg-white/[0.08] dark:hover:text-white/65 dark:focus-visible:outline-white/25"
            title={copy.back}
            aria-label={copy.back}
            tabIndex={poemLifted ? 0 : -1}
            onClick={(event) => {
              event.stopPropagation();
              onExpandedChange(false);
            }}
          >
            <ArrowLeft size={15} strokeWidth={1.9} />
          </button>
          <button
            type="button"
            className="flex size-7 items-center justify-center rounded-md border-0 bg-transparent p-0 text-black/35 opacity-70 transition-[background,opacity,transform] duration-100 ease-in cursor-pointer hover:scale-105 hover:bg-black/[0.045] hover:text-black/55 hover:opacity-100 active:scale-95 focus-visible:rounded-full focus-visible:outline-2 focus-visible:outline-offset-[5px] focus-visible:outline-black/20 dark:text-white/40 dark:hover:bg-white/[0.08] dark:hover:text-white/65 dark:focus-visible:outline-white/25"
            title={copy.copyText}
            aria-label={copy.copyText}
            tabIndex={poemLifted ? 0 : -1}
            onClick={(event) => {
              event.stopPropagation();
              void handleCopyPoem();
            }}
          >
            <Copy size={15} strokeWidth={1.9} />
          </button>
          <button
            type="button"
            className="flex size-7 items-center justify-center rounded-md border-0 bg-transparent p-0 text-black/35 opacity-70 transition-[background,opacity,transform] duration-100 ease-in cursor-pointer hover:scale-105 hover:bg-black/[0.045] hover:text-black/55 hover:opacity-100 active:scale-95 focus-visible:rounded-full focus-visible:outline-2 focus-visible:outline-offset-[5px] focus-visible:outline-black/20 dark:text-white/40 dark:hover:bg-white/[0.08] dark:hover:text-white/65 dark:focus-visible:outline-white/25"
            title={copy.webSearch}
            aria-label={copy.webSearch}
            tabIndex={poemLifted ? 0 : -1}
            onClick={(event) => {
              event.stopPropagation();
              handleSearchPoem();
            }}
          >
            <Search size={15} strokeWidth={1.9} />
          </button>
        </span>
      </span>

      <motion.div
        className={cn(
          'box-border flex w-full flex-col gap-[0.18em] overflow-hidden px-[clamp(16px,4vw,48px)] [scrollbar-width:none] [text-shadow:0_1px_18px_rgba(255,255,255,0.42)] transition-[padding] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none [&::-webkit-scrollbar]:hidden [&>span]:block dark:[text-shadow:0_1px_18px_rgba(0,0,0,0.36)]',
          expanded && 'cursor-pointer overflow-y-auto pb-[clamp(18px,3vw,34px)] pointer-events-auto',
        )}
        aria-hidden={!poemLifted}
        onClick={() => {
          if (poemLifted) onExpandedChange(false);
        }}
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
      </motion.div>
    </motion.div>
  );
}
