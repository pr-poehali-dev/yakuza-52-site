import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/context/AuthContext';
import { playersApi, tournamentsApi, Player, Tournament, CreatePlayerData, CreateTournamentData } from '@/lib/api';
import { Button } from '@/components/ui/button';

const ROLE_LABELS: Record<string, string> = {
  owner: 'Лидер', admin: 'Админ', member: 'Боец', recruit: 'Рекрут',
};
const ROLE_COLORS: Record<string, string> = {
  owner: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  admin: 'text-purple-300 bg-purple-500/10 border-purple-500/30',
  member: 'text-blue-300 bg-blue-500/10 border-blue-500/30',
  recruit: 'text-gray-400 bg-gray-500/10 border-gray-500/30',
};

const EMPTY_PLAYER: CreatePlayerData = { login: '', password: '', nickname: '', role: 'recruit', standoffId: '', region: '' };
const EMPTY_TOURNAMENT: CreateTournamentData = { title: '', description: '', date: '', time: '20:00', type: '5v5', status: 'upcoming', maxParticipants: 10, prize: '' };

export default function AdminPage() {
  const { currentUser, isAuthenticated, hasAccess } = useAuth();
  const [tab, setTab] = useState<'members' | 'tournaments' | 'settings'>('members');
  const [players, setPlayers] = useState<Player[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loadingP, setLoadingP] = useState(true);
  const [loadingT, setLoadingT] = useState(true);
  const [search, setSearch] = useState('');

  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [newPlayer, setNewPlayer] = useState<CreatePlayerData>(EMPTY_PLAYER);
  const [addingPlayer, setAddingPlayer] = useState(false);
  const [playerError, setPlayerError] = useState('');

  const [showAddTournament, setShowAddTournament] = useState(false);
  const [newTournament, setNewTournament] = useState<CreateTournamentData>(EMPTY_TOURNAMENT);
  const [addingTournament, setAddingTournament] = useState(false);
  const [tournamentError, setTournamentError] = useState('');

  const loadPlayers = () => {
    setLoadingP(true);
    playersApi.list().then(({ players: p }) => { setPlayers(p); setLoadingP(false); }).catch(() => setLoadingP(false));
  };
  const loadTournaments = () => {
    setLoadingT(true);
    tournamentsApi.list().then(({ tournaments: t }) => { setTournaments(t); setLoadingT(false); }).catch(() => setLoadingT(false));
  };

  useEffect(() => { loadPlayers(); loadTournaments(); }, []);

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

  const filtered = players.filter(p => p.nickname.toLowerCase().includes(search.toLowerCase()));

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlayerError('');
    setAddingPlayer(true);
    try {
      await playersApi.create(newPlayer);
      setNewPlayer(EMPTY_PLAYER);
      setShowAddPlayer(false);
      loadPlayers();
    } catch (err: unknown) {
      setPlayerError(err instanceof Error ? err.message : 'Ошибка');
    } finally {
      setAddingPlayer(false);
    }
  };

  const handleRoleChange = async (id: number, role: string) => {
    try {
      await playersApi.update(id, { role: role as Player['role'] });
      loadPlayers();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Ошибка');
    }
  };

  const handleAddTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    setTournamentError('');
    setAddingTournament(true);
    try {
      await tournamentsApi.create(newTournament);
      setNewTournament(EMPTY_TOURNAMENT);
      setShowAddTournament(false);
      loadTournaments();
    } catch (err: unknown) {
      setTournamentError(err instanceof Error ? err.message : 'Ошибка');
    } finally {
      setAddingTournament(false);
    }
  };

  const handleTournamentStatus = async (id: number, status: string) => {
    try {
      await tournamentsApi.update(id, { status: status as Tournament['status'] });
      loadTournaments();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Ошибка');
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
            { label: 'Всего', value: players.length, icon: 'Users', c: 'text-purple-400' },
            { label: 'Онлайн', value: players.filter(p => p.isOnline).length, icon: 'Wifi', c: 'text-green-400' },
            { label: 'Турниров', value: tournaments.length, icon: 'Trophy', c: 'text-yellow-400' },
            { label: 'Рекруты', value: players.filter(p => p.role === 'recruit').length, icon: 'UserPlus', c: 'text-blue-400' },
          ].map(s => (
            <div key={s.label} className="card-glass rounded-xl p-4 text-center">
              <Icon name={s.icon} size={24} className={`${s.c} mx-auto mb-2`} />
              <p className={`font-oswald font-bold text-2xl ${s.c}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border mb-6">
          {([['members', 'Участники', 'Users'], ['tournaments', 'Турниры', 'Trophy'], ['settings', 'Настройки', 'Settings']] as const).map(([key, label, icon]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all -mb-px ${
                tab === key ? 'text-purple-300 border-purple-500' : 'text-muted-foreground border-transparent hover:text-foreground'
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
                  placeholder="Поиск..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-card border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-600/50"
                />
              </div>
              <Button
                onClick={() => { setShowAddPlayer(!showAddPlayer); setPlayerError(''); }}
                className="bg-purple-600 hover:bg-purple-500 text-white"
                size="sm"
              >
                <Icon name="UserPlus" size={15} className="mr-1.5" />
                Добавить
              </Button>
            </div>

            {showAddPlayer && (
              <form onSubmit={handleAddPlayer} className="card-glass rounded-xl p-6 mb-5 border border-purple-600/20">
                <h3 className="font-oswald font-bold text-white mb-4">Новый участник</h3>
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Логин *</label>
                    <input value={newPlayer.login} onChange={e => setNewPlayer({...newPlayer, login: e.target.value})} required placeholder="Логин для входа" className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-purple-600/50" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Пароль *</label>
                    <input type="password" value={newPlayer.password} onChange={e => setNewPlayer({...newPlayer, password: e.target.value})} required placeholder="Пароль" className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-purple-600/50" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Никнейм *</label>
                    <input value={newPlayer.nickname} onChange={e => setNewPlayer({...newPlayer, nickname: e.target.value})} required placeholder="Никнейм в клане" className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-purple-600/50" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Роль</label>
                    <select value={newPlayer.role} onChange={e => setNewPlayer({...newPlayer, role: e.target.value})} className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-purple-600/50">
                      {currentUser.role === 'owner' && <option value="admin">Админ</option>}
                      <option value="member">Боец</option>
                      <option value="recruit">Рекрут</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Standoff ID</label>
                    <input value={newPlayer.standoffId} onChange={e => setNewPlayer({...newPlayer, standoffId: e.target.value})} placeholder="SO2-XXXXXX" className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-purple-600/50" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Регион</label>
                    <input value={newPlayer.region} onChange={e => setNewPlayer({...newPlayer, region: e.target.value})} placeholder="Страна/город" className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-purple-600/50" />
                  </div>
                </div>
                {playerError && <p className="text-red-400 text-sm mb-3">{playerError}</p>}
                <div className="flex gap-2">
                  <Button type="submit" disabled={addingPlayer} className="bg-purple-600 hover:bg-purple-500 text-white">
                    {addingPlayer ? <Icon name="Loader2" size={14} className="animate-spin mr-1.5" /> : <Icon name="UserPlus" size={14} className="mr-1.5" />}
                    Создать
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddPlayer(false)} className="border-border">Отмена</Button>
                </div>
              </form>
            )}

            {loadingP ? (
              <div className="text-center py-12 text-muted-foreground"><Icon name="Loader2" size={28} className="mx-auto animate-spin opacity-50" /></div>
            ) : (
              <div className="card-glass rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
                      <th className="text-left px-5 py-3">Игрок</th>
                      <th className="text-left px-4 py-3 hidden md:table-cell">Standoff ID</th>
                      <th className="text-left px-4 py-3">Роль</th>
                      <th className="text-right px-4 py-3 hidden sm:table-cell">Очки</th>
                      <th className="text-right px-4 py-3 hidden lg:table-cell">K/D</th>
                      <th className="text-right px-5 py-3">Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((player) => {
                      const kd = (player.kills / Math.max(player.deaths, 1)).toFixed(2);
                      return (
                        <tr key={player.id} className="border-b border-border/50 last:border-0 hover:bg-white/3 transition-colors">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center text-sm font-bold text-white">
                                  {player.nickname[0]}
                                </div>
                                <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-card ${player.isOnline ? 'bg-green-400' : 'bg-gray-600'}`} />
                              </div>
                              <div>
                                <span className="font-medium text-sm text-foreground">{player.nickname}</span>
                                {player.region && <p className="text-xs text-muted-foreground">{player.region}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <span className="text-xs text-muted-foreground">{player.standoffId || '—'}</span>
                          </td>
                          <td className="px-4 py-3">
                            {currentUser.role === 'owner' && player.role !== 'owner' ? (
                              <select
                                value={player.role}
                                onChange={(e) => handleRoleChange(player.id, e.target.value)}
                                className="bg-card border border-border rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-purple-600/50 text-foreground"
                              >
                                <option value="admin">Админ</option>
                                <option value="member">Боец</option>
                                <option value="recruit">Рекрут</option>
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
                            <span className="text-sm text-foreground">{kd}</span>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <span className={`text-xs ${player.isOnline ? 'text-green-400' : 'text-muted-foreground'}`}>
                              {player.isOnline ? 'Онлайн' : 'Оффлайн'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {filtered.length === 0 && (
                      <tr><td colSpan={6} className="text-center py-10 text-muted-foreground text-sm">Участники не найдены</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Tournaments tab */}
        {tab === 'tournaments' && (
          <>
            <div className="flex items-center justify-between mb-5">
              <p className="text-muted-foreground text-sm">Всего: {tournaments.length}</p>
              <Button
                onClick={() => { setShowAddTournament(!showAddTournament); setTournamentError(''); }}
                className="bg-purple-600 hover:bg-purple-500 text-white"
                size="sm"
              >
                <Icon name="Plus" size={15} className="mr-1.5" />
                Создать турнир
              </Button>
            </div>

            {showAddTournament && (
              <form onSubmit={handleAddTournament} className="card-glass rounded-xl p-6 mb-5 border border-purple-600/20">
                <h3 className="font-oswald font-bold text-white mb-4">Новый турнир</h3>
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div className="sm:col-span-2">
                    <label className="text-xs text-muted-foreground mb-1 block">Название *</label>
                    <input value={newTournament.title} onChange={e => setNewTournament({...newTournament, title: e.target.value})} required placeholder="Название турнира" className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-purple-600/50" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs text-muted-foreground mb-1 block">Описание</label>
                    <textarea value={newTournament.description} onChange={e => setNewTournament({...newTournament, description: e.target.value})} rows={2} placeholder="Описание..." className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-purple-600/50 resize-none" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Дата *</label>
                    <input type="date" value={newTournament.date} onChange={e => setNewTournament({...newTournament, date: e.target.value})} required className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-purple-600/50" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Время *</label>
                    <input type="time" value={newTournament.time} onChange={e => setNewTournament({...newTournament, time: e.target.value})} required className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-purple-600/50" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Формат</label>
                    <select value={newTournament.type} onChange={e => setNewTournament({...newTournament, type: e.target.value as CreateTournamentData['type']})} className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-purple-600/50">
                      <option value="5v5">Команда 5v5</option>
                      <option value="1v1">Дуэль 1v1</option>
                      <option value="clan-war">Клановая война</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Макс. участников</label>
                    <input type="number" min={2} max={100} value={newTournament.maxParticipants} onChange={e => setNewTournament({...newTournament, maxParticipants: +e.target.value})} className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-purple-600/50" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Приз</label>
                    <input value={newTournament.prize} onChange={e => setNewTournament({...newTournament, prize: e.target.value})} placeholder="Напр. 5000 монет" className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-purple-600/50" />
                  </div>
                </div>
                {tournamentError && <p className="text-red-400 text-sm mb-3">{tournamentError}</p>}
                <div className="flex gap-2">
                  <Button type="submit" disabled={addingTournament} className="bg-purple-600 hover:bg-purple-500 text-white">
                    {addingTournament ? <Icon name="Loader2" size={14} className="animate-spin mr-1.5" /> : <Icon name="Plus" size={14} className="mr-1.5" />}
                    Создать
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddTournament(false)} className="border-border">Отмена</Button>
                </div>
              </form>
            )}

            {loadingT ? (
              <div className="text-center py-12 text-muted-foreground"><Icon name="Loader2" size={28} className="mx-auto animate-spin opacity-50" /></div>
            ) : (
              <div className="space-y-3">
                {tournaments.map(t => (
                  <div key={t.id} className="card-glass rounded-xl p-5 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground">{t.title}</h3>
                      <p className="text-xs text-muted-foreground">{t.date} · {t.time} · {t.participants}/{t.maxParticipants} участников</p>
                    </div>
                    <select
                      value={t.status}
                      onChange={e => handleTournamentStatus(t.id, e.target.value)}
                      className="bg-card border border-border rounded-lg px-2 py-1.5 text-xs text-foreground focus:outline-none focus:border-purple-600/50"
                    >
                      <option value="upcoming">Скоро</option>
                      <option value="ongoing">Идёт</option>
                      <option value="completed">Завершён</option>
                    </select>
                  </div>
                ))}
                {tournaments.length === 0 && (
                  <div className="text-center py-10 text-muted-foreground card-glass rounded-xl">
                    <Icon name="Trophy" size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Турниров ещё нет</p>
                  </div>
                )}
              </div>
            )}
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
                  <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Регион</label>
                  <input defaultValue="СНГ" className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-purple-600/50" />
                </div>
              </div>
            </div>
            <Button className="bg-purple-600 hover:bg-purple-500 text-white">
              <Icon name="Save" size={16} className="mr-1.5" />
              Сохранить
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
