import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import Icon from '@/components/ui/icon';
import { tournamentsApi, Tournament } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const STATUS_CONFIG = {
  upcoming: { label: 'Скоро', color: 'text-green-400 bg-green-500/10 border-green-500/20' },
  ongoing: { label: 'Идёт', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
  completed: { label: 'Завершён', color: 'text-gray-400 bg-gray-500/10 border-gray-500/20' },
};

const TYPE_LABELS: Record<string, string> = {
  '1v1': 'Дуэль 1v1', '5v5': 'Команда 5v5', 'clan-war': 'Клановая война',
};
const TYPE_ICONS: Record<string, string> = {
  '1v1': 'Swords', '5v5': 'Users', 'clan-war': 'Shield',
};

export default function TournamentsPage() {
  const { currentUser, isAuthenticated } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | Tournament['status']>('all');
  const [registering, setRegistering] = useState<number | null>(null);

  const load = () => {
    tournamentsApi.list().then(({ tournaments: t }) => { setTournaments(t); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = tournaments.filter((t) => filter === 'all' || t.status === filter);

  const handleRegister = async (id: number, isReg: boolean) => {
    setRegistering(id);
    try {
      await tournamentsApi.register(id, isReg ? 'unregister' : 'register');
      load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Ошибка');
    } finally {
      setRegistering(null);
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-purple-600/10 border border-purple-600/20 rounded-full px-4 py-1.5 mb-4 text-purple-300 text-sm">
            <Icon name="Trophy" size={14} />
            Турниры
          </div>
          <h1 className="font-oswald text-5xl font-bold text-white mb-3">Расписание турниров</h1>
          <p className="text-muted-foreground">Клановые битвы, дуэли и командные сражения</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Предстоящих', value: tournaments.filter(t => t.status === 'upcoming').length, c: 'text-green-400' },
            { label: 'Активных', value: tournaments.filter(t => t.status === 'ongoing').length, c: 'text-yellow-400' },
            { label: 'Завершённых', value: tournaments.filter(t => t.status === 'completed').length, c: 'text-purple-400' },
          ].map(s => (
            <div key={s.label} className="card-glass rounded-xl p-4 text-center">
              <p className={`text-2xl font-oswald font-bold ${s.c}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {([['all', 'Все'], ['upcoming', 'Предстоящие'], ['ongoing', 'Активные'], ['completed', 'Завершённые']] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === key
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-600/30'
                  : 'text-muted-foreground hover:text-foreground border border-transparent hover:bg-white/5'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16 text-muted-foreground">
            <Icon name="Loader2" size={32} className="mx-auto mb-3 animate-spin opacity-50" />
            <p>Загрузка турниров...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground card-glass rounded-xl">
            <Icon name="Trophy" size={40} className="mx-auto mb-3 opacity-30" />
            <p>Турниров пока нет</p>
            {isAuthenticated && currentUser && (currentUser.role === 'owner' || currentUser.role === 'admin') && (
              <p className="text-sm mt-2">Создай первый турнир в <span className="text-purple-400">Админке</span></p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((t) => {
              const statusCfg = STATUS_CONFIG[t.status];
              const fill = Math.round((t.participants / t.maxParticipants) * 100);
              const isReg = !!(currentUser && t.registeredIds?.includes(currentUser.id));

              return (
                <div key={t.id} className="card-glass rounded-xl p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${statusCfg.color}`}>
                          {statusCfg.label}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Icon name={TYPE_ICONS[t.type]} size={12} />
                          {TYPE_LABELS[t.type]}
                        </span>
                      </div>
                      <h3 className="font-oswald text-xl font-bold text-white mb-1">{t.title}</h3>
                      {t.description && <p className="text-muted-foreground text-sm mb-4">{t.description}</p>}
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <Icon name="Calendar" size={14} />
                          {t.date}
                        </span>
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <Icon name="Clock" size={14} />
                          {t.time}
                        </span>
                        {t.prize && (
                          <span className="text-yellow-400 flex items-center gap-1.5">
                            <Icon name="Gift" size={14} />
                            {t.prize}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground mb-1">
                          {t.participants}/{t.maxParticipants} участников
                        </p>
                        <div className="w-32 h-1.5 bg-card rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full" style={{ width: `${fill}%` }} />
                        </div>
                      </div>

                      {isAuthenticated && t.status === 'upcoming' && (
                        <button
                          onClick={() => handleRegister(t.id, isReg)}
                          disabled={registering === t.id}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 ${
                            isReg
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                              : 'bg-purple-600/20 text-purple-300 border border-purple-600/30 hover:bg-purple-600/30'
                          }`}
                        >
                          {registering === t.id ? <Icon name="Loader2" size={14} className="animate-spin" /> : isReg ? 'Отменить' : 'Записаться'}
                        </button>
                      )}
                      {!isAuthenticated && t.status === 'upcoming' && (
                        <span className="text-xs text-muted-foreground">Войдите для записи</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
