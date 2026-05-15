export interface Player {
  id: string;
  rank?: number;
  name: string;
  motto?: string;
  avatar: string;
  crewLogo?: string;
  countryFlag: string;
  level: number;
  bounty: number;
  fruits: string[];
  achievements: string[];
  region: string;
  socials: {
    youtube?: string;
    discord?: string;
    talents?: string;
  };
  updatedAt?: any;
}

export interface Region {
  id: string;
  name: string;
  image: string;
}

export interface Crew {
  id: string;
  name: string;
  tag: string;
  logo: string;
  leaderId: string;
  leaderName: string;
  motto?: string;
  bounty: number;
  memberCount: number;
  members: string[]; // User UIDs
  updatedAt: any;
  rank?: number;
}

export type GameMode = 'Normal' | 'Control Meta';
export type Category = '1V1S' | '2V2S' | 'PUBLIC WARS';
export type Platform = 'PC' | 'Console' | 'Mobile' | 'Book';
