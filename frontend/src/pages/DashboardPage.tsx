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
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { reviewApi, authApi } from '../services/api';
import { DashboardStats, AIStatus } from '../types';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ScoreGauge, ScoreProgressBar } from '../components/ui/ScoreGauge';
import { DemoBanner } from '../components/ui/DemoBanner';

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

  return (
    <div className="space-y-6">
      {/* AI Mode Banner */}
      {aiStatus && (
        <DemoBanner
          isDemoMode={aiStatus.isDemoMode}
          aiModel={aiStatus.activeProvider}
        />
      )}

      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-700 via-brand-600 to-indigo-700 p-6 sm:p-8 text-white shadow-md">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Productivity Workspace</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.fullName?.split(' ')[0] || 'Harsh'}! 👋
          </h2>
          <p className="text-xs sm:text-sm text-brand-100 leading-relaxed">
            What would you like to accomplish today? Draft a new context-tailored email or audit an existing message for professionalism and grammar.
          </p>

          <div className="pt-3 flex flex-wrap gap-3">
            <Link to="/draft">
              <Button
                variant="secondary"
                size="sm"
                className="bg-white text-brand-700 hover:bg-slate-100 font-bold"
                icon={<PenTool className="w-3.5 h-3.5" />}
              >
                Draft New Email
              </Button>
            </Link>
            <Link to="/review">
              <Button
                variant="outline"
                size="sm"
                className="border-white/40 text-white hover:bg-white/10"
                icon={<CheckCheck className="w-3.5 h-3.5" />}
              >
                Review Existing Email
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative background shape */}
        <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Real Usage Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 flex items-center justify-center shrink-0">
              <PenTool className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Emails Generated</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {isLoading ? '-' : stats?.totalGenerations || 0}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Reviews Performed</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {isLoading ? '-' : stats?.totalReviews || 0}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center shrink-0">
              <Bookmark className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Saved Drafts</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {isLoading ? '-' : stats?.totalDrafts || 0}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Avg Review Score</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {isLoading
                  ? '-'
                  : stats?.avgOverallScore
                  ? `${stats.avgOverallScore}/100`
                  : 'N/A'}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Quality Analytics + Recent Drafts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Quality Health Breakdown */}
        <div className="lg:col-span-5 space-y-6">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brand-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Communication Quality Index
                </h3>
              </div>
              <Badge variant="brand" size="sm">Live DB Metrics</Badge>
            </CardHeader>
            <CardContent className="space-y-6">
              {stats?.totalReviews && stats.totalReviews > 0 ? (
                <>
                  <div className="py-2">
                    <ScoreGauge score={stats.avgOverallScore} size={130} label="Overall Writing Score" />
                  </div>
                  <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <ScoreProgressBar
                      label="Grammar & Spelling"
                      score={stats.scoreBreakdown.grammar}
                      colorClass="bg-emerald-500"
                    />
                    <ScoreProgressBar
                      label="Corporate Professionalism"
                      score={stats.scoreBreakdown.professionalism}
                      colorClass="bg-brand-600"
                    />
                    <ScoreProgressBar
                      label="Readability & Clarity"
                      score={stats.scoreBreakdown.clarity}
                      colorClass="bg-sky-500"
                    />
                  </div>
                </>
              ) : (
                <div className="py-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                    <CheckCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      No review data recorded yet
                    </p>
                    <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-1">
                      Analyze an email in the AI Review module to see your scores and communication trends.
                    </p>
                  </div>
                  <Link to="/review">
                    <Button size="sm" variant="outline" className="mt-2">
                      Review First Email
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Recent Drafts & Recent Activity */}
        <div className="lg:col-span-7 space-y-6">
          {/* Recent Saved Drafts */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Recent Saved Drafts
                </h3>
              </div>
              <Link to="/drafts" className="text-xs text-brand-600 font-semibold hover:underline flex items-center gap-1">
                View all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {stats?.recentDrafts && stats.recentDrafts.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {stats.recentDrafts.map((draft) => (
                    <div
                      key={draft.id}
                      onClick={() => navigate('/drafts')}
                      className="p-4 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <div className="min-w-0 pr-4">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                            {draft.title || draft.subject}
                          </p>
                          {draft.isPinned && (
                            <Badge variant="brand" size="sm">Pinned</Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                          To: <span className="font-medium text-slate-600 dark:text-slate-400">{draft.recipient}</span> • Purpose: {draft.purpose}
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
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    No saved drafts yet
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Draft an email and click "Save Draft" to access it here anytime.
                  </p>
                  <Link to="/draft" className="inline-block pt-1">
                    <Button size="sm" variant="primary">
                      Create a Draft
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Reviews List */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCheck className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Recent Email Reviews
                </h3>
              </div>
              <Link to="/history" className="text-xs text-brand-600 font-semibold hover:underline flex items-center gap-1">
                View history <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {stats?.recentReviews && stats.recentReviews.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {stats.recentReviews.map((rev) => (
                    <div
                      key={rev.id}
                      onClick={() => navigate('/history')}
                      className="p-4 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <div className="min-w-0 pr-4">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {rev.purpose} (Recipient: {rev.recipient})
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Reviewed on {new Date(rev.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge
                        variant={rev.overallScore >= 80 ? 'success' : rev.overallScore >= 65 ? 'warning' : 'danger'}
                        size="sm"
                      >
                        Score: {rev.overallScore}/100
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center space-y-2">
                  <CheckCheck className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    No recent reviews
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Audit an email's tone, grammar, and professionalism.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
