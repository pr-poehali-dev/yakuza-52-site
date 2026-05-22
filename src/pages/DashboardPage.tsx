import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/context/AuthContext';
import { tournamentsApi, playersApi, Tournament, Player } from '@/lib/api';

const ROLE_LABELS: Record<string, string> = {
  owner: 'Лидер клана', admin: 'Администратор', member: 'Боец', recruit: 'Рекрут',
};

export default function DashboardPage() {
  const { currentUser, isAuthenticated } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    tournamentsApi.list().then(({ tournaments: t }) => setTournaments(t)).catch(() => {});
    playersApi.list().then(({ players: p }) => setPlayers(p)).catch(() => {});
  }, []);

  if (!isAuthenticated || !currentUser) return <Navigate to="/login" replace />;

  const upcoming = tournaments.filter(t => t.status === 'upcoming').slice(0, 2);
  const clanRank = players.findIndex(p => p.id === currentUser.id) + 1;
  const kd = (currentUser.kills / Math.max(currentUser.deaths, 1)).toFixed(2);
  const wr = Math.round((currentUser.wins / Math.max(currentUser.wins + currentUser.losses, 1)) * 100);

  const quickLinks = [
    { label: 'Мой профиль', icon: 'User', path: '/profile', color: 'text-purple-400 bg-purple-500/10 hover:bg-purple-500/20' },
    { label: 'Рейтинг', icon: 'BarChart3', path: '/rating', color: 'text-blue-400 bg-blue-500/10 hover:bg-blue-500/20' },
    { label: 'Турниры', icon: 'Trophy', path: '/tournaments', color: 'text-yellow-400 bg-yellow-500/10 hover:bg-yellow-500/20' },
    { label: 'Академия', icon: 'GraduationCap', path: '/academy', color: 'text-green-400 bg-green-500/10 hover:bg-green-500/20' },
    { label: 'Чат клана', icon: 'MessageCircle', path: '/chat', color: 'text-purple-400 bg-purple-500/10 hover:bg-purple-500/20' },
    { label: 'Правила', icon: 'ScrollText', path: '/rules', color: 'text-gray-400 bg-gray-500/10 hover:bg-gray-500/20' },
  ];

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Welcome */}
        <div className="card-glass rounded-2xl p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center text-2xl font-bold text-white glow-purple flex-shrink-0">
            {currentUser.nickname[0]}
          </div>
          <div className="flex-1">
            <p className="text-muted-foreground text-sm">Добро пожаловать,</p>
            <h1 className="font-oswald text-3xl font-bold text-white">{currentUser.nickname}</h1>
            <p className="text-purple-400 text-sm">{ROLE_LABELS[currentUser.role]} · Yakudza 52</p>
          </div>
          <div className="flex gap-3 text-center flex-shrink-0">
            {clanRank > 0 && (
              <>
                <div>
                  <p className="font-oswald font-bold text-xl text-white">#{clanRank}</p>
                  <p className="text-xs text-muted-foreground">Место</p>
                </div>
                <div className="w-px bg-border" />
              </>
            )}
            <div>
              <p className="font-oswald font-bold text-xl text-purple-300">{currentUser.points.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Очков</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Убийства', value: currentUser.kills.toLocaleString(), icon: 'Target', c: 'text-red-400' },
            { label: 'K/D', value: kd, icon: 'TrendingUp', c: 'text-blue-400' },
            { label: 'Победы', value: currentUser.wins, icon: 'Trophy', c: 'text-yellow-400' },
            { label: 'Процент побед', value: `${wr}%`, icon: 'BarChart', c: 'text-green-400' },
          ].map((stat) => (
            <div key={stat.label} className="card-glass rounded-xl p-4 text-center">
              <Icon name={stat.icon} size={22} className={`${stat.c} mx-auto mb-2`} />
              <p className={`font-oswald font-bold text-xl ${stat.c}`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Quick links */}
          <div>
            <h2 className="font-oswald text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Icon name="LayoutGrid" size={18} className="text-purple-400" />
              Быстрый доступ
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {quickLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="card-glass rounded-xl p-4 flex items-center gap-3 transition-all hover:scale-[1.02] border border-transparent hover:border-purple-600/20"
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${link.color.split(' ').slice(0, 2).join(' ')}`}>
                    <Icon name={link.icon} size={18} className={link.color.split(' ')[0]} />
                  </div>
                  <span className="text-sm font-medium text-foreground">{link.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Upcoming tournaments */}
          <div>
            <h2 className="font-oswald text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Icon name="Calendar" size={18} className="text-purple-400" />
              Ближайшие турниры
            </h2>
            <div className="space-y-3">
              {upcoming.map((t) => (
                <div key={t.id} className="card-glass rounded-xl p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-medium text-foreground text-sm mb-1">{t.title}</h3>
                      <p className="text-xs text-muted-foreground">{t.date} · {t.time}</p>
                    </div>
                    <span className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-full px-2 py-0.5 flex-shrink-0">Скоро</span>
                  </div>
                  <div className="flex items-center justify-between mt-3 text-xs">
                    <span className="text-muted-foreground"><Icon name="Users" size={12} className="inline mr-1" />{t.participants}/{t.maxParticipants}</span>
                    <Link to="/tournaments" className="text-purple-400 hover:text-purple-300">Подробнее →</Link>
                  </div>
                </div>
              ))}
              {upcoming.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm card-glass rounded-xl">
                  <Icon name="Calendar" size={28} className="mx-auto mb-2 opacity-30" />
                  Нет предстоящих турниров
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
