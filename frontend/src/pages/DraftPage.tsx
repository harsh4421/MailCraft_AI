import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  PenTool,
  Sparkles,
  Copy,
  Check,
  Download,
  Bookmark,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  RotateCcw,
  Zap,
  Info,
  Layers,
  Wand2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { emailApi, authApi } from '../services/api';
import { DraftEmailResult, AIStatus } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { DemoBanner } from '../components/ui/DemoBanner';
import { Modal } from '../components/ui/Modal';

export const DraftPage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const location = useLocation();

  // State from location or defaults
  const passedTemplate = (location.state as any)?.template;

  // Form Fields
  const [recipient, setRecipient] = useState(passedTemplate?.recipient || 'Professor');
  const [customRecipient, setCustomRecipient] = useState('');
  const [purpose, setPurpose] = useState(passedTemplate?.purpose || 'Assignment extension');
  const [customPurpose, setCustomPurpose] = useState('');
  const [context, setContext] = useState(
    passedTemplate?.context ||
      'I was hospitalized with high fever yesterday. The doctor prescribed complete bed rest until Thursday. I would like to request an extension on the project submission until Friday 5 PM.'
  );
  const [tone, setTone] = useState(passedTemplate?.tone || 'Professional');
  const [length, setLength] = useState(passedTemplate?.length || 'Medium');
  const [senderName, setSenderName] = useState(user?.defaultSenderName || user?.fullName || 'Harsh Kumar');
  const [additionalInstructions, setAdditionalInstructions] = useState('');

  // Generated Result & Editable Output Fields
  const [result, setResult] = useState<DraftEmailResult | null>(null);
  const [subject, setSubject] = useState('');
  const [greeting, setGreeting] = useState('');
  const [body, setBody] = useState('');
  const [closing, setClosing] = useState('');

  // UI States
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [copiedField, setCopiedField] = useState<'all' | 'subject' | null>(null);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftTags, setDraftTags] = useState('college, urgent');
  const [isSaving, setIsSaving] = useState(false);
  const [aiStatus, setAIStatus] = useState<AIStatus | null>(null);

  useEffect(() => {
    authApi.getAIStatus().then(setAIStatus).catch(() => {});
  }, []);

  // Update sender name when user changes
  useEffect(() => {
    if (user?.defaultSenderName || user?.fullName) {
      setSenderName(user.defaultSenderName || user.fullName);
    }
  }, [user]);

  const recipientOptions = [
    'Professor',
    'Manager',
    'HR',
    'Client',
    'Colleague',
    'Customer',
    'Friend',
    'Custom',
  ];

  const purposeOptions = [
    'Leave request',
    'Assignment extension',
    'Job application',
    'Meeting request',
    'Follow-up',
    'Apology',
    'Complaint',
    'Thank-you email',
    'Business proposal',
    'Custom',
  ];

  const toneOptions = [
    'Professional',
    'Formal',
    'Friendly',
    'Persuasive',
    'Apologetic',
    'Confident',
    'Neutral',
  ];

  const lengthOptions = ['Short', 'Medium', 'Detailed'];

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!context.trim()) {
      toast.error('Please enter the background context/situation');
      return;
    }

    const effectiveRecipient = recipient === 'Custom' ? customRecipient.trim() || 'Colleague' : recipient;
    const effectivePurpose = purpose === 'Custom' ? customPurpose.trim() || 'Communication' : purpose;

    setIsGenerating(true);
    try {
      const generated = await emailApi.generateDraft({
        recipient: effectiveRecipient,
        purpose: effectivePurpose,
        context,
        tone,
        length,
        senderName,
        additionalInstructions: additionalInstructions.trim() || undefined,
      });

      setResult(generated);
      setSubject(generated.subject);
      setGreeting(generated.greeting);
      setBody(generated.body);
      setClosing(generated.closing);
      setDraftTitle(`${effectivePurpose} - ${effectiveRecipient}`);

      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
      toast.success('Email draft successfully generated!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefine = async (action: 'makeShorter' | 'makeLonger' | 'improveProfessionalism' | 'changeTone', targetTone?: string) => {
    if (!result && !body) return;

    setIsRefining(true);
    try {
      const refined = await emailApi.refineDraft({
        currentDraft: {
          subject,
          greeting,
          body,
          closing,
          senderName,
        },
        action,
        targetTone,
      });

      setSubject(refined.subject);
      setGreeting(refined.greeting);
      setBody(refined.body);
      setClosing(refined.closing);
      toast.success(`Email refined: ${action}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || 'Refinement failed');
    } finally {
      setIsRefining(false);
    }
  };

  const handleCopyEmail = () => {
    const fullText = `${subject ? `Subject: ${subject}\n\n` : ''}${greeting}\n\n${body}\n\n${closing}\n${senderName}`;
    navigator.clipboard.writeText(fullText);
    setCopiedField('all');
    toast.success('Full email copied to clipboard!');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCopySubject = () => {
    navigator.clipboard.writeText(subject);
    setCopiedField('subject');
    toast.success('Subject line copied to clipboard!');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDownloadTxt = () => {
    const fullText = `Subject: ${subject}\n\n${greeting}\n\n${body}\n\n${closing}\n${senderName}\n\n---\nDrafted with MailCraft AI by Harsh Kumar`;
    const element = document.createElement('a');
    const file = new Blob([fullText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${subject.replace(/[^a-zA-Z0-9_-]/g, '_') || 'email_draft'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Downloaded draft as TXT file!');
  };

  const handleSaveDraft = async () => {
    if (!user) {
      toast.error('Please sign in to save drafts to your database');
      return;
    }
    if (!body.trim()) {
      toast.error('Draft content cannot be empty');
      return;
    }

    setIsSaving(true);
    try {
      const effectiveRecipient = recipient === 'Custom' ? customRecipient || 'Colleague' : recipient;
      const effectivePurpose = purpose === 'Custom' ? customPurpose || 'General' : purpose;

      const fullFormattedBody = `${greeting}\n\n${body}\n\n${closing}\n${senderName}`;

      await emailApi.saveDraft({
        title: draftTitle || subject,
        subject,
        recipient: effectiveRecipient,
        purpose: effectivePurpose,
        context,
        tone,
        body: fullFormattedBody,
        generationId: result?.generationId || null,
        tags: draftTags.split(',').map((t) => t.trim()).filter(Boolean),
        isPinned: false,
      });

      toast.success('Draft successfully saved to database!');
      setSaveModalOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || 'Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  };

  // Preset Prompts for Instant Evaluation
  const loadPreset = (presetName: string) => {
    if (presetName === 'leave') {
      setRecipient('Manager');
      setPurpose('Leave request');
      setTone('Professional');
      setLength('Medium');
      setContext('Need medical leave for 3 days starting next Monday due to a scheduled minor surgery and follow-up. Project tasks are handed over to Sarah.');
    } else if (presetName === 'job') {
      setRecipient('HR');
      setPurpose('Job application');
      setTone('Confident');
      setLength('Detailed');
      setContext('Applying for Full-Stack Developer position. Graduating with Computer Science degree. Built multiple React, Node.js, and PostgreSQL SaaS apps. Resume attached.');
    } else if (presetName === 'meeting') {
      setRecipient('Client');
      setPurpose('Meeting request');
      setTone('Formal');
      setLength('Short');
      setContext('Need a 20-minute sync this Thursday to showcase sprint 2 deliverables and get sign-off on architecture.');
    }
  };

  return (
    <div className="space-y-6">
      {aiStatus && (
        <DemoBanner
          isDemoMode={aiStatus.isDemoMode}
          aiModel={aiStatus.activeProvider}
        />
      )}

      {/* Header with Preset Quick-Load buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <PenTool className="w-5 h-5 text-indigo-500" />
            AI Email Drafting Workspace
          </h2>
          <p className="text-xs text-slate-500">
            Generate custom, highly tailored emails based on purpose, recipient, context, and tone.
          </p>
        </div>

        {/* Quick Preload Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-slate-400 font-medium text-[11px] shrink-0">Sample Presets:</span>
          <button
            onClick={() => loadPreset('leave')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-brand-950/40 text-slate-700 dark:text-slate-300 text-[11px] transition-colors shrink-0"
          >
            Leave Request
          </button>
          <button
            onClick={() => loadPreset('job')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-brand-950/40 text-slate-700 dark:text-slate-300 text-[11px] transition-colors shrink-0"
          >
            Job Application
          </button>
          <button
            onClick={() => loadPreset('meeting')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-brand-950/40 text-slate-700 dark:text-slate-300 text-[11px] transition-colors shrink-0"
          >
            Meeting Request
          </button>
        </div>
      </div>

      {/* Main 2-Column Responsive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-5 space-y-4">
          <Card>
            <CardHeader className="py-3 px-5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Draft Parameters
              </span>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <form onSubmit={handleGenerate} className="space-y-4">
                {/* Recipient */}
                <div className="space-y-2">
                  <Select
                    label="Recipient Category"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    options={recipientOptions}
                  />
                  {recipient === 'Custom' && (
                    <Input
                      placeholder="e.g. Dean of Students, Investor, Vendor"
                      value={customRecipient}
                      onChange={(e) => setCustomRecipient(e.target.value)}
                      required
                    />
                  )}
                </div>

                {/* Purpose */}
                <div className="space-y-2">
                  <Select
                    label="Email Purpose"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    options={purposeOptions}
                  />
                  {purpose === 'Custom' && (
                    <Input
                      placeholder="e.g. Budget Approval, Internship Request"
                      value={customPurpose}
                      onChange={(e) => setCustomPurpose(e.target.value)}
                      required
                    />
                  )}
                </div>

                {/* Tone & Length in 2 Columns */}
                <div className="grid grid-cols-2 gap-3">
                  <Select
                    label="Desired Tone"
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    options={toneOptions}
                  />
                  <Select
                    label="Length"
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    options={lengthOptions}
                  />
                </div>

                {/* Sender Name */}
                <Input
                  label="Configurable Sender Name"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="e.g. Harsh Kumar"
                  hint="Your name as it should appear in the sign-off."
                />

                {/* Context Details */}
                <Textarea
                  label="Context & Situation Details (Required)"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Describe the situation, dates, deadlines, background, reasons, or specific commitments..."
                  rows={4}
                  required
                />

                {/* Additional Instructions */}
                <Input
                  label="Additional Custom Instructions (Optional)"
                  value={additionalInstructions}
                  onChange={(e) => setAdditionalInstructions(e.target.value)}
                  placeholder="e.g. Mention attached resume, specify meeting link"
                />

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  size="md"
                  isLoading={isGenerating}
                  icon={<Sparkles className="w-4 h-4" />}
                >
                  Generate Email Draft
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Editable Output & Actions */}
        <div className="lg:col-span-7 space-y-4">
          <Card>
            <CardHeader className="py-3 px-5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Generated Email Output (Editable)
                </span>
                {result?.isDemoMode && (
                  <Badge variant="warning" size="sm">Demo Mode</Badge>
                )}
              </div>

              {/* Top Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopySubject}
                  disabled={!subject}
                  icon={copiedField === 'subject' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                >
                  Copy Subject
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyEmail}
                  disabled={!body}
                  icon={copiedField === 'all' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                >
                  {copiedField === 'all' ? 'Copied' : 'Copy Email'}
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              {/* Subject Field */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Subject line will appear here..."
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                />
              </div>

              {/* Greeting Field */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Salutation
                </label>
                <input
                  type="text"
                  value={greeting}
                  onChange={(e) => setGreeting(e.target.value)}
                  placeholder="Greeting will appear here..."
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3.5 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                />
              </div>

              {/* Email Body */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Email Body
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Generated body paragraphs will appear here. You can directly edit any text before copying or saving..."
                  rows={9}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3.5 text-sm leading-relaxed text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/30 resize-y"
                />
              </div>

              {/* Closing & Sender Name in 2 columns */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Sign-Off / Closing
                  </label>
                  <input
                    type="text"
                    value={closing}
                    onChange={(e) => setClosing(e.target.value)}
                    placeholder="Sincerely,"
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3.5 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Sign-Off Name
                  </label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Harsh Kumar"
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3.5 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                  />
                </div>
              </div>

              {/* Refinement Toolbar */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold flex items-center gap-1">
                    <Wand2 className="w-3.5 h-3.5 text-brand-600" />
                    Instant AI Refinement Actions:
                  </span>
                  {isRefining && <span className="text-brand-600 font-bold animate-pulse">Refining...</span>}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={!body || isRefining}
                    onClick={() => handleRefine('makeShorter')}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-40"
                  >
                    Make Shorter
                  </button>
                  <button
                    type="button"
                    disabled={!body || isRefining}
                    onClick={() => handleRefine('makeLonger')}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-40"
                  >
                    Make Longer
                  </button>
                  <button
                    type="button"
                    disabled={!body || isRefining}
                    onClick={() => handleRefine('improveProfessionalism')}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-40"
                  >
                    Elevate Professionalism
                  </button>
                  <button
                    type="button"
                    disabled={!body || isRefining}
                    onClick={() => handleRefine('changeTone', 'Friendly')}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-40"
                  >
                    Friendly Tone
                  </button>
                  <button
                    type="button"
                    disabled={!body || isRefining}
                    onClick={() => handleRefine('changeTone', 'Formal')}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-40"
                  >
                    Formal Tone
                  </button>
                  <button
                    type="button"
                    disabled={isGenerating || isRefining}
                    onClick={() => handleGenerate()}
                    className="px-3 py-1.5 rounded-lg bg-brand-50 dark:bg-brand-950/40 hover:bg-brand-100 text-xs font-semibold text-brand-700 dark:text-brand-300 transition-colors flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Regenerate
                  </button>
                </div>
              </div>

              {/* Bottom Actions: Save Draft & Download */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadTxt}
                  disabled={!body}
                  icon={<Download className="w-3.5 h-3.5" />}
                >
                  Download TXT
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setSaveModalOpen(true)}
                  disabled={!body}
                  icon={<Bookmark className="w-3.5 h-3.5" />}
                >
                  Save to Saved Drafts
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Save Draft Modal */}
      <Modal
        isOpen={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        title="Save Email Draft"
        description="Persist this drafted email to your PostgreSQL database."
      >
        <div className="space-y-4">
          <Input
            label="Draft Title"
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            placeholder="e.g. Extension Request Draft"
            required
          />
          <Input
            label="Tags (comma separated)"
            value={draftTags}
            onChange={(e) => setDraftTags(e.target.value)}
            placeholder="college, urgent, work"
          />
          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs space-y-1">
            <p className="font-semibold text-slate-700 dark:text-slate-300">Preview Summary:</p>
            <p className="text-slate-500 truncate">Subject: {subject}</p>
            <p className="text-slate-500">To: {recipient} • Tone: {tone}</p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setSaveModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isSaving}
              onClick={handleSaveDraft}
              icon={<Bookmark className="w-3.5 h-3.5" />}
            >
              Confirm & Save
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
