import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle } from 'lucide-react';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

  return (
    <div className="min-h-screen bg-fintech-bg flex items-center justify-center px-4 animate-fade-in">
      {/* Decorative gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-20 w-72 h-72 bg-accent-insights/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -left-20 w-72 h-72 bg-accent-primary/10 rounded-full blur-[120px]" />
      </div>

      <div className="card w-full max-w-md animate-scale-in relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 shadow-lg shadow-accent-primary/20 overflow-hidden border border-white/10">
            <img src="/logo.png" alt="Smart Expense" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl font-heading font-bold gradient-text">Smart Expense</h1>
          <p className="text-txt-muted mt-2">Behavior Analyzer</p>
        </div>

        <h2 className="text-2xl font-heading font-bold text-txt-primary mb-6">Create your account</h2>

        {error && (
          <div className="mb-6 flex items-center gap-2 p-3 rounded-xl bg-accent-danger/10 border border-accent-danger/20 text-accent-danger text-sm">
            <AlertCircle size={20} /> <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-txt-secondary mb-2">Email Address</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="you@example.com" required />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-txt-secondary mb-2">Password</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="••••••••" required />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-txt-secondary mb-2">Confirm Password</label>
            <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input-field" placeholder="••••••••" required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-txt-muted mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-accent-primary hover:text-accent-primary/80 font-medium transition-colors">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
