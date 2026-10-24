import { Link, NavLink, useLocation } from 'react-router-dom';
import { Bell, Menu, Moon, PlusCircle, Sun } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useExpenses } from '../../context/ExpenseContext';
import UserAvatar, { getUserDisplayName } from '../Common/UserAvatar';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/add-expense': 'Add Expense',
  '/expenses': 'Expenses',
  '/analytics': 'Analytics',
  '/alerts': 'Alerts',
  '/reports': 'Reports',
  '/profile': 'Profile',
};

/**
 * TopBar — compact sticky header for the authenticated shell:
 * drawer trigger (mobile), current page, Add Expense, alerts, theme, account.
 */
const TopBar = ({ onMenuClick }) => {
  const { user, profile } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { unreadAlertsCount } = useExpenses();
  const { pathname } = useLocation();

  const title = PAGE_TITLES[pathname] || 'Finora';
  const firstName = getUserDisplayName(user, profile).split(' ')[0];

  return (
    <header className="sticky top-0 z-30 h-16 backdrop-blur-xl bg-[#eef2f7]/80 dark:bg-fintech-bg/80 border-b border-slate-200/80 dark:border-white/5 transition-colors duration-300">
      <div className="h-full w-full max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            className="lg:hidden flex items-center justify-center w-11 h-11 -ml-1 rounded-xl bg-white dark:bg-fintech-secondary border border-slate-200 dark:border-white/10 text-slate-600 dark:text-txt-secondary hover:text-slate-900 dark:hover:text-txt-primary transition-colors"
          >
            <Menu size={20} />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg font-heading font-bold text-slate-800 dark:text-txt-primary leading-tight truncate">
              {title}
            </h1>
            <p className="hidden sm:block text-xs text-slate-400 dark:text-txt-muted truncate">
              Welcome back, {firstName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <NavLink
            to="/add-expense"
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl btn-primary !py-2.5 !px-4 text-sm"
          >
            <PlusCircle size={16} />
            <span className="font-semibold">Add Expense</span>
          </NavLink>

          <Link
            to="/alerts"
            aria-label={unreadAlertsCount > 0 ? `Alerts, ${unreadAlertsCount} unread` : 'Alerts'}
            className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-white dark:bg-fintech-card border border-slate-200 dark:border-white/10 text-slate-500 dark:text-txt-secondary hover:text-accent-primary dark:hover:text-accent-primary hover:border-accent-primary/30 transition-all duration-300"
          >
            <Bell size={18} />
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-accent-danger to-red-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 border-2 border-[#eef2f7] dark:border-fintech-bg">
                {unreadAlertsCount > 9 ? '9+' : unreadAlertsCount}
              </span>
            )}
          </Link>

          <button
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="flex items-center justify-center w-11 h-11 rounded-xl bg-white dark:bg-fintech-card border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300 group"
          >
            {isDark ? (
              <Sun size={18} className="text-accent-warning group-hover:rotate-45 transition-transform duration-300" />
            ) : (
              <Moon size={18} className="text-slate-400 group-hover:-rotate-12 transition-transform duration-300" />
            )}
          </button>

          <Link to="/profile" aria-label="Profile settings" className="flex items-center">
            <UserAvatar user={user} profile={profile} size="sm" ringColor="ring-2 ring-accent-primary/30" />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
