import React from 'react';
import { Trophy, Shield, X, User, Zap, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '../lib/firebase';
import { useAuthState, useSignInWithGoogle, useSignOut } from 'react-firebase-hooks/auth';
import { ActiveView } from '../App';

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: ActiveView;
  onViewChange: (view: ActiveView) => void;
  subMode: string;
  setSubMode: (mode: string) => void;
}

const NAV_ITEMS: { key: ActiveView; icon: React.ReactNode; label: string; accent: string }[] = [
  { key: 'rankings', icon: <Trophy />, label: 'Rankings', accent: 'accent-gold' },
  { key: 'crews',    icon: <Shield />, label: 'Crews',    accent: 'accent-purple' },
  { key: 'meta',     icon: <Zap />,   label: 'Meta Tracker', accent: 'accent-blue' },
];

export default function Sidebar({
  isOpen, onClose, activeView, onViewChange, subMode, setSubMode
}: SidebarProps) {
  const [user] = useAuthState(auth);
  const [signInWithGoogle] = useSignInWithGoogle(auth);
  const [signOut] = useSignOut(auth);

  const handleNavClick = (view: ActiveView) => {
    onViewChange(view);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />

          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed left-0 top-0 h-full w-72 bg-[#050505] border-r border-border-subtle z-50 flex flex-col"
          >
            {/* Logo */}
            <div className="pt-8 px-6 pb-6 border-b border-border-subtle">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-white font-black italic tracking-tighter text-2xl uppercase leading-none">Asia</span>
                  <span className="text-accent-gold font-bold text-[9px] uppercase tracking-[0.4em] mt-0.5">Competitive</span>
                </div>
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-xl border border-border-subtle flex items-center justify-center hover:bg-white/5 transition-all"
                >
                  <X className="w-4 h-4 text-[#444]" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* User Profile */}
              <div className="p-4 bg-[#0a0a0a] border border-border-subtle rounded-2xl">
                {user ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`}
                      alt="me"
                      className="w-11 h-11 rounded-xl border border-white/5"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{user.displayName}</p>
                      <button
                        onClick={() => signOut()}
                        className="flex items-center gap-1 text-[9px] text-[#555] font-bold uppercase tracking-widest hover:text-red-400 transition-colors mt-0.5"
                      >
                        <LogOut className="w-2.5 h-2.5" /> Sign Out
                      </button>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                  </div>
                ) : (
                  <button
                    onClick={() => signInWithGoogle()}
                    className="w-full py-3.5 bg-[#111] hover:bg-[#151515] border border-border-subtle rounded-xl text-[9px] font-black uppercase tracking-widest text-white transition-all flex items-center justify-center gap-2.5"
                  >
                    <User className="w-4 h-4 text-accent-blue" /> Sign In with Google
                  </button>
                )}
              </div>

              {/* Navigation */}
              <nav className="space-y-1">
                <p className="text-[9px] font-black text-[#222] uppercase tracking-[0.3em] px-2 mb-3">Navigation</p>
                {NAV_ITEMS.map(item => (
                  <button
                    key={item.key}
                    onClick={() => handleNavClick(item.key)}
                    className={`w-full flex items-center gap-3.5 p-3.5 rounded-xl transition-all ${
                      activeView === item.key
                        ? 'bg-white/5 text-white border border-white/8 font-black'
                        : 'text-[#555] hover:text-[#999] hover:bg-white/3'
                    }`}
                  >
                    <div className={`${activeView === item.key ? `text-${item.accent}` : ''} transition-colors`}>
                      {React.cloneElement(item.icon as React.ReactElement, { className: 'w-4 h-4' })}
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-[0.12em]">{item.label}</span>
                    {activeView === item.key && (
                      <motion.div layoutId="activeNav" className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-blue" />
                    )}
                  </button>
                ))}
              </nav>

              {/* Mode Section */}
              <div className="space-y-3">
                <p className="text-[9px] font-black text-[#222] uppercase tracking-[0.3em] px-2">System Mode</p>
                <div className="flex space-x-1 bg-[#0a0a0a] p-1.5 rounded-xl border border-border-subtle">
                  {['Normal', 'Skill'].map(mode => (
                    <button
                      key={mode}
                      onClick={() => setSubMode(mode)}
                      className={`flex-1 py-2.5 text-center text-[9px] font-bold uppercase tracking-widest rounded-lg transition-all ${
                        subMode === mode ? 'bg-[#1a1a1a] text-white border border-border-subtle shadow' : 'text-[#444]'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Info box */}
              <div className="p-4 bg-accent-blue/5 border border-accent-blue/15 rounded-xl">
                <p className="text-[9px] font-black text-accent-blue uppercase tracking-widest mb-1">🔴 Live Rankings</p>
                <p className="text-[10px] text-[#555] leading-relaxed">Rankings update in real-time as players compete across the Asia region.</p>
              </div>
            </div>

            <div className="p-6 border-t border-border-subtle">
              <p className="text-[9px] font-bold text-[#1a1a1a] text-center uppercase tracking-widest">
                v1.3.0 · Asia Competitive
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
