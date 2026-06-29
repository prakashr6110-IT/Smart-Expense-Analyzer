import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, BarChart3, Bell, User, Menu, X, FileDown, Receipt } from 'lucide-react';
import { useState } from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import { useAuth } from '../../context/AuthContext';
import UserAvatar, { getUserDisplayName } from '../Common/UserAvatar';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { unreadAlertsCount } = useExpenses();
  const { user, profile } = useAuth();

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/add-expense', icon: PlusCircle, label: 'Add Expense' },
    { to: '/expenses', icon: Receipt, label: 'Expenses' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/alerts', icon: Bell, label: 'Alerts', badge: unreadAlertsCount },
    { to: '/reports', icon: FileDown, label: 'Reports' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-white dark:bg-fintech-card border border-slate-200 dark:border-white/10 text-slate-800 dark:text-txt-primary shadow-lg backdrop-blur-xl"
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white dark:bg-fintech-sidebar border-r border-slate-200 dark:border-white/5 text-slate-800 dark:text-txt-primary w-64 transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Logo Section */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl overflow-hidden ring-2 ring-brand-teal/20">
              <img src="/finora-logo.png" alt="Finora" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-xl font-heading">
                <span className="font-bold text-brand-teal">Fin</span><span className="font-normal text-brand-teal">ora</span>
              </h1>
              <p className="text-xs text-slate-400 dark:text-txt-muted mt-0.5 tracking-wide">Smart Expense Analyzer</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-4 px-3">
          <div className="space-y-1">
            {navItems.map((item, index) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `group flex items-center px-4 py-3 rounded-xl transition-all duration-300 relative ${
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
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-accent-primary to-accent-insights rounded-r-full" />
                    )}
                    <div className={`relative flex items-center justify-center w-9 h-9 rounded-lg mr-3 transition-all duration-300 ${
                      isActive 
                        ? 'bg-accent-primary/20 text-accent-primary' 
                        : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-txt-muted group-hover:bg-slate-200 dark:group-hover:bg-white/10 group-hover:text-slate-600 dark:group-hover:text-txt-secondary'
                    }`}>
                      <item.icon size={18} />
                    </div>
                    <span className={`font-medium text-sm ${isActive ? 'font-heading' : ''}`}>{item.label}</span>
                    {item.badge > 0 && (
                      <span className="ml-auto bg-gradient-to-r from-accent-danger to-red-600 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 animate-pulse-soft">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* User Profile Section */}
        <div className="absolute bottom-0 w-full p-4">
          {/* User avatar and info */}
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-200 dark:border-white/10">
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
          </div>
          
          {/* Premium Tagline Card */}
          <div className="glass rounded-xl p-4">
            <p className="text-sm text-slate-600 dark:text-txt-secondary font-medium">Track • Analyze • Predict</p>
            <p className="text-xs text-slate-400 dark:text-txt-muted mt-1">Stay in control of your finances</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
