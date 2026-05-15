import React, { useState, useEffect, useRef } from 'react';
import { Player } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Trophy, Sword, TrendingUp, Globe, ChevronDown, Star, Zap } from 'lucide-react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  limit 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from '../lib/firebase';
import ProfileModal from './ProfileModal';
import { useAuthState } from 'react-firebase-hooks/auth';

interface LeaderboardProps {
  externalSearchQuery?: string;
}

const RANK_COLORS: Record<number, { border: string; bg: string; text: string; glow: string; label: string }> = {
  1: { border: 'border-amber-400', bg: 'bg-amber-400/10', text: 'text-amber-400', glow: 'shadow-amber-400/20', label: '👑 Champion' },
  2: { border: 'border-slate-300', bg: 'bg-slate-300/10', text: 'text-slate-300', glow: 'shadow-slate-300/20', label: '⚔️ 2nd' },
  3: { border: 'border-amber-700', bg: 'bg-amber-700/10', text: 'text-amber-700', glow: 'shadow-amber-700/20', label: '🛡️ 3rd' },
};

const FRUIT_COLORS: Record<string, string> = {
  Dragon: 'bg-red-500/20 text-red-400 border-red-500/30',
  Control: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  Leopard: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Phoenix: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  Mammoth: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Light: 'bg-yellow-300/20 text-yellow-300 border-yellow-300/30',
  Flame: 'bg-red-400/20 text-red-300 border-red-400/30',
  Spirit: 'bg-cyan-400/20 text-cyan-300 border-cyan-400/30',
  Gravity: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  default: 'bg-white/5 text-white/50 border-white/10',
};

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(false);
  useEffect(() => {
    if (ref.current) return;
    ref.current = true;
    let start = 0;
    const duration = 800;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);
  return <span>{display.toLocaleString()}</span>;
}

function RankBadge({ rank }: { rank: number }) {
  if (rank > 3) return (
    <span className="text-[#444] font-black italic w-8 text-center tabular-nums">{rank}</span>
  );
  const style = RANK_COLORS[rank];
  return (
    <div className={`w-8 h-8 rounded-lg border ${style.border} ${style.bg} flex items-center justify-center shadow-lg ${style.glow}`}>
      <span className={`text-[10px] font-black ${style.text}`}>{rank}</span>
    </div>
  );
}

export default function Leaderboard({ externalSearchQuery = '' }: LeaderboardProps) {
  const [activeTab, setActiveTab] = useState<'Bounty' | 'Level'>('Bounty');
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [fruitFilter, setFruitFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [user] = useAuthState(auth);

  const searchQuery = externalSearchQuery || internalSearchQuery;

  useEffect(() => {
    const field = activeTab === 'Level' ? 'level' : 'bounty';
    const q = query(collection(db, 'players'), orderBy(field, 'desc'), limit(100));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const playersList = snapshot.docs.map((doc, index) => ({
        ...doc.data(),
        id: doc.id,
        rank: index + 1
      })) as Player[];
      setPlayers(playersList);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'players');
    });
    return () => unsubscribe();
  }, [activeTab]);

  // Derived filter options
  const allCountries = [...new Set(players.map(p => p.countryFlag).filter(Boolean))];
  const allFruits = [...new Set(players.flatMap(p => p.fruits ?? []))];

  const filteredPlayers = players.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCountry = countryFilter === 'all' || p.countryFlag === countryFilter;
    const matchFruit = fruitFilter === 'all' || (p.fruits ?? []).includes(fruitFilter);
    return matchSearch && matchCountry && matchFruit;
  });

  const topPlayers = filteredPlayers.slice(0, 3);
  const otherPlayers = filteredPlayers.slice(3);

  // Stats
  const totalBounty = players.reduce((s, p) => s + (p.bounty || 0), 0);
  const avgLevel = players.length ? Math.round(players.reduce((s, p) => s + (p.level || 0), 0) / players.length) : 0;

  const handlePlayerClick = (player: Player) => {
    setSelectedPlayer(player);
    setIsModalOpen(true);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="w-12 h-12 border-4 border-accent-blue border-t-transparent rounded-full animate-spin" />
      <p className="text-[#333] text-xs font-bold uppercase tracking-widest animate-pulse">Fetching Rankings...</p>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-10">
      <ProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        player={selectedPlayer}
        isOwnProfile={user?.uid === selectedPlayer?.id}
      />

      {/* Quick Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-3 gap-3"
      >
        {[
          { label: 'Total Players', value: players.length, icon: <Globe className="w-3.5 h-3.5" />, color: 'text-accent-blue' },
          { label: 'Total Bounty', value: `${(totalBounty / 1_000_000).toFixed(0)}M`, icon: <Trophy className="w-3.5 h-3.5" />, color: 'text-accent-gold', raw: false },
          { label: 'Avg Level', value: avgLevel, icon: <TrendingUp className="w-3.5 h-3.5" />, color: 'text-accent-purple' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[#0a0a0a] border border-border-subtle rounded-2xl p-4 flex flex-col gap-1"
          >
            <div className={`flex items-center gap-1.5 ${stat.color} opacity-70`}>
              {stat.icon}
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">{stat.label}</span>
            </div>
            <span className="text-white font-black text-lg italic tabular-nums">
              {typeof stat.value === 'number' ? <AnimatedNumber value={stat.value} /> : stat.value}
            </span>
          </motion.div>
        ))}
      </motion.div>

      {/* Controls */}
      <div className="space-y-4 border-b border-border-subtle pb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-black italic tracking-tighter text-white uppercase">Asia Rankings</h3>
            <p className="text-[10px] font-bold text-[#333] uppercase tracking-[0.2em] mt-1">Official Competitive Standings</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            {/* Tab Toggle */}
            <div className="flex space-x-1 bg-[#0a0a0a] p-1.5 rounded-2xl border border-border-subtle">
              {(['Bounty', 'Level'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                    activeTab === tab ? 'bg-[#151515] text-white shadow-xl border border-white/5' : 'text-[#333]'
                  }`}
                >
                  {tab === 'Bounty' ? <Trophy className="w-3 h-3" /> : <Sword className="w-3 h-3" />}
                  {tab}
                </button>
              ))}
            </div>

            {/* Search */}
            {!externalSearchQuery && (
              <div className="relative w-full sm:w-56">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#333]" />
                <input
                  type="text"
                  placeholder="Find Player..."
                  value={searchQuery}
                  onChange={(e) => setInternalSearchQuery(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 bg-[#0a0a0a] border border-border-subtle rounded-2xl text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-accent-blue transition-all text-white"
                />
              </div>
            )}

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 h-12 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                showFilters || countryFilter !== 'all' || fruitFilter !== 'all'
                  ? 'bg-accent-blue/10 border-accent-blue/30 text-accent-blue'
                  : 'border-border-subtle text-[#444] bg-[#0a0a0a]'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              Filter
              <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Expandable Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-[9px] font-black text-[#444] uppercase tracking-widest mb-2">Country</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setCountryFilter('all')}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${countryFilter === 'all' ? 'bg-accent-blue/20 border-accent-blue/40 text-accent-blue' : 'border-border-subtle text-[#444]'}`}
                    >
                      All
                    </button>
                    {allCountries.map(flag => (
                      <button
                        key={flag}
                        onClick={() => setCountryFilter(flag === countryFilter ? 'all' : flag)}
                        className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${countryFilter === flag ? 'bg-accent-blue/20 border-accent-blue/40' : 'border-border-subtle'}`}
                      >
                        {flag}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[9px] font-black text-[#444] uppercase tracking-widest mb-2">Fruit</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setFruitFilter('all')}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${fruitFilter === 'all' ? 'bg-accent-blue/20 border-accent-blue/40 text-accent-blue' : 'border-border-subtle text-[#444]'}`}
                    >
                      All
                    </button>
                    {allFruits.slice(0, 8).map(fruit => (
                      <button
                        key={fruit}
                        onClick={() => setFruitFilter(fruit === fruitFilter ? 'all' : fruit)}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-bold border transition-all ${
                          fruitFilter === fruit
                            ? 'bg-accent-blue/20 border-accent-blue/40 text-accent-blue'
                            : 'border-border-subtle text-[#444]'
                        }`}
                      >
                        {fruit}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Podium */}
      {topPlayers.length >= 1 && (
        <div className="flex items-end justify-center px-4 space-x-2 sm:space-x-4">
          {[1, 0, 2].map((posIdx, i) => {
            const p = topPlayers[posIdx];
            if (!p) return null;
            const isFirst = posIdx === 0;
            const isSecond = posIdx === 1;
            const style = RANK_COLORS[posIdx + 1] || RANK_COLORS[3];
            const heights = ['h-20 sm:h-28', 'h-28 sm:h-36', 'h-14 sm:h-20'];
            const widths = ['w-24 sm:w-32', 'w-28 sm:w-36', 'w-20 sm:w-28'];
            const avatarSizes = ['w-14 h-14 sm:w-16 sm:h-16', 'w-16 h-16 sm:w-20 sm:h-20', 'w-12 h-12 sm:w-14 sm:h-14'];

            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12, type: 'spring', stiffness: 120 }}
                onClick={() => handlePlayerClick(p)}
                className="flex flex-col items-center cursor-pointer group"
              >
                {/* Avatar */}
                <div className="relative mb-3">
                  {isFirst && (
                    <motion.div
                      animate={{ rotate: [0, -5, 5, 0] }}
                      transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                      className="absolute -top-7 left-1/2 -translate-x-1/2 text-2xl z-10"
                    >
                      👑
                    </motion.div>
                  )}
                  <div className={`${avatarSizes[i]} rounded-full border-2 ${style.border} p-0.5 ${isFirst ? `shadow-lg ${style.glow}` : ''} group-hover:scale-105 transition-transform`}>
                    <div className="w-full h-full rounded-full bg-[#0a0a0a] overflow-hidden">
                      <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                  </div>
                  {p.countryFlag && (
                    <span className="absolute -bottom-1 -right-1 text-base leading-none">{p.countryFlag}</span>
                  )}
                </div>

                {/* Name */}
                <p className="text-white text-[10px] font-black uppercase tracking-tight mb-1 max-w-[90px] text-center truncate">{p.name}</p>
                <p className={`text-[9px] font-black tracking-widest mb-2 ${style.text}`}>
                  {activeTab === 'Level' ? `LVL ${p.level}` : `${(p.bounty / 1_000_000).toFixed(1)}M`}
                </p>

                {/* Podium block */}
                <div className={`${widths[i]} ${heights[i]} relative overflow-hidden rounded-t-2xl border-t border-x ${style.border} opacity-80 border-opacity-30`}>
                  <div className={`absolute inset-0 ${style.bg}`} />
                  <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent" />
                  <div className={`absolute top-3 left-1/2 -translate-x-1/2 ${style.text} font-black text-xl`}>
                    {posIdx + 1}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Player List */}
      <div className="bg-[#080808] rounded-t-[40px] p-5 sm:p-8 -mx-4 sm:mx-0 space-y-2.5 border-t border-border-subtle min-h-[300px]">
        {/* Header row */}
        <div className="flex items-center justify-between px-4 mb-4">
          <span className="text-[9px] font-black text-[#222] uppercase tracking-widest">Player</span>
          <span className="text-[9px] font-black text-[#222] uppercase tracking-widest">{activeTab}</span>
        </div>

        <AnimatePresence mode="popLayout">
          {otherPlayers.length > 0 ? otherPlayers.map((player, index) => (
            <motion.div
              key={player.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ delay: Math.min(index * 0.04, 0.3) }}
              onClick={() => handlePlayerClick(player)}
              className="flex items-center justify-between p-4 bg-[#0a0a0a] border border-border-subtle rounded-[20px] hover:border-[#2a2a2a] hover:bg-[#0f0f0f] transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <RankBadge rank={player.rank!} />

                {/* Avatar */}
                <div className="relative w-11 h-11 rounded-xl bg-[#111] border border-border-subtle overflow-hidden group-hover:scale-105 transition-transform flex-shrink-0">
                  <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />
                  {player.countryFlag && (
                    <span className="absolute -bottom-0.5 -right-0.5 text-xs leading-none">{player.countryFlag}</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-black uppercase tracking-tight group-hover:text-accent-blue transition-colors truncate max-w-[120px] sm:max-w-none">
                      {player.name}
                    </span>
                  </div>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {(player.fruits ?? []).slice(0, 2).map(fruit => (
                      <span
                        key={fruit}
                        className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${FRUIT_COLORS[fruit] ?? FRUIT_COLORS.default}`}
                      >
                        {fruit}
                      </span>
                    ))}
                    {(player.fruits ?? []).length > 2 && (
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold border border-white/5 text-[#444]">
                        +{(player.fruits ?? []).length - 2}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right flex-shrink-0 ml-4">
                <div className="text-white text-sm font-black italic tracking-tighter tabular-nums">
                  {activeTab === 'Level' ? `LVL ${player.level.toLocaleString()}` : `${(player.bounty / 1_000_000).toFixed(1)}M`}
                </div>
                <div className="text-[#333] text-[8px] font-black uppercase tracking-widest mt-0.5 flex items-center justify-end gap-1">
                  {activeTab === 'Level' ? <Sword className="w-2.5 h-2.5 opacity-40" /> : <Trophy className="w-2.5 h-2.5 opacity-40" />}
                  Rank #{player.rank}
                </div>
              </div>
            </motion.div>
          )) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center py-20 gap-3"
            >
              <Search className="w-8 h-8 text-[#222]" />
              <p className="text-[#444] font-bold uppercase tracking-[0.2em] text-xs">No players found</p>
              {(countryFilter !== 'all' || fruitFilter !== 'all') && (
                <button
                  onClick={() => { setCountryFilter('all'); setFruitFilter('all'); }}
                  className="text-accent-blue text-[10px] font-bold uppercase tracking-widest hover:underline"
                >
                  Clear filters
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
