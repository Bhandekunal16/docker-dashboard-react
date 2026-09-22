import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Keyboard,
  LayoutDashboard,
  Box,
  Package,
  RefreshCw,
  Settings,
  CornerDownLeft,
} from 'lucide-react';
import { useConfig } from '../../context/ConfigContext';
import { useQueryClient } from '@tanstack/react-query';

interface ShortcutItem {
  keys: string[];
  description: string;
  icon?: React.ReactNode;
  action?: () => void;
  badge?: string;
}

interface ShortcutSection {
  title: string;
  items: ShortcutItem[];
}

export const KeyboardShortcutsModal: React.FC = () => {
  const {
    isShortcutsModalOpen,
    setIsShortcutsModalOpen,
    setIsApiConfigModalOpen,
    checkConnection,
    addToast,
  } = useConfig();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  if (!isShortcutsModalOpen) return null;

  const sections: ShortcutSection[] = [
    {
      title: 'Page Navigation',
      items: [
        {
          keys: ['G', 'D'],
          description: 'Navigate to Dashboard',
          icon: <LayoutDashboard className="w-4 h-4 text-blue-400" />,
          action: () => {
            navigate('/');
            setIsShortcutsModalOpen(false);
          },
          badge: 'or press 1',
        },
        {
          keys: ['G', 'C'],
          description: 'Navigate to Containers Management',
          icon: <Box className="w-4 h-4 text-emerald-400" />,
          action: () => {
            navigate('/containers');
            setIsShortcutsModalOpen(false);
          },
          badge: 'or press 2',
        },
        {
          keys: ['G', 'I'],
          description: 'Navigate to Docker Images',
          icon: <Package className="w-4 h-4 text-amber-400" />,
          action: () => {
            navigate('/images');
            setIsShortcutsModalOpen(false);
          },
          badge: 'or press 3',
        },
      ],
    },
    {
      title: 'Host Operations & System',
      items: [
        {
          keys: ['R'],
          description: 'Refresh all container & image queries',
          icon: <RefreshCw className="w-4 h-4 text-cyan-400" />,
          action: () => {
            queryClient.refetchQueries();
            checkConnection();
            addToast('info', 'Refreshed', 'Refreshed container and image data');
            setIsShortcutsModalOpen(false);
          },
        },
        {
          keys: ['S'],
          description: 'Open API Connection Settings modal',
          icon: <Settings className="w-4 h-4 text-purple-400" />,
          action: () => {
            setIsShortcutsModalOpen(false);
            setIsApiConfigModalOpen(true);
          },
        },
        {
          keys: ['?'],
          description: 'Toggle this keyboard shortcut helper',
          icon: <Keyboard className="w-4 h-4 text-zinc-400" />,
          badge: 'Shift + /',
        },
        {
          keys: ['Esc'],
          description: 'Close active modal or drawer',
          icon: <CornerDownLeft className="w-4 h-4 text-rose-400" />,
          action: () => setIsShortcutsModalOpen(false),
        },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
        onClick={() => setIsShortcutsModalOpen(false)}
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-modal-title"
        className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-6 z-10 animate-in zoom-in-95 duration-150"
      >
        {/* Close Button */}
        <button
          onClick={() => setIsShortcutsModalOpen(false)}
          className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          aria-label="Close shortcuts modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-zinc-800">
          <div className="p-2.5 rounded-lg bg-zinc-800/80 text-zinc-200 border border-zinc-700/60">
            <Keyboard className="w-5 h-5" />
          </div>
          <div>
            <h3 id="shortcuts-modal-title" className="text-base font-semibold text-zinc-100 flex items-center gap-2">
              Keyboard Shortcuts
              <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/50 font-mono">
                Press ? anytime
              </span>
            </h3>
            <p className="text-xs text-zinc-400">
              Quickly navigate between views and trigger actions with zero latency
            </p>
          </div>
        </div>

        {/* Shortcuts Content */}
        <div className="mt-5 space-y-5 max-h-[60vh] overflow-y-auto pr-1">
          {sections.map((section) => (
            <div key={section.title} className="space-y-2">
              <h4 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider px-1">
                {section.title}
              </h4>
              <div className="space-y-1.5">
                {section.items.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={item.action}
                    className={`flex items-center justify-between p-2.5 rounded-lg border border-zinc-800/80 bg-zinc-950/60 hover:bg-zinc-800/50 hover:border-zinc-700 transition-colors ${
                      item.action ? 'cursor-pointer' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {item.icon}
                      <span className="text-xs text-zinc-200 font-medium truncate">
                        {item.description}
                      </span>
                      {item.badge && (
                        <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">
                          ({item.badge})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      {item.keys.map((k, kIdx) => (
                        <React.Fragment key={k}>
                          {kIdx > 0 && <span className="text-zinc-600 text-xs font-mono">+</span>}
                          <kbd className="min-w-6 text-center px-2 py-1 text-[11px] font-mono font-semibold bg-zinc-900 text-zinc-200 rounded border border-zinc-700 shadow-xs">
                            {k}
                          </kbd>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer tip */}
        <div className="mt-5 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
          <span className="text-[11px] text-zinc-500">
            Tip: Chords like <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-zinc-800 text-zinc-300 rounded border border-zinc-700">G</kbd> then <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-zinc-800 text-zinc-300 rounded border border-zinc-700">D</kbd> or single digits work from any page.
          </span>
          <button
            onClick={() => setIsShortcutsModalOpen(false)}
            className="px-3 py-1 rounded bg-zinc-800 text-zinc-200 hover:bg-zinc-700 text-xs transition-colors cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
