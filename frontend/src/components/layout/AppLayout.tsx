import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Menu, Sun, Moon, PenTool, CheckCheck } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const location = useLocation();

  const getPageTitle = (pathname: string) => {
    if (pathname.startsWith('/dashboard')) return 'Dashboard Overview';
    if (pathname.startsWith('/draft')) return 'AI Email Drafting Assistant';
    if (pathname.startsWith('/review')) return 'AI Email Review & Quality Analysis';
    if (pathname.startsWith('/drafts')) return 'Saved Email Drafts';
    if (pathname.startsWith('/history')) return 'Email History & Logs';
    if (pathname.startsWith('/profile')) return 'User Profile';
    if (pathname.startsWith('/settings')) return 'Preferences & AI Settings';
    if (pathname.includes('/about')) return 'About MailCraft AI';
    if (pathname.includes('/help')) return 'Help Center & Documentation';
    return 'MailCraft AI';
  };

  return (
    <div className="min-h-screen bg-surface-soft dark:bg-surface-dark flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-16 glass-header px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                {getPageTitle(location.pathname)}
              </h1>
            </div>
          </div>

          {/* Quick Actions & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/draft" className="hidden sm:inline-flex">
              <Button size="sm" variant="outline" icon={<PenTool className="w-3.5 h-3.5 text-indigo-500" />}>
                Draft
              </Button>
            </Link>
            <Link to="/review" className="hidden sm:inline-flex">
              <Button size="sm" variant="outline" icon={<CheckCheck className="w-3.5 h-3.5 text-emerald-500" />}>
                Review
              </Button>
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* User Avatar */}
            <Link to="/profile" className="flex items-center gap-2 pl-1">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-light text-white font-bold text-xs flex items-center justify-center shadow-sm">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
