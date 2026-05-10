import * as TabsPrimitive from '@radix-ui/react-tabs';
import { motion } from 'motion/react';
import { Badge } from './ui/badge';
import type { ViewMode } from '../types/tab';

interface ViewToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
  accentColor: string;
  options: Array<{ value: ViewMode; label: string }>;
  counts: Record<ViewMode, number>;
}

export function ViewToggle({ value, onChange, accentColor, options, counts }: ViewToggleProps) {
  return (
    <TabsPrimitive.List className="inline-flex gap-[2px] rounded-[22px] p-[3px] relative bg-[rgba(0,0,0,0.04)] dark:bg-[rgba(255,255,255,0.06)]">
      {options.map((opt) => (
        <TabsPrimitive.Trigger
          key={opt.value}
          value={opt.value}
          className="group/trigger relative flex items-center gap-1.5 px-4 py-[6px] rounded-[18px] border-none bg-transparent cursor-pointer outline-none text-[15px] font-medium transition-colors duration-200 text-[var(--text-muted,rgba(0,0,0,0.48))] hover:text-[var(--text-primary,rgba(0,0,0,0.7))] dark:text-[rgba(255,255,255,0.45)] dark:hover:text-[rgba(255,255,255,0.7)] data-[state=active]:text-white"
          onClick={() => onChange(opt.value)}
        >
          {value === opt.value && (
            <motion.span
              layoutId="vt-indicator"
              className="absolute inset-0 rounded-[18px] shadow-[0_1px_4px_rgba(0,0,0,0.10)]"
              style={{ background: accentColor }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            />
          )}
          <span className="relative z-[1] flex items-center gap-1.5">
            {opt.label}
            {counts[opt.value] > 0 && (
              <Badge variant="count" className="bg-[rgba(0,0,0,0.06)] dark:bg-[rgba(255,255,255,0.10)] group-data-[state=active]/trigger:bg-[rgba(255,255,255,0.20)]">
                {counts[opt.value]}
              </Badge>
            )}
          </span>
        </TabsPrimitive.Trigger>
      ))}
    </TabsPrimitive.List>
  );
}
