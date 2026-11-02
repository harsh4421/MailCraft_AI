import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bookmark,
  Search,
  Filter,
  Trash2,
  Edit,
  ExternalLink,
  Copy,
  Check,
  Pin,
  Tag,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { emailApi } from '../services/api';
import { EmailDraft } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';

export const DraftsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [drafts, setDrafts] = useState<EmailDraft[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [recipientFilter, setRecipientFilter] = useState('All');
  const [purposeFilter, setPurposeFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [selectedDraft, setSelectedDraft] = useState<EmailDraft | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [draftToDelete, setDraftToDelete] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchDrafts = async () => {
    setIsLoading(true);
    try {
      const res = await emailApi.getDrafts({
        search: search.trim() || undefined,
        recipient: recipientFilter !== 'All' ? recipientFilter : undefined,
        purpose: purposeFilter !== 'All' ? purposeFilter : undefined,
        page,
        limit: 10,
      });
      setDrafts(res.drafts);
      setTotal(res.pagination.total);
      setTotalPages(res.pagination.totalPages);
    } catch (err: any) {
      console.warn('Error fetching drafts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, [page, recipientFilter, purposeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchDrafts();
  };

  const handleCopyDraft = (draft: EmailDraft) => {
    navigator.clipboard.writeText(`Subject: ${draft.subject}\n\n${draft.body}`);
    setCopiedId(draft.id);
    toast.success('Draft copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteConfirm = async () => {
    if (!draftToDelete) return;
    try {
      await emailApi.deleteDraft(draftToDelete);
      toast.success('Draft deleted.');
      setIsDeleteModalOpen(false);
      setDraftToDelete(null);
      fetchDrafts();
    } catch (err: any) {
      toast.error('Failed to delete draft');
    }
  };

  const handleLoadIntoWorkspace = (draft: EmailDraft) => {
    navigate('/draft', {
      state: {
        template: {
          recipient: draft.recipient,
          purpose: draft.purpose,
          context: draft.context || '',
          tone: draft.tone,
        },
      },
    });
  };

  const handleTogglePin = async (draft: EmailDraft) => {
    try {
      const updated = await emailApi.updateDraft(draft.id, { isPinned: !draft.isPinned });
      setDrafts((prev) => prev.map((d) => (d.id === draft.id ? updated : d)));
      toast.info(updated.isPinned ? 'Draft pinned to top' : 'Draft unpinned');
    } catch {
      toast.error('Failed to update pin state');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-indigo-500" />
            Saved Email Drafts
          </h2>
          <p className="text-xs text-slate-500">
            Access, edit, pin, and reuse your saved emails persisted in PostgreSQL.
          </p>
        </div>
        <Button
          size="sm"
          variant="primary"
          icon={<Sparkles className="w-4 h-4" />}
          onClick={() => navigate('/draft')}
        >
          Draft New Email
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            <div className="sm:col-span-6">
              <Input
                placeholder="Search by title, subject, recipient, or body..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="sm:col-span-3">
              <Select
                value={recipientFilter}
                onChange={(e) => {
                  setRecipientFilter(e.target.value);
                  setPage(1);
                }}
                options={['All', 'Professor', 'Manager', 'HR', 'Client', 'Colleague', 'Customer', 'Friend']}
              />
            </div>
            <div className="sm:col-span-3 flex gap-2">
              <Button type="submit" variant="secondary" className="w-full text-xs">
                Filter
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Drafts List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading drafts...</div>
          ) : drafts.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {drafts.map((draft) => (
                <div
                  key={draft.id}
                  className="p-5 hover:bg-slate-50/70 dark:hover:bg-slate-850/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => handleTogglePin(draft)}
                        className={`p-1 rounded-md transition-colors ${
                          draft.isPinned ? 'text-brand-600 bg-brand-50 dark:bg-brand-950' : 'text-slate-300 hover:text-slate-500'
                        }`}
                        title={draft.isPinned ? 'Unpin' : 'Pin to top'}
                      >
                        <Pin className="w-3.5 h-3.5 fill-current" />
                      </button>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                        {draft.title || draft.subject}
                      </h4>
                      <Badge variant="brand" size="sm">{draft.recipient}</Badge>
                      <Badge variant="neutral" size="sm">{draft.tone}</Badge>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                      {draft.body}
                    </p>

                    <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Updated {new Date(draft.updatedAt).toLocaleDateString()}
                      </span>
                      {draft.tags && draft.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          <span>{draft.tags.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleCopyDraft(draft)}
                      className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Copy Draft"
                    >
                      {copiedId === draft.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedDraft(draft);
                        setIsViewModalOpen(true);
                      }}
                      className="p-2 rounded-xl text-slate-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-colors"
                      title="View Details"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleLoadIntoWorkspace(draft)}
                      className="text-xs font-semibold"
                    >
                      Load in Workspace
                    </Button>
                    <button
                      onClick={() => {
                        setDraftToDelete(draft.id);
                        setIsDeleteModalOpen(true);
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title="Delete Draft"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center space-y-3">
              <Bookmark className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No saved drafts found
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Generate an email in the drafting module and save it to access it in this library.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-xs text-slate-400 flex items-center px-2">
            Page {page} of {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      )}

      {/* View Detail Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={selectedDraft?.title || 'Draft Details'}
        description={`Recipient: ${selectedDraft?.recipient} • Purpose: ${selectedDraft?.purpose}`}
        maxWidth="lg"
      >
        {selectedDraft && (
          <div className="space-y-4 text-xs">
            <div>
              <span className="font-bold text-slate-400">Subject:</span>
              <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                {selectedDraft.subject}
              </p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 whitespace-pre-line text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
              {selectedDraft.body}
            </div>
            <div className="flex justify-between items-center pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopyDraft(selectedDraft)}
                icon={<Copy className="w-3.5 h-3.5" />}
              >
                Copy Content
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleLoadIntoWorkspace(selectedDraft);
                }}
              >
                Open in Workspace
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
        description="Are you sure you want to permanently delete this email draft?"
        maxWidth="sm"
      >
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" size="sm" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={handleDeleteConfirm}>
            Delete Permanently
          </Button>
        </div>
      </Modal>
    </div>
  );
};
