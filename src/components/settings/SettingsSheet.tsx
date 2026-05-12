import { useState } from 'react';
import { Check, ChevronRight, Moon, Sun } from 'lucide-react';

import { SearchModeToggle, type SearchMode } from '../SearchModeToggle';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { ScrollArea } from '../ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import { ACCENT_COLORS } from '../../lib/accentColors';
import { useAccent, useCopy, useSettingsContext } from '../../lib/appContext';
import { cn } from '../../lib/cn';
import { getViewOptions } from '../../lib/i18n';
import { DEFAULT_SETTINGS } from '../../lib/storage';
import type { ThemePreference } from '../../types/settings';
import {
  SettingsItem,
  SettingsSection,
  SettingsSectionCard,
  SettingsSegmentedControl,
  SettingsSelectButton,
  SettingsSwitch,
} from './SettingsPrimitives';

const DROPDOWN_CONTENT_CLASS = 'border-black/[0.08] bg-white text-foreground shadow-[0_16px_42px_rgba(40,24,34,0.16)] backdrop-blur-none dark:border-[var(--theme-border-strong)] dark:bg-[var(--theme-popover)] dark:shadow-[var(--theme-shadow-soft),var(--theme-inset-highlight)]';

interface SettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsSheet({
  open,
  onOpenChange,
}: SettingsSheetProps) {
  const copy = useCopy();
  const { accentColor, accentTextColor, resetAccentColor } = useAccent();
  const { updateSettings } = useSettingsContext();
  const [searchTogglePreviewMode, setSearchTogglePreviewMode] = useState<SearchMode>('tabs');

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="right-4 top-6 bottom-6 flex h-auto w-[min(500px,calc(100vw-32px))] flex-col overflow-hidden rounded-[32px] border border-white/40 bg-white/72 p-0 shadow-[0_8px_40px_rgba(180,120,160,0.12)] backdrop-blur-2xl dark:border-[var(--theme-border-strong)] dark:bg-[rgba(16,26,35,0.82)] dark:shadow-[0_28px_90px_rgba(4,10,16,0.42),var(--theme-inset-highlight)] sm:max-w-none"
      >
        <SheetHeader className="h-16 justify-center border-b border-black/[0.04] px-6 pr-14 dark:border-[var(--theme-border)]">
          <SheetTitle className="text-[20px] font-semibold tracking-tight text-[#2f2f2f] dark:text-foreground">
            {copy.settings.title}
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-7 px-6 py-5">
            <AppearanceSettingsSection />

            <ProtectionSettingsSection accentColor={accentColor} />

            <PoemSettingsSection accentColor={accentColor} />

            <SearchToggleSettingsSection
              accentColor={accentColor}
              accentTextColor={accentTextColor}
              previewMode={searchTogglePreviewMode}
              onTogglePreview={() => setSearchTogglePreviewMode((current) => (current === 'tabs' ? 'web' : 'tabs'))}
            />

            <Button
              variant="ghost"
              className="h-10 w-full rounded-full border-none bg-[#f5ebf1] text-[14px] font-medium hover:bg-[#eedee8] dark:bg-[var(--theme-surface)] dark:hover:bg-[var(--theme-surface-strong)]"
              style={{ color: accentColor }}
              onClick={() => {
                resetAccentColor(DEFAULT_SETTINGS.defaultAccentColor);
                void updateSettings(DEFAULT_SETTINGS);
              }}
            >
              {copy.settings.resetAll}
            </Button>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function AppearanceSettingsSection() {
  const copy = useCopy();
  const { settings, updateSettings } = useSettingsContext();
  const { accentColor, colorSample, setDefaultAccentColor } = useAccent();

  return (
    <SettingsSection title={copy.settings.appearance}>
      <SettingsSectionCard>
        <SettingsItem title={copy.accents.currentColor}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SettingsSelectButton className="max-w-[164px]">
                <span className="size-4 rounded-full" style={{ background: accentColor }} />
                <span className="font-ornament-2 truncate">{colorSample.name}</span>
                <ChevronRight className="size-4 opacity-40" />
              </SettingsSelectButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className={cn('w-[260px] max-h-[360px] overflow-y-auto', DROPDOWN_CONTENT_CLASS)}>
              {ACCENT_COLORS.map((color) => (
                <DropdownMenuItem
                  key={color.hex}
                  onSelect={() => setDefaultAccentColor(color.hex)}
                  className="justify-between"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="size-4 shrink-0 rounded-full" style={{ background: color.hex }} />
                    <span className="font-ornament-2 truncate">{color.name}</span>
                  </span>
                  {color.hex === accentColor && <Check className="size-4" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </SettingsItem>

        <ThemeSettingsItem />
        <DefaultViewSettingsItem />

        <SettingsItem title={copy.settings.language} last>
          <SettingsSegmentedControl
            value={settings.language}
            accentColor={accentColor}
            options={[
              { value: 'zh', label: copy.settings.chinese },
              { value: 'en', label: copy.settings.english },
            ]}
            onChange={(language) => void updateSettings({ language })}
          />
        </SettingsItem>
      </SettingsSectionCard>
    </SettingsSection>
  );
}

function ThemeSettingsItem() {
  const copy = useCopy();
  const { settings, updateSettings } = useSettingsContext();
  const themeLabel = settings.theme === 'system' ? copy.settings.system : settings.theme === 'light' ? copy.settings.light : copy.settings.dark;

  return (
    <SettingsItem title={copy.settings.theme}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SettingsSelectButton>
            {settings.theme === 'dark' ? <Moon className="size-4" /> : <Sun className="size-4" />}
            <span>{themeLabel}</span>
            <ChevronRight className="size-4 opacity-40" />
          </SettingsSelectButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className={cn('w-40', DROPDOWN_CONTENT_CLASS)}>
          {([
            ['system', copy.settings.system],
            ['light', copy.settings.light],
            ['dark', copy.settings.dark],
          ] as Array<[ThemePreference, string]>).map(([theme, label]) => (
            <DropdownMenuItem key={theme} onSelect={() => void updateSettings({ theme })}>
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </SettingsItem>
  );
}

function DefaultViewSettingsItem() {
  const copy = useCopy();
  const { settings, updateSettings } = useSettingsContext();
  const viewOptions = getViewOptions(copy);

  return (
    <SettingsItem title={copy.settings.defaultView}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SettingsSelectButton>
            <span>{viewOptions.find((option) => option.value === settings.defaultView)?.label}</span>
            <ChevronRight className="size-4 opacity-40" />
          </SettingsSelectButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className={cn('w-40', DROPDOWN_CONTENT_CLASS)}>
          {viewOptions.map((option) => (
            <DropdownMenuItem key={option.value} onSelect={() => void updateSettings({ defaultView: option.value })}>
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </SettingsItem>
  );
}

function ProtectionSettingsSection({ accentColor }: { accentColor: string }) {
  const copy = useCopy();
  const { settings, updateSettings } = useSettingsContext();
  const rules = [
    ['protectPinned', copy.settings.protectPinned, copy.settings.protectPinnedDescription],
    ['protectAudible', copy.settings.protectAudible, copy.settings.protectAudibleDescription],
    ['protectActive', copy.settings.protectActive, copy.settings.protectActiveDescription],
  ] as const;

  return (
    <SettingsSection title={copy.settings.features}>
      <SettingsSectionCard>
        {rules.map(([key, title, description], index) => (
          <SettingsItem key={key} title={title} description={description} last={index === rules.length - 1}>
            <SettingsSwitch
              checked={settings[key]}
              accentColor={accentColor}
              ariaLabel={title}
              onClick={() =>
                void updateSettings((current) => ({
                  ...current,
                  [key]: !current[key],
                }))
              }
            />
          </SettingsItem>
        ))}
      </SettingsSectionCard>
    </SettingsSection>
  );
}

function PoemSettingsSection({ accentColor }: { accentColor: string }) {
  const copy = useCopy();
  const { settings, updateSettings } = useSettingsContext();

  return (
    <SettingsSection title={copy.settings.features}>
      <SettingsSectionCard>
        <SettingsItem
          title={copy.settings.showPoem}
          description={copy.settings.showPoemDescription}
          last
        >
          <SettingsSwitch
            checked={settings.showPoem}
            accentColor={accentColor}
            ariaLabel={copy.settings.showPoem}
            onClick={() => void updateSettings((current) => ({ ...current, showPoem: !current.showPoem }))}
          />
        </SettingsItem>
      </SettingsSectionCard>
    </SettingsSection>
  );
}

function SearchToggleSettingsSection({
  accentColor,
  accentTextColor,
  previewMode,
  onTogglePreview,
}: {
  accentColor: string;
  accentTextColor: string;
  previewMode: SearchMode;
  onTogglePreview: () => void;
}) {
  const copy = useCopy();
  const { settings, updateSettings } = useSettingsContext();

  return (
    <SettingsSection title={copy.settings.moreDetails}>
      <SettingsSectionCard>
        <SettingsItem
          title={copy.settings.searchToggleDisplay}
          description={copy.settings.searchToggleDisplayDescription}
          below={
            <div className="flex items-center justify-between gap-3 rounded-[14px] bg-white/60 px-3 py-2 dark:bg-[var(--theme-surface)]">
              <span className="text-[12px] font-medium text-muted-foreground">{copy.settings.preview}</span>
              <SearchModeToggle
                mode={previewMode}
                display={settings.searchToggleDisplay}
                accentColor={accentColor}
                textColor={accentTextColor}
                labels={copy.search}
                onToggle={onTogglePreview}
              />
            </div>
          }
          last
        >
          <SettingsSegmentedControl
            value={settings.searchToggleDisplay}
            accentColor={accentColor}
            options={[
              { value: 'detailed', label: copy.settings.detailed },
              { value: 'compact', label: copy.settings.compact },
            ]}
            onChange={(searchToggleDisplay) => void updateSettings({ searchToggleDisplay })}
          />
        </SettingsItem>
      </SettingsSectionCard>
    </SettingsSection>
  );
}
