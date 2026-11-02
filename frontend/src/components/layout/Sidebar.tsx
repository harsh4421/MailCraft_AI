import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  PenTool,
  CheckCheck,
  Bookmark,
  History,
  User,
  Settings,
  HelpCircle,
  Info,
  LogOut,
  Mail,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const { isCollapsed, toggleCollapsed, isMobileOpen, closeMobile } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, path: '/dashboard' },
    { label: 'Draft Email', icon: <PenTool className="w-4 h-4 text-indigo-500" />, path: '/draft' },
    { label: 'Review Email', icon: <CheckCheck className="w-4 h-4 text-emerald-500" />, path: '/review' },
    { label: 'Saved Drafts', icon: <Bookmark className="w-4 h-4" />, path: '/drafts' },
    { label: 'History', icon: <History className="w-4 h-4" />, path: '/history' },
    { label: 'Profile', icon: <User className="w-4 h-4" />, path: '/profile' },
    { label: 'Settings', icon: <Settings className="w-4 h-4" />, path: '/settings' },
    { label: 'Help', icon: <HelpCircle className="w-4 h-4" />, path: '/app/help' },
  ];

  const handleLogout = () => {
    logout();
    closeMobile();
    navigate('/');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={closeMobile}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        aria-label="Workspace Navigation"
        className={`fixed top-0 bottom-0 left-0 z-50 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0 w-64 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-[72px]' : 'lg:w-60'}`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <NavLink
            to="/"
            onClick={closeMobile}
            className="flex items-center gap-2.5 min-w-0 group"
            title="MailCraft AI Home"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-accent-light flex items-center justify-center text-white shadow-sm shrink-0 group-hover:scale-105 transition-transform">
              <Mail className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0 transition-opacity duration-200">
                <span className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight flex items-center gap-1">
                  MailCraft <span className="text-gradient-brand">AI</span>
                </span>
              </div>
            )}
          </NavLink>

          {/* Desktop Toggle Button */}
          <button
            onClick={toggleCollapsed}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={closeMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-2.5 py-4 space-y-1.5 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeMobile}
                title={isCollapsed ? item.label : undefined}
                className={({ isActive: linkActive }) =>
                  `relative group flex items-center rounded-xl text-xs font-semibold transition-colors duration-150 ${
                    isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2.5 gap-3'
                  } ${
                    linkActive
                      ? 'text-brand-700 dark:text-brand-300 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-900/60'
                  }`
                }
              >
                {/* Smooth Animated Active Pill Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-indicator"
                    className="absolute inset-0 rounded-xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200/70 dark:border-brand-900/80 -z-10"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}

                <span className="shrink-0">{item.icon}</span>

                {!isCollapsed && <span className="truncate">{item.label}</span>}

                {/* Floating Tooltip in Collapsed Mode */}
                {isCollapsed && (
                  <div
                    role="tooltip"
                    className="hidden lg:block absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 group-focus:opacity-100 pointer-events-none transition-opacity shadow-lg z-50 dark:bg-slate-800 dark:border dark:border-slate-700"
                  >
                    {item.label}
                  </div>
                )}
              </NavLink>
            );
          })}

          {/* Secondary Documentation Link */}
          <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-850">
            <NavLink
              to="/app/about"
              onClick={closeMobile}
              title={isCollapsed ? 'About Project' : undefined}
              className={({ isActive }) =>
                `relative group flex items-center rounded-xl text-xs font-medium transition-colors ${
                  isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2 gap-3'
                } ${
                  isActive
                    ? 'text-brand-700 dark:text-brand-300 font-semibold bg-brand-50/60 dark:bg-brand-950/40'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-900/40'
                }`
              }
            >
              <Info className="w-4 h-4 shrink-0 text-slate-400" />
              {!isCollapsed && <span className="truncate">About Project</span>}
              {isCollapsed && (
                <div
                  role="tooltip"
                  className="hidden lg:block absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg z-50 dark:bg-slate-800 dark:border dark:border-slate-700"
                >
                  About Project
                </div>
              )}
            </NavLink>
          </div>
        </nav>

        {/* User Card & Logout Footer */}
        <div className="p-2.5 border-t border-slate-200 dark:border-slate-800">
          <div
            className={`flex items-center rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 ${
              isCollapsed ? 'p-1.5 justify-center' : 'p-2 justify-between'
            }`}
          >
            <NavLink
              to="/profile"
              onClick={closeMobile}
              title={isCollapsed ? user?.fullName || 'Profile' : undefined}
              className="flex items-center gap-2.5 min-w-0 group"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-accent-light text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {user?.fullName || 'My Account'}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {user?.email || 'user@mailcraft.ai'}
                  </p>
                </div>
              )}
            </NavLink>

            {!isCollapsed && (
              <button
                onClick={handleLogout}
                title="Sign Out"
                aria-label="Sign Out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors ml-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
