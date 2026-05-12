import type { ReactNode } from 'react';

import { useAccent, useCopy } from '../lib/appContext';
import { getViewOptions } from '../lib/i18n';
import type { ViewMode } from '../types/tab';
import type { BatchAction } from '../hooks/useTabActions';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent } from './ui/tabs';
import { ViewToggle } from './ViewToggle';

interface TabContentAreaProps {
  view: ViewMode;
  counts: Record<ViewMode, number>;
  batchAction: BatchAction | null;
  error?: string | null;
  children: ReactNode;
  onViewChange: (view: ViewMode) => void;
}

export function TabContentArea({
  view,
  counts,
  batchAction,
  error,
  children,
  onViewChange,
}: TabContentAreaProps) {
  const copy = useCopy();
  const { accentColor } = useAccent();
  const viewOptions = getViewOptions(copy);

  return (
    <Tabs
      value={view}
      onValueChange={(value) => onViewChange(value as ViewMode)}
      className="flex flex-col flex-1 min-h-0 min-w-0 mt-4 outline-none"
    >
      <div className="flex items-center justify-between">
        <ViewToggle
          value={view}
          onChange={onViewChange}
          accentColor={accentColor}
          options={viewOptions}
          counts={counts}
        />

        {batchAction && (
          <Button
            variant="destructive"
            size="sm"
            onClick={batchAction.action}
            className="gap-2"
          >
            {batchAction.label}
            <Badge variant="count" className="bg-[rgba(0,0,0,0.06)] dark:bg-[rgba(255,255,255,0.10)]">
              {batchAction.count}
            </Badge>
          </Button>
        )}
      </div>

      {error && (
        <p className="text-[#c0392b] text-[15px] py-2 opacity-80">{error}</p>
      )}

      <TabsContent key={view} value={view} className="min-w-0 mt-3">
        {children}
      </TabsContent>
    </Tabs>
  );
}
