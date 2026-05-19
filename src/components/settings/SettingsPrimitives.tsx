import * as React from 'react';
import { motion } from 'motion/react';

import { cn } from '../../lib/cn';
import { buttonVariants } from '../ui/button';

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
    <div className="overflow-hidden rounded-xl border border-[rgba(34,54,50,0.13)] bg-white/82 shadow-[0_16px_38px_rgba(34,54,50,0.12),var(--theme-inset-highlight)] backdrop-blur-xl backdrop-saturate-150 transition-[background,border-color,box-shadow] duration-500 dark:border-white/10 dark:bg-[rgba(16,26,35,0.82)] dark:shadow-[0_18px_44px_rgba(0,0,0,0.32),var(--theme-inset-highlight)]">
      {children}
    </div>
  );
}

export function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <p className="mb-2.5 px-1 text-[12px] font-semibold uppercase tracking-[0.12em] text-foreground/56 dark:text-muted-foreground/82">{title}</p>
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
        className="group/item transition-colors duration-200 hover:bg-[rgba(34,54,50,0.045)] dark:hover:bg-white/[0.045]"
      >
        <div
          className={cn(
            'flex min-h-[64px] justify-between gap-3 px-4',
            description || more ? 'items-start py-3.5' : 'items-center',
          )}
        >
          <span className="min-w-0 flex-1 pr-2">
            <span className="block text-[14px] font-semibold leading-snug text-foreground/86 transition-colors duration-200 group-hover/item:text-foreground/72 dark:text-foreground/88 dark:group-hover/item:text-foreground/74">{title}</span>
            {description && (
              <span className="mt-1 block text-[12px] leading-snug text-muted-foreground/78 dark:text-muted-foreground/74">{description}</span>
            )}
          </span>
          <div className="shrink-0">{children}</div>
        </div>
        {more && <div className="px-4 pb-4">{more}</div>}
      </div>
      {!last && <div className="mx-4 h-px bg-[rgba(34,54,50,0.10)] dark:bg-white/10" />}
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
    <div className="inline-flex rounded-lg border border-[rgba(34,54,50,0.12)] bg-[rgba(34,54,50,0.07)] p-1 shadow-[var(--theme-inset-highlight)] dark:border-white/10 dark:bg-white/[0.06]">
      {options.map((option) => {
        const active = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'h-7 rounded-md px-3 text-[12px] font-semibold transition-all duration-200 active:scale-[0.98]',
              active ? 'text-primary-foreground shadow-[0_7px_18px_rgba(30,50,45,0.14)] dark:shadow-[0_8px_18px_rgba(0,0,0,0.24)]' : 'text-muted-foreground hover:bg-white/60 hover:text-foreground dark:hover:bg-white/[0.07]',
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

export function SettingsAnimatedSegmentedControl<T extends string>({
  value,
  options,
  onChange,
  accentColor,
  activeTextColor,
  layoutId,
  className,
}: {
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
  accentColor: string;
  activeTextColor?: string;
  layoutId: string;
  className?: string;
}) {
  const activeIndex = Math.max(0, options.findIndex((option) => option.value === value));

  return (
    <div
      role="radiogroup"
      className={cn(
        'inline-flex rounded-lg border border-[rgba(34,54,50,0.12)] bg-[rgba(34,54,50,0.06)] p-1 shadow-[var(--theme-inset-highlight)] dark:border-white/10 dark:bg-white/[0.06]',
        className,
      )}
    >
      {options.map((option) => {
        const active = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => {
              if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
                event.preventDefault();
                onChange(options[(activeIndex - 1 + options.length) % options.length].value);
              }

              if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                event.preventDefault();
                onChange(options[(activeIndex + 1) % options.length].value);
              }

              if (event.key === 'Home') {
                event.preventDefault();
                onChange(options[0].value);
              }

              if (event.key === 'End') {
                event.preventDefault();
                onChange(options[options.length - 1].value);
              }
            }}
            className={cn(
              'relative h-7 min-w-12 rounded-md px-3 text-[12px] font-semibold transition-[color,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]',
              active ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
            style={activeTextColor && active ? { color: activeTextColor } : undefined}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-md"
                style={{
                  background: accentColor,
                  boxShadow: '0 8px 20px rgba(30,50,45,0.16), inset 0 1px 0 rgba(255,255,255,0.16)',
                }}
                transition={{ type: 'spring', stiffness: 360, damping: 32, mass: 0.82 }}
              />
            )}
            <span className="relative z-10">{option.label}</span>
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
      buttonVariants({ variant: 'ghost' }),
      'h-9 cursor-pointer gap-2.5 rounded-lg border-[rgba(34,54,50,0.18)] bg-white/72 px-3 text-[13px] font-medium text-foreground/74 shadow-[0_1px_2px_rgba(34,54,50,0.06),var(--theme-inset-highlight)] transition-all duration-200 hover:border-[rgba(34,54,50,0.30)] hover:bg-white/92 hover:text-foreground active:scale-[0.98] dark:border-white/14 dark:bg-white/[0.075] dark:text-muted-foreground dark:hover:border-white/24 dark:hover:bg-white/[0.12] dark:hover:text-foreground [&>svg:last-child]:ml-0.5 [&>svg:last-child]:rounded-md [&>svg:last-child]:bg-[rgba(34,54,50,0.07)] [&>svg:last-child]:p-0.5 [&>svg:last-child]:opacity-55 dark:[&>svg:last-child]:bg-white/[0.08]',
      className,
    )}
    {...props}
  >
    {children}
  </button>
));
SettingsSelectButton.displayName = 'SettingsSelectButton';
