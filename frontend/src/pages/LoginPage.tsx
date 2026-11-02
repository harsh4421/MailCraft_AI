import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [customApiUrl, setCustomApiUrl] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('mailcraft_api_url') || '' : ''));

  const handleSaveApiUrl = () => {
    if (customApiUrl.trim()) {
      localStorage.setItem('mailcraft_api_url', customApiUrl.trim());
      toast.success('Backend API URL saved! Reloading...');
      setTimeout(() => window.location.reload(), 500);
    } else {
      localStorage.removeItem('mailcraft_api_url');
      toast.info('API URL reset to default. Reloading...');
      setTimeout(() => window.location.reload(), 500);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password');
      return;
    }

    setIsLoading(true);
    try {
      await login({ email, password });
      toast.success('Welcome back to MailCraft AI!');
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Invalid credentials';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setError('');
    const demoEmail = 'demo_user@mailcraft.ai';
    const demoPassword = 'Password123!';

    try {
      await login({ email: demoEmail, password: demoPassword });
      toast.success('Signed in with Demo Account!');
      navigate('/dashboard');
    } catch {
      // If demo user doesn't exist yet, auto-register it
      try {
        await register({
          email: demoEmail,
          password: demoPassword,
          fullName: 'Harsh Kumar (Demo)',
          jobTitle: 'Student / Reviewer',
        });
        toast.success('Demo account initialized and signed in!');
        navigate('/dashboard');
      } catch (regErr: any) {
        setError('Failed to initialize demo user.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-soft dark:bg-surface-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-sm">
              <Mail className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl text-slate-900 dark:text-white">
              MailCraft <span className="text-brand-600">AI</span>
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Sign in to MailCraft AI</h2>
          <p className="text-xs text-slate-500">
            Access your email drafts, review workspace, and saved templates
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-300">
                  {error}
                </div>
              )}

              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="harsh@example.com"
                icon={<Mail className="w-4 h-4" />}
                required
              />

              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                icon={<Lock className="w-4 h-4" />}
                required
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-2"
                isLoading={isLoading}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Sign In
              </Button>
            </form>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full text-xs font-semibold"
                icon={<Sparkles className="w-3.5 h-3.5 text-brand-600" />}
                onClick={handleDemoLogin}
                isLoading={isLoading}
              >
                1-Click Quick Demo Sign In
              </Button>

              <div className="text-center text-xs text-slate-500">
                Don't have an account?{' '}
                <Link to="/register" className="text-brand-600 font-semibold hover:underline">
                  Create Account
                </Link>
              </div>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setShowApiSettings(!showApiSettings)}
                  className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline"
                >
                  {showApiSettings ? 'Hide Backend URL Settings' : '🔧 Configure Backend API URL'}
                </button>
                {showApiSettings && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left space-y-2">
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      Backend Service URL (from Render)
                    </label>
                    <input
                      type="text"
                      placeholder="https://mailcraft-backend-xxxx.onrender.com"
                      value={customApiUrl}
                      onChange={(e) => setCustomApiUrl(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-[10px] text-slate-400">Paste your live Render backend URL</span>
                      <Button size="sm" variant="secondary" onClick={handleSaveApiUrl}>Save URL</Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
