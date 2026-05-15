import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Player } from '../types';

const INITIAL_PLAYERS: Player[] = [
  {
    id: 'player1',
    name: 'King_Blox',
    motto: '#1 Global Champion',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=King',
    countryFlag: '🇰🇼',
    level: 2550,
    bounty: 30000000,
    fruits: ['Dragon', 'Control', 'Leopard'],
    achievements: ['Grandmaster', 'Sea Emperor'],
    region: 'asia',
    socials: { youtube: '#', discord: '#' }
  },
  {
    id: 'player2',
    name: 'Zoro_Jp',
    motto: 'Strongest Swordsman',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zoro',
    countryFlag: '🇯🇵',
    level: 2500,
    bounty: 28400000,
    fruits: ['Phoenix', 'Mammoth'],
    achievements: ['Sword Master'],
    region: 'asia',
    socials: { youtube: '#', discord: '#' }
  },
  {
    id: 'player3',
    name: 'Aceder',
    motto: 'Speed of Light',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ace',
    countryFlag: '🇻🇳',
    level: 2450,
    bounty: 27100000,
    fruits: ['Light', 'Flame'],
    achievements: ['First Commander'],
    region: 'asia',
    socials: { discord: '#' }
  },
  {
    id: 'player4',
    name: 'Ryu_Jin_KR',
    motto: 'Dragon Slayers Leader',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ryu',
    countryFlag: '🇰🇷',
    level: 2400,
    bounty: 25200000,
    fruits: ['Spirit', 'Gravity'],
    achievements: ['Dragon Slayer'],
    region: 'asia',
    socials: { youtube: '#', discord: '#' }
  }
];

export async function seedPlayers() {
  try {
    for (const player of INITIAL_PLAYERS) {
      const playerRef = doc(db, 'players', player.id);
      await setDoc(playerRef, {
        ...player,
        updatedAt: serverTimestamp()
      });
    }
    console.log('Players seeded successfully');
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'players');
  }
}
