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
      data-state={checked ? 'checked' : 'unchecked'}
      className={cn(
        'group/switch inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full bg-muted/45 p-0.5 shadow-[var(--theme-inset-highlight)] transition-colors duration-200 ease-out hover:bg-muted/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-transparent active:scale-[0.98]',
        checked && 'shadow-[var(--theme-inset-highlight),0_8px_20px_rgba(30,50,45,0.10)] dark:shadow-[var(--theme-inset-highlight),0_8px_20px_rgba(0,0,0,0.22)]',
      )}
      style={checked ? { background: accentColor } : undefined}
    >
      <span
        className={cn(
          'pointer-events-none block size-5 rounded-full bg-white shadow-[0_2px_8px_rgba(30,50,45,0.18)] ring-0 transition-transform duration-200 ease-out group-hover/switch:shadow-[0_3px_10px_rgba(30,50,45,0.22)] dark:bg-[rgba(245,251,249,0.92)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.32)]',
          checked && 'translate-x-5',
        )}
      />
    </button>
  );
}

export function SettingsSectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[20px] border border-border/80 bg-card/55 shadow-[var(--theme-shadow-soft),var(--theme-inset-highlight)] backdrop-blur-xl backdrop-saturate-150 transition-[background,border-color,box-shadow] duration-500 dark:bg-card/45">
      {children}
    </div>
  );
}

export function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <p className="mb-2.5 px-1 text-[12px] font-semibold uppercase tracking-[0.16em] text-foreground/38 dark:text-muted-foreground/70">{title}</p>
      {children}
    </section>
  );
}

export function SettingsItem({
  title,
  description,
  children,
  more,
  last = false,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  more?: React.ReactNode;
  last?: boolean;
}) {
  return (
    <>
      <div
        className="group/item transition-colors duration-200 hover:bg-[rgba(128,128,128,0.055)] dark:hover:bg-[rgba(255,255,255,0.045)]"
      >
        <div
          className={cn(
            'flex min-h-[64px] justify-between gap-3 px-4',
            description || more ? 'items-start py-3.5' : 'items-center',
          )}
        >
          <span className="min-w-0 flex-1 pr-2">
            <span className="block text-[14px] font-semibold leading-snug text-[rgba(0,0,0,0.78)] transition-colors duration-200 group-hover/item:text-[rgba(0,0,0,0.64)] dark:text-[rgba(255,255,255,0.82)] dark:group-hover/item:text-[rgba(255,255,255,0.68)]">{title}</span>
            {description && (
              <span className="mt-1 block text-[12px] leading-snug text-[rgba(0,0,0,0.40)] dark:text-[rgba(255,255,255,0.38)]">{description}</span>
            )}
          </span>
          <div className="shrink-0">{children}</div>
        </div>
        {more && <div className="px-4 pb-3.5">{more}</div>}
      </div>
      {!last && <div className="mx-4 h-px bg-border/55" />}
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
    <div className="inline-flex rounded-full border border-border/50 bg-muted/35 p-0.5 shadow-[var(--theme-inset-highlight)]">
      {options.map((option) => {
        const active = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'h-7 rounded-full px-3 text-[12px] font-semibold transition-all duration-200 active:scale-[0.98]',
              active ? 'text-primary-foreground shadow-[0_6px_16px_rgba(30,50,45,0.10)] dark:shadow-[0_8px_18px_rgba(0,0,0,0.20)]' : 'text-muted-foreground hover:bg-[rgba(128,128,128,0.08)] hover:text-foreground dark:hover:bg-[rgba(255,255,255,0.06)]',
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
      'inline-flex h-9 items-center gap-2.5 rounded-xl border border-border/55 bg-muted/35 px-3 text-[13px] font-medium text-muted-foreground shadow-[var(--theme-inset-highlight)] transition-all duration-200 hover:border-border hover:bg-muted/55 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]',
      className,
    )}
    {...props}
  >
    {children}
  </button>
));
SettingsSelectButton.displayName = 'SettingsSelectButton';
