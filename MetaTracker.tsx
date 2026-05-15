import React, { useState, useEffect } from 'react';
import { Player } from '../types';
import { motion } from 'motion/react';
import { Zap, TrendingUp, Award, BarChart3, Globe, Shield } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

const FRUIT_EMOJIS: Record<string, string> = {
  Dragon: '🐉', Control: '🌀', Leopard: '🐆', Phoenix: '🔥', Mammoth: '🦣',
  Light: '⚡', Flame: '🌋', Spirit: '👻', Gravity: '🌑', Ice: '❄️',
  Venom: '☠️', Quake: '💥', Dough: '🍞', Shadow: '🌑', Love: '💘',
  default: '🍎'
};

const FRUIT_TIER: Record<string, string> = {
  Dragon: 'S', Control: 'S', Leopard: 'S', Phoenix: 'A', Mammoth: 'A',
  Spirit: 'A', Gravity: 'B', Light: 'B', Flame: 'B', default: 'C'
};

const TIER_COLORS: Record<string, string> = {
  S: 'text-red-400 border-red-500/40 bg-red-500/10',
  A: 'text-orange-400 border-orange-500/40 bg-orange-500/10',
  B: 'text-yellow-400 border-yellow-500/40 bg-yellow-500/10',
  C: 'text-slate-400 border-slate-500/40 bg-slate-500/10',
};

interface FruitStat {
  name: string;
  count: number;
  pct: number;
  tier: string;
}

interface RegionStat {
  flag: string;
  count: number;
  avgBounty: number;
  topPlayer: string;
}

function TierBadge({ tier }: { tier: string }) {
  return (
    <span className={`px-1.5 py-0.5 rounded text-[9px] font-black border ${TIER_COLORS[tier] ?? TIER_COLORS.C}`}>
      {tier}
    </span>
  );
}

export default function MetaTracker() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'fruits' | 'regions' | 'achievements'>('fruits');

  useEffect(() => {
    const q = query(collection(db, 'players'), orderBy('bounty', 'desc'), limit(100));
    const unsub = onSnapshot(q, (snap) => {
      setPlayers(snap.docs.map(d => ({ ...d.data(), id: d.id })) as Player[]);
      setLoading(false);
    }, (e) => handleFirestoreError(e, OperationType.LIST, 'players'));
    return () => unsub();
  }, []);

  // Fruit meta stats
  const fruitStats: FruitStat[] = (() => {
    const counts: Record<string, number> = {};
    players.forEach(p => (p.fruits ?? []).forEach(f => { counts[f] = (counts[f] ?? 0) + 1; }));
    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(counts)
      .map(([name, count]) => ({
        name, count, pct: Math.round((count / total) * 100),
        tier: FRUIT_TIER[name] ?? FRUIT_TIER.default
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  })();

  // Region stats
  const regionStats: RegionStat[] = (() => {
    const map: Record<string, Player[]> = {};
    players.forEach(p => {
      if (!p.countryFlag) return;
      if (!map[p.countryFlag]) map[p.countryFlag] = [];
      map[p.countryFlag].push(p);
    });
    return Object.entries(map).map(([flag, ps]) => ({
      flag,
      count: ps.length,
      avgBounty: Math.round(ps.reduce((s, p) => s + (p.bounty ?? 0), 0) / ps.length),
      topPlayer: ps.sort((a, b) => (b.bounty ?? 0) - (a.bounty ?? 0))[0]?.name ?? '—'
    })).sort((a, b) => b.count - a.count);
  })();

  // Achievement stats
  const achStats = (() => {
    const counts: Record<string, number> = {};
    players.forEach(p => (p.achievements ?? []).forEach(a => { counts[a] = (counts[a] ?? 0) + 1; }));
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  })();

  if (loading) return (
    <div className="flex justify-center p-20">
      <div className="w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-5 h-5 text-accent-blue" />
            <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase">Meta Tracker</h2>
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest">Live competitive analysis</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-green-400 text-[10px] font-bold uppercase tracking-widest">Live</span>
        </div>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Players', value: players.length, icon: <Globe className="w-4 h-4" />, color: 'text-accent-blue' },
          { label: 'Unique Fruits', value: fruitStats.length, icon: <Zap className="w-4 h-4" />, color: 'text-accent-gold' },
          { label: 'Countries', value: regionStats.length, icon: <BarChart3 className="w-4 h-4" />, color: 'text-accent-purple' },
          { label: 'Achievements', value: achStats.length, icon: <Award className="w-4 h-4" />, color: 'text-green-400' },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-[#0a0a0a] border border-border-subtle rounded-2xl p-4"
          >
            <div className={`${card.color} opacity-70 mb-2`}>{card.icon}</div>
            <p className="text-white font-black text-2xl italic">{card.value}</p>
            <p className="text-[#444] text-[9px] font-bold uppercase tracking-widest mt-0.5">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 bg-[#080808] p-1.5 rounded-2xl border border-border-subtle">
        {([
          { key: 'fruits', label: 'Fruit Meta', icon: <Zap className="w-3.5 h-3.5" /> },
          { key: 'regions', label: 'Regions', icon: <Globe className="w-3.5 h-3.5" /> },
          { key: 'achievements', label: 'Achievements', icon: <Award className="w-3.5 h-3.5" /> },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveSection(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeSection === tab.key
                ? 'bg-[#111] text-white border border-border-subtle shadow'
                : 'text-[#333] hover:text-[#666]'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Section content */}
      {activeSection === 'fruits' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          <p className="text-[10px] font-black text-[#444] uppercase tracking-widest px-1">
            Most used fruits across all players
          </p>
          {fruitStats.map((fruit, i) => (
            <motion.div
              key={fruit.name}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-[#0a0a0a] border border-border-subtle rounded-2xl p-4 flex items-center gap-4"
            >
              <div className="w-8 text-[#333] font-black text-sm tabular-nums">#{i + 1}</div>
              <div className="w-10 h-10 rounded-xl bg-[#111] border border-border-subtle flex items-center justify-center text-xl flex-shrink-0">
                {FRUIT_EMOJIS[fruit.name] ?? FRUIT_EMOJIS.default}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-white font-black text-sm">{fruit.name}</span>
                  <TierBadge tier={fruit.tier} />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-[#111] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${fruit.pct}%` }}
                      transition={{ delay: i * 0.06 + 0.2, duration: 0.6, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-accent-blue to-accent-purple"
                    />
                  </div>
                  <span className="text-[#555] text-[9px] font-bold tabular-nums w-8 text-right">{fruit.pct}%</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-white font-black text-sm">{fruit.count}</p>
                <p className="text-[#444] text-[9px] font-bold uppercase">players</p>
              </div>
            </motion.div>
          ))}
          {fruitStats.length === 0 && (
            <p className="text-center text-[#444] text-xs font-bold py-12">No fruit data available</p>
          )}
        </motion.div>
      )}

      {activeSection === 'regions' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          <p className="text-[10px] font-black text-[#444] uppercase tracking-widest px-1">
            Player distribution by country
          </p>
          {regionStats.map((region, i) => (
            <motion.div
              key={region.flag}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-[#0a0a0a] border border-border-subtle rounded-2xl p-5 flex items-center gap-5"
            >
              <span className="text-3xl">{region.flag}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-black text-sm">{region.count} Player{region.count !== 1 ? 's' : ''}</span>
                  <span className="text-[#444] text-[9px] font-bold uppercase tracking-widest">Avg {(region.avgBounty / 1_000_000).toFixed(1)}M</span>
                </div>
                <div className="h-1.5 bg-[#111] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(region.count / (regionStats[0]?.count || 1)) * 100}%` }}
                    transition={{ delay: i * 0.07 + 0.2, duration: 0.5, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-accent-gold to-accent-orange"
                  />
                </div>
                <p className="text-[#555] text-[9px] font-bold mt-1.5">Top: <span className="text-[#888]">{region.topPlayer}</span></p>
              </div>
            </motion.div>
          ))}
          {regionStats.length === 0 && (
            <p className="text-center text-[#444] text-xs font-bold py-12">No region data available</p>
          )}
        </motion.div>
      )}

      {activeSection === 'achievements' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          <p className="text-[10px] font-black text-[#444] uppercase tracking-widest px-1">
            Most common achievements
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {achStats.map(([name, count], i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.07 }}
                className="bg-accent-gold/5 border border-accent-gold/20 rounded-2xl p-4 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center text-2xl">
                  🏆
                </div>
                <div className="flex-1">
                  <p className="text-accent-gold font-black text-sm">{name}</p>
                  <p className="text-[#555] text-[9px] font-bold uppercase tracking-widest mt-0.5">
                    {count} player{count !== 1 ? 's' : ''} earned this
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
          {achStats.length === 0 && (
            <p className="text-center text-[#444] text-xs font-bold py-12">No achievement data available</p>
          )}
        </motion.div>
      )}
    </div>
  );
}
