import Icon from '@/components/ui/icon';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  color?: 'purple' | 'gold' | 'green' | 'red' | 'blue';
  suffix?: string;
}

const colorMap = {
  purple: 'text-purple-400 bg-purple-500/10',
  gold: 'text-yellow-400 bg-yellow-500/10',
  green: 'text-green-400 bg-green-500/10',
  red: 'text-red-400 bg-red-500/10',
  blue: 'text-blue-400 bg-blue-500/10',
};

export default function StatCard({ label, value, icon, color = 'purple', suffix }: StatCardProps) {
  return (
    <div className="card-glass rounded-xl p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
        <Icon name={icon} size={20} className={colorMap[color].split(' ')[0]} />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-oswald font-bold text-foreground">
          {typeof value === 'number' ? value.toLocaleString() : value}
          {suffix && <span className="text-sm text-muted-foreground ml-1">{suffix}</span>}
        </p>
      </div>
    </div>
  );
}
