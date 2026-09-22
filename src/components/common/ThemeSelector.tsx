import React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme, ThemeMode } from '../../context/ThemeContext';

interface ThemeSelectorProps {
  className?: string;
  variant?: 'compact' | 'segmented' | 'dropdown';
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  className = '',
  variant = 'segmented',
}) => {
  const { theme, setTheme } = useTheme();

  const options: { mode: ThemeMode; label: string; icon: typeof Moon }[] = [
    { mode: 'dark', label: 'Dark', icon: Moon },
    { mode: 'light', label: 'Light', icon: Sun },
    { mode: 'system', label: 'System', icon: Monitor },
  ];

  if (variant === 'compact') {
    return (
      <div
        className={`inline-flex items-center p-0.5 rounded-lg bg-zinc-950/60 light:bg-zinc-200/80 border border-zinc-800 light:border-zinc-300 ${className}`}
        role="radiogroup"
        aria-label="Theme selector"
      >
        {options.map((opt) => {
          const Icon = opt.icon;
          const isActive = theme === opt.mode;
          return (
            <button
              key={opt.mode}
              onClick={() => setTheme(opt.mode)}
              role="radio"
              aria-checked={isActive}
              aria-label={`Switch to ${opt.label} theme`}
              title={`Switch to ${opt.label} theme`}
              className={`p-1.5 rounded-md text-xs transition-all cursor-pointer flex items-center justify-center ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 light:text-zinc-600 light:hover:text-zinc-900 hover:bg-zinc-850/60 light:hover:bg-zinc-300/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center p-1 rounded-lg bg-zinc-950/60 light:bg-zinc-200/80 border border-zinc-800/80 light:border-zinc-300 select-none ${className}`}
      role="radiogroup"
      aria-label="Theme selector"
    >
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = theme === opt.mode;
        return (
          <button
            key={opt.mode}
            onClick={() => setTheme(opt.mode)}
            role="radio"
            aria-checked={isActive}
            aria-label={`Switch to ${opt.label} theme`}
            title={`Switch to ${opt.label} theme`}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
              isActive
                ? 'bg-blue-600 text-white shadow-xs font-semibold'
                : 'text-zinc-400 hover:text-zinc-200 light:text-zinc-600 light:hover:text-zinc-900 hover:bg-zinc-850/60 light:hover:bg-zinc-300/60'
            }`}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};
