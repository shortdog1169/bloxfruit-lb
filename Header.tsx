import React from 'react';
import { Search, Menu, Trophy, Shield, Zap } from 'lucide-react';
import { ActiveView } from '../App';

interface HeaderProps {
  onMenuClick: () => void;
  onSearch: (query: string) => void;
  activeView?: ActiveView;
}

const VIEW_META: Record<ActiveView, { label: string; icon: React.ReactNode; color: string }> = {
  rankings: { label: 'Asia Rankings', icon: <Trophy className="w-4 h-4" />, color: 'text-accent-gold' },
  crews:    { label: 'Crews',         icon: <Shield className="w-4 h-4" />,  color: 'text-accent-purple' },
  meta:     { label: 'Meta Tracker',  icon: <Zap className="w-4 h-4" />,    color: 'text-accent-blue' },
};

export default function Header({ onMenuClick, onSearch, activeView = 'rankings' }: HeaderProps) {
  const meta = VIEW_META[activeView];

  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 px-5 h-16 bg-[#050505]/90 border-b border-border-subtle backdrop-blur-xl">
      <button
        onClick={onMenuClick}
        className="w-9 h-9 rounded-xl border border-[#1a1a1a] flex items-center justify-center hover:bg-white/5 transition-all group"
      >
        <Menu className="w-4 h-4 text-[#555] group-hover:text-white transition-colors" />
      </button>

      {/* Center: title on desktop, search on mobile */}
      <div className="flex-1">
        {/* Desktop title */}
        <div className="hidden sm:flex items-center justify-center gap-2">
          <span className={meta.color}>{meta.icon}</span>
          <span className="text-white font-black tracking-tight text-base uppercase">{meta.label}</span>
        </div>
        {/* Mobile search */}
        <div className="sm:hidden relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#444]" />
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => onSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-4 bg-[#111] border border-border-subtle rounded-xl text-xs focus:outline-none focus:border-[#333] transition-all text-white"
          />
        </div>
      </div>

      {/* Right side: desktop search */}
      <div className="hidden sm:flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#333]" />
          <input
            type="text"
            placeholder="Search players..."
            onChange={(e) => onSearch(e.target.value)}
            className="w-44 h-9 pl-9 pr-4 bg-[#111] border border-border-subtle rounded-xl text-[11px] focus:outline-none focus:border-[#333] focus:w-56 transition-all text-white placeholder:text-[#333]"
          />
        </div>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-accent-blue to-accent-purple border border-white/10" />
      </div>
    </header>
  );
}
