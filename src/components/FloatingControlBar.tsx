import type { AppCopy } from '../lib/i18n';
import type { ColorSample } from '../types/settings';

interface FloatingControlBarProps {
  accentColor: string;
  colorSample: ColorSample;
  animationEnabled: boolean;
  isDarkMode: boolean;
  copy: AppCopy;
  onToggleTheme: () => void;
  onToggleAnimation: () => void;
  onOpenSettings: () => void;
  onChangeColor: () => void;
}

const controlButtonClass = 'w-0 group-hover:w-[30px] h-[30px] rounded-full border-none bg-transparent text-[rgba(0,0,0,0.42)] dark:text-[rgba(255,255,255,0.42)] cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100 overflow-hidden p-0 m-0 pointer-events-none group-hover:pointer-events-auto transition-all duration-250 hover:bg-[rgba(128,128,128,0.10)] dark:hover:bg-[rgba(255,255,255,0.08)] hover:text-[rgba(0,0,0,0.70)] dark:hover:text-[rgba(255,255,255,0.75)]';

export function FloatingControlBar({
  accentColor,
  colorSample,
  animationEnabled,
  isDarkMode,
  copy,
  onToggleTheme,
  onToggleAnimation,
  onOpenSettings,
  onChangeColor,
}: FloatingControlBarProps) {
  return (
    <div className="group fixed bottom-4 right-5 z-[2] flex items-center gap-0 hover:gap-[6px] p-[10px_14px] rounded-full cursor-pointer border border-transparent hover:border-[rgba(255,255,255,0.35)] dark:hover:border-[rgba(255,255,255,0.07)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:bg-[color-mix(in_srgb,rgba(255,255,255,0.50)_65%,transparent)] dark:hover:bg-[color-mix(in_srgb,rgba(20,25,28,0.55)_65%,transparent)] transition-all duration-300">
      <button
        className={controlButtonClass}
        onClick={onToggleTheme}
        title={isDarkMode ? copy.controls.light : copy.controls.dark}
      >
        {isDarkMode ? (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
        ) : (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        )}
      </button>
      <button
        className={controlButtonClass}
        onClick={onToggleAnimation}
        title={animationEnabled ? copy.controls.pause : copy.controls.play}
      >
        {animationEnabled ? (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
        ) : (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
        )}
      </button>
      <button
        className={controlButtonClass}
        onClick={onOpenSettings}
        title={copy.controls.settings}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
      </button>
      <div className="w-0 group-hover:w-[1px] h-4 bg-[rgba(0,0,0,0.08)] dark:bg-[rgba(255,255,255,0.10)] mx-[2px] opacity-0 group-hover:opacity-100 transition-all duration-250" />
      <button
        className="w-[20px] h-[20px] shrink-0 rounded-full border-none shadow-[0_0_0_2px_rgba(255,255,255,0.40),0_2px_8px_rgba(0,0,0,0.10)] dark:shadow-[0_0_0_2px_rgba(255,255,255,0.20)] cursor-pointer transition-all duration-350 opacity-100 pointer-events-auto overflow-visible p-0 m-0 hover:scale-[1.18] hover:shadow-[0_0_0_2px_rgba(255,255,255,0.70),0_2px_12px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_0_0_2px_rgba(255,255,255,0.40)]"
        onClick={onChangeColor}
        title={`${copy.accents.currentColor}: ${colorSample.name}`}
        style={{ background: accentColor }}
      />
    </div>
  );
}
