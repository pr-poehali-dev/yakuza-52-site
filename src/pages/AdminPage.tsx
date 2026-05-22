import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/context/AuthContext';
import { MOCK_PLAYERS } from '@/data/mockData';
import { Player, Role } from '@/types/clan';

const ROLE_LABELS: Record<Role, string> = {
  owner: 'Лидер',
  admin: 'Админ',
  member: 'Боец',
  recruit: 'Рекрут',
};

const ROLE_COLORS: Record<Role, string> = {
  owner: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  admin: 'text-purple-300 bg-purple-500/10 border-purple-500/30',
  member: 'text-blue-300 bg-blue-500/10 border-blue-500/30',
  recruit: 'text-gray-400 bg-gray-500/10 border-gray-500/30',
};

export default function AdminPage() {
  const { currentUser, isAuthenticated, hasAccess } = useAuth();
  const [players, setPlayers] = useState<Player[]>(MOCK_PLAYERS);
  const [tab, setTab] = useState<'members' | 'settings'>('members');
  const [search, setSearch] = useState('');

  if (!isAuthenticated || !currentUser) return <Navigate to="/login" replace />;
  if (!hasAccess('admin')) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <Icon name="ShieldOff" size={48} className="text-red-400 mx-auto mb-4" />
            <h2 className="font-oswald text-2xl font-bold text-white mb-2">Доступ запрещён</h2>
            <p className="text-muted-foreground">Эта страница доступна только администраторам</p>
          </div>
        </div>
      </Layout>
    );
  }

  const filtered = players.filter((p) =>
    p.nickname.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: players.length,
    online: players.filter((p) => p.isOnline).length,
    admins: players.filter((p) => p.role === 'admin' || p.role === 'owner').length,
    recruits: players.filter((p) => p.role === 'recruit').length,
  };

  const handleRoleChange = (id: string, role: Role) => {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, role } : p)));
  };

  const handleKick = (id: string) => {
    if (confirm('Исключить участника из клана?')) {
      setPlayers((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-oswald text-4xl font-bold text-white flex items-center gap-3">
              <Icon name="Shield" size={32} className="text-purple-400" />
              Панель администратора
            </h1>
            <p className="text-muted-foreground mt-1">Управление кланом Yakudza 52</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Всего участников', value: stats.total, icon: 'Users', c: 'text-purple-400' },
            { label: 'Онлайн', value: stats.online, icon: 'Wifi', c: 'text-green-400' },
            { label: 'Руководство', value: stats.admins, icon: 'Crown', c: 'text-yellow-400' },
            { label: 'Рекруты', value: stats.recruits, icon: 'UserPlus', c: 'text-blue-400' },
          ].map((stat) => (
            <div key={stat.label} className="card-glass rounded-xl p-4 text-center">
              <Icon name={stat.icon} size={24} className={`${stat.c} mx-auto mb-2`} />
              <p className={`font-oswald font-bold text-2xl ${stat.c}`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border mb-6">
          {([['members', 'Участники', 'Users'], ['settings', 'Настройки', 'Settings']] as const).map(([key, label, icon]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all -mb-px ${
                tab === key
                  ? 'text-purple-300 border-purple-500'
                  : 'text-muted-foreground border-transparent hover:text-foreground'
              }`}
            >
              <Icon name={icon} size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* Members tab */}
        {tab === 'members' && (
          <>
            <div className="flex items-center gap-3 mb-5">
              <div className="relative flex-1 max-w-xs">
                <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Поиск участника..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-card border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-600/50"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600/20 text-purple-300 border border-purple-600/30 hover:bg-purple-600/30 text-sm font-medium transition-all">
                <Icon name="UserPlus" size={15} />
                Добавить
              </button>
            </div>

            <div className="card-glass rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
                    <th className="text-left px-5 py-3">Игрок</th>
                    <th className="text-left px-4 py-3 hidden md:table-cell">Standoff ID</th>
                    <th className="text-left px-4 py-3">Роль</th>
                    <th className="text-right px-4 py-3 hidden sm:table-cell">Очки</th>
                    <th className="text-right px-4 py-3 hidden lg:table-cell">Статус</th>
                    <th className="text-right px-5 py-3">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((player) => (
                    <tr key={player.id} className="border-b border-border/50 last:border-0 hover:bg-white/3 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center text-sm font-bold text-white">
                              {player.nickname[0]}
                            </div>
                            <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-card ${player.isOnline ? 'bg-green-400' : 'bg-gray-600'}`} />
                          </div>
                          <span className="font-medium text-sm text-foreground">{player.nickname}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-xs text-muted-foreground">{player.standoffId}</span>
                      </td>
                      <td className="px-4 py-3">
                        {currentUser.role === 'owner' && player.role !== 'owner' ? (
                          <select
                            value={player.role}
                            onChange={(e) => handleRoleChange(player.id, e.target.value as Role)}
                            className="bg-card border border-border rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-purple-600/50 text-foreground"
                          >
                            {(['admin', 'member', 'recruit'] as Role[]).map((r) => (
                              <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                            ))}
                          </select>
                        ) : (
                          <span className={`text-xs px-2 py-0.5 rounded border ${ROLE_COLORS[player.role]}`}>
                            {ROLE_LABELS[player.role]}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right hidden sm:table-cell">
                        <span className="text-sm text-purple-300 font-medium">{player.points.toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-3 text-right hidden lg:table-cell">
                        <span className={`text-xs ${player.isOnline ? 'text-green-400' : 'text-muted-foreground'}`}>
                          {player.isOnline ? 'Онлайн' : 'Оффлайн'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        {player.role !== 'owner' && (
                          <button
                            onClick={() => handleKick(player.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1.5 rounded-lg transition-all"
                            title="Исключить"
                          >
                            <Icon name="UserMinus" size={15} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Settings tab */}
        {tab === 'settings' && (
          <div className="space-y-4 max-w-xl">
            <div className="card-glass rounded-xl p-6">
              <h3 className="font-oswald font-bold text-lg text-white mb-4 flex items-center gap-2">
                <Icon name="Info" size={18} className="text-purple-400" />
                Информация о клане
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Название клана</label>
                  <input defaultValue="Yakudza 52" className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-purple-600/50" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Описание</label>
                  <textarea defaultValue="Элитный клан Standoff 2 из СНГ" rows={3} className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-purple-600/50 resize-none" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Регион</label>
                  <input defaultValue="СНГ" className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-purple-600/50" />
                </div>
              </div>
            </div>

            <div className="card-glass rounded-xl p-6">
              <h3 className="font-oswald font-bold text-lg text-white mb-4 flex items-center gap-2">
                <Icon name="Lock" size={18} className="text-purple-400" />
                Требования к вступлению
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Минимальный K/D</label>
                  <input type="number" defaultValue="1.5" step="0.1" className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-purple-600/50" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Минимум побед</label>
                  <input type="number" defaultValue="100" className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-purple-600/50" />
                </div>
              </div>
            </div>

            <button className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-all flex items-center justify-center gap-2">
              <Icon name="Save" size={16} />
              Сохранить изменения
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
