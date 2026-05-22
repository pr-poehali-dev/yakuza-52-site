import { createContext, useContext, useState, ReactNode } from 'react';
import { Player, Role } from '@/types/clan';
import { MOCK_PLAYERS } from '@/data/mockData';

interface AuthContextType {
  currentUser: Player | null;
  isAuthenticated: boolean;
  login: (nickname: string, password: string) => boolean;
  logout: () => void;
  hasAccess: (minRole?: Role) => boolean;
}

const ROLE_WEIGHT: Record<Role, number> = {
  owner: 4,
  admin: 3,
  member: 2,
  recruit: 1,
};

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isAuthenticated: false,
  login: () => false,
  logout: () => {},
  hasAccess: () => false,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<Player | null>(null);

  const login = (nickname: string, _password: string): boolean => {
    const player = MOCK_PLAYERS.find(
      (p) => p.nickname.toLowerCase() === nickname.toLowerCase()
    );
    if (player) {
      setCurrentUser(player);
      return true;
    }
    return false;
  };

  const logout = () => setCurrentUser(null);

  const hasAccess = (minRole: Role = 'recruit'): boolean => {
    if (!currentUser) return false;
    return ROLE_WEIGHT[currentUser.role] >= ROLE_WEIGHT[minRole];
  };

  return (
    <AuthContext.Provider
      value={{ currentUser, isAuthenticated: !!currentUser, login, logout, hasAccess }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
