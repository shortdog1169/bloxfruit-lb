import React, { useState, useEffect } from 'react';
import { Player } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sword, Shield, Trophy, Edit2, Check } from 'lucide-react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player | null;
  isOwnProfile: boolean;
}

export default function ProfileModal({ isOpen, onClose, player, isOwnProfile }: ProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedMotto, setEditedMotto] = useState(player?.motto || '');
  const [editedName, setEditedName] = useState(player?.name || '');
  const [editedAvatar, setEditedAvatar] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (player) {
      setEditedMotto(player.motto || '');
      setEditedName(player.name);
      // Extract seed from URL if it's a dicebear one
      const seedMatch = player.avatar.match(/seed=([^&]+)/);
      setEditedAvatar(seedMatch ? seedMatch[1] : player.name);
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full max-w-lg bg-card-dark border border-border-subtle rounded-[32px] overflow-hidden shadow-2xl relative z-10"
          >
            {/* Header / Cover */}
            <div className="h-32 bg-gradient-to-r from-accent-blue/20 to-accent-purple/20 relative">
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Info */}
            <div className="px-8 pb-8 -mt-12">
              <div className="flex items-end justify-between mb-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-3xl border-4 border-card-dark bg-item-dark p-1 overflow-hidden shadow-xl">
                    <img src={isEditing ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${editedAvatar}` : player.avatar} alt={player.name} className="w-full h-full object-cover rounded-2xl" />
                  </div>
                  {isOwnProfile && isEditing && (
                    <div className="absolute -bottom-2 -right-2 flex flex-col gap-1">
                       <label className="text-[8px] font-bold bg-accent-orange text-white px-2 py-1 rounded-full shadow-lg border border-card-dark cursor-pointer">
                         CHANGE SEED
                         <input 
                            type="text" 
                            className="bg-accent-orange text-white text-[8px] border-none outline-none w-20 px-1" 
                            value={editedAvatar} 
                            onChange={(e) => setEditedAvatar(e.target.value)} 
                          />
                       </label>
                    </div>
                  )}
                </div>

                {isOwnProfile && (
                  <button 
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    disabled={saving}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                      isEditing ? 'bg-green-600 text-white' : 'bg-white/5 text-white border border-white/10'
                    }`}
                  >
                    {saving ? 'Saving...' : isEditing ? <><Check className="w-4 h-4" /> Save</> : <><Edit2 className="w-4 h-4" /> Edit Profile</>}
                  </button>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  {isEditing ? (
                    <input 
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="bg-[#111] border border-border-subtle rounded-xl px-4 py-2 text-2xl font-black italic tracking-tighter w-full mb-2 text-white focus:outline-none focus:border-accent-blue"
                    />
                  ) : (
                    <h2 className="text-3xl font-black italic tracking-tighter text-white flex items-center gap-3">
                      {player.name}
                      <span className="text-2xl">{player.countryFlag}</span>
                    </h2>
                  )}
                  
                  {isEditing ? (
                    <input 
                      value={editedMotto}
                      onChange={(e) => setEditedMotto(e.target.value)}
                      placeholder="Enter motto..."
                      className="bg-[#111] border border-border-subtle rounded-lg px-3 py-1.5 text-xs text-white/60 font-bold uppercase tracking-widest w-full focus:outline-none focus:border-accent-blue"
                    />
                  ) : (
                    <p className="text-[#555] text-xs font-bold uppercase tracking-widest">{player.motto || 'Blox Fruits Legend'}</p>
                  )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2">
                  <StatCard icon={<Trophy />} label="Bounty" value={`${(player.bounty / 1000000).toFixed(1)}M`} color="text-accent-gold" />
                  <StatCard icon={<Sword />} label="Level" value={player.level} color="text-accent-blue" />
                  <StatCard icon={<Shield />} label="Rank" value={player.rank || 'N/A'} color="text-accent-orange" />
                </div>

                {/* Fruits & Achievements */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#555]">Owned Fruits</h3>
                    <div className="flex flex-wrap gap-2">
                      {player.fruits.map(fruit => (
                        <span key={fruit} className="px-3 py-1.5 bg-[#111] border border-border-subtle rounded-lg text-[10px] font-bold text-white/80">
                          {fruit}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#555]">Achievements</h3>
                    <div className="flex flex-wrap gap-2">
                      {player.achievements.map(ach => (
                        <span key={ach} className="px-3 py-1.5 bg-accent-gold/10 border border-accent-gold/20 rounded-lg text-[10px] font-bold text-accent-gold">
                          {ach}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string | number, color: string }) {
  return (
    <div className="bg-[#111] border border-border-subtle rounded-2xl p-4 flex flex-col items-center gap-1">
      <div className={`${color} opacity-80`}>{React.cloneElement(icon as React.ReactElement, { className: 'w-5 h-5' })}</div>
      <span className="text-[10px] font-bold text-[#555] uppercase tracking-wider mt-1">{label}</span>
      <span className="text-lg font-black text-white italic">{value}</span>
    </div>
  );
}
