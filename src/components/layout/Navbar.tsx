import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

const NAV_ITEMS = [
  { path: '/', label: 'Главная', icon: 'Home' },
  { path: '/about', label: 'О нас', icon: 'Users' },
  { path: '/rules', label: 'Правила', icon: 'ScrollText' },
  { path: '/tournaments', label: 'Турниры', icon: 'Trophy' },
  { path: '/academy', label: 'Академия', icon: 'GraduationCap' },
  { path: '/rating', label: 'Рейтинг', icon: 'BarChart3' },
];

const AUTH_ITEMS = [
  { path: '/dashboard', label: 'Кабинет', icon: 'LayoutDashboard', minRole: 'member' as const },
  { path: '/chat', label: 'Чат', icon: 'MessageCircle', minRole: 'recruit' as const },
  { path: '/profile', label: 'Профиль', icon: 'User', minRole: 'recruit' as const },
  { path: '/admin', label: 'Админка', icon: 'Shield', minRole: 'admin' as const },
];

const ROLE_LABELS: Record<string, string> = {
  owner: 'Лидер',
  admin: 'Админ',
  member: 'Боец',
  recruit: 'Рекрут',
};

const ROLE_COLORS: Record<string, string> = {
  owner: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  admin: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  member: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  recruit: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

export default function Navbar() {
  const { currentUser, isAuthenticated, logout, hasAccess } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-purple-900/40 bg-background/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center glow-purple">
            <span className="font-oswald font-bold text-white text-sm">Y52</span>
          </div>
          <span className="font-oswald font-bold text-xl text-white group-hover:glow-purple-text transition-all hidden sm:block">
            YAKUDZA <span className="text-purple-400">52</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive(item.path)
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-600/30'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              }`}
            >
              <Icon name={item.icon} size={15} />
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {isAuthenticated && currentUser ? (
            <>
              {/* Auth nav items */}
              <div className="hidden lg:flex items-center gap-1">
                {AUTH_ITEMS.filter((item) => hasAccess(item.minRole)).map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive(item.path)
                        ? 'bg-purple-600/20 text-purple-300 border border-purple-600/30'
                        : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                    }`}
                  >
                    <Icon name={item.icon} size={15} />
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* User info */}
              <div className="flex items-center gap-2 pl-2 border-l border-purple-900/40">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-sm font-medium text-foreground">{currentUser.nickname}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded border ${ROLE_COLORS[currentUser.role]}`}>
                    {ROLE_LABELS[currentUser.role]}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center text-sm font-bold text-white">
                  {currentUser.nickname[0]}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-muted-foreground hover:text-red-400 hidden md:flex"
                >
                  <Icon name="LogOut" size={15} />
                </Button>
              </div>
            </>
          ) : (
            <Link to="/login">
              <Button size="sm" className="bg-purple-600 hover:bg-purple-500 text-white">
                <Icon name="LogIn" size={15} className="mr-1.5" />
                Войти
              </Button>
            </Link>
          )}

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <Icon name={mobileOpen ? 'X' : 'Menu'} size={20} />
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-purple-900/40 bg-background/95 backdrop-blur-md">
          <div className="px-4 py-3 space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive(item.path)
                    ? 'bg-purple-600/20 text-purple-300'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                }`}
              >
                <Icon name={item.icon} size={16} />
                {item.label}
              </Link>
            ))}
            {isAuthenticated &&
              AUTH_ITEMS.filter((item) => hasAccess(item.minRole)).map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive(item.path)
                      ? 'bg-purple-600/20 text-purple-300'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                  }`}
                >
                  <Icon name={item.icon} size={16} />
                  {item.label}
                </Link>
              ))}
            {isAuthenticated && (
              <button
                onClick={() => { logout(); setMobileOpen(false); }}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-400/10 w-full"
              >
                <Icon name="LogOut" size={16} />
                Выйти
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}