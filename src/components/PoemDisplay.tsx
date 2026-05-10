import { useEffect, useState } from 'react';

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

export function PoemDisplay({ show, expanded, onExpandedChange }: PoemDisplayProps) {
  const [poem, setPoem] = useState<PoemLine>(DEFAULT_POEM);

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

  if (!show) return null;

  const credit = getPoemCredit(poem);
  const poemLines = getPoemLines(poem);
  const title = poem.origin?.title;

  return (
    <button
      type="button"
      className={cn(
        'bottom-poem font-ornament-1 z-10 w-[min(760px,calc(100vw-48px))] leading-relaxed tracking-[0.08em] max-[720px]:px-4',
        expanded && 'bottom-poem-expanded',
      )}
      aria-expanded={expanded}
      title={expanded ? '收起诗文' : '展开诗文'}
      onClick={() => onExpandedChange(!expanded)}
    >
      <span className="poem-head">
        <span className="poem-head-text">{expanded ? title || poem.content : poem.content}</span>
        {credit && <span className="poem-stamp font-ornament-1">{credit}</span>}
      </span>

      {expanded && (
        <span className="poem-body">
          {poemLines.map((line, index) => (
            <span key={`${line}-${index}`}>{line}</span>
          ))}
        </span>
      )}
    </button>
  );
}
