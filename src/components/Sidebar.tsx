import React from 'react';
import { 
  Trophy, 
  Shield, 
  X,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '../lib/firebase';
import { useAuthState, useSignInWithGoogle, useSignOut } from 'react-firebase-hooks/auth';

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: 'rankings' | 'crews';
  onViewChange: (view: 'rankings' | 'crews') => void;
  subMode: string;
  setSubMode: (mode: string) => void;
}

export default function Sidebar({ 
  isOpen, 
  onClose, 
  activeView,
  onViewChange,
  subMode, 
  setSubMode 
}: SidebarProps) {
  const [user] = useAuthState(auth);
  const [signInWithGoogle] = useSignInWithGoogle(auth);
  const [signOut] = useSignOut(auth);

  const handleNavClick = (view: 'rankings' | 'crews') => {
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
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-72 bg-[#050505] border-r border-border-subtle z-50 flex flex-col"
          >
            <div className="pt-16 px-8 pb-8 border-b border-border-subtle">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-white font-black italic tracking-tighter text-2xl uppercase leading-none">Asia</span>
                  <span className="text-accent-gold font-bold text-[10px] uppercase tracking-[0.4em] mt-1">Competitive</span>
                </div>
                <button 
                  onClick={onClose}
                  className="w-10 h-10 rounded-full border border-border-subtle flex items-center justify-center lg:hidden"
                >
                  <X className="w-5 h-5 text-[#444]" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* User Profile Section */}
              <div className="p-5 bg-item-dark border border-border-subtle rounded-[24px] space-y-4">
                {user ? (
                  <div className="flex items-center gap-3">
                    <img 
                      src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} 
                      alt="me" 
                      className="w-12 h-12 rounded-2xl border border-white/5" 
                    />
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-bold text-white truncate">{user.displayName}</span>
                      <button 
                        onClick={() => signOut()} 
                        className="text-[9px] text-[#555] font-bold uppercase tracking-widest flex items-center gap-1 hover:text-red-500 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => signInWithGoogle()}
                    className="w-full py-4 bg-[#111] hover:bg-[#151515] border border-border-subtle rounded-2xl text-[9px] font-black uppercase tracking-widest text-white transition-all flex items-center justify-center gap-3"
                  >
                    <User className="w-4 h-4 text-accent-blue" /> Login
                  </button>
                )}
              </div>

              {/* Main Nav */}
              <nav className="space-y-2">
                <NavItem 
                  icon={<Trophy />} 
                  label="Rankings" 
                  active={activeView === 'rankings'} 
                  onClick={() => handleNavClick('rankings')} 
                />
                <NavItem 
                  icon={<Shield />} 
                  label="Crews" 
                  active={activeView === 'crews'} 
                  onClick={() => handleNavClick('crews')} 
                />
              </nav>

              {/* Mode Section */}
              <div className="space-y-4">
                <label className="text-[9px] font-black text-[#333] uppercase tracking-[0.3em] pl-2">System Mode</label>
                <div className="flex space-x-1 bg-[#0a0a0a] p-1.5 rounded-2xl border border-border-subtle">
                  <button 
                    onClick={() => setSubMode('Normal')}
                    className={`flex-1 py-3 text-center text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${
                      subMode === 'Normal' ? 'bg-[#1a1a1a] text-white shadow-lg' : 'text-[#444]'
                    }`}
                  >
                    Normal
                  </button>
                  <button 
                    onClick={() => setSubMode('Skill')}
                    className={`flex-1 py-3 text-center text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${
                      subMode === 'Skill' ? 'bg-[#1a1a1a] text-white shadow-lg' : 'text-[#444]'
                    }`}
                  >
                    Skill
                  </button>
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-border-subtle">
              <p className="text-[10px] font-bold text-[#222] text-center uppercase tracking-widest">
                v1.2.0-stable
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
        active 
          ? 'bg-accent-blue/5 text-accent-blue border border-accent-blue/10 font-black' 
          : 'text-[#555] hover:text-white hover:bg-white/5'
      }`}
    >
      {React.cloneElement(icon as React.ReactElement, { className: 'w-5 h-5' })}
      <span className="text-[11px] font-bold uppercase tracking-[0.15em]">{label}</span>
    </button>
  );
}
