import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

const ROLE_LABELS: Record<string, string> = {
  owner: 'Лидер клана',
  admin: 'Администратор',
  member: 'Боец',
  recruit: 'Рекрут',
};

const ROLE_COLORS: Record<string, string> = {
  owner: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  admin: 'text-purple-300 bg-purple-500/10 border-purple-500/30',
  member: 'text-blue-300 bg-blue-500/10 border-blue-500/30',
  recruit: 'text-gray-400 bg-gray-500/10 border-gray-500/30',
};

export default function ProfilePage() {
  const { currentUser, isAuthenticated } = useAuth();
  const [editMode, setEditMode] = useState(false);

  if (!isAuthenticated || !currentUser) return <Navigate to="/login" replace />;

  const kd = (currentUser.kills / Math.max(currentUser.deaths, 1)).toFixed(2);
  const wr = Math.round((currentUser.wins / Math.max(currentUser.wins + currentUser.losses, 1)) * 100);

  const stats = [
    { label: 'Очки рейтинга', value: currentUser.points.toLocaleString(), icon: 'Star', color: 'purple' },
    { label: 'Убийств', value: currentUser.kills.toLocaleString(), icon: 'Target', color: 'red' },
    { label: 'Смертей', value: currentUser.deaths.toLocaleString(), icon: 'Skull', color: 'gray' },
    { label: 'K/D', value: kd, icon: 'TrendingUp', color: 'blue' },
    { label: 'Побед', value: currentUser.wins, icon: 'Trophy', color: 'gold' },
    { label: 'Поражений', value: currentUser.losses, icon: 'TrendingDown', color: 'red' },
    { label: 'Процент побед', value: `${wr}%`, icon: 'BarChart', color: 'green' },
    { label: 'Место в рейтинге', value: `#${currentUser.rank}`, icon: 'Crown', color: 'purple' },
  ];

  const colorMap: Record<string, string> = {
    purple: 'text-purple-400 bg-purple-500/10',
    red: 'text-red-400 bg-red-500/10',
    green: 'text-green-400 bg-green-500/10',
    blue: 'text-blue-400 bg-blue-500/10',
    gold: 'text-yellow-400 bg-yellow-500/10',
    gray: 'text-gray-400 bg-gray-500/10',
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Profile header */}
        <div className="card-glass rounded-2xl p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center text-4xl font-bold text-white glow-purple">
                {currentUser.nickname[0]}
              </div>
              <span className={`absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full border-2 border-card ${currentUser.isOnline ? 'bg-green-400' : 'bg-gray-600'}`} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="font-oswald text-3xl font-bold text-white">{currentUser.nickname}</h1>
                <span className={`text-sm px-3 py-1 rounded-full border ${ROLE_COLORS[currentUser.role]}`}>
                  {ROLE_LABELS[currentUser.role]}
                </span>
              </div>
              {currentUser.bio && (
                <p className="text-muted-foreground text-sm mb-3">{currentUser.bio}</p>
              )}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {currentUser.region && (
                  <span className="flex items-center gap-1.5">
                    <Icon name="MapPin" size={14} />
                    {currentUser.region}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Icon name="Calendar" size={14} />
                  В клане с {currentUser.joinedAt}
                </span>
                <span className="flex items-center gap-1.5">
                  <Icon name="Gamepad2" size={14} />
                  {currentUser.standoffId}
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditMode(!editMode)}
              className="border-purple-600/30 text-purple-300 hover:bg-purple-600/10 flex-shrink-0"
            >
              <Icon name={editMode ? 'X' : 'Pencil'} size={14} className="mr-1.5" />
              {editMode ? 'Отмена' : 'Редактировать'}
            </Button>
          </div>

          {/* Edit form */}
          {editMode && (
            <div className="mt-6 pt-6 border-t border-border space-y-4">
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">ID Standoff 2</label>
                <input
                  type="text"
                  defaultValue={currentUser.standoffId}
                  placeholder="SO2-XXXXXX"
                  className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-purple-600/50"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">О себе</label>
                <textarea
                  defaultValue={currentUser.bio}
                  placeholder="Расскажи о себе..."
                  rows={3}
                  className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-purple-600/50 resize-none"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Регион</label>
                <input
                  type="text"
                  defaultValue={currentUser.region}
                  placeholder="Страна / город"
                  className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-purple-600/50"
                />
              </div>
              <Button className="bg-purple-600 hover:bg-purple-500 text-white">
                <Icon name="Save" size={14} className="mr-1.5" />
                Сохранить
              </Button>
            </div>
          )}
        </div>

        {/* Stats grid */}
        <div className="mb-6">
          <h2 className="font-oswald text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Icon name="BarChart3" size={20} className="text-purple-400" />
            Статистика
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.map((stat) => (
              <div key={stat.label} className="card-glass rounded-xl p-4 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${colorMap[stat.color]}`}>
                  <Icon name={stat.icon} size={18} className={colorMap[stat.color].split(' ')[0]} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground truncate">{stat.label}</p>
                  <p className="font-oswald font-bold text-foreground">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress bars */}
        <div className="card-glass rounded-xl p-6">
          <h2 className="font-oswald text-xl font-bold text-white mb-5 flex items-center gap-2">
            <Icon name="TrendingUp" size={20} className="text-purple-400" />
            Прогресс
          </h2>
          <div className="space-y-4">
            {[
              { label: 'Процент побед', value: wr, max: 100, color: 'bg-green-400' },
              { label: 'K/D (макс 5.0)', value: Math.min(parseFloat(kd) * 20, 100), max: 100, color: 'bg-purple-400' },
              { label: 'Рейтинговые очки', value: Math.round((currentUser.points / 20000) * 100), max: 100, color: 'bg-yellow-400' },
            ].map((bar) => (
              <div key={bar.label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-muted-foreground">{bar.label}</span>
                  <span className="text-foreground font-medium">{Math.round(bar.value)}%</span>
                </div>
                <div className="h-2 bg-card rounded-full overflow-hidden">
                  <div
                    className={`h-full ${bar.color} rounded-full transition-all`}
                    style={{ width: `${bar.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
