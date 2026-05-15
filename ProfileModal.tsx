import React, { useState, useEffect } from 'react';
import { Player } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sword, Shield, Trophy, Edit2, Check, Youtube, MessageCircle, ExternalLink, Star, Zap } from 'lucide-react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player | null;
  isOwnProfile: boolean;
}

const FRUIT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Dragon:  { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/40' },
  Control: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/40' },
  Leopard: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/40' },
  Phoenix: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/40' },
  Mammoth: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/40' },
  Light:   { bg: 'bg-yellow-200/20', text: 'text-yellow-200', border: 'border-yellow-200/40' },
  Flame:   { bg: 'bg-red-400/20', text: 'text-red-300', border: 'border-red-400/40' },
  Spirit:  { bg: 'bg-cyan-400/20', text: 'text-cyan-300', border: 'border-cyan-400/40' },
  Gravity: { bg: 'bg-violet-500/20', text: 'text-violet-400', border: 'border-violet-500/40' },
  default: { bg: 'bg-white/5', text: 'text-white/50', border: 'border-white/10' },
};

const ACHIEVEMENT_ICONS: Record<string, string> = {
  'Grandmaster': '🏆',
  'Sea Emperor': '👑',
  'Sword Master': '⚔️',
  'First Commander': '🎖️',
  'Dragon Slayer': '🐉',
};

function StatCard({ icon, label, value, color, sub }: {
  icon: React.ReactNode; label: string; value: string | number; color: string; sub?: string;
}) {
  return (
    <div className="bg-[#0a0a0a] border border-border-subtle rounded-2xl p-4 flex flex-col items-center gap-1.5 group hover:border-[#2a2a2a] transition-all">
      <div className={`${color} opacity-70 group-hover:opacity-100 transition-opacity`}>
        {React.cloneElement(icon as React.ReactElement, { className: 'w-4 h-4' })}
      </div>
      <span className="text-[9px] font-bold text-[#444] uppercase tracking-wider">{label}</span>
      <span className={`text-xl font-black italic ${color}`}>{value}</span>
      {sub && <span className="text-[8px] text-[#333] font-bold">{sub}</span>}
    </div>
  );
}

export default function ProfileModal({ isOpen, onClose, player, isOwnProfile }: ProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedMotto, setEditedMotto] = useState('');
  const [editedName, setEditedName] = useState('');
  const [editedAvatar, setEditedAvatar] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'stats' | 'fruits' | 'achievements'>('stats');

  useEffect(() => {
    if (player) {
      setEditedMotto(player.motto || '');
      setEditedName(player.name);
      const seedMatch = player.avatar?.match(/seed=([^&]+)/);
      setEditedAvatar(seedMatch ? seedMatch[1] : player.name);
      setActiveTab('stats');
    }
  }, [player]);

  if (!player) return null;

  const handleSave = async () => {
    if (!player.id) return;
    setSaving(true);
    try {
      const playerRef = doc(db, 'players', player.id);
      await updateDoc(playerRef, {
        name: editedName,
        motto: editedMotto,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${editedAvatar}`,
        updatedAt: serverTimestamp()
      });
      setIsEditing(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `players/${player.id}`);
    } finally {
      setSaving(false);
    }
  };

  const rankLabel = player.rank && player.rank <= 3
    ? ['👑 Champion', '⚔️ 2nd Place', '🛡️ 3rd Place'][player.rank - 1]
    : `Rank #${player.rank ?? '—'}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 24 }}
            transition={{ type: 'spring', stiffness: 200, damping: 22 }}
            className="w-full max-w-md bg-[#0a0a0a] border border-border-subtle rounded-[32px] overflow-hidden shadow-2xl relative z-10"
          >
            {/* Cover */}
            <div className="h-28 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/30 via-accent-purple/20 to-accent-gold/10" />
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(ellipse at 20% 50%, rgba(59,130,246,0.15) 0%, transparent 60%),
                                  radial-gradient(ellipse at 80% 50%, rgba(168,85,247,0.1) 0%, transparent 60%)`
              }} />
              {/* Decorative pattern */}
              <div className="absolute inset-0 opacity-5" style={{
                backgroundImage: 'repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)',
                backgroundSize: '12px 12px'
              }} />
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-white hover:bg-black/70 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 pb-6 -mt-10">
              {/* Avatar + Name row */}
              <div className="flex items-end justify-between mb-5">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl border-4 border-[#0a0a0a] bg-[#111] overflow-hidden shadow-xl">
                    <img
                      src={isEditing
                        ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${editedAvatar}`
                        : player.avatar}
                      alt={player.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {player.countryFlag && (
                    <span className="absolute -bottom-1 -right-1 text-xl leading-none">{player.countryFlag}</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Social links */}
                  {player.socials?.youtube && (
                    <a href={player.socials.youtube} target="_blank" rel="noreferrer"
                      className="w-9 h-9 rounded-xl bg-[#111] border border-border-subtle flex items-center justify-center hover:border-red-500/50 transition-all group">
                      <Youtube className="w-4 h-4 text-[#444] group-hover:text-red-400 transition-colors" />
                    </a>
                  )}
                  {player.socials?.discord && (
                    <a href={player.socials.discord} target="_blank" rel="noreferrer"
                      className="w-9 h-9 rounded-xl bg-[#111] border border-border-subtle flex items-center justify-center hover:border-indigo-500/50 transition-all group">
                      <MessageCircle className="w-4 h-4 text-[#444] group-hover:text-indigo-400 transition-colors" />
                    </a>
                  )}
                  {isOwnProfile && (
                    <button
                      onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                      disabled={saving}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                        isEditing
                          ? 'bg-green-600/20 text-green-400 border border-green-500/30'
                          : 'bg-white/5 text-white border border-border-subtle hover:border-[#333]'
                      }`}
                    >
                      {saving ? <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                        : isEditing ? <Check className="w-3 h-3" /> : <Edit2 className="w-3 h-3" />}
                      {saving ? 'Saving' : isEditing ? 'Save' : 'Edit'}
                    </button>
                  )}
                </div>
              </div>

              {/* Name */}
              {isEditing ? (
                <div className="space-y-2 mb-4">
                  <input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="w-full bg-[#111] border border-border-subtle rounded-xl px-4 py-2.5 text-lg font-black italic tracking-tighter text-white focus:outline-none focus:border-accent-blue"
                  />
                  <input
                    value={editedMotto}
                    onChange={(e) => setEditedMotto(e.target.value)}
                    placeholder="Enter motto..."
                    className="w-full bg-[#111] border border-border-subtle rounded-xl px-4 py-2 text-xs font-bold text-[#666] focus:outline-none focus:border-accent-blue"
                  />
                  <div>
                    <p className="text-[9px] text-[#444] font-bold uppercase tracking-widest mb-1">Avatar Seed</p>
                    <input
                      value={editedAvatar}
                      onChange={(e) => setEditedAvatar(e.target.value)}
                      className="w-full bg-[#111] border border-border-subtle rounded-xl px-4 py-2 text-xs font-bold text-[#666] focus:outline-none focus:border-accent-blue"
                    />
                  </div>
                </div>
              ) : (
                <div className="mb-5">
                  <h2 className="text-2xl font-black italic tracking-tighter text-white">{player.name}</h2>
                  <p className="text-[#555] text-[10px] font-bold uppercase tracking-widest mt-0.5">{player.motto || 'Blox Fruits Legend'}</p>
                  <div className="mt-2">
                    <span className="px-2.5 py-1 bg-accent-blue/10 border border-accent-blue/20 rounded-lg text-[9px] font-black text-accent-blue uppercase tracking-widest">
                      {rankLabel}
                    </span>
                  </div>
                </div>
              )}

              {/* Tabs */}
              <div className="flex gap-1 bg-[#050505] p-1 rounded-xl border border-border-subtle mb-5">
                {(['stats', 'fruits', 'achievements'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${
                      activeTab === tab ? 'bg-[#111] text-white border border-border-subtle shadow' : 'text-[#333]'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                {activeTab === 'stats' && (
                  <motion.div
                    key="stats"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="grid grid-cols-3 gap-2"
                  >
                    <StatCard icon={<Trophy />} label="Bounty" value={`${(player.bounty / 1_000_000).toFixed(1)}M`} color="text-accent-gold" />
                    <StatCard icon={<Sword />} label="Level" value={player.level.toLocaleString()} color="text-accent-blue" />
                    <StatCard icon={<Shield />} label="Rank" value={`#${player.rank ?? '—'}`} color="text-accent-purple" />
                    <StatCard icon={<Star />} label="Fruits" value={(player.fruits ?? []).length} color="text-orange-400" sub="owned" />
                    <StatCard icon={<Zap />} label="Achievements" value={(player.achievements ?? []).length} color="text-green-400" sub="earned" />
                    <StatCard icon={<ExternalLink />} label="Region" value={(player.region ?? '—').toUpperCase()} color="text-cyan-400" />
                  </motion.div>
                )}

                {activeTab === 'fruits' && (
                  <motion.div
                    key="fruits"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="space-y-2"
                  >
                    {(player.fruits ?? []).length === 0 ? (
                      <p className="text-center text-[#444] text-xs font-bold py-8">No fruits recorded</p>
                    ) : (player.fruits ?? []).map((fruit, i) => {
                      const style = FRUIT_COLORS[fruit] ?? FRUIT_COLORS.default;
                      return (
                        <motion.div
                          key={fruit}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className={`flex items-center justify-between p-3 rounded-xl border ${style.bg} ${style.border}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg ${style.bg} ${style.border} border flex items-center justify-center`}>
                              <span className="text-base">🍎</span>
                            </div>
                            <span className={`font-black text-sm ${style.text}`}>{fruit}</span>
                          </div>
                          <span className={`text-[9px] font-bold uppercase tracking-widest ${style.text} opacity-60`}>Mythical</span>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}

                {activeTab === 'achievements' && (
                  <motion.div
                    key="achievements"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="space-y-2"
                  >
                    {(player.achievements ?? []).length === 0 ? (
                      <p className="text-center text-[#444] text-xs font-bold py-8">No achievements yet</p>
                    ) : (player.achievements ?? []).map((ach, i) => (
                      <motion.div
                        key={ach}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="flex items-center gap-3 p-3 bg-accent-gold/5 border border-accent-gold/20 rounded-xl"
                      >
                        <div className="w-9 h-9 rounded-xl bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center text-lg">
                          {ACHIEVEMENT_ICONS[ach] ?? '🏅'}
                        </div>
                        <div>
                          <p className="text-sm font-black text-accent-gold">{ach}</p>
                          <p className="text-[9px] text-[#555] font-bold uppercase tracking-widest">Earned</p>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
