import { Player } from '@/types/clan';
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';

interface PlayerCardProps {
  player: Player;
  showRank?: boolean;
}

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

const RANK_ICONS = ['👑', '⚔️', '🔥', '💜', '⚡', '🎯', '🛡️', '🌟'];

export default function PlayerCard({ player, showRank = false }: PlayerCardProps) {
  const kd = (player.kills / Math.max(player.deaths, 1)).toFixed(2);
  const wr = Math.round((player.wins / Math.max(player.wins + player.losses, 1)) * 100);

  return (
    <div className="card-glass rounded-xl p-4 hover:border-purple-glow transition-all duration-300 group">
      <div className="flex items-start gap-3">
        {showRank && (
          <div className="text-2xl flex-shrink-0 pt-1">
            {RANK_ICONS[player.rank - 1] || player.rank}
          </div>
        )}

        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center text-lg font-bold text-white flex-shrink-0 relative">
          {player.nickname[0]}
          <span
            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${
              player.isOnline ? 'bg-green-400' : 'bg-gray-600'
            }`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-oswald font-semibold text-foreground group-hover:text-purple-300 transition-colors truncate">
              {player.nickname}
            </span>
            <span className={`text-xs px-1.5 py-0.5 rounded border ${ROLE_COLORS[player.role]}`}>
              {ROLE_LABELS[player.role]}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{player.standoffId}</p>

          <div className="flex items-center gap-3 mt-2 text-xs">
            <span className="text-muted-foreground">
              <span className="text-foreground font-medium">{player.points.toLocaleString()}</span> pts
            </span>
            <span className="text-muted-foreground">
              K/D: <span className="text-purple-300 font-medium">{kd}</span>
            </span>
            <span className="text-muted-foreground">
              WR: <span className="text-green-400 font-medium">{wr}%</span>
            </span>
          </div>
        </div>

        {showRank && (
          <div className="text-right flex-shrink-0">
            <div className="text-lg font-oswald font-bold text-purple-300">#{player.rank}</div>
          </div>
        )}
      </div>
    </div>
  );
}
