import type { ReactNode } from 'react';
import { motion } from 'motion/react';

import { cn } from '../lib/cn';

interface MainPanelProps {
  accentColor: string;
  poemExpanded: boolean;
  children: ReactNode;
}

export function MainPanel({ accentColor, poemExpanded, children }: MainPanelProps) {
  return (
    <motion.div
      className={cn(
        'relative z-10 w-[min(980px,calc(100vw-48px))] mt-[clamp(28px,5vh,60px)] rounded-[20px] overflow-hidden bg-card/65 backdrop-blur-sm backdrop-saturate-150 border border-border/90 shadow-[var(--theme-shadow-soft)] transition-[background,border-color,box-shadow] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] max-[720px]:w-[calc(100vw-32px)] max-[720px]:mt-4',
        poemExpanded && 'pointer-events-none',
      )}
      animate={{
        y: poemExpanded ? 'calc(-100% - clamp(80px, 14vh, 150px))' : 0,
        scale: poemExpanded ? 0.52 : 1,
        opacity: 1,
      }}
      transition={{ duration: 0.74, delay: poemExpanded ? 0.12 : 0, ease: [0.22, 1, 0.36, 1] }}
      style={{ transformOrigin: 'top center' }}
    >
      <div className="h-[3px] w-full transition-[background] duration-500" style={{ background: accentColor }} />

      <div className="px-6 pt-5 pb-5 min-w-0 max-[720px]:p-4">
        {children}
      </div>
    </motion.div>
  );
}
