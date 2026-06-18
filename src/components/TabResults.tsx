import { EmptyState } from './EmptyState';
import { GroupGrid } from './GroupGrid';
import { VirtualTabList } from './VirtualTabList';
import type { TabActionHandlers } from '../hooks/useTabActions';
import { useCopy } from '../lib/appContext';
import type { BrowserTab, DomainGroupModel, ViewMode, WindowGroupModel } from '../types/tab';

interface TabResultsProps {
  view: ViewMode;
  query: string;
  loading: boolean;
  totalTabCount: number;
  filteredTabs: BrowserTab[];
  duplicateTabs: BrowserTab[];
  domainGroups: DomainGroupModel[];
  windowGroups: WindowGroupModel[];
  duplicateTabIds: Set<number>;
  canSleepTab: (tab: BrowserTab) => boolean;
  handlers: TabActionHandlers;
}

export function TabResults({
  view,
  query,
  loading,
  totalTabCount,
  filteredTabs,
  duplicateTabs,
  domainGroups,
  windowGroups,
  duplicateTabIds,
  canSleepTab,
  handlers,
}: TabResultsProps) {
  const copy = useCopy();
  const isEmpty = view === 'duplicate' ? duplicateTabs.length === 0 : filteredTabs.length === 0;

  if (loading && totalTabCount === 0) {
    return <EmptyState title={copy.empty.loading} />;
  }

  if (isEmpty) {
    return (
      <EmptyState
        title={query.trim() ? copy.empty.noMatches : copy.empty.noTabs}
        description={query.trim() ? copy.empty.noMatchesDescription : copy.empty.noTabsDescription}
        descriptionClassName={query.trim() ? undefined : 'font-ornament-2'}
      />
    );
  }

  if (view === 'all') {
    return (
      <VirtualTabList
        tabs={filteredTabs}
        onClose={handlers.onClose}
        onSleep={handlers.onSleep}
        onSwitch={handlers.onSwitch}
        canSleepTab={canSleepTab}
        duplicateTabIds={duplicateTabIds}
      />
    );
  }

  if (view === 'duplicate') {
    return (
      <VirtualTabList
        tabs={duplicateTabs}
        onClose={handlers.onClose}
        onSleep={handlers.onSleep}
        onSwitch={handlers.onSwitch}
        canSleepTab={canSleepTab}
        showDuplicateBadge
      />
    );
  }

  if (view === 'domain') {
    return (
      <GroupGrid
        groups={domainGroups}
        onSwitch={handlers.onSwitch}
        onClose={handlers.onClose}
        onSleep={handlers.onSleep}
        onCloseAll={handlers.onCloseAll}
        onSleepAll={handlers.onSleepAll}
        canSleepTab={canSleepTab}
      />
    );
  }

  return (
    <GroupGrid
      groups={windowGroups}
      onSwitch={handlers.onSwitch}
      onClose={handlers.onClose}
      onSleep={handlers.onSleep}
      onCloseAll={handlers.onCloseAll}
      onSleepAll={handlers.onSleepAll}
      canSleepTab={canSleepTab}
    />
  );
}
