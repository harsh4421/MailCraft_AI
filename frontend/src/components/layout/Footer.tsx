import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Heart, Github, GraduationCap } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800/80 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand & Student Info */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-accent-light flex items-center justify-center text-white shadow-sm">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">
                MailCraft <span className="text-gradient-brand">AI</span>
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
            MailCraft AI is an advanced, production-grade AI Email Drafting and Review Assistant developed by{' '}
            <strong className="text-slate-800 dark:text-slate-200 font-semibold">Harsh Kumar</strong> as a college mini-project in Professional Productivity.
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <GraduationCap className="w-4 h-4 text-brand-600" />
            <span>ITM Sem 3 — AI Tools Mini Project</span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3">
            Core Modules
          </h4>
          <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
            <li>
              <Link to="/draft" className="hover:text-brand-600 transition-colors">
                AI Email Drafting
              </Link>
            </li>
            <li>
              <Link to="/review" className="hover:text-brand-600 transition-colors">
                AI Email Review
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="hover:text-brand-600 transition-colors">
                Productivity Dashboard
              </Link>
            </li>
            <li>
              <Link to="/drafts" className="hover:text-brand-600 transition-colors">
                Saved Drafts
              </Link>
            </li>
          </ul>
        </div>

        {/* Project & Support */}
        <div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3">
            Documentation
          </h4>
          <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
            <li>
              <Link to="/about" className="hover:text-brand-600 transition-colors">
                About Project & Architecture
              </Link>
            </li>
            <li>
              <Link to="/help" className="hover:text-brand-600 transition-colors">
                Help & Email Writing Guide
              </Link>
            </li>
            <li>
              <Link to="/settings" className="hover:text-brand-600 transition-colors">
                AI Provider Settings
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-slate-100 dark:border-slate-850 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
        <p>© 2026 MailCraft AI — Developed by Harsh Kumar. All rights reserved.</p>
        <p className="flex items-center gap-1">
          Designed with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" /> for seamless professional communication.
        </p>
      </div>
    </footer>
  );
};
