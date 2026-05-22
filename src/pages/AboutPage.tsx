import Layout from '@/components/layout/Layout';
import Icon from '@/components/ui/icon';
import PlayerCard from '@/components/clan/PlayerCard';
import { MOCK_PLAYERS } from '@/data/mockData';

const ADMINS = MOCK_PLAYERS.filter((p) => p.role === 'owner' || p.role === 'admin');

export default function AboutPage() {
  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-purple-600/10 border border-purple-600/20 rounded-full px-4 py-1.5 mb-4 text-purple-300 text-sm">
            <Icon name="Users" size={14} />
            О клане
          </div>
          <h1 className="font-oswald text-5xl font-bold text-white mb-4">YAKUDZA 52</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Элитное боевое братство в Standoff 2. Мы объединяем лучших игроков из СНГ,
            чтобы вместе покорять вершины рейтинга и клановых войн.
          </p>
        </div>

        {/* Values */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {[
            {
              icon: 'Sword',
              title: 'Сила',
              desc: 'Каждый боец клана прошёл жёсткий отбор. Мы принимаем только тех, кто готов биться до конца.',
            },
            {
              icon: 'Target',
              title: 'Точность',
              desc: 'Не только в прицеле — мы точны в решениях, тактике и командных действиях.',
            },
            {
              icon: 'Trophy',
              title: 'Победа',
              desc: 'Наша цель — первые строчки рейтингов и клановых турниров. Мы приходим только за победой.',
            },
          ].map((v) => (
            <div key={v.title} className="card-glass rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Icon name={v.icon} size={24} className="text-purple-400" />
              </div>
              <h3 className="font-oswald text-xl font-bold text-white mb-2">{v.title}</h3>
              <p className="text-muted-foreground text-sm">{v.desc}</p>
            </div>
          ))}
        </div>

        {/* History */}
        <div className="card-glass rounded-2xl p-8 mb-16">
          <h2 className="font-oswald text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Icon name="BookOpen" size={22} className="text-purple-400" />
            История клана
          </h2>
          <div className="space-y-6">
            {[
              { year: '2023', text: 'Клан основан GhostBlade. Первые 5 бойцов, первый клановый матч.' },
              { year: '2023', text: 'Рост до 15 участников. Первая победа в клановой войне.' },
              { year: '2024', text: 'Первое место в региональном турнире. Отбор ужесточён.' },
              { year: '2025', text: 'Топ-10 кланов СНГ. Запуск Академии и системы обучения.' },
              { year: '2026', text: 'Запуск официального сайта. Новый сезон — новые победы.' },
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-16 flex-shrink-0">
                  <span className="font-oswald font-bold text-purple-400">{item.year}</span>
                </div>
                <div className="flex-1 border-l border-purple-900/40 pl-4">
                  <p className="text-muted-foreground text-sm">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leadership */}
        <div>
          <h2 className="font-oswald text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Icon name="Crown" size={22} className="text-yellow-400" />
            Руководство
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ADMINS.map((p) => (
              <PlayerCard key={p.id} player={p} />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
