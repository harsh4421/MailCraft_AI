import React from 'react';
import { Sparkles, Cpu, Settings as SettingsIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DemoBannerProps {
  isDemoMode: boolean;
  aiModel?: string;
  className?: string;
}

export const DemoBanner: React.FC<DemoBannerProps> = ({
  isDemoMode,
  aiModel,
  className = '',
}) => {
  return (
    <div
      className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-xs border ${
        isDemoMode
          ? 'bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-300'
          : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
      } ${className}`}
    >
      <div className="flex items-center gap-2">
        {isDemoMode ? (
          <Cpu className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        ) : (
          <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        )}
        <span>
          <strong className="font-semibold">
            {isDemoMode ? 'Demo Mode Active' : 'Live AI Active'}:
          </strong>{' '}
          {isDemoMode
            ? 'Running local deterministic NLP engine (no API key required).'
            : `Connected to ${aiModel || 'OpenAI'}.`}
        </span>
      </div>
      <Link
        to="/settings"
        className="flex items-center gap-1 font-semibold hover:underline shrink-0 ml-2 text-[11px]"
      >
        <SettingsIcon className="w-3 h-3" />
        Configure AI
      </Link>
    </div>
  );
};
