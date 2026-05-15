import React from 'react';
import { Search, Menu } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
  onSearch: (query: string) => void;
}

export default function Header({ onMenuClick, onSearch }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 px-6 h-20 bg-gradient-to-b from-[#1a1a1a] to-bg-dark border-b border-border-subtle">
      <button 
        onClick={onMenuClick}
        className="w-10 h-10 rounded-full border border-[#333] flex items-center justify-center hover:bg-white/5 transition-colors"
      >
        <Menu className="w-5 h-5 text-[#666]" />
      </button>
      
      <div className="flex-1 relative max-w-xl mx-auto">
        <h1 className="text-white font-bold tracking-tight text-lg uppercase text-center hidden sm:block">Asia Rankings</h1>
        <div className="sm:hidden flex items-center justify-center">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444]" />
           <input 
            type="text" 
            placeholder="Search..." 
            onChange={(e) => onSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-[#111] border border-border-subtle rounded-xl text-sm focus:outline-none focus:border-[#333] transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-[#222] border border-[#444] overflow-hidden">
          <div className="w-full h-full bg-gradient-to-tr from-accent-blue to-accent-purple"></div>
        </div>
      </div>
    </header>
  );
}
