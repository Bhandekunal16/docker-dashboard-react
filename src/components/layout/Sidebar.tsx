import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Box, Package, ChevronLeft, ChevronRight, Server, Keyboard } from 'lucide-react';
import { useConfig } from '../../context/ConfigContext';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const { apiBaseUrl, setIsApiConfigModalOpen, setIsShortcutsModalOpen } = useConfig();

  const navItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: LayoutDashboard,
      shortcut: '1',
    },
    {
      name: 'Containers',
      path: '/containers',
      icon: Box,
      shortcut: '2',
    },
    {
      name: 'Images',
      path: '/images',
      icon: Package,
      shortcut: '3',
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-zinc-900 border-r border-zinc-800 select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-zinc-800">
        <div className="flex items-center gap-3 overflow-hidden">
          {/* Docker-inspired Whale / Container logo */}
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600 text-white shadow-md shadow-blue-600/30 shrink-0">
            <svg
              className="w-5 h-5 fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M13 3h3v3h-3V3zm-4 0h3v3H9V3zm-4 0h3v3H5V3zm12 4h3v3h-3V7zm-4 0h3v3h-3V7zm-4 0h3v3H9V7zm-4 0h3v3H5V7zm12 4h3v3h-3v-3zm-4 0h3v3h-3v-3zm-4 0h3v3H9v-3zm-4 0h3v3H5v-3zm-3 0h2v3H2v-3zm20 3.3c-.6-.4-1.6-.5-2.5-.2-.3-1.4-1.3-2.5-2.8-2.8-1.5-.3-3 .4-3.7 1.7H1c-.6 0-1 .4-1 1 0 5.5 4.5 10 10 10 6.6 0 11.5-4.4 12.8-9.7.3-1.2-.1-2.4-1-3z" />
            </svg>
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <h1 className="text-sm font-bold tracking-tight text-zinc-100">
                Docker
              </h1>
              <p className="text-[11px] text-zinc-400 truncate">REST API Client</p>
            </div>
          )}
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 border border-transparent'
                }`
              }
              title={isCollapsed ? `${item.name} (Key: ${item.shortcut})` : undefined}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span>{item.name}</span>}
              </div>
              {!isCollapsed && (
                <kbd className="hidden lg:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-950/80 text-zinc-500 border border-zinc-800">
                  {item.shortcut}
                </kbd>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Actions: Shortcuts & Host Configuration */}
      <div className="p-3 border-t border-zinc-800 bg-zinc-900/50 space-y-2">
        {/* Quick Shortcuts Trigger */}
        <button
          onClick={() => setIsShortcutsModalOpen(true)}
          className="w-full flex items-center gap-2.5 p-2 rounded-lg bg-zinc-950/40 border border-zinc-800/70 text-left hover:border-zinc-700 hover:bg-zinc-950/80 transition-colors cursor-pointer text-zinc-400 hover:text-zinc-200"
          title="Keyboard Shortcuts (Press ?)"
        >
          <Keyboard className="w-4 h-4 text-zinc-400 shrink-0" />
          {!isCollapsed && (
            <div className="flex-1 flex items-center justify-between text-xs">
              <span>Shortcuts</span>
              <kbd className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-900 border border-zinc-750 text-zinc-400">
                ?
              </kbd>
            </div>
          )}
        </button>

        {/* API Endpoint Indicator */}
        <button
          onClick={() => setIsApiConfigModalOpen(true)}
          className="w-full flex items-center gap-2.5 p-2 rounded-lg bg-zinc-950/60 border border-zinc-800 text-left hover:border-zinc-700 transition-colors cursor-pointer"
          title="Configure API Base URL"
        >
          <Server className="w-4 h-4 text-blue-400 shrink-0" />
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">
                API Endpoint
              </div>
              <div className="text-xs font-mono text-zinc-300 truncate">
                {apiBaseUrl}
              </div>
            </div>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:block transition-all duration-200 ease-in-out shrink-0 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative w-64 max-w-[80vw] h-full z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
