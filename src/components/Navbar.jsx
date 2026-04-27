// Navbar — top navigation bar for authenticated pages

import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Map, LayoutDashboard, BarChart3, Flame } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate('/');
      toast.success('Logged out successfully');
    } catch {
      toast.error('Failed to log out');
    }
  }

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/heatmap',   label: 'Heatmap',   icon: Flame },
    { to: '/admin',     label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-dark-800/60 bg-dark-950/80 backdrop-blur-xl">
      <nav className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2.5 group" id="nav-logo">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-900/50 group-hover:bg-brand-500 transition-colors">
            <Map size={16} className="text-white" />
          </div>
          <span className="font-bold text-white text-lg tracking-tight">
            Civic<span className="gradient-text">Lens</span>
            <span className="text-brand-400 text-xs font-medium ml-1 align-top mt-1 inline-block">AI</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              id={`nav-${label.toLowerCase()}`}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                 ${isActive
                   ? 'bg-brand-600/20 text-brand-400'
                   : 'text-dark-400 hover:text-white hover:bg-dark-800'
                 }`
              }
            >
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </div>

        {/* User menu */}
        <div className="flex items-center gap-3">
          {user && (
            <div className="hidden md:flex items-center gap-2 text-sm">
              <div className="w-8 h-8 rounded-full bg-brand-700 flex items-center justify-center text-brand-200 font-semibold text-xs">
                {(user.displayName || user.email || 'U')[0].toUpperCase()}
              </div>
              <span className="text-dark-400 max-w-[120px] truncate">
                {user.displayName || user.email}
              </span>
            </div>
          )}
          <button
            id="btn-logout"
            onClick={handleLogout}
            className="btn-ghost text-sm"
            title="Log out"
          >
            <LogOut size={15} />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>

      </nav>

      {/* Mobile nav */}
      <div className="md:hidden flex border-t border-dark-800/60">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors
               ${isActive ? 'text-brand-400' : 'text-dark-500 hover:text-dark-200'}`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </div>
    </header>
  );
}
