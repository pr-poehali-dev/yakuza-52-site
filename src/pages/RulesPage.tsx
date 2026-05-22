import Layout from '@/components/layout/Layout';
import Icon from '@/components/ui/icon';
import { MOCK_RULES } from '@/data/mockData';

const SEVERITY_CONFIG = {
  critical: { label: 'Критично', color: 'text-red-400 bg-red-500/10 border-red-500/20', icon: 'AlertOctagon' },
  warning: { label: 'Важно', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20', icon: 'AlertTriangle' },
  info: { label: 'Инфо', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', icon: 'Info' },
};

const categories = [...new Set(MOCK_RULES.map((r) => r.category))];

export default function RulesPage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-purple-600/10 border border-purple-600/20 rounded-full px-4 py-1.5 mb-4 text-purple-300 text-sm">
            <Icon name="ScrollText" size={14} />
            Устав клана
          </div>
          <h1 className="font-oswald text-5xl font-bold text-white mb-4">Правила</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Соблюдение правил — основа сильного клана. Незнание правил не освобождает от ответственности.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mb-10 justify-center">
          {Object.entries(SEVERITY_CONFIG).map(([key, cfg]) => (
            <span key={key} className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border ${cfg.color}`}>
              <Icon name={cfg.icon} size={13} />
              {cfg.label}
            </span>
          ))}
        </div>

        {/* Rules by category */}
        <div className="space-y-10">
          {categories.map((cat) => (
            <div key={cat}>
              <h2 className="font-oswald text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-purple-500 rounded-full inline-block" />
                {cat}
              </h2>
              <div className="space-y-3">
                {MOCK_RULES.filter((r) => r.category === cat).map((rule) => {
                  const cfg = SEVERITY_CONFIG[rule.severity];
                  return (
                    <div key={rule.id} className="card-glass rounded-xl p-5 flex gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border ${cfg.color}`}>
                        <Icon name={cfg.icon} size={18} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-medium text-foreground">{rule.title}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${cfg.color}`}>
                            {cfg.label}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed">{rule.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-12 card-glass rounded-xl p-6 border border-purple-600/20 text-center">
          <Icon name="Shield" size={28} className="text-purple-400 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">
            Правила могут обновляться администрацией клана. Следите за изменениями в общем чате.
          </p>
        </div>
      </div>
    </Layout>
  );
}
