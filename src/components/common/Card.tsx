import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', id }) => {
  return (
    <div
      id={id}
      className={`bg-zinc-900/70 border border-zinc-800/80 rounded-xl p-3.5 sm:p-4.5 backdrop-blur-xs shadow-xs ${className}`}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, action, icon, className = '' }) => {
  return (
    <div className={`flex items-start justify-between gap-4 pb-3 border-b border-zinc-800/60 mb-3.5 ${className}`}>
      <div className="flex items-center gap-2.5 sm:gap-3">
        {icon && (
          <div className="w-8 h-8 rounded-lg bg-zinc-800/80 text-blue-400 border border-zinc-700/50 flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-sm sm:text-[15px] font-semibold text-zinc-100 leading-snug">{title}</h3>
          {subtitle && <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};
