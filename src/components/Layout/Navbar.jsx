import { NavLink, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Receipt, BarChart3, Settings, FileDown, Menu, X, LogOut, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import UserAvatar from '../Common/UserAvatar';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/expenses', icon: Receipt, label: 'History' },
    { to: '/analytics', icon: BarChart3, label: 'Insights' },
    { to: '/profile', icon: Settings, label: 'Settings' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 h-[60px] flex items-center px-4 sm:px-6" style={{
      backgroundColor: 'rgba(11,18,32,0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)'
    }}>
      <div className="w-full px-4 md:px-8 lg:px-12 flex items-center justify-between">
        {/* Left: Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xl font-heading">
            <span className="font-bold text-brand-teal">Fin</span><span className="font-normal text-brand-teal">ora</span>
          </span>
        </Link>

        {/* Center: Nav Links (Desktop) */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-brand-teal'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon size={16} />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-brand-teal rounded-full" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Right: Actions */}
        <div className="hidden md:flex items-center gap-3">
          {/* Export PDF Button */}
          <Link
            to="/reports"
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-brand-teal text-brand-teal text-sm font-medium hover:bg-brand-teal/10 transition-all duration-200"
          >
            <FileDown size={16} />
            <span>Export PDF</span>
          </Link>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-white/5 transition-all duration-200"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? (
              <Sun size={16} className="text-slate-300" />
            ) : (
              <Moon size={16} className="text-slate-300" />
            )}
          </button>

          {/* User Avatar */}
          <UserAvatar user={user} profile={profile} size="sm" ringColor="ring-2 ring-brand-teal/30" />

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200 text-sm"
          >
            <LogOut size={16} />
          </button>
        </div>

        {/* Mobile: Hamburger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-white/5 transition-all"
        >
          {isOpen ? <X size={22} className="text-white" /> : <Menu size={22} className="text-white" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-[60px] left-0 right-0 bg-fintech-sidebar border-b border-white/10 p-4 md:hidden animate-slide-in-up">
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-teal/10 text-brand-teal'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <item.icon size={18} />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
            <Link
              to="/reports"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-brand-teal text-brand-teal hover:bg-brand-teal/10 transition-all"
            >
              <FileDown size={18} />
              <span className="font-medium">Export PDF</span>
            </Link>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut size={18} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
