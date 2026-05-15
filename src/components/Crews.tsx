import React, { useState, useEffect } from 'react';
import { Crew } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Users, Shield, Plus, Search, ChevronRight } from 'lucide-react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  setDoc, 
  serverTimestamp,
  doc,
  updateDoc,
  arrayUnion,
  getDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

export interface CrewsProps {
  externalSearchQuery?: string;
}

export default function Crews({ externalSearchQuery = '' }: CrewsProps) {
  const [crews, setCrews] = useState<Crew[]>([]);
  const [loading, setLoading] = useState(true);
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [user] = useAuthState(auth);

  const searchQuery = externalSearchQuery || internalSearchQuery;

  // New Crew State
  const [newCrewName, setNewCrewName] = useState('');
  const [newCrewTag, setNewCrewTag] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'crews'), orderBy('bounty', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const crewList = snapshot.docs.map((doc, index) => ({
        ...doc.data(),
        id: doc.id,
        rank: index + 1
      })) as Crew[];
      setCrews(crewList);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'crews');
    });
    return () => unsubscribe();
  }, []);

  const handleCreateCrew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newCrewName || !newCrewTag) return;

    try {
      const crewRef = doc(collection(db, 'crews'));
      const crewData = {
        id: crewRef.id,
        name: newCrewName,
        tag: newCrewTag,
        logo: `https://api.dicebear.com/7.x/identicon/svg?seed=${newCrewName}`,
        leaderId: user.uid,
        leaderName: user.displayName || 'Legend',
        bounty: 0,
        memberCount: 1,
        members: [user.uid],
        updatedAt: serverTimestamp()
      };
      await setDoc(crewRef, crewData);
      setIsCreateModalOpen(false);
      setNewCrewName('');
      setNewCrewTag('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'crews');
    }
  };

  const joinCrew = async (crewId: string) => {
    if (!user) return;
    try {
      const crewRef = doc(db, 'crews', crewId);
      await updateDoc(crewRef, {
        members: arrayUnion(user.uid),
        memberCount: crews.find(c => c.id === crewId)!.memberCount + 1
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `crews/${crewId}`);
    }
  };

  const filteredCrews = crews.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="flex justify-center p-20"><div className="w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase">Crews</h2>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mt-1">Competitive Asia Brigades</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-accent-blue text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-accent-blue/20 hover:scale-105 transition-all"
        >
          <Plus className="w-4 h-4" /> Create Crew
        </button>
      </div>

      {/* Search */}
      {!externalSearchQuery && (
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444]" />
          <input 
            type="text" 
            placeholder="SEARCH CREWS OR TAGS..." 
            value={searchQuery}
            onChange={(e) => setInternalSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-[#0a0a0a] border border-border-subtle rounded-2xl text-sm focus:outline-none focus:border-accent-blue transition-all"
          />
        </div>
      )}

      {/* Crew Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCrews.map((crew, idx) => (
          <motion.div
            key={crew.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-[#0f0f0f] border border-border-subtle p-6 rounded-[32px] hover:border-[#333] transition-all group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#1a1a1a] p-1 border border-border-subtle overflow-hidden">
                  <img src={crew.logo} alt="logo" className="w-full h-full object-cover rounded-xl" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black italic text-white leading-none">{crew.name}</h3>
                    <span className="px-2 py-0.5 bg-accent-blue/10 text-accent-blue border border-accent-blue/20 rounded-md text-[10px] font-bold">[{crew.tag}]</span>
                  </div>
                  <p className="text-[#555] text-[10px] font-bold uppercase tracking-widest mt-1">Leader: {crew.leaderName}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-accent-gold text-2xl font-black italic"># {crew.rank}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-border-subtle">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#1a1a1a] rounded-lg">
                  <Trophy className="w-4 h-4 text-accent-gold" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#555] uppercase tracking-widest">Bounty</p>
                  <p className="text-sm font-black text-white italic">{(crew.bounty / 1000000).toFixed(1)}M</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#1a1a1a] rounded-lg">
                  <Users className="w-4 h-4 text-accent-blue" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#555] uppercase tracking-widest">Members</p>
                  <p className="text-sm font-black text-white italic">{crew.memberCount} / 50</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button 
                onClick={() => joinCrew(crew.id)}
                disabled={!user || crew.members.includes(user.uid)}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-50"
              >
                {crew.members.includes(user?.uid || '') ? 'Member' : 'Request Join'}
              </button>
              <button className="p-3 bg-[#111] border border-border-subtle rounded-xl hover:bg-[#1a1a1a] transition-all">
                <ChevronRight className="w-4 h-4 text-[#555]" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0f0f0f] border border-border-subtle p-8 rounded-[40px] w-full max-w-sm relative z-10"
            >
              <h3 className="text-2xl font-black italic tracking-tighter text-white mb-6 uppercase">Create Crew</h3>
              <form onSubmit={handleCreateCrew} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-[#555] uppercase tracking-widest pl-2 mb-2 block">Crew Name</label>
                  <input 
                    value={newCrewName}
                    onChange={(e) => setNewCrewName(e.target.value)}
                    className="w-full h-12 bg-[#0a0a0a] border border-border-subtle rounded-xl px-4 text-sm focus:outline-none focus:border-accent-blue"
                    placeholder="E.g. Void Brigade"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#555] uppercase tracking-widest pl-2 mb-2 block">Crew Tag (MAX 4 CHR)</label>
                  <input 
                    maxLength={4}
                    value={newCrewTag}
                    onChange={(e) => setNewCrewTag(e.target.value.toUpperCase())}
                    className="w-full h-12 bg-[#0a0a0a] border border-border-subtle rounded-xl px-4 text-sm focus:outline-none focus:border-accent-blue font-bold tracking-widest"
                    placeholder="VOID"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full h-12 bg-accent-blue text-white rounded-xl font-bold uppercase text-xs tracking-widest mt-4"
                >
                  Confirm Creation
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
