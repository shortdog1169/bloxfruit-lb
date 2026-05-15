/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Leaderboard from './components/Leaderboard';
import Crews from './components/Crews';
import { motion, AnimatePresence } from 'motion/react';
import { seedPlayers } from './lib/seedData';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { db } from './lib/firebase';

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<'rankings' | 'crews'>('rankings');
  const [subMode, setSubMode] = useState('Normal');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Auto-seed if empty
    const checkAndSeed = async () => {
      try {
        const q = query(collection(db, 'players'), limit(1));
        const snap = await getDocs(q);
        if (snap.empty) {
          console.log('Database empty, seeding initial data...');
          await seedPlayers();
        }
      } catch (error) {
        console.warn('Initial seeding skipped (permission or auth issue). Please login to initialize data.');
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
      
      <Header onMenuClick={toggleSidebar} onSearch={setSearchQuery} />
      
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {activeView === 'rankings' ? (
            <motion.div
              key="rankings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="pb-20"
            >
              <div className="p-8 sm:p-12 max-w-4xl mx-auto flex flex-col items-center text-center">
                <span className="text-accent-gold font-black uppercase tracking-[0.5em] text-[10px] mb-4">Asia Competitive</span>
                <h2 className="text-5xl font-black italic text-white tracking-tighter uppercase leading-none">
                  Player Rankings
                </h2>
                <div className="w-12 h-1 bg-accent-blue mt-6 rounded-full opacity-50" />
              </div>
              <Leaderboard externalSearchQuery={searchQuery} />
            </motion.div>
          ) : (
            <motion.div
              key="crews"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="pb-20"
            >
              <Crews externalSearchQuery={searchQuery} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="py-20 px-8 text-center border-t border-border-subtle bg-[#050505]">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black text-[#222] uppercase tracking-[1em] mb-4">Official Competitive Platform</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-12 opacity-20 grayscale">
              <span className="font-black italic tracking-tighter uppercase text-lg">Void</span>
              <span className="font-black italic tracking-tighter uppercase text-lg">Zenith</span>
              <span className="font-black italic tracking-tighter uppercase text-lg">Nova</span>
              <span className="font-black italic tracking-tighter uppercase text-lg">Echo</span>
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
