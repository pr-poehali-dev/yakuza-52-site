import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, Player } from '@/lib/api';

interface AuthContextType {
  currentUser: Player | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (login: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  hasAccess: (minRole?: Player['role']) => boolean;
  refreshUser: () => Promise<void>;
}

const ROLE_WEIGHT: Record<string, number> = {
  owner: 4, admin: 3, member: 2, recruit: 1,
};

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isAuthenticated: false,
  loading: true,
  login: async () => ({ ok: false }),
  logout: async () => {},
  hasAccess: () => false,
  refreshUser: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const token = localStorage.getItem('clan_token');
    if (!token) { setLoading(false); return; }
    try {
      const { player } = await authApi.me();
      setCurrentUser(player);
    } catch {
      localStorage.removeItem('clan_token');
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refreshUser(); }, []);

  const login = async (loginVal: string, password: string) => {
    try {
      const { token, player } = await authApi.login(loginVal, password);
      localStorage.setItem('clan_token', token);
      setCurrentUser(player);
      return { ok: true };
    } catch (e: unknown) {
      return { ok: false, error: e instanceof Error ? e.message : 'Ошибка входа' };
    }
  };

  const logout = async () => {
    try { await authApi.logout(); } catch (_e) { /* ignore logout errors */ }
    localStorage.removeItem('clan_token');
    setCurrentUser(null);
  };

  const hasAccess = (minRole: Player['role'] = 'recruit') => {
    if (!currentUser) return false;
    return ROLE_WEIGHT[currentUser.role] >= ROLE_WEIGHT[minRole];
  };

  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticated: !!currentUser, loading, login, logout, hasAccess, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);