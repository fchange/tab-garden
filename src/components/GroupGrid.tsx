import type { AppCopy } from '../lib/i18n';
import type { BrowserTab, DomainGroupModel, WindowGroupModel } from '../types/tab';
import { DomainCard } from './DomainCard';

interface GroupGridProps {
  groups: Array<DomainGroupModel | WindowGroupModel>;
  accentColor: string;
  copy: AppCopy;
  onSwitch: (tab: BrowserTab) => void;
  onClose: (tab: BrowserTab) => void;
  onSleep: (tab: BrowserTab) => void;
  onCloseAll: (tabs: BrowserTab[]) => void;
  onSleepAll: (tabs: BrowserTab[]) => void;
  canSleepTab: (tab: BrowserTab) => boolean;
}

export function GroupGrid({
  groups,
  accentColor,
  copy,
  onSwitch,
  onClose,
  onSleep,
  onCloseAll,
  onSleepAll,
  canSleepTab,
}: GroupGridProps) {
  return (
    <div className="grid grid-cols-3 gap-2.5 min-w-0 max-h-[calc(100vh-330px)] overflow-y-auto overflow-x-hidden pb-2 max-[720px]:grid-cols-1">
      {groups.map((group) => (
        <DomainCard
          key={group.id}
          group={group}
          accentColor={accentColor}
          onSwitch={onSwitch}
          onClose={onClose}
          onSleep={onSleep}
          onCloseAll={onCloseAll}
          onSleepAll={onSleepAll}
          canSleepTab={canSleepTab}
          copy={copy}
        />
      ))}
    </div>
  );
}
