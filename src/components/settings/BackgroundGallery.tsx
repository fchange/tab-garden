import { useEffect, useRef, useState } from 'react';
import type { ReactNode, RefObject } from 'react';
import { Check, ChevronRight, ExternalLink, ImageOff, LoaderCircle, RotateCcw } from 'lucide-react';

import { useAccent, useCopy, useSettingsContext } from '../../lib/appContext';
import { cn } from '../../lib/cn';
import {
  acquireWallpaperImage,
  getWallpaper,
  loadWallpaperImage,
  WALLPAPERS,
  WALLPAPER_CATEGORIES,
  type Wallpaper,
  type WallpaperCategory,
} from '../../lib/wallpapers';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { SettingsItem, SettingsSection, SettingsSectionCard, SettingsSelectButton } from './SettingsPrimitives';

const MIX_ORDER = [
  'blue-hour',
  'utah-mountains',
  'italian-landscape',
  'bahamas-blue',
  'hudson-skyline',
  'quiet-dunes',
  'florida-sunrise',
  'windmill-landscape',
  'new-orleans-moon',
  'himalayan-ridges',
];

const MIX_RANK = new Map(MIX_ORDER.map((id, index) => [id, index]));

type PendingSelection = string | 'mountains' | null;

export function BackgroundSettingsEntry({ onOpen }: { onOpen: () => void }) {
  const copy = useCopy();
  const { settings } = useSettingsContext();
  const { accentColor } = useAccent();
  const current = getWallpaper(settings.wallpaperId);
  const currentName = current?.name[settings.language] ?? copy.background.mountains;

  return (
    <SettingsSection title={copy.background.title}>
      <SettingsSectionCard>
        <button
          type="button"
          onClick={onOpen}
          className="group flex min-h-[68px] w-full items-center gap-3 px-3.5 py-3 text-left transition-colors hover:bg-[rgba(34,54,50,0.045)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring dark:hover:bg-white/[0.045]"
        >
          <span className="relative h-10 w-[68px] shrink-0 overflow-hidden rounded-lg border border-white/45 shadow-[0_4px_14px_rgba(34,54,50,0.10)] dark:border-white/10">
            {current ? (
              <WallpaperImage key={current.id} wallpaper={current} />
            ) : (
              <MountainPreview accentColor={accentColor} />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[14px] font-semibold text-foreground/88">{currentName}</span>
            <span className="mt-0.5 block text-[12px] text-muted-foreground">{copy.background.choose}</span>
          </span>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground/55 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground/65 motion-reduce:transform-none motion-reduce:transition-none" aria-hidden="true" />
        </button>
      </SettingsSectionCard>
    </SettingsSection>
  );
}

export function BackgroundGallery({ selectionVersion }: { selectionVersion: RefObject<number> }) {
  const copy = useCopy();
  const { settings, updateSettings } = useSettingsContext();
  const { accentColor } = useAccent();
  const [category, setCategory] = useState<WallpaperCategory>('mix');
  const [pendingSelection, setPendingSelection] = useState<PendingSelection>(null);
  const [failedSelection, setFailedSelection] = useState<PendingSelection>(null);
  const [imageAttempts, setImageAttempts] = useState<Record<string, number>>({});
  const requestToken = useRef(0);
  const updateSettingsRef = useRef(updateSettings);
  const expectedWallpaperId = useRef(settings.wallpaperId);
  const current = getWallpaper(settings.wallpaperId);
  const currentName = current?.name[settings.language] ?? copy.background.mountains;
  const pendingWallpaper = pendingSelection && pendingSelection !== 'mountains'
    ? getWallpaper(pendingSelection)
    : null;
  const pendingName = pendingSelection === 'mountains'
    ? copy.background.mountains
    : pendingWallpaper?.name[settings.language] ?? '';
  const visibleWallpapers = WALLPAPERS
    .filter((wallpaper) => category === 'mix' || wallpaper.category === category)
    .sort((a, b) => category === 'mix'
      ? (MIX_RANK.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (MIX_RANK.get(b.id) ?? Number.MAX_SAFE_INTEGER)
      : 0);

  useEffect(() => {
    updateSettingsRef.current = updateSettings;
  }, [updateSettings]);

  useEffect(() => {
    if (settings.wallpaperId !== expectedWallpaperId.current) {
      requestToken.current += 1;
      setPendingSelection(null);
      setFailedSelection(null);
    }
    expectedWallpaperId.current = settings.wallpaperId;
  }, [settings.wallpaperId]);

  useEffect(() => () => {
    requestToken.current += 1;
  }, []);

  async function selectWallpaper(id: string | null) {
    const token = ++requestToken.current;
    const version = selectionVersion.current;
    const pendingKey = id ?? 'mountains';
    setFailedSelection(null);
    setPendingSelection(pendingKey);
    if (id) setImageAttempts((attempts) => ({ ...attempts, [id]: (attempts[id] ?? 0) + 1 }));

    try {
      const wallpaper = getWallpaper(id);
      if (wallpaper) await loadWallpaperImage(wallpaper.imageUrl);
      if (token !== requestToken.current || version !== selectionVersion.current) return;
      const retryCurrent = expectedWallpaperId.current === id;
      expectedWallpaperId.current = id;
      await updateSettingsRef.current((currentSettings) => ({ ...currentSettings, wallpaperId: id }));
      if (id && retryCurrent && token === requestToken.current && version === selectionVersion.current) {
        window.dispatchEvent(new CustomEvent('tab-garden:retry-wallpaper', { detail: id }));
      }
    } catch {
      if (token === requestToken.current && version === selectionVersion.current) setFailedSelection(pendingKey);
    } finally {
      if (token === requestToken.current && version === selectionVersion.current) setPendingSelection(null);
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-6 px-6 py-5">
          <SettingsSection title={copy.background.current}>
            <SettingsSectionCard>
              <div className="px-4 pt-4">
                <div className="relative h-[112px] overflow-hidden rounded-lg border border-foreground/10 bg-background">
                  {current ? (
                    <WallpaperImage key={`${current.id}-${imageAttempts[current.id] ?? 0}`} wallpaper={current} />
                  ) : (
                    <MountainPreview accentColor={accentColor} />
                  )}
                </div>
              </div>
              <SettingsItem title={currentName} description={copy.background.applyHint} last>
                {current && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    title={copy.background.restore}
                    aria-label={copy.background.restore}
                    onClick={() => void selectWallpaper(null)}
                    className="rounded-lg"
                  >
                    <RotateCcw className="size-4" aria-hidden="true" />
                  </Button>
                )}
              </SettingsItem>
            </SettingsSectionCard>
          </SettingsSection>

          <SettingsSection title={copy.background.collection}>
            <SettingsSectionCard>
              <SettingsItem title={copy.background.categoriesLabel} description={copy.background.builtIn} last>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SettingsSelectButton aria-label={`${copy.background.categoriesLabel}: ${copy.background.categories[category]}`}>
                      <span>{copy.background.categories[category]}</span>
                      <ChevronRight className="size-4 opacity-40" aria-hidden="true" />
                    </SettingsSelectButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44 rounded-xl">
                    {WALLPAPER_CATEGORIES.map((value) => {
                      const count = value === 'mix' ? WALLPAPERS.length + 1 : WALLPAPERS.filter((wallpaper) => wallpaper.category === value).length;
                      return (
                        <DropdownMenuItem key={value} aria-current={category === value ? 'true' : undefined} onSelect={() => setCategory(value)} className="justify-between">
                          <span className="flex items-center gap-2">
                            {copy.background.categories[value]}
                            <span className="text-[12px] tabular-nums text-muted-foreground">{count}</span>
                          </span>
                          {category === value && <Check className="size-4" style={{ color: accentColor }} aria-hidden="true" />}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </SettingsItem>
            </SettingsSectionCard>
            <p className="mb-3 mt-4 px-1 text-[12px] text-muted-foreground">
              {copy.background.count(visibleWallpapers.length + (category === 'mix' ? 1 : 0))}
            </p>
            <div className="grid grid-cols-2 gap-x-3 gap-y-4 max-[340px]:grid-cols-1">
              {category === 'mix' && (
                <WallpaperCard
                  name={copy.background.mountains}
                  detail={copy.background.original}
                  selected={!current}
                  loading={pendingSelection === 'mountains'}
                  onClick={() => void selectWallpaper(null)}
                >
                  <MountainPreview accentColor={accentColor} />
                </WallpaperCard>
              )}
              {visibleWallpapers.map((wallpaper) => (
                <WallpaperCard
                  key={wallpaper.id}
                  name={wallpaper.name[settings.language]}
                  detail={copy.background.categories[wallpaper.category]}
                  selected={settings.wallpaperId === wallpaper.id}
                  loading={pendingSelection === wallpaper.id}
                  onClick={() => void selectWallpaper(wallpaper.id)}
                >
                  <WallpaperImage key={`${wallpaper.id}-${imageAttempts[wallpaper.id] ?? 0}`} wallpaper={wallpaper} lazy />
                </WallpaperCard>
              ))}
            </div>
          </SettingsSection>

          <SettingsSection title={copy.background.credits}>
            <SettingsSectionCard>
              <div className="p-4">
                {current ? (
                  <>
                    <p className="text-[14px] font-semibold leading-snug text-foreground/88">{currentName}</p>
                    <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{current.author}</p>
                    <div className="mt-2 flex flex-wrap items-start gap-x-4 gap-y-1 text-[12px] leading-relaxed text-muted-foreground">
                      <a href={current.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-7 items-center gap-1 rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        {copy.background.source}<ExternalLink className="size-3 shrink-0" aria-hidden="true" />
                      </a>
                      <a href={current.licenseUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-7 items-center gap-1 rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        <span>{current.license}</span><ExternalLink className="size-3 shrink-0" aria-hidden="true" />
                      </a>
                    </div>
                  </>
                ) : (
                  <p className="text-[12px] leading-relaxed text-muted-foreground">Tab Garden · {copy.background.original}</p>
                )}
              </div>
            </SettingsSectionCard>
          </SettingsSection>
        </div>
      </ScrollArea>

      <div className="shrink-0 border-t border-foreground/10 bg-foreground/[0.025] px-6 py-3">
        <div className="flex items-center gap-2.5">
          {pendingSelection && <LoaderCircle className="size-3.5 shrink-0 animate-spin text-muted-foreground motion-reduce:animate-none" aria-hidden="true" />}
          <p
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className={cn('min-w-0 flex-1 text-[12px] leading-relaxed', failedSelection ? 'text-destructive' : 'text-muted-foreground')}
          >
            {failedSelection ? copy.background.loadFailed : pendingSelection ? copy.background.loading(pendingName) : copy.background.description}
          </p>
          {failedSelection && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => void selectWallpaper(failedSelection === 'mountains' ? null : failedSelection)}
              className="shrink-0 rounded-lg text-[12px]"
            >
              {copy.background.retry}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function WallpaperCard({
  name,
  detail,
  selected,
  loading,
  onClick,
  children,
}: {
  name: string;
  detail: string;
  selected: boolean;
  loading: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  const copy = useCopy();

  return (
    <button
      type="button"
      aria-label={copy.background.select(name)}
      aria-pressed={selected}
      aria-busy={loading}
      onClick={onClick}
      className="group min-w-0 rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-popover"
    >
      <span className={cn(
        'relative block aspect-[16/10] overflow-hidden rounded-xl border bg-background shadow-[0_4px_12px_rgba(34,54,50,0.06)] transition-[border-color,box-shadow] duration-150 motion-reduce:transition-none dark:shadow-[0_4px_12px_rgba(0,0,0,0.18)]',
        selected ? 'border-primary ring-1 ring-primary' : 'border-foreground/10 group-hover:border-foreground/30 group-hover:shadow-[0_7px_18px_rgba(34,54,50,0.12)]',
      )}>
        {children}
        {(selected || loading) && (
          <span className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
            {loading
              ? <LoaderCircle className="size-3.5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
              : <Check className="size-3.5" aria-hidden="true" />}
            {selected && <span className="sr-only">{copy.background.selected}</span>}
          </span>
        )}
      </span>
      <span className="mt-2 block truncate text-[14px] font-semibold text-foreground/88">{name}</span>
      <span className="mt-1 flex min-w-0 items-center justify-between gap-2 text-[12px] leading-snug text-muted-foreground">
        <span className="truncate">{detail}</span>
        {selected && <span className="shrink-0 font-medium text-foreground/80">{copy.background.selected}</span>}
      </span>
    </button>
  );
}

function WallpaperImage({ wallpaper, lazy = false }: { wallpaper: Wallpaper; lazy?: boolean }) {
  const copy = useCopy();
  const container = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(!lazy);
  const [source, setSource] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (visible || !container.current) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: '100px' });
    observer.observe(container.current);
    return () => observer.disconnect();
  }, [visible]);

  useEffect(() => {
    const retry = () => setAttempt((value) => value + 1);
    window.addEventListener('online', retry);
    return () => window.removeEventListener('online', retry);
  }, []);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    let release: (() => void) | undefined;
    setSource(null);
    setFailed(false);
    // Thumbnails use the same offline cache, but never download a full image as a fallback.
    acquireWallpaperImage(wallpaper.thumbnailUrl).then((lease) => {
      if (cancelled) lease.release();
      else {
        release = lease.release;
        setSource(lease.url);
      }
    }).catch(() => {
      if (!cancelled) setFailed(true);
    });
    return () => {
      cancelled = true;
      release?.();
    };
  }, [visible, wallpaper.thumbnailUrl, attempt]);

  return (
    <span ref={container} className="block h-full w-full">
      {failed ? (
        <span className="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-foreground/[0.04] px-2 text-center text-[12px] text-muted-foreground">
          <ImageOff className="size-4" aria-hidden="true" />
          {copy.background.previewUnavailable}
        </span>
      ) : source ? (
        <img
          src={source}
          alt=""
          decoding="async"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.025] motion-reduce:transform-none motion-reduce:transition-none"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center bg-foreground/[0.04]">
          {visible && <LoaderCircle className="size-4 animate-spin text-muted-foreground motion-reduce:animate-none" aria-hidden="true" />}
        </span>
      )}
    </span>
  );
}

function MountainPreview({ accentColor }: { accentColor: string }) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-background">
      <span className="absolute inset-0 bg-[radial-gradient(circle_at_70%_22%,rgba(255,255,255,0.72),transparent_26%)]" />
      {[0.2, 0.38, 0.62].map((opacity, index) => (
        <span
          key={opacity}
          className="absolute -left-[20%] h-full w-[140%] rounded-[50%_50%_0_0]"
          style={{ background: accentColor, opacity, top: `${47 + index * 15}%`, transform: `rotate(${index % 2 ? -5 : 5}deg)` }}
        />
      ))}
    </div>
  );
}
