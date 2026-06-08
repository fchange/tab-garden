import { useState } from 'react';
import { Check, ChevronRight, ExternalLink, Github, Moon, Sun } from 'lucide-react';

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
  SettingsAnimatedSegmentedControl,
  SettingsSection,
  SettingsSectionCard,
  SettingsSelectButton,
  SettingsSwitch,
} from './SettingsPrimitives';

const DROPDOWN_CONTENT_CLASS = 'rounded-xl border-[rgba(34,54,50,0.14)] bg-popover/98 text-foreground shadow-[0_18px_44px_rgba(34,54,50,0.16),var(--theme-inset-highlight)] backdrop-blur-xl dark:border-white/10 dark:bg-[var(--theme-popover)] dark:shadow-[0_18px_44px_rgba(0,0,0,0.36),var(--theme-inset-highlight)]';
const PROJECT_REPOSITORY_URL = 'https://github.com/fchange/tab-garden';

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
        className="right-4 top-6 bottom-6 flex h-auto w-[min(500px,calc(100vw-32px))] flex-col overflow-hidden rounded-2xl border border-[rgba(34,54,50,0.14)] bg-popover/98 p-0 shadow-[0_26px_80px_rgba(34,54,50,0.20),var(--theme-inset-highlight)] dark:border-white/12 dark:bg-[var(--theme-popover)] dark:shadow-[0_30px_86px_rgba(0,0,0,0.48),var(--theme-inset-highlight)] sm:max-w-none"
      >
        <SheetHeader className="border-b border-[rgba(34,54,50,0.11)] bg-white/42 px-6 py-5 pr-14 dark:border-white/10 dark:bg-white/[0.025]">
          <SheetTitle className="text-[20px] font-semibold tracking-tight text-foreground/90 dark:text-foreground/92">
            {copy.settings.title}
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-6 px-6 py-5">
            <AppearanceSettingsSection />

            <NewTabSettingsSection accentColor={accentColor} />

            <ProtectionSettingsSection accentColor={accentColor} />

            <PoemSettingsSection accentColor={accentColor} />

            <SearchToggleSettingsSection
              accentColor={accentColor}
              accentTextColor={accentTextColor}
              previewMode={searchTogglePreviewMode}
              onTogglePreview={() => setSearchTogglePreviewMode((current) => (current === 'tabs' ? 'web' : 'tabs'))}
            />

            <AboutSettingsSection />

            <Button
              variant="ghost"
              className="h-10 w-full rounded-lg text-[14px] font-medium shadow-[var(--theme-inset-highlight)] transition-all duration-200 active:scale-[0.99]"
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

function AboutSettingsSection() {
  const copy = useCopy();
  const { accentColor, accentTextColor } = useAccent();

  return (
    <SettingsSection title={copy.settings.about}>
      <SettingsSectionCard>
        <SettingsItem
          title={copy.settings.productInfo}
          description={copy.settings.brandDescription}
        >
          <span className="rounded-md border border-[rgba(34,54,50,0.12)] bg-[rgba(34,54,50,0.06)] px-2 py-1 text-[12px] font-medium tracking-[0.02em] text-foreground/62 dark:border-white/10 dark:bg-white/[0.06] dark:text-muted-foreground/86">
            {copy.settings.versionLabel} {__APP_VERSION__}
          </span>
        </SettingsItem>

        <SettingsItem
          title={copy.settings.githubProject}
          description={copy.settings.githubProjectDescription}
          last
        >
          <Button
            asChild
            size="sm"
            className="h-9 gap-2.5 rounded-lg border px-3 text-[13px] font-semibold shadow-[var(--theme-inset-highlight),0_8px_20px_rgba(30,50,45,0.14)] transition-all duration-200 hover:opacity-90 active:scale-[0.98] dark:shadow-[var(--theme-inset-highlight),0_8px_20px_rgba(0,0,0,0.26)]"
            style={{
              background: accentColor,
              borderColor: `color-mix(in srgb, ${accentColor} 72%, transparent)`,
              color: accentTextColor,
            }}
          >
            <a
              href={PROJECT_REPOSITORY_URL}
              target="_blank"
              rel="noreferrer"
            >
              <Github className="size-4" />
              <span>{copy.settings.openGithub}</span>
              <ExternalLink className="size-3.5 opacity-45" />
            </a>
          </Button>
        </SettingsItem>
      </SettingsSectionCard>
    </SettingsSection>
  );
}

function AppearanceSettingsSection() {
  const copy = useCopy();
  const { settings, updateSettings } = useSettingsContext();
  const { accentColor, accentTextColor, colorSample, setDefaultAccentColor } = useAccent();

  return (
    <SettingsSection title={copy.settings.appearance}>
      <SettingsSectionCard>
        <SettingsItem title={copy.accents.currentColor}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SettingsSelectButton className="max-w-[164px]">
                <span className="size-4 shrink-0 rounded-full shadow-[0_0_0_2px_rgba(255,255,255,0.42),0_2px_8px_rgba(0,0,0,0.10)] dark:shadow-[0_0_0_2px_rgba(255,255,255,0.18)]" style={{ background: accentColor }} />
                <span className="min-w-0 truncate font-ornament-2 leading-[1.15]">{colorSample.name}</span>
                <ChevronRight className="size-4 opacity-40" />
              </SettingsSelectButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className={cn('w-[260px] max-h-[360px] overflow-y-auto', DROPDOWN_CONTENT_CLASS)}>
              {ACCENT_COLORS.map((color) => (
                <DropdownMenuItem
                  key={color.hex}
                  onSelect={() => setDefaultAccentColor(color.hex)}
                  className="justify-between rounded-lg px-2.5 py-2.5 transition-all duration-200 focus:bg-[color-mix(in_srgb,var(--item-accent)_12%,transparent)]"
                  style={{ '--item-accent': color.hex } as React.CSSProperties}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="size-4 shrink-0 rounded-full shadow-[0_0_0_2px_rgba(255,255,255,0.42),0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_0_0_2px_rgba(255,255,255,0.16)]" style={{ background: color.hex }} />
                    <span className="font-ornament-2 truncate">{color.name}</span>
                  </span>
                  {color.hex === accentColor && <Check className="size-4" style={{ color: accentColor }} />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </SettingsItem>

        <ThemeSettingsItem />
        <DefaultViewSettingsItem />

        <SettingsItem title={copy.settings.language} last>
          <SettingsAnimatedSegmentedControl
            value={settings.language}
            accentColor={accentColor}
            activeTextColor={accentTextColor}
            layoutId="settings-language-indicator"
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

function NewTabSettingsSection({ accentColor }: { accentColor: string }) {
  const copy = useCopy();
  const { settings, updateSettings } = useSettingsContext();

  return (
    <SettingsSection title={copy.settings.newTabPage}>
      <SettingsSectionCard>
        <SettingsItem
          title={copy.settings.bookmarksBar}
          description={copy.settings.bookmarksBarDescription}
          last
        >
          <SettingsSwitch
            checked={settings.showBookmarksBar}
            accentColor={accentColor}
            ariaLabel={copy.settings.bookmarksBar}
            onClick={() => void updateSettings((current) => ({ ...current, showBookmarksBar: !current.showBookmarksBar }))}
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
    <SettingsSection title={copy.settings.poemSettings}>
      <SettingsSectionCard>
        <SettingsItem
          title={copy.settings.showPoem}
          description={copy.settings.showPoemDescription}
        >
          <SettingsSwitch
            checked={settings.showPoem}
            accentColor={accentColor}
            ariaLabel={copy.settings.showPoem}
            onClick={() => void updateSettings((current) => ({ ...current, showPoem: !current.showPoem }))}
          />
        </SettingsItem>

        <SettingsItem
          title={copy.settings.showPoemDynasty}
          description={copy.settings.showPoemDynastyDescription}
          last
        >
          <SettingsSwitch
            checked={settings.showPoemDynasty}
            accentColor={accentColor}
            ariaLabel={copy.settings.showPoemDynasty}
            onClick={() => void updateSettings((current) => ({ ...current, showPoemDynasty: !current.showPoemDynasty }))}
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
          more={
            <div className="flex items-center justify-between gap-3 rounded-lg border border-[rgba(34,54,50,0.13)] bg-white/62 px-3 py-2 shadow-[0_1px_2px_rgba(34,54,50,0.05),var(--theme-inset-highlight)] dark:border-white/10 dark:bg-white/[0.055]">
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: accentColor }}
                />
                <span className="truncate text-[12px] font-semibold text-foreground/72 dark:text-muted-foreground/90">{copy.settings.preview}</span>
              </div>
              <SearchModeToggle
                mode={previewMode}
                display={settings.searchToggleDisplay}
                accentColor={accentColor}
                textColor={accentTextColor}
                labels={copy.search}
                onToggle={onTogglePreview}
                variant="preview"
              />
            </div>
          }
          last
        >
          <SettingsAnimatedSegmentedControl
            value={settings.searchToggleDisplay}
            accentColor={accentColor}
            activeTextColor={accentTextColor}
            layoutId="settings-search-toggle-display-indicator"
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
