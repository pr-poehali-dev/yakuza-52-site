import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { MOCK_PLAYERS, MOCK_TOURNAMENTS } from '@/data/mockData';

const TOP3 = MOCK_PLAYERS.slice(0, 3);

const clanStats = {
  members: MOCK_PLAYERS.length,
  wins: MOCK_PLAYERS.reduce((s, p) => s + p.wins, 0),
  kills: MOCK_PLAYERS.reduce((s, p) => s + p.kills, 0),
  tournaments: MOCK_TOURNAMENTS.filter((t) => t.status === 'completed').length,
};

export default function HomePage() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center justify-center hero-grid overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-700/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700" />
        </div>

        <div className="text-center px-4 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-purple-600/10 border border-purple-600/20 rounded-full px-4 py-1.5 mb-6 text-purple-300 text-sm">
            <Icon name="Zap" size={14} />
            Standoff 2 · Официальный сайт клана
          </div>

          <h1 className="font-oswald text-6xl md:text-8xl font-bold text-white mb-3 glow-purple-text">
            YAKUDZA
          </h1>
          <h2 className="font-oswald text-3xl md:text-5xl font-bold text-purple-400 mb-6 tracking-widest">
            52
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-xl mx-auto mb-10">
            Элитный клан Standoff 2. Сила, точность и командный дух — наш путь к вершине рейтинга.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/rating">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-500 text-white glow-purple">
                <Icon name="BarChart3" size={18} className="mr-2" />
                Рейтинг игроков
              </Button>
            </Link>
            <Link to="/tournaments">
              <Button size="lg" variant="outline" className="border-purple-600/40 text-purple-300 hover:bg-purple-600/10">
                <Icon name="Trophy" size={18} className="mr-2" />
                Турниры
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Clan stats */}
      <section className="max-w-5xl mx-auto px-4 -mt-10 mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Бойцов', value: clanStats.members, icon: 'Users', color: 'purple' as const },
            { label: 'Побед', value: clanStats.wins, icon: 'Trophy', color: 'gold' as const },
            { label: 'Убийств', value: clanStats.kills.toLocaleString(), icon: 'Target', color: 'red' as const },
            { label: 'Турниров', value: clanStats.tournaments, icon: 'Award', color: 'green' as const },
          ].map((stat) => (
            <div key={stat.label} className="card-glass rounded-xl p-5 text-center animate-scale-in">
              <Icon
                name={stat.icon}
                size={28}
                className={
                  stat.color === 'purple' ? 'text-purple-400 mx-auto mb-2' :
                  stat.color === 'gold' ? 'text-yellow-400 mx-auto mb-2' :
                  stat.color === 'red' ? 'text-red-400 mx-auto mb-2' :
                  'text-green-400 mx-auto mb-2'
                }
              />
              <p className="font-oswald text-3xl font-bold text-white">{stat.value}</p>
              <p className="text-muted-foreground text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Top 3 */}
      <section className="max-w-5xl mx-auto px-4 mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-oswald text-2xl font-bold text-white flex items-center gap-2">
            <Icon name="Crown" size={22} className="text-yellow-400" />
            Топ бойцов
          </h2>
          <Link to="/rating" className="text-purple-400 text-sm hover:text-purple-300 flex items-center gap-1">
            Все <Icon name="ChevronRight" size={14} />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {TOP3.map((player, i) => {
            const kd = (player.kills / Math.max(player.deaths, 1)).toFixed(2);
            const wr = Math.round((player.wins / Math.max(player.wins + player.losses, 1)) * 100);
            const podiumColors = ['from-yellow-600/30 to-yellow-900/10 border-yellow-500/30', 'from-gray-500/20 to-gray-800/10 border-gray-500/30', 'from-amber-700/20 to-amber-900/10 border-amber-600/30'];
            const medals = ['👑', '🥈', '🥉'];
            return (
              <div key={player.id} className={`relative rounded-xl p-5 bg-gradient-to-br border ${podiumColors[i]} transition-all hover:scale-[1.02]`}>
                <div className="absolute top-3 right-3 text-2xl">{medals[i]}</div>
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center text-xl font-bold text-white mb-3">
                  {player.nickname[0]}
                </div>
                <h3 className="font-oswald font-bold text-lg text-white">{player.nickname}</h3>
                <p className="text-xs text-muted-foreground mb-3">{player.standoffId}</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Очки</span>
                    <span className="text-purple-300 font-medium">{player.points.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">K/D</span>
                    <span className="text-foreground font-medium">{kd}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Побед</span>
                    <span className="text-green-400 font-medium">{wr}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Upcoming tournaments */}
      <section className="max-w-5xl mx-auto px-4 mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-oswald text-2xl font-bold text-white flex items-center gap-2">
            <Icon name="Calendar" size={22} className="text-purple-400" />
            Ближайшие турниры
          </h2>
          <Link to="/tournaments" className="text-purple-400 text-sm hover:text-purple-300 flex items-center gap-1">
            Все <Icon name="ChevronRight" size={14} />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {MOCK_TOURNAMENTS.filter((t) => t.status === 'upcoming').slice(0, 2).map((t) => (
            <div key={t.id} className="card-glass rounded-xl p-5 border-purple-glow">
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 rounded-full px-2 py-0.5">
                  Скоро
                </span>
                <span className="text-xs text-muted-foreground">{t.date} · {t.time}</span>
              </div>
              <h3 className="font-oswald font-bold text-lg text-white mb-1">{t.title}</h3>
              <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{t.description}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  <Icon name="Users" size={13} className="inline mr-1" />
                  {t.participants}/{t.maxParticipants}
                </span>
                {t.prize && (
                  <span className="text-yellow-400 text-xs">
                    <Icon name="Gift" size={13} className="inline mr-1" />
                    {t.prize}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 mb-16">
        <div className="card-glass rounded-2xl p-8 md:p-12 text-center border-purple-glow">
          <h2 className="font-oswald text-3xl font-bold text-white mb-3">Хочешь в клан?</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Пройди отбор, докажи свои навыки и стань частью элиты Yakudza 52
          </p>
          <Link to="/login">
            <Button className="bg-purple-600 hover:bg-purple-500 text-white">
              <Icon name="LogIn" size={16} className="mr-2" />
              Подать заявку
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
