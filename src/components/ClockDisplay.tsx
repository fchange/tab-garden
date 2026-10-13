import { useEffect, useState } from 'react';

import { useSettingsContext } from '../lib/appContext';

export function ClockDisplay() {
  const { settings } = useSettingsContext();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const sync = () => {
      clearTimeout(timer);
      setNow(new Date());
      // Align to the next minute; refresh immediately when returning to the tab.
      if (!document.hidden) {
        timer = setTimeout(sync, 60_000 - Date.now() % 60_000);
      }
    };

    sync();
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('focus', sync);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', sync);
      window.removeEventListener('focus', sync);
    };
  }, []);

  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const locale = settings.language === 'zh' ? 'zh-CN' : 'en-US';
  const date = new Intl.DateTimeFormat(locale, { month: 'long', day: 'numeric' }).format(now);
  const weekday = new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(now);
  const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  return (
    <div data-clock-display className="flex shrink-0 flex-col items-center gap-4 text-center text-foreground">
      <time
        dateTime={time}
        className="text-[clamp(80px,10vw,128px)] leading-none font-light tracking-[-0.055em] tabular-nums"
      >
        {time}
      </time>
      <time dateTime={dateKey} className="text-[clamp(14px,1.2vw,17px)] leading-6 tracking-[0.06em] text-foreground/80">
        {date}<span className="mx-2.5 opacity-45" aria-hidden="true">·</span>{weekday}
      </time>
    </div>
  );
}
