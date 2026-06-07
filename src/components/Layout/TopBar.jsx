import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Link } from 'react-router-dom';
import { LogOut, Sun, Moon, Wallet } from 'lucide-react';
import UserAvatar from '../Common/UserAvatar';
import { getUserDisplayName } from '../Common/UserAvatar';

const TopBar = () => {
  const { user, profile, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="bg-white/80 dark:bg-fintech-secondary/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 px-6 py-4 transition-colors duration-300 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        <div className="ml-12 lg:ml-0 flex items-center gap-4">
          <UserAvatar user={user} profile={profile} size="md" ringColor="ring-2 ring-accent-primary/30" />
          <div>
            <h2 className="text-xl sm:text-2xl font-heading font-bold text-slate-800 dark:text-txt-primary leading-tight">
              Welcome back, {getUserDisplayName(user, profile).split(' ')[0]}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 dark:text-txt-muted mt-0.5">
              {user?.email}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Budget Badge */}
          <Link
            to="/profile"
            className="hidden sm:flex items-center space-x-2 px-3 py-2 rounded-xl bg-white dark:bg-fintech-card border border-slate-200 dark:border-white/10 hover:border-accent-primary/30 transition-all duration-300 group"
          >
            <Wallet size={16} className="text-accent-primary" />
            <span className="text-sm font-semibold text-slate-800 dark:text-txt-primary">
              {profile?.monthly_budget ? `₹${profile.monthly_budget.toLocaleString()}` : 'Set Budget'}
            </span>
          </Link>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-white dark:bg-fintech-card border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300 group"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? (
              <Sun size={18} className="text-accent-warning group-hover:rotate-45 transition-transform duration-300" />
            ) : (
              <Moon size={18} className="text-slate-400 dark:text-txt-muted group-hover:-rotate-12 transition-transform duration-300" />
            )}
          </button>

          {/* Profile Link */}
          <Link
            to="/profile"
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-white dark:bg-fintech-card border border-slate-200 dark:border-white/10 hover:border-accent-primary/30 transition-all duration-300 group"
            title="Profile Settings"
          >
            <UserAvatar user={user} profile={profile} size="xs" />
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2.5 bg-accent-danger/10 hover:bg-accent-danger/20 border border-accent-danger/20 hover:border-accent-danger/40 text-accent-danger rounded-xl transition-all duration-300 text-sm font-medium group"
          >
            <LogOut size={16} className="group-hover:translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
