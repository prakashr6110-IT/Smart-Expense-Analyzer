import { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, BarChart3, Bell, User, FileDown, Receipt, LogOut } from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';
import { useAuth } from '../../context/AuthContext';
import UserAvatar, { getUserDisplayName } from '../Common/UserAvatar';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/add-expense', icon: PlusCircle, label: 'Add Expense' },
  { to: '/expenses', icon: Receipt, label: 'Expenses' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/alerts', icon: Bell, label: 'Alerts', badgeKey: 'unreadAlertsCount' },
  { to: '/reports', icon: FileDown, label: 'Reports' },
  { to: '/profile', icon: User, label: 'Profile' },
];

/**
 * Sidebar — fixed 240px rail on desktop (lg+), slide-in drawer below 1024px.
 * Drawer state is controlled by AppLayout; supports Escape/backdrop close.
 */
const Sidebar = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { unreadAlertsCount } = useExpenses();
  const { user, profile, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Escape closes the drawer
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  const badges = { unreadAlertsCount };

  return (
    <>
      {/* Backdrop (drawer only) */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      <aside
        aria-label="Main navigation"
        className={`fixed top-0 left-0 h-full w-60 bg-white dark:bg-fintech-sidebar border-r border-slate-200 dark:border-white/5 text-slate-800 dark:text-txt-primary transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] z-50 lg:translate-x-0 overflow-y-auto scrollbar-thin ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo Section */}
        <div className="p-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-brand-teal/20">
              <img src="/finora-logo.png" alt="Finora" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-lg font-heading">
                <span className="font-bold text-brand-teal">Fin</span><span className="font-normal text-brand-teal">ora</span>
              </h1>
              <p className="text-[11px] text-slate-400 dark:text-txt-muted mt-0.5 tracking-wide">Smart Expense Analyzer</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-2 px-3 pb-28">
          <div className="space-y-1">
            {navItems.map((item, index) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                aria-label={item.label}
                className={({ isActive }) =>
                  `group flex items-center px-3 py-2.5 rounded-xl transition-all duration-300 relative ${
                    isActive
                      ? 'bg-gradient-to-r from-accent-primary/20 to-accent-insights/10 text-slate-800 dark:text-txt-primary shadow-lg'
                      : 'text-slate-600 dark:text-txt-secondary hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-800 dark:hover:text-txt-primary'
                  }`
                }
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {({ isActive }) => (
                  <>
                    {/* Active indicator bar */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 bg-gradient-to-b from-accent-primary to-accent-insights rounded-r-full" />
                    )}
                    <div className={`relative flex items-center justify-center w-8 h-8 rounded-lg mr-2.5 transition-all duration-300 ${
                      isActive
                        ? 'bg-accent-primary/20 text-accent-primary'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-txt-muted group-hover:bg-slate-200 dark:group-hover:bg-white/10 group-hover:text-slate-600 dark:group-hover:text-txt-secondary'
                    }`}>
                      <item.icon size={16} />
                    </div>
                    <span className={`text-sm ${isActive ? 'font-heading font-semibold' : 'font-medium'}`}>{item.label}</span>
                    {item.badgeKey && badges[item.badgeKey] > 0 && (
                      <span className="ml-auto bg-gradient-to-r from-accent-danger to-red-600 text-white text-[11px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 animate-pulse-soft">
                        {badges[item.badgeKey]}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* User Profile Section */}
        <div className="fixed bottom-0 w-60 p-4 bg-white dark:bg-fintech-sidebar">
          <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-200 dark:border-white/10">
            <UserAvatar
              user={user}
              profile={profile}
              size="sm"
              ringColor="ring-2 ring-accent-primary/40"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800 dark:text-txt-primary truncate font-heading">
                {getUserDisplayName(user, profile)}
              </p>
              <p className="text-xs text-slate-400 dark:text-txt-muted truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              aria-label="Log out"
              title="Log out"
              className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg text-slate-400 dark:text-txt-muted hover:text-accent-danger hover:bg-accent-danger/10 transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>

          <p className="text-xs text-slate-400 dark:text-txt-muted tracking-wide">Track • Analyze • Predict</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
