import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import AuthLayout from '../components/Layout/AuthLayout';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try { await login(email, password); navigate('/dashboard'); } catch (err) { setError(err.message || 'Failed to login'); } finally { setLoading(false); }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to continue analyzing your spending behavior">
      {error && (
        <div className="mb-6 flex items-center gap-2 p-3 rounded-xl bg-accent-danger/10 border border-accent-danger/20 text-accent-danger text-sm animate-slide-in-up">
          <AlertCircle size={18} /> <span className="font-medium">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-600 dark:text-txt-secondary mb-2">Email Address</label>
          <div className="relative">
            <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-txt-muted pointer-events-none" />
            <input
              type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="input-field !pl-11" placeholder="you@example.com" required autoComplete="email"
            />
          </div>
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-600 dark:text-txt-secondary mb-2">Password</label>
          <div className="relative">
            <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-txt-muted pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'} id="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="input-field !pl-11 !pr-12" placeholder="••••••••" required autoComplete="current-password"
            />
            <button
              type="button" onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 dark:text-txt-muted hover:text-slate-600 dark:hover:text-txt-secondary transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {loading ? (
            'Logging in...'
          ) : (
            <>
              <LogIn size={18} />
              Login
            </>
          )}
        </button>
      </form>

      <p className="text-center text-slate-400 dark:text-txt-muted mt-8 text-sm">
        Don't have an account?{' '}
        <Link to="/register" className="text-accent-primary hover:text-accent-primary/80 font-medium transition-colors">Sign up free</Link>
      </p>
    </AuthLayout>
  );
};

export default Login;
