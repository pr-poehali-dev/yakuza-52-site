import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import Icon from '@/components/ui/icon';
import { MOCK_PLAYERS } from '@/data/mockData';
import { Player } from '@/types/clan';

type SortKey = 'points' | 'kills' | 'wins' | 'kd';

const ROLE_LABELS: Record<string, string> = {
  owner: 'Лидер',
  admin: 'Админ',
  member: 'Боец',
  recruit: 'Рекрут',
};

const ROLE_COLORS: Record<string, string> = {
  owner: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
  admin: 'text-purple-300 border-purple-500/30 bg-purple-500/10',
  member: 'text-blue-300 border-blue-500/30 bg-blue-500/10',
  recruit: 'text-gray-400 border-gray-500/30 bg-gray-500/10',
};

const MEDALS = ['🥇', '🥈', '🥉'];

export default function RatingPage() {
  const [sortKey, setSortKey] = useState<SortKey>('points');
  const [search, setSearch] = useState('');

  const sorted = [...MOCK_PLAYERS]
    .filter((p) => p.nickname.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortKey === 'kd') {
        return b.kills / Math.max(b.deaths, 1) - a.kills / Math.max(a.deaths, 1);
      }
      return (b[sortKey] as number) - (a[sortKey] as number);
    });

  const totalKills = MOCK_PLAYERS.reduce((s, p) => s + p.kills, 0);
  const totalWins = MOCK_PLAYERS.reduce((s, p) => s + p.wins, 0);
  const avgKD = (MOCK_PLAYERS.reduce((s, p) => s + p.kills / Math.max(p.deaths, 1), 0) / MOCK_PLAYERS.length).toFixed(2);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-purple-600/10 border border-purple-600/20 rounded-full px-4 py-1.5 mb-4 text-purple-300 text-sm">
            <Icon name="BarChart3" size={14} />
            Рейтинг клана
          </div>
          <h1 className="font-oswald text-5xl font-bold text-white mb-3">Таблица лидеров</h1>
          <p className="text-muted-foreground">Рейтинг всех бойцов клана Yakudza 52</p>
        </div>

        {/* Clan totals */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="card-glass rounded-xl p-4 text-center">
            <p className="text-2xl font-oswald font-bold text-red-400">{totalKills.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Убийств всего</p>
          </div>
          <div className="card-glass rounded-xl p-4 text-center">
            <p className="text-2xl font-oswald font-bold text-green-400">{totalWins}</p>
            <p className="text-xs text-muted-foreground mt-1">Побед всего</p>
          </div>
          <div className="card-glass rounded-xl p-4 text-center">
            <p className="text-2xl font-oswald font-bold text-purple-400">{avgKD}</p>
            <p className="text-xs text-muted-foreground mt-1">Средний K/D</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Поиск по нику..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-card border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-600/50"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {([['points', 'Очки'], ['kills', 'Убийства'], ['wins', 'Победы'], ['kd', 'K/D']] as [SortKey, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSortKey(key)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  sortKey === key
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-600/30'
                    : 'text-muted-foreground hover:text-foreground border border-transparent hover:bg-white/5'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="card-glass rounded-xl overflow-hidden">
          <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-0 text-xs text-muted-foreground uppercase tracking-wider border-b border-border px-5 py-3">
            <span className="w-10">#</span>
            <span>Игрок</span>
            <span className="w-20 text-right">Очки</span>
            <span className="w-16 text-right">K/D</span>
            <span className="w-16 text-right">Победы</span>
            <span className="w-16 text-right">WR%</span>
          </div>

          {sorted.map((player, idx) => {
            const kd = (player.kills / Math.max(player.deaths, 1)).toFixed(2);
            const wr = Math.round((player.wins / Math.max(player.wins + player.losses, 1)) * 100);
            const isTop = idx < 3;

            return (
              <div
                key={player.id}
                className={`grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-0 px-5 py-4 border-b border-border/50 last:border-0 transition-colors hover:bg-purple-600/5 ${isTop ? 'bg-purple-600/3' : ''}`}
              >
                <div className="w-10 flex items-center">
                  {idx < 3 ? (
                    <span className="text-lg">{MEDALS[idx]}</span>
                  ) : (
                    <span className="text-muted-foreground font-oswald font-bold">{idx + 1}</span>
                  )}
                </div>

                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative flex-shrink-0">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center text-sm font-bold text-white">
                      {player.nickname[0]}
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-card ${player.isOnline ? 'bg-green-400' : 'bg-gray-600'}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{player.nickname}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded border ${ROLE_COLORS[player.role]}`}>
                      {ROLE_LABELS[player.role]}
                    </span>
                  </div>
                </div>

                <div className="w-20 flex items-center justify-end">
                  <span className={`font-oswald font-bold ${isTop ? 'text-purple-300' : 'text-foreground'}`}>
                    {player.points.toLocaleString()}
                  </span>
                </div>
                <div className="w-16 flex items-center justify-end">
                  <span className="text-foreground font-medium">{kd}</span>
                </div>
                <div className="w-16 flex items-center justify-end">
                  <span className="text-foreground">{player.wins}</span>
                </div>
                <div className="w-16 flex items-center justify-end">
                  <span className={`font-medium ${wr >= 70 ? 'text-green-400' : wr >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {wr}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {sorted.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Icon name="Search" size={40} className="mx-auto mb-3 opacity-30" />
            <p>Игроки не найдены</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
