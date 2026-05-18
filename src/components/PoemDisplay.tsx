import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowLeft, Copy, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

import { DEFAULT_POEM, loadPoem, type PoemLine } from '../lib/jinrishici';
import { cn } from '../lib/cn';
import { queryDefaultSearchProvider } from '../lib/defaultSearch';
import { useCopy, useSettingsContext } from '../lib/appContext';

interface PoemDisplayProps {
  show: boolean;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
}

function getPoemCredit(poem: PoemLine, showDynasty: boolean) {
  const author = poem.origin?.author;

  if (showDynasty && poem.origin?.dynasty && author) {
    return `${poem.origin.dynasty} · ${author}`;
  }

  return author || poem.origin?.title || DEFAULT_POEM.origin?.author || '';
}

function getPoemLines(poem: PoemLine) {
  const originContent = poem.origin?.content?.filter((line) => line.trim());
  return originContent?.length ? originContent : [poem.content];
}

function formatPoemText(poem: PoemLine, lines: string[], showDynasty: boolean) {
  const title = poem.origin?.title;
  const credit = getPoemCredit(poem, showDynasty);
  return [title, credit, ...lines].filter(Boolean).join('\n');
}

function getPoemSearchQuery(poem: PoemLine) {
  return [poem.origin?.title, poem.origin?.author, poem.content].filter(Boolean).join(' ');
}

const TEXT_WIDTH_TOLERANCE = 24;
const HEAD_TRAIL_GAP = 16;
const POEM_LIFT_DELAY = 120;
const HEAD_RESET_DELAY = 360;
const HEAD_MAX_WIDTH_CLASS = 'max-w-[min(92vw,1080px)]';
const POEM_ACTION_GROUP_CLASS = 'inline-flex items-center gap-0.5 rounded-lg bg-black/[0.045] p-0.5 dark:bg-white/[0.07]';
const POEM_ACTION_BUTTON_CLASS =
  'flex size-7 items-center justify-center rounded-md border-0 bg-transparent p-0 text-black/35 opacity-70 transition-[background,opacity,transform] duration-100 ease-in cursor-pointer hover:scale-105 hover:bg-black/[0.045] hover:text-black/55 hover:opacity-100 active:scale-95 focus-visible:rounded-full focus-visible:outline-2 focus-visible:outline-offset-[5px] focus-visible:outline-black/20 dark:text-white/40 dark:hover:bg-white/[0.08] dark:hover:text-white/65 dark:focus-visible:outline-white/25';

export function PoemDisplay({ show, expanded, onExpandedChange }: PoemDisplayProps) {
  const copy = useCopy();
  const { settings } = useSettingsContext();
  const poemCopy = copy.poem;
  const [poem, setPoem] = useState<PoemLine>(DEFAULT_POEM);
  const [showExpandedHead, setShowExpandedHead] = useState(false);
  const [poemLifted, setPoemLifted] = useState(false);
  const collapsedTextMeasureRef = useRef<HTMLSpanElement>(null);
  const expandedTextMeasureRef = useRef<HTMLSpanElement>(null);
  const titleViewportRef = useRef<HTMLSpanElement>(null);
  const [textWidths, setTextWidths] = useState({ collapsed: 0, expanded: 0 });
  const [titleViewportWidth, setTitleViewportWidth] = useState(0);
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

  useEffect(() => {
    if (poemLifted) return;

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }, [poemLifted]);

  useLayoutEffect(() => {
    let frame = 0;
    let cancelled = false;

    const updateTextWidths = () => {
      const nextWidths = {
        collapsed: Math.ceil((collapsedTextMeasureRef.current?.offsetWidth ?? 0) + TEXT_WIDTH_TOLERANCE),
        expanded: Math.ceil((expandedTextMeasureRef.current?.offsetWidth ?? 0) + TEXT_WIDTH_TOLERANCE),
      };

      setTextWidths((currentWidths) => {
        if (currentWidths.collapsed === nextWidths.collapsed && currentWidths.expanded === nextWidths.expanded) {
          return currentWidths;
        }

        return nextWidths;
      });
    };

    frame = window.requestAnimationFrame(updateTextWidths);

    void document.fonts?.ready.then(() => {
      if (!cancelled) updateTextWidths();
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
    };
  }, [poem.content, title]);

  useLayoutEffect(() => {
    const viewport = titleViewportRef.current;
    if (!viewport) return;

    const updateViewportWidth = () => {
      setTitleViewportWidth((currentWidth) => {
        const nextWidth = Math.floor(viewport.clientWidth);
        return currentWidth === nextWidth ? currentWidth : nextWidth;
      });
    };

    updateViewportWidth();

    const resizeObserver = new ResizeObserver(updateViewportWidth);
    resizeObserver.observe(viewport);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  if (!show) return null;

  const credit = getPoemCredit(poem, settings.showPoemDynasty);
  const poemLines = getPoemLines(poem);
  const visibleHead = showExpandedHead ? 'expanded' : 'collapsed';
  const textWidth = textWidths[visibleHead] || 'auto';
  const trailX = (textWidths[visibleHead] || 0) / 2 + HEAD_TRAIL_GAP;
  const longestHeadWidth = Math.max(textWidths.collapsed, textWidths.expanded);
  const compactThreshold = titleViewportWidth > 0 ? titleViewportWidth - 12 : 0;
  const extraCompactThreshold = titleViewportWidth > 0 ? titleViewportWidth - 96 : 0;
  const headSizeClass =
    titleViewportWidth > 0 && longestHeadWidth > compactThreshold
      ? longestHeadWidth > extraCompactThreshold
        ? 'text-[24px] max-[720px]:text-[22px]'
        : 'text-[26px] max-[720px]:text-[24px]'
      : null;

  const handleCopyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast(poemCopy.copied);
    } catch {
      toast(poemCopy.copyFailed);
    }
  };

  const handleCopyPoem = async () => {
    await handleCopyText(formatPoemText(poem, poemLines, settings.showPoemDynasty));
  };

  const handleSearchPoem = () => {
    void queryDefaultSearchProvider(getPoemSearchQuery(poem));
  };

  return (
    <motion.div
      className={cn(
        'group/poem absolute left-[50vw] top-[calc(100%-54px)] z-10 flex w-[min(1080px,calc(100vw-48px))] flex-col items-center justify-center gap-0 bg-transparent p-0 text-center font-ornament-1 text-[30px] leading-relaxed tracking-[0.08em] text-[rgb(17,17,17)] opacity-80 transition-[color,opacity] duration-300 ease-in animate-[poem-fade-in_1s_ease-in] dark:text-white max-[720px]:px-4',
        headSizeClass,
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
      <span className="group/title relative flex min-h-[1.5em] w-full max-w-full items-center justify-center">
        <button
          type="button"
          className="inline-flex min-w-0 items-center justify-center border-0 bg-transparent p-0 text-center [font:inherit] [letter-spacing:inherit] text-inherit outline-none cursor-pointer focus-visible:rounded-full focus-visible:outline-2 focus-visible:outline-offset-[5px] focus-visible:outline-[color-mix(in_srgb,var(--accent,#8fbfaf)_70%,transparent)]"
          aria-label={expanded ? `收起诗文：${title || poem.content}` : `展开诗文：${poem.content}`}
          title={expanded ? '收起诗文' : '展开诗文'}
          onClick={() => onExpandedChange(!expanded)}
        >
          <span
            ref={titleViewportRef}
            className={cn('relative inline-flex min-w-0 items-center justify-center', HEAD_MAX_WIDTH_CLASS)}
          >
            <motion.span
              className="relative inline-grid min-w-0 max-w-full place-items-center overflow-hidden"
              animate={{ width: textWidth }}
              transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.span
                className="col-start-1 row-start-1 inline-block max-w-full overflow-hidden text-ellipsis whitespace-nowrap"
                aria-hidden="true"
                animate={{
                  opacity: showExpandedHead ? 0 : 1,
                  x: showExpandedHead ? -14 : 0,
                }}
                transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
              >
                {poem.content}
              </motion.span>
              <motion.span
                className="col-start-1 row-start-1 inline-block max-w-full overflow-hidden text-ellipsis whitespace-nowrap"
                aria-hidden="true"
                animate={{
                  opacity: showExpandedHead ? 1 : 0,
                  x: showExpandedHead ? 0 : 14,
                }}
                transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
              >
                {title || poem.content}
              </motion.span>
            </motion.span>

          </span>
        </button>
        <motion.span
          className="absolute left-1/2 top-0 inline-flex h-full items-center gap-2"
          aria-hidden={!credit && !poemLifted}
          animate={{
            x: trailX,
            y: 0,
          }}
          transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
        >
          {credit && (
            <motion.span
              className="pointer-events-none whitespace-nowrap rounded-[4px] bg-[#c20000] py-[0.34em] pr-[0.46em] pl-[0.38em] font-ornament-1 text-[12px] leading-none tracking-[-0.08em] text-white/96 shadow-[0_10px_24px_rgba(194,0,0,0.18)] max-[720px]:text-[11px]"
              animate={{
                opacity: 1,
                scale: showExpandedHead ? 1 : 0.92,
              }}
              transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
            >
              {credit}
            </motion.span>
          )}
          <span
            className={cn(
              'inline-flex items-center opacity-0 transition-opacity duration-150 ease-in pointer-events-none focus-within:pointer-events-auto focus-within:opacity-100',
              poemLifted && 'group-hover/poem:pointer-events-auto group-hover/poem:opacity-100',
            )}
            aria-hidden={!poemLifted}
          >
            <span className={POEM_ACTION_GROUP_CLASS}>
              <button
                type="button"
                className={POEM_ACTION_BUTTON_CLASS}
                title={poemCopy.back}
                aria-label={poemCopy.back}
                tabIndex={poemLifted ? 0 : -1}
                onClick={(event) => {
                  event.stopPropagation();
                  onExpandedChange(false);
                }}
              >
                <ArrowLeft size={15} strokeWidth={1.9} />
              </button>
            </span>
          </span>
          <span
            className={cn(
              'ml-1.5 inline-flex items-center opacity-0 transition-opacity duration-150 ease-in pointer-events-none focus-within:pointer-events-auto focus-within:opacity-100',
              poemLifted && 'group-hover/title:pointer-events-auto group-hover/title:opacity-100',
            )}
            aria-hidden={!poemLifted}
          >
            <span className={POEM_ACTION_GROUP_CLASS}>
              <button
                type="button"
                className={POEM_ACTION_BUTTON_CLASS}
                title={poemCopy.copyText}
                aria-label={poemCopy.copyText}
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
                className={POEM_ACTION_BUTTON_CLASS}
                title={poemCopy.webSearch}
                aria-label={poemCopy.webSearch}
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
        </motion.span>
      </span>

      <span className="pointer-events-none absolute opacity-0">
        <span ref={collapsedTextMeasureRef} className="inline-block whitespace-nowrap [font:inherit]">
          {poem.content}
        </span>
        <span ref={expandedTextMeasureRef} className="inline-block whitespace-nowrap [font:inherit]">
          {title || poem.content}
        </span>
      </span>

      <motion.div
        className={cn(
          'box-border flex w-full flex-col gap-[0.18em] overflow-hidden px-[clamp(16px,4vw,48px)] [scrollbar-width:none] [text-shadow:0_1px_18px_rgba(255,255,255,0.42)] transition-[margin,padding] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none [&::-webkit-scrollbar]:hidden [&>span]:block dark:[text-shadow:0_1px_18px_rgba(0,0,0,0.36)]',
          expanded && 'mt-[0.72em] cursor-pointer overflow-y-auto pb-[clamp(18px,3vw,34px)] pointer-events-auto max-[720px]:mt-[0.56em]',
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
          <span key={`${line}-${index}`} className="group/poem-line">
            <span className="relative inline-block">
              <span>{line}</span>
              <span className="pointer-events-none absolute top-1/2 left-full -translate-y-1/2 pl-1.5">
                <span
                  className={cn(
                    POEM_ACTION_GROUP_CLASS,
                    'opacity-0 transition-opacity duration-100 ease-in pointer-events-none group-hover/poem-line:pointer-events-auto group-hover/poem-line:opacity-100 focus-within:pointer-events-auto focus-within:opacity-100',
                  )}
                >
                  <button
                    type="button"
                    className={POEM_ACTION_BUTTON_CLASS}
                    title={poemCopy.copyText}
                    aria-label={poemCopy.copyText}
                    tabIndex={poemLifted ? 0 : -1}
                    onClick={(event) => {
                      event.stopPropagation();
                      void handleCopyText(line);
                    }}
                  >
                    <Copy size={15} strokeWidth={1.9} />
                  </button>
                </span>
              </span>
            </span>
          </span>
        ))}
      </motion.div>
    </motion.div>
  );
}
