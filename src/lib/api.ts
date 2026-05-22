const URLS = {
  auth: 'https://functions.poehali.dev/690afdd5-d31e-494b-8e1a-7809abc0743c',
  players: 'https://functions.poehali.dev/67224925-c03a-42d6-bede-a676da6fc04d',
  tournaments: 'https://functions.poehali.dev/b2cc6465-e8d4-4950-a8ea-e9d581cd8372',
  chat: 'https://functions.poehali.dev/cfc9e277-4983-4de1-baa4-45fda57316e3',
};

function getToken(): string {
  return localStorage.getItem('clan_token') || '';
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { 'Content-Type': 'application/json' };
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers || {}) },
  });
  const text = await res.text();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    data = { error: text };
  }
  if (!res.ok) {
    const err = (data as Record<string, string>)?.error || `HTTP ${res.status}`;
    throw new Error(err);
  }
  return data as T;
}

// AUTH
export const authApi = {
  login: (login: string, password: string) =>
    request<{ token: string; player: Player }>(`${URLS.auth}/login`, {
      method: 'POST',
      body: JSON.stringify({ login, password }),
    }),

  logout: () =>
    request(`${URLS.auth}/logout`, { method: 'POST' }),

  me: () =>
    request<{ player: Player }>(`${URLS.auth}/me`),
};

// PLAYERS
export const playersApi = {
  list: () =>
    request<{ players: Player[] }>(`${URLS.players}/`),

  get: (id: number) =>
    request<{ player: Player }>(`${URLS.players}/${id}`),

  create: (data: CreatePlayerData) =>
    request<{ id: number }>(`${URLS.players}/`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<Player & { standoffId: string }>) =>
    request<{ ok: boolean }>(`${URLS.players}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// TOURNAMENTS
export const tournamentsApi = {
  list: () =>
    request<{ tournaments: Tournament[] }>(`${URLS.tournaments}/`),

  get: (id: number) =>
    request<{ tournament: Tournament }>(`${URLS.tournaments}/${id}`),

  create: (data: CreateTournamentData) =>
    request<{ id: number }>(`${URLS.tournaments}/`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<CreateTournamentData>) =>
    request<{ ok: boolean }>(`${URLS.tournaments}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  register: (id: number, action: 'register' | 'unregister' = 'register') =>
    request<{ ok: boolean; registered: boolean }>(`${URLS.tournaments}/${id}/register`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    }),
};

// CHAT
export const chatApi = {
  rooms: () =>
    request<{ rooms: ChatRoom[] }>(`${URLS.chat}/`),

  messages: (roomId: number, limit = 50) =>
    request<{ messages: Message[] }>(`${URLS.chat}/${roomId}?limit=${limit}`),

  send: (roomId: number, content: string) =>
    request<{ message: Message }>(`${URLS.chat}/${roomId}`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),
};

// Types
export interface Player {
  id: number;
  nickname: string;
  standoffId?: string;
  role: 'owner' | 'admin' | 'member' | 'recruit';
  rank?: number;
  points: number;
  kills: number;
  deaths: number;
  wins: number;
  losses: number;
  kd?: number;
  bio?: string;
  region?: string;
  isOnline?: boolean;
  joinedAt?: string;
}

export interface Tournament {
  id: number;
  title: string;
  description?: string;
  date: string;
  time: string;
  type: '1v1' | '5v5' | 'clan-war';
  status: 'upcoming' | 'ongoing' | 'completed';
  maxParticipants: number;
  participants: number;
  prize?: string;
  registeredIds?: number[];
}

export interface ChatRoom {
  id: number;
  name: string;
  type: 'general' | 'tournament' | 'private';
}

export interface Message {
  id: number;
  senderId: number;
  senderNick: string;
  content: string;
  timestamp: string;
  chatId: string;
}

export interface CreatePlayerData {
  login: string;
  password: string;
  nickname: string;
  role: string;
  standoffId?: string;
  bio?: string;
  region?: string;
}

export interface CreateTournamentData {
  title: string;
  description?: string;
  date: string;
  time: string;
  type: '1v1' | '5v5' | 'clan-war';
  status?: string;
  maxParticipants?: number;
  prize?: string;
}
