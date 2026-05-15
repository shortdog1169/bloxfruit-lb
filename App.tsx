/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Leaderboard from './components/Leaderboard';
import Crews from './components/Crews';
import MetaTracker from './components/MetaTracker';
import { motion, AnimatePresence } from 'motion/react';
import { seedPlayers } from './lib/seedData';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { db } from './lib/firebase';

export type ActiveView = 'rankings' | 'crews' | 'meta';

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<ActiveView>('rankings');
  const [subMode, setSubMode] = useState('Normal');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const checkAndSeed = async () => {
      try {
        const q = query(collection(db, 'players'), limit(1));
        const snap = await getDocs(q);
        if (snap.empty) {
          console.log('Database empty, seeding initial data...');
          await seedPlayers();
        }
      } catch (error) {
        console.warn('Initial seeding skipped (permission or auth issue).');
      }
    };
    checkAndSeed();
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-bg-dark text-white selection:bg-accent-blue/30 flex flex-col">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeView={activeView}
        onViewChange={setActiveView}
        subMode={subMode}
        setSubMode={setSubMode}
      />

      <Header onMenuClick={toggleSidebar} onSearch={setSearchQuery} activeView={activeView} />

      <main className="flex-1">
        <AnimatePresence mode="wait">
          {activeView === 'rankings' && (
            <motion.div
              key="rankings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="pb-20"
            >
              <div className="p-8 sm:p-12 max-w-4xl mx-auto flex flex-col items-center text-center">
                <motion.span
                  initial={{ opacity: 0, letterSpacing: '0.2em' }}
                  animate={{ opacity: 1, letterSpacing: '0.5em' }}
                  transition={{ duration: 0.6 }}
                  className="text-accent-gold font-black uppercase text-[10px] mb-4"
                >
                  Asia Competitive
                </motion.span>
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-5xl font-black italic text-white tracking-tighter uppercase leading-none"
                >
                  Player Rankings
                </motion.h2>
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="w-12 h-1 bg-accent-blue mt-6 rounded-full opacity-50"
                />
              </div>
              <Leaderboard externalSearchQuery={searchQuery} />
            </motion.div>
          )}

          {activeView === 'crews' && (
            <motion.div
              key="crews"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="pb-20"
            >
              <div className="p-8 sm:p-12 max-w-4xl mx-auto flex flex-col items-center text-center">
                <span className="text-accent-purple font-black uppercase tracking-[0.5em] text-[10px] mb-4">Competitive</span>
                <h2 className="text-5xl font-black italic text-white tracking-tighter uppercase leading-none">Crews</h2>
                <div className="w-12 h-1 bg-accent-purple mt-6 rounded-full opacity-50" />
              </div>
              <Crews externalSearchQuery={searchQuery} />
            </motion.div>
          )}

          {activeView === 'meta' && (
            <motion.div
              key="meta"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="pb-20"
            >
              <div className="p-8 sm:p-12 max-w-4xl mx-auto flex flex-col items-center text-center">
                <span className="text-accent-blue font-black uppercase tracking-[0.5em] text-[10px] mb-4">Live Data</span>
                <h2 className="text-5xl font-black italic text-white tracking-tighter uppercase leading-none">Meta Tracker</h2>
                <div className="w-12 h-1 bg-accent-blue mt-6 rounded-full opacity-50" />
              </div>
              <MetaTracker />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="py-20 px-8 text-center border-t border-border-subtle bg-[#050505]">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black text-[#222] uppercase tracking-[1em] mb-4">Official Competitive Platform</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-12 opacity-20 grayscale">
              {['Void', 'Zenith', 'Nova', 'Echo'].map(name => (
                <span key={name} className="font-black italic tracking-tighter uppercase text-lg">{name}</span>
              ))}
            </div>
          </div>
          <p className="text-[8px] font-bold text-[#111] uppercase tracking-[0.5em] pt-8">
            © 2026 Competitive Asia. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
