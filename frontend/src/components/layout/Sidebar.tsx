import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  PenTool,
  CheckCheck,
  Bookmark,
  History,
  User,
  Settings,
  Info,
  HelpCircle,
  LogOut,
  Mail,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, path: '/dashboard' },
    { label: 'AI Email Drafting', icon: <PenTool className="w-4 h-4 text-indigo-500" />, path: '/draft' },
    { label: 'AI Email Review', icon: <CheckCheck className="w-4 h-4 text-emerald-500" />, path: '/review' },
    { label: 'Saved Drafts', icon: <Bookmark className="w-4 h-4" />, path: '/drafts' },
    { label: 'Email History', icon: <History className="w-4 h-4" />, path: '/history' },
    { label: 'User Profile', icon: <User className="w-4 h-4" />, path: '/profile' },
    { label: 'Settings', icon: <Settings className="w-4 h-4" />, path: '/settings' },
    { label: 'About Project', icon: <Info className="w-4 h-4" />, path: '/app/about' },
    { label: 'Help & Support', icon: <HelpCircle className="w-4 h-4" />, path: '/app/help' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white shadow-sm">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight">
                MailCraft <span className="text-brand-600">AI</span>
              </span>
            </div>
          </NavLink>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Main Workspace
          </div>
          {navItems.slice(0, 3).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-100'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                {item.icon}
                <span>{item.label}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-40" />
            </NavLink>
          ))}

          <div className="px-3 pt-4 pb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Library & Tools
          </div>
          {navItems.slice(3, 5).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-100'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                {item.icon}
                <span>{item.label}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-40" />
            </NavLink>
          ))}

          <div className="px-3 pt-4 pb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            System & Help
          </div>
          {navItems.slice(5).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-100'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                {item.icon}
                <span>{item.label}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-40" />
            </NavLink>
          ))}
        </nav>

        {/* User Card & Logout Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-accent-light text-white font-bold text-xs flex items-center justify-center shrink-0">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  {user?.fullName || 'Harsh Kumar'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {user?.email || 'harsh@example.com'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
