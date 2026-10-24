import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, Mail, Lock, Eye, EyeOff, UserPlus, Check } from 'lucide-react';
import AuthLayout from '../components/Layout/AuthLayout';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try { await register(email, password); navigate('/dashboard'); } catch (err) { setError(err.message || 'Failed to register'); } finally { setLoading(false); }
  };

  // Simple password strength (0-3)
  const strength = [
    password.length >= 6,
    /[A-Z]/.test(password) && /[a-z]/.test(password),
    /\d/.test(password) || /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;
  const strengthMeta = [
    { label: 'Too short', color: 'bg-accent-danger' },
    { label: 'Weak', color: 'bg-accent-danger' },
    { label: 'Good', color: 'bg-accent-warning' },
    { label: 'Strong', color: 'bg-accent-success' },
  ][password.length === 0 ? 0 : strength];

  return (
    <AuthLayout title="Create your account" subtitle="Start understanding your spending in minutes — free forever">
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
              className="input-field !pl-11 !pr-12" placeholder="••••••••" required autoComplete="new-password"
            />
            <button
              type="button" onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 dark:text-txt-muted hover:text-slate-600 dark:hover:text-txt-secondary transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          {password.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 flex gap-1">
                {[1, 2, 3].map(i => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= strength ? strengthMeta.color : 'bg-slate-200 dark:bg-white/10'}`} />
                ))}
              </div>
              <span className="text-xs text-slate-500 dark:text-txt-muted font-medium">{strengthMeta.label}</span>
            </div>
          )}
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-600 dark:text-txt-secondary mb-2">Confirm Password</label>
          <div className="relative">
            <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-txt-muted pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'} id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field !pl-11 !pr-12" placeholder="••••••••" required autoComplete="new-password"
            />
            {confirmPassword && confirmPassword === password && (
              <Check size={17} className="absolute right-4 top-1/2 -translate-y-1/2 text-accent-success" />
            )}
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {loading ? (
            'Creating account...'
          ) : (
            <>
              <UserPlus size={18} />
              Sign Up
            </>
          )}
        </button>
      </form>

      <p className="text-center text-slate-400 dark:text-txt-muted mt-8 text-sm">
        Already have an account?{' '}
        <Link to="/login" className="text-accent-primary hover:text-accent-primary/80 font-medium transition-colors">Login</Link>
      </p>
    </AuthLayout>
  );
};

export default Register;
