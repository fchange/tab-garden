import * as React from 'react';

import { cn } from '../../lib/cn';

export function SettingsSwitch({
  checked,
  onClick,
  accentColor,
  ariaLabel,
}: {
  checked: boolean;
  onClick: () => void;
  accentColor: string;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={onClick}
      className={cn(
        'relative h-6 w-10 shrink-0 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        checked ? 'shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)]' : 'bg-[rgba(120,128,126,0.28)] dark:bg-[var(--theme-muted)]',
      )}
      style={checked ? { background: accentColor } : undefined}
    >
      <span
        className={cn(
          'absolute left-0 top-1 size-4 rounded-full bg-white shadow-sm transition-transform duration-200',
          checked ? 'translate-x-5' : 'translate-x-1',
        )}
      />
    </button>
  );
}

export function SettingsSectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-black/[0.04] bg-white/70 backdrop-blur-xl dark:border-[var(--theme-border)] dark:bg-[var(--theme-surface)]">
      {children}
    </div>
  );
}

export function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <p className="mb-3 text-[13px] font-medium tracking-wide text-black/35 dark:text-muted-foreground/80">{title}</p>
      {children}
    </section>
  );
}

export function SettingsItem({
  title,
  description,
  children,
  below,
  last = false,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  below?: React.ReactNode;
  last?: boolean;
}) {
  return (
    <>
      <div
        className={cn(
          'flex min-h-[60px] justify-between gap-3 px-4',
          description || below ? 'items-start py-3' : 'items-center',
        )}
      >
        <span className="min-w-0 flex-1 pr-2">
          <span className="block text-[14px] font-medium leading-snug text-[#2f2f2f] dark:text-foreground">{title}</span>
          {description && (
            <span className="mt-1 block text-[12px] leading-snug text-black/35 dark:text-muted-foreground/78">{description}</span>
          )}
        </span>
        <div className="shrink-0">{children}</div>
      </div>
      {below && <div className="px-4 pb-3">{below}</div>}
      {!last && <div className="mx-4 h-px bg-black/[0.04] dark:bg-[var(--theme-border)]" />}
    </>
  );
}

export function SettingsSegmentedControl<T extends string>({
  value,
  options,
  onChange,
  accentColor,
}: {
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
  accentColor: string;
}) {
  return (
    <div className="rounded-full bg-[rgba(255,255,255,0.66)] p-1 shadow-[var(--theme-inset-highlight)] dark:bg-[var(--theme-muted)]">
      {options.map((option) => {
        const active = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'h-7 rounded-full px-3 text-[12px] font-semibold transition-colors',
              active ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
            style={active ? { background: accentColor } : undefined}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export const SettingsSelectButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, className, type = 'button', ...props }, ref) => (
  <button
    ref={ref}
    type={type}
    className={cn(
      'inline-flex h-9 items-center gap-2.5 rounded-xl border border-black/[0.03] bg-[#faf7f9] px-3 text-[13px] text-black/55 transition hover:bg-[#f4eef2] dark:border-[var(--theme-border)] dark:bg-[var(--theme-muted)] dark:text-muted-foreground dark:hover:bg-[var(--theme-surface-strong)] dark:hover:text-foreground',
      className,
    )}
    {...props}
  >
    {children}
  </button>
));
SettingsSelectButton.displayName = 'SettingsSelectButton';
