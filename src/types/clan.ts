export type Role = 'owner' | 'admin' | 'member' | 'recruit';

export interface Player {
  id: string;
  nickname: string;
  standoffId: string;
  avatar?: string;
  role: Role;
  rank: number;
  points: number;
  kills: number;
  deaths: number;
  wins: number;
  losses: number;
  joinedAt: string;
  isOnline: boolean;
  bio?: string;
  region?: string;
}

export interface Tournament {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  type: '1v1' | '5v5' | 'clan-war';
  status: 'upcoming' | 'ongoing' | 'completed';
  participants: number;
  maxParticipants: number;
  prize?: string;
  registeredIds: string[];
}

export interface Rule {
  id: string;
  category: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface Message {
  id: string;
  senderId: string;
  senderNick: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  chatId: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  lessons: number;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  completed?: boolean;
}

export interface Test {
  id: string;
  title: string;
  description: string;
  questions: number;
  passingScore: number;
  timeLimit: number;
  completed?: boolean;
  score?: number;
}

export interface ChatRoom {
  id: string;
  name: string;
  type: 'general' | 'private' | 'tournament';
  participants: string[];
  lastMessage?: Message;
  unread: number;
}
