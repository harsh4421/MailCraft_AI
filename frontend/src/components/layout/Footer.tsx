import React from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800/80 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="md:col-span-2 space-y-3">
          <Link to="/" className="flex items-center gap-2.5 group w-fit">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-accent-light flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight">
                MailCraft <span className="text-gradient-brand">AI</span>
              </span>
            </div>
          </Link>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
            Intelligent email drafting and writing review assistant designed to elevate your everyday communication.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3">
            Product
          </h4>
          <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
            <li>
              <Link to="/draft" className="hover:text-brand-600 transition-colors">
                Draft Email
              </Link>
            </li>
            <li>
              <Link to="/review" className="hover:text-brand-600 transition-colors">
                Review Email
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="hover:text-brand-600 transition-colors">
                Dashboard
              </Link>
            </li>
          </ul>
        </div>

        {/* Documentation */}
        <div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3">
            Resources
          </h4>
          <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
            <li>
              <Link to="/about" className="hover:text-brand-600 transition-colors">
                About & Architecture
              </Link>
            </li>
            <li>
              <Link to="/help" className="hover:text-brand-600 transition-colors">
                Help & Documentation
              </Link>
            </li>
            <li>
              <Link to="/settings" className="hover:text-brand-600 transition-colors">
                AI Settings
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-100 dark:border-slate-850 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
        <p>© 2026 MailCraft AI. All rights reserved.</p>
        <p className="text-slate-400 text-[11px]">
          Professional Productivity Suite
        </p>
      </div>
    </footer>
  );
};
