import React, { useState, useEffect } from 'react';
import {
  History,
  CheckCheck,
  PenTool,
  Search,
  Trash2,
  ExternalLink,
  Award,
  Clock,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react';
import { useToast } from '../components/ui/Toast';
import { reviewApi, emailApi } from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { ScoreGauge } from '../components/ui/ScoreGauge';

export const HistoryPage: React.FC = () => {
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'reviews' | 'generations'>('reviews');
  const [reviews, setReviews] = useState<any[]>([]);
  const [generations, setGenerations] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [selectedReview, setSelectedReview] = useState<any | null>(null);
  const [selectedGen, setSelectedGen] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const [revData, genData] = await Promise.all([
        reviewApi.getReviews({ search: search.trim() || undefined }),
        emailApi.getGenerations(),
      ]);
      setReviews(revData.reviews || []);
      setGenerations(genData || []);
    } catch (err: any) {
      console.warn('History fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDeleteReview = async (id: string) => {
    try {
      await reviewApi.deleteReview(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      toast.success('Review history item removed.');
    } catch {
      toast.error('Failed to remove review');
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-500" />
            Email Activity & Audit History
          </h2>
          <p className="text-xs text-slate-500">
            Review past email generations, audits, and quality scoring evaluations.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'reviews'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Reviews ({reviews.length})
          </button>
          <button
            onClick={() => setActiveTab('generations')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'generations'
                ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            Generations ({generations.length})
          </button>
        </div>
      </div>

      {/* Reviews Tab */}
      {activeTab === 'reviews' && (
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-12 text-center text-xs text-slate-400">Loading history...</div>
            ) : reviews.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-5 hover:bg-slate-50/70 dark:hover:bg-slate-850/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant={rev.overallScore >= 80 ? 'success' : rev.overallScore >= 65 ? 'warning' : 'danger'}
                          size="sm"
                        >
                          Score: {rev.overallScore}/100
                        </Badge>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {rev.purpose} (To: {rev.recipient})
                        </h4>
                        <Badge variant="neutral" size="sm">{rev.desiredTone} Tone</Badge>
                      </div>

                      <p className="text-xs text-slate-500 line-clamp-2 font-sans">
                        {rev.improvedEmail}
                      </p>

                      <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(rev.createdAt).toLocaleString()}
                        </span>
                        <span>Model: {rev.aiModel}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedReview(rev)}
                        icon={<ExternalLink className="w-3.5 h-3.5" />}
                      >
                        View Report
                      </Button>
                      <button
                        onClick={() => handleDeleteReview(rev.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        title="Delete Review Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center space-y-2">
                <CheckCheck className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  No review records found
                </p>
                <p className="text-xs text-slate-400">
                  Emails audited in the Review Module will appear here with detailed score metrics.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Generations Tab */}
      {activeTab === 'generations' && (
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-12 text-center text-xs text-slate-400">Loading history...</div>
            ) : generations.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {generations.map((gen) => (
                  <div
                    key={gen.id}
                    className="p-5 hover:bg-slate-50/70 dark:hover:bg-slate-850/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="brand" size="sm">{gen.recipient}</Badge>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                          {gen.subject}
                        </h4>
                        <Badge variant="neutral" size="sm">{gen.tone}</Badge>
                      </div>

                      <p className="text-xs text-slate-500 line-clamp-2 font-sans">
                        {gen.body}
                      </p>

                      <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(gen.createdAt).toLocaleString()}
                        </span>
                        <span>Sender: {gen.senderName}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedGen(gen)}
                        icon={<ExternalLink className="w-3.5 h-3.5" />}
                      >
                        Inspect
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center space-y-2">
                <PenTool className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  No generation logs found
                </p>
                <p className="text-xs text-slate-400">
                  Generated emails will be automatically logged to your account.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Review Details Modal */}
      <Modal
        isOpen={!!selectedReview}
        onClose={() => setSelectedReview(null)}
        title="Email Audit Report"
        description={`Evaluated on ${selectedReview ? new Date(selectedReview.createdAt).toLocaleDateString() : ''}`}
        maxWidth="xl"
      >
        {selectedReview && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  Overall Score: {selectedReview.overallScore}/100
                </p>
                <p className="text-slate-400">
                  Grammar: {selectedReview.grammarScore} • Prof: {selectedReview.professionalismScore} • Clarity: {selectedReview.clarityScore}
                </p>
              </div>
              <Badge variant={selectedReview.overallScore >= 80 ? 'success' : 'warning'}>
                {selectedReview.desiredTone} Tone
              </Badge>
            </div>

            <div>
              <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Improved & Corrected Email
              </span>
              <div className="p-4 bg-emerald-50/30 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-xl whitespace-pre-line leading-relaxed text-slate-900 dark:text-slate-100">
                {selectedReview.improvedEmail}
              </div>
            </div>

            <div>
              <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Original Input
              </span>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl whitespace-pre-line text-slate-500">
                {selectedReview.originalEmail}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopyText(selectedReview.improvedEmail)}
                icon={copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              >
                Copy Improved
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Generation Details Modal */}
      <Modal
        isOpen={!!selectedGen}
        onClose={() => setSelectedGen(null)}
        title={selectedGen?.subject || 'Generated Email'}
        description={`Recipient: ${selectedGen?.recipient} • Purpose: ${selectedGen?.purpose}`}
        maxWidth="lg"
      >
        {selectedGen && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 leading-relaxed">
              <p className="font-semibold text-slate-900 dark:text-slate-100">{selectedGen.greeting}</p>
              <p className="whitespace-pre-line text-slate-800 dark:text-slate-200">{selectedGen.body}</p>
              <p className="font-semibold text-slate-900 dark:text-slate-100">{selectedGen.closing}</p>
              <p className="text-slate-600 dark:text-slate-400 font-medium">{selectedGen.senderName}</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopyText(`${selectedGen.subject}\n\n${selectedGen.greeting}\n\n${selectedGen.body}\n\n${selectedGen.closing}\n${selectedGen.senderName}`)}
                icon={<Copy className="w-3.5 h-3.5" />}
              >
                Copy Email
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
