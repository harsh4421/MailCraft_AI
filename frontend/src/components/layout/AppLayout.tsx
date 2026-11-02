import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Menu, Sun, Moon, PenTool, CheckCheck, LayoutDashboard, Bookmark } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { SidebarProvider, useSidebar } from '../../context/SidebarContext';
import { Button } from '../ui/Button';

const AppLayoutInner: React.FC = () => {
  const { isCollapsed, openMobile, isMobileOpen } = useSidebar();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const location = useLocation();

  const getPageTitle = (pathname: string) => {
    if (pathname.startsWith('/dashboard')) return 'Dashboard';
    if (pathname.startsWith('/draft')) return 'Draft Email';
    if (pathname.startsWith('/review')) return 'Review Email';
    if (pathname.startsWith('/drafts')) return 'Saved Drafts';
    if (pathname.startsWith('/history')) return 'History';
    if (pathname.startsWith('/profile')) return 'Profile';
    if (pathname.startsWith('/settings')) return 'Settings';
    if (pathname.includes('/about')) return 'About Project';
    if (pathname.includes('/help')) return 'Help & Documentation';
    return 'MailCraft AI';
  };

  return (
    <div className="min-h-screen bg-surface-soft dark:bg-surface-dark flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-[padding] duration-300 ease-in-out ${
          isCollapsed ? 'lg:pl-[72px]' : 'lg:pl-60'
        }`}
      >
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-14 sm:h-16 glass-header px-3.5 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={openMobile}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Open sidebar navigation"
              aria-expanded={isMobileOpen}
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
          <div className="flex items-center gap-1.5 sm:gap-3">
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
            <Link to="/profile" className="flex items-center gap-2 pl-1" title="User Profile">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-light text-white font-bold text-xs flex items-center justify-center shadow-sm hover:scale-105 transition-transform">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content with restrained route fade */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-full"
          >
            <Outlet />
          </motion.div>
        </main>

        {/* Mobile Bottom Navigation Bar for SmartPhones */}
        <nav
          aria-label="Mobile Navigation"
          className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-white/95 dark:bg-slate-950/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 flex items-center justify-around px-2 shadow-lg"
        >
          <Link
            to="/dashboard"
            className={`flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-colors ${
              location.pathname === '/dashboard'
                ? 'text-brand-600 dark:text-brand-400 font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Home</span>
          </Link>

          <Link
            to="/draft"
            className={`flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-colors ${
              location.pathname === '/draft'
                ? 'text-brand-600 dark:text-brand-400 font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <PenTool className="w-5 h-5 text-indigo-500" />
            <span className="text-[10px] mt-0.5">Draft</span>
          </Link>

          <Link
            to="/review"
            className={`flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-colors ${
              location.pathname === '/review'
                ? 'text-brand-600 dark:text-brand-400 font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CheckCheck className="w-5 h-5 text-emerald-500" />
            <span className="text-[10px] mt-0.5">Review</span>
          </Link>

          <Link
            to="/drafts"
            className={`flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-colors ${
              location.pathname === '/drafts'
                ? 'text-brand-600 dark:text-brand-400 font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Bookmark className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Saved</span>
          </Link>

          <button
            onClick={openMobile}
            className="flex flex-col items-center justify-center w-14 h-12 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            aria-label="Open full menu"
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Menu</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

export const AppLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <AppLayoutInner />
    </SidebarProvider>
  );
};
