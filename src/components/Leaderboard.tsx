import React, { useState, useEffect } from 'react';
import { Player } from '../types';
import { motion } from 'motion/react';
import { Search, Filter, Sword, Trophy } from 'lucide-react';
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

export default function Leaderboard({ externalSearchQuery = '' }: LeaderboardProps) {
  const [activeTab, setActiveTab] = useState('Bounty');
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user] = useAuthState(auth);

  const searchQuery = externalSearchQuery || internalSearchQuery;

  useEffect(() => {
    const field = activeTab === 'Level' ? 'level' : 'bounty';
    const q = query(
      collection(db, 'players'),
      orderBy(field, 'desc'),
      limit(50)
    );

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

  const filteredPlayers = players.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const topPlayers = filteredPlayers.slice(0, 3);
  const otherPlayers = filteredPlayers.slice(3);

  const handlePlayerClick = (player: Player) => {
    setSelectedPlayer(player);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-accent-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-12">
      <ProfileModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        player={selectedPlayer}
        isOwnProfile={user?.uid === selectedPlayer?.id}
      />

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-border-subtle pb-8">
        <div>
          <h3 className="text-2xl font-black italic tracking-tighter text-white uppercase">Asia Rankings</h3>
          <p className="text-[10px] font-bold text-[#333] uppercase tracking-[0.2em] mt-1">Official Competitive Standings</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <div className="flex space-x-1 bg-[#0a0a0a] p-1.5 rounded-2xl border border-border-subtle w-full sm:w-64">
            <button 
              onClick={() => setActiveTab('Bounty')}
              className={`flex-1 py-3 text-center text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                activeTab === 'Bounty' ? 'bg-[#151515] text-white shadow-xl border border-white/5' : 'text-[#333]'
              }`}
            >
              Bounty
            </button>
            <button 
              onClick={() => setActiveTab('Level')}
              className={`flex-1 py-3 text-center text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                activeTab === 'Level' ? 'bg-[#151515] text-white shadow-xl border border-white/5' : 'text-[#333]'
              }`}
            >
              Level
            </button>
          </div>

          {!externalSearchQuery && (
            <div className="relative w-full sm:w-64">
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
        </div>
      </div>

      {/* Podium */}
      <div className="flex items-end justify-center px-6 space-x-2 sm:space-x-4">
        {topPlayers.map((player, i) => {
          const rankPos = i === 1 ? 0 : i === 0 ? 1 : 2; // Order: 2nd, 1st, 3rd
          const p = topPlayers[rankPos];
          if (!p) return null;
          
          const isFirst = rankPos === 0;
          const isSecond = rankPos === 1;
          const isThird = rankPos === 2;

          const borderColor = isFirst ? 'border-accent-gold' : isSecond ? 'border-accent-silver' : 'border-accent-bronze';
          const labelColor = isFirst ? 'text-accent-gold' : isSecond ? 'text-accent-silver' : 'text-accent-bronze';
          const labelText = isFirst ? 'CHAMPION' : isSecond ? '2ND' : '3RD';
          const height = isFirst ? 'h-24 sm:h-32' : isSecond ? 'h-16 sm:h-20' : 'h-12 sm:h-16';
          const width = isFirst ? 'w-24 sm:w-36' : 'w-20 sm:w-28';

          return (
            <motion.div 
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => handlePlayerClick(p)}
              className={`flex flex-col items-center cursor-pointer ${isFirst ? 'z-10' : ''}`}
            >
              <div className={`w-12 h-12 sm:w-16 ${isFirst ? 'sm:w-20 sm:h-20' : 'sm:h-16'} rounded-full border-2 ${borderColor} p-1 mb-2 relative bg-[#0a0a0a]`}>
                {isFirst && <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-2xl drop-shadow-xl">👑</div>}
                <div className="w-full h-full rounded-full bg-[#111] flex items-center justify-center overflow-hidden">
                   <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                </div>
              </div>
              <div className={`bg-[#0a0a0a] ${width} ${height} rounded-t-3xl flex flex-col items-center justify-center border-t border-x border-border-subtle group-hover:bg-[#111] transition-all relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-50" />
                <span className={`${labelColor} text-[8px] font-black tracking-[0.3em] mb-1 relative z-10`}>{labelText}</span>
                <span className="text-white text-[10px] sm:text-xs font-black uppercase tracking-tight truncate w-full px-4 text-center relative z-10">{p.name}</span>
                <span className="text-[#333] text-[8px] font-bold mt-1 uppercase tracking-widest relative z-10">{activeTab === 'Level' ? `LVL ${p.level}` : `${(p.bounty / 1000000).toFixed(1)}M`}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Player List */}
      <div className="bg-[#0a0a0a] rounded-t-[48px] p-6 sm:p-10 -mx-4 sm:mx-0 space-y-3 border-t border-border-subtle min-h-[400px]">
        {otherPlayers.length > 0 ? otherPlayers.map((player, index) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => handlePlayerClick(player)}
            className="flex items-center justify-between p-5 bg-[#0a0a0a] border border-border-subtle rounded-[24px] hover:border-[#222] transition-all group cursor-pointer"
          >
            <div className="flex items-center space-x-6">
              <span className="text-[#333] font-black italic w-6 text-center group-hover:text-accent-blue transition-colors">{player.rank}</span>
              <div className="w-12 h-12 bg-[#111] p-0.5 border border-border-subtle rounded-2xl overflow-hidden group-hover:scale-110 transition-transform">
                <img src={player.avatar} alt={player.name} className="w-full h-full object-cover rounded-[14px]" />
              </div>
              <div className="flex flex-col">
                <span className="text-white text-sm font-black uppercase tracking-tight group-hover:text-accent-blue transition-colors">{player.name}</span>
                <span className="text-[#333] text-[9px] font-black uppercase tracking-[0.2em] mt-0.5">{player.motto || 'Asia Legend'}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white text-xs font-black italic tracking-tighter">{activeTab === 'Level' ? `LVL ${player.level}` : `${(player.bounty / 1000000).toFixed(1)}M`}</div>
              <div className="text-[#222] text-[8px] font-black uppercase tracking-[0.1em] mt-1 flex items-center justify-end gap-1">
                {activeTab === 'Level' ? <Sword className="w-3 h-3 opacity-20" /> : <Trophy className="w-3 h-3 opacity-20" />}
                RANK {player.rank}
              </div>
            </div>
          </motion.div>

        )) : (
          <div className="text-center py-20 text-[#555] font-bold uppercase tracking-[0.2em]">No players found</div>
        )}
      </div>
    </div>
  );
}

function TabButton({ label, active, onClick, color }: { label: string, active: boolean, onClick: () => void, color?: string }) {
  const defaultColor = active ? 'bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/20' : 'bg-white/5 text-white/40 border-white/5 hover:bg-white/10';
  return (
    <button 
      onClick={onClick}
      className={`px-6 h-11 rounded-xl font-bold text-xs tracking-wider border transition-all ${color || defaultColor}`}
    >
      {label}
    </button>
  );
}

function PlatformButton({ icon, active, onClick }: { icon: React.ReactNode, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`p-2 rounded-lg transition-all ${
        active ? 'bg-white/20 text-white shadow-sm' : 'text-white/40 hover:text-white/60'
      }`}
    >
      {React.cloneElement(icon as React.ReactElement, { className: 'w-4 h-4' })}
    </button>
  );
}

function ManagerInfo({ name, avatar }: { name: string, avatar: string }) {
  return (
    <div className="flex items-center gap-2">
      <img src={avatar} alt={name} className="w-8 h-8 rounded-lg object-cover grayscale" />
      <span className="text-[10px] font-bold text-white tracking-widest">{name}</span>
    </div>
  );
}

function SocialBadge({ label, color, glow }: { label: string, color: string, glow: string }) {
  return (
    <div className={`px-3 py-1 rounded-full text-[8px] font-black tracking-widest ${color} ${glow} text-white`}>
      {label}
    </div>
  );
}
