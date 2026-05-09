import { useState } from 'react';
import { Check, ChevronRight, Moon, Sun } from 'lucide-react';

import { SearchModeToggle, type SearchMode } from '../SearchModeToggle';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { ScrollArea } from '../ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import { ACCENT_COLORS } from '../../lib/accentColors';
import { cn } from '../../lib/cn';
import type { AppCopy } from '../../lib/i18n';
import type { AppSettings, ColorSample, ThemePreference } from '../../types/settings';
import type { ViewMode } from '../../types/tab';
import {
  SettingsItem,
  SettingsSection,
  SettingsSectionCard,
  SettingsSegmentedControl,
  SettingsSelectButton,
  SettingsSwitch,
} from './SettingsPrimitives';

type UpdateSettings = (updater: Partial<AppSettings> | ((current: AppSettings) => AppSettings)) => Promise<void>;

const DROPDOWN_CONTENT_CLASS = 'border-black/[0.08] bg-white text-foreground shadow-[0_16px_42px_rgba(40,24,34,0.16)] backdrop-blur-none dark:border-[var(--theme-border-strong)] dark:bg-[var(--theme-popover)] dark:shadow-[var(--theme-shadow-soft),var(--theme-inset-highlight)]';
const MAX_CUSTOM_SLOGAN_LENGTH = 80;

interface SettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: AppSettings;
  copy: AppCopy;
  viewOptions: Array<{ value: ViewMode; label: string }>;
  colorSample: ColorSample;
  accentColor: string;
  accentTextColor: string;
  updateSettings: UpdateSettings;
  onSetDefaultAccentColor: (hex: string) => void;
  onResetSettings: () => void;
}

export function SettingsSheet({
  open,
  onOpenChange,
  settings,
  copy,
  viewOptions,
  colorSample,
  accentColor,
  accentTextColor,
  updateSettings,
  onSetDefaultAccentColor,
  onResetSettings,
}: SettingsSheetProps) {
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
            <AppearanceSettingsSection
              settings={settings}
              copy={copy}
              viewOptions={viewOptions}
              colorSample={colorSample}
              accentColor={accentColor}
              updateSettings={updateSettings}
              onSetDefaultAccentColor={onSetDefaultAccentColor}
            />

            <ProtectionSettingsSection settings={settings} copy={copy} accentColor={accentColor} updateSettings={updateSettings} />

            <CustomSloganSettingsSection settings={settings} copy={copy} updateSettings={updateSettings} />

            <SearchToggleSettingsSection
              settings={settings}
              copy={copy}
              accentColor={accentColor}
              accentTextColor={accentTextColor}
              previewMode={searchTogglePreviewMode}
              onTogglePreview={() => setSearchTogglePreviewMode((current) => (current === 'tabs' ? 'web' : 'tabs'))}
              updateSettings={updateSettings}
            />

            <Button
              variant="ghost"
              className="h-10 w-full rounded-full border-none bg-[#f5ebf1] text-[14px] font-medium hover:bg-[#eedee8] dark:bg-[var(--theme-surface)] dark:hover:bg-[var(--theme-surface-strong)]"
              style={{ color: accentColor }}
              onClick={onResetSettings}
            >
              {copy.settings.resetAll}
            </Button>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function AppearanceSettingsSection({
  settings,
  copy,
  viewOptions,
  colorSample,
  accentColor,
  updateSettings,
  onSetDefaultAccentColor,
}: Pick<SettingsSheetProps, 'settings' | 'copy' | 'viewOptions' | 'colorSample' | 'accentColor' | 'updateSettings' | 'onSetDefaultAccentColor'>) {
  return (
    <SettingsSection title={copy.settings.appearance}>
      <SettingsSectionCard>
        <SettingsItem title={copy.accents.currentColor}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SettingsSelectButton className="max-w-[164px]">
                <span className="size-4 rounded-full" style={{ background: accentColor }} />
                <span className="font-crgk truncate">{colorSample.name}</span>
                <ChevronRight className="size-4 opacity-40" />
              </SettingsSelectButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className={cn("w-[260px] max-h-[360px] overflow-y-auto", DROPDOWN_CONTENT_CLASS)}>
              {ACCENT_COLORS.map((color) => (
                <DropdownMenuItem
                  key={color.hex}
                  onSelect={() => onSetDefaultAccentColor(color.hex)}
                  className="justify-between"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="size-4 shrink-0 rounded-full" style={{ background: color.hex }} />
                    <span className="font-crgk truncate">{color.name}</span>
                  </span>
                  {color.hex === accentColor && <Check className="size-4" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </SettingsItem>

        <ThemeSettingsItem settings={settings} copy={copy} updateSettings={updateSettings} />
        <DefaultViewSettingsItem settings={settings} copy={copy} viewOptions={viewOptions} updateSettings={updateSettings} />

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

function ThemeSettingsItem({
  settings,
  copy,
  updateSettings,
}: Pick<SettingsSheetProps, 'settings' | 'copy' | 'updateSettings'>) {
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
        <DropdownMenuContent align="end" className={cn("w-40", DROPDOWN_CONTENT_CLASS)}>
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

function DefaultViewSettingsItem({
  settings,
  copy,
  viewOptions,
  updateSettings,
}: Pick<SettingsSheetProps, 'settings' | 'copy' | 'viewOptions' | 'updateSettings'>) {
  return (
    <SettingsItem title={copy.settings.defaultView}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SettingsSelectButton>
            <span>{viewOptions.find((option) => option.value === settings.defaultView)?.label}</span>
            <ChevronRight className="size-4 opacity-40" />
          </SettingsSelectButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className={cn("w-40", DROPDOWN_CONTENT_CLASS)}>
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

function ProtectionSettingsSection({
  settings,
  copy,
  accentColor,
  updateSettings,
}: Pick<SettingsSheetProps, 'settings' | 'copy' | 'accentColor' | 'updateSettings'>) {
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

function CustomSloganSettingsSection({
  settings,
  copy,
  updateSettings,
}: Pick<SettingsSheetProps, 'settings' | 'copy' | 'updateSettings'>) {
  return (
    <SettingsSection title={copy.settings.features}>
      <SettingsSectionCard>
        <SettingsItem
          title={copy.settings.customSlogan}
          description={copy.settings.customSloganDescription}
          below={
            <Input
              value={settings.customSlogan}
              maxLength={MAX_CUSTOM_SLOGAN_LENGTH}
              placeholder={copy.settings.customSloganPlaceholder}
              className="h-9 rounded-2xl border-black/[0.04] bg-white/60 px-3 text-[13px] shadow-none dark:border-[var(--theme-border)] dark:bg-[var(--theme-input)]"
              onChange={(event) => {
                const customSlogan = event.target.value.slice(0, MAX_CUSTOM_SLOGAN_LENGTH);
                void updateSettings({ customSlogan });
              }}
            />
          }
          last
        >
          <span className="text-[12px] text-black/30 dark:text-muted-foreground/70">
            {settings.customSlogan.length}/{MAX_CUSTOM_SLOGAN_LENGTH}
          </span>
        </SettingsItem>
      </SettingsSectionCard>
    </SettingsSection>
  );
}

function SearchToggleSettingsSection({
  settings,
  copy,
  accentColor,
  accentTextColor,
  previewMode,
  onTogglePreview,
  updateSettings,
}: Pick<SettingsSheetProps, 'settings' | 'copy' | 'accentColor' | 'accentTextColor' | 'updateSettings'> & {
  previewMode: SearchMode;
  onTogglePreview: () => void;
}) {
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
