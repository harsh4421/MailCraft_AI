import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PenTool,
  CheckCheck,
  Bookmark,
  Award,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  ChevronRight,
  FileText,
  Settings as SettingsIcon,
  Cpu,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { reviewApi, authApi } from '../services/api';
import { DashboardStats, AIStatus } from '../types';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ScoreProgressBar } from '../components/ui/ScoreGauge';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [aiStatus, setAIStatus] = useState<AIStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsData, aiData] = await Promise.all([
          reviewApi.getDashboardStats(),
          authApi.getAIStatus(),
        ]);
        setStats(statsData);
        setAIStatus(aiData);
      } catch (err) {
        console.warn('Dashboard fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const firstName = user?.fullName?.split(' ')[0] || 'there';

  return (
    <div className="space-y-6">
      {/* Top Bar: Compact Greeting & Status Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Welcome back, {firstName}! 👋
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select an action below to draft new messages or review your writing.
          </p>
        </div>

        {/* Compact AI Status Badge */}
        {aiStatus && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                aiStatus.isDemoMode
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-300'
                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
              }`}
            >
              {aiStatus.isDemoMode ? (
                <Cpu className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              )}
              <span className="truncate max-w-[180px]">
                {aiStatus.isDemoMode ? 'Demo NLP Engine' : aiStatus.activeProvider || 'Live Cloud AI'}
              </span>
              <Link
                to="/settings"
                title="Configure AI Providers"
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors ml-0.5"
              >
                <SettingsIcon className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Modern Compact Action Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-700 via-brand-600 to-indigo-700 p-5 sm:p-6 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1 max-w-xl">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-200">
            Workspace Actions
          </p>
          <p className="text-sm sm:text-base font-bold text-white">
            Create a recipient-tailored draft or audit writing for grammar and tone.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            className="bg-white text-brand-700 hover:bg-slate-100 font-bold shadow-sm"
            icon={<PenTool className="w-3.5 h-3.5" />}
            onClick={() => navigate('/draft')}
          >
            Draft Email
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-white/40 text-white hover:bg-white/10 font-bold"
            icon={<CheckCheck className="w-3.5 h-3.5" />}
            onClick={() => navigate('/review')}
          >
            Review Email
          </Button>
        </div>
      </div>

      {/* Metrics Row (Non-redundant, clean) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 flex items-center justify-center shrink-0">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Emails Generated</p>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                {isLoading ? '-' : stats?.totalGenerations || 0}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Reviews Performed</p>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                {isLoading ? '-' : stats?.totalReviews || 0}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center shrink-0">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Saved Drafts</p>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                {isLoading ? '-' : stats?.totalDrafts || 0}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Average Score</p>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                {isLoading
                  ? '-'
                  : stats?.avgOverallScore && stats.totalReviews > 0
                  ? `${stats.avgOverallScore}/100`
                  : 'No reviews'}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main 2-Column Balanced Overview: Recent Drafts & Recent Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Recent Saved Drafts */}
        <Card>
          <CardHeader className="py-3 px-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-indigo-500" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Recent Saved Drafts
              </h3>
            </div>
            <Link
              to="/drafts"
              className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline flex items-center gap-1"
            >
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {stats?.recentDrafts && stats.recentDrafts.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {stats.recentDrafts.slice(0, 4).map((draft) => (
                  <div
                    key={draft.id}
                    onClick={() => navigate('/drafts')}
                    className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <div className="min-w-0 pr-3">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {draft.title || draft.subject || 'Untitled Draft'}
                        </p>
                        {draft.isPinned && (
                          <Badge variant="brand" size="sm">Pinned</Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                        Recipient: {draft.recipient} • {draft.purpose}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(draft.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center space-y-2">
                <FileText className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  No saved drafts yet
                </p>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  Draft an email and click "Save Draft" to access it here anytime.
                </p>
                <div className="pt-1">
                  <Button size="sm" variant="outline" onClick={() => navigate('/draft')}>
                    Create Draft
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column: Recent Reviews */}
        <Card>
          <CardHeader className="py-3 px-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCheck className="w-4 h-4 text-emerald-500" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Recent Email Reviews
              </h3>
            </div>
            <Link
              to="/history"
              className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline flex items-center gap-1"
            >
              View history <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {stats?.recentReviews && stats.recentReviews.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {stats.recentReviews.slice(0, 4).map((rev) => (
                  <div
                    key={rev.id}
                    onClick={() => navigate('/history')}
                    className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <div className="min-w-0 pr-3">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {rev.purpose}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                        Recipient: {rev.recipient}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant={rev.overallScore >= 80 ? 'success' : rev.overallScore >= 65 ? 'warning' : 'danger'}
                        size="sm"
                      >
                        {rev.overallScore}/100
                      </Badge>
                      <span className="text-[10px] text-slate-400">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center space-y-2">
                <CheckCheck className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  No email reviews yet
                </p>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  Audit your emails for grammar, tone, and professionalism.
                </p>
                <div className="pt-1">
                  <Button size="sm" variant="outline" onClick={() => navigate('/review')}>
                    Review an Email
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
