import { useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loginVal, setLoginVal] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(loginVal, password);
    if (result.ok) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Неверный логин или пароль. Доступ выдаётся администраторами клана.');
    }
    setLoading(false);
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center glow-purple mx-auto mb-4">
              <span className="font-oswald font-bold text-white text-xl">Y52</span>
            </div>
            <h1 className="font-oswald text-3xl font-bold text-white mb-1">Вход в клан</h1>
            <p className="text-muted-foreground text-sm">Доступ предоставляется администраторами</p>
          </div>

          <div className="card-glass rounded-2xl p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Логин
                </label>
                <input
                  type="text"
                  value={loginVal}
                  onChange={(e) => setLoginVal(e.target.value)}
                  placeholder="Твой логин..."
                  required
                  autoComplete="username"
                  className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-600/50 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Пароль
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-600/50 transition-colors"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm">
                  <Icon name="AlertCircle" size={16} className="flex-shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || !loginVal || !password}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white"
              >
                {loading ? (
                  <><Icon name="Loader2" size={16} className="mr-2 animate-spin" />Вход...</>
                ) : (
                  <><Icon name="LogIn" size={16} className="mr-2" />Войти</>
                )}
              </Button>
            </form>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-4">
            Нет доступа?{' '}
            <Link to="/about" className="text-purple-400 hover:text-purple-300">
              Узнай об условиях вступления
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}
