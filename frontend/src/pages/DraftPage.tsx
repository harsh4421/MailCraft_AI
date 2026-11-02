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
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Wand2,
  FileText,
  SlidersHorizontal,
  HelpCircle,
  ArrowRight,
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
      'I was unwell with fever yesterday. The doctor prescribed rest until Thursday. I would like to request an extension on the project submission until Friday 5 PM.'
  );
  const [tone, setTone] = useState(passedTemplate?.tone || 'Professional');
  const [length, setLength] = useState(passedTemplate?.length || 'Medium');
  const [senderName, setSenderName] = useState(user?.defaultSenderName || user?.fullName || '');
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

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
  const [draftTags, setDraftTags] = useState('academic, urgent');
  const [isSaving, setIsSaving] = useState(false);

  // Update sender name when user profile loads
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
    'Custom',
  ];

  const toneOptions = ['Professional', 'Formal', 'Friendly', 'Persuasive', 'Apologetic', 'Confident'];
  const lengthOptions = ['Short', 'Medium', 'Detailed'];

  const handleGenerate = async (e?: React.FormEvent, overridePurpose?: string) => {
    if (e) e.preventDefault();

    if (!context.trim()) {
      toast.error('Please provide some context details to draft your email.');
      return;
    }

    const currentPurposeVal = overridePurpose || (purpose === 'Custom' ? customPurpose.trim() : purpose);
    const effectiveRecipient = recipient === 'Custom' ? customRecipient.trim() : recipient;

    if (overridePurpose) {
      setPurpose(overridePurpose);
    }

    setIsGenerating(true);
    try {
      const generated = await emailApi.generateDraft({
        recipient: effectiveRecipient,
        purpose: currentPurposeVal,
        context,
        tone,
        length,
        senderName: senderName.trim() || undefined,
        additionalInstructions: additionalInstructions.trim() || undefined,
        confirmedPurpose: overridePurpose || undefined,
      });

      setResult(generated);

      if (generated.needsClarification) {
        setSubject('');
        setGreeting('');
        setBody('');
        setClosing('');
        toast.info('Clarification needed: Please select your preferred request type.');
        return;
      }

      setSubject(generated.subject);
      setGreeting(generated.greeting);
      setBody(generated.body);
      setClosing(generated.closing);
      setDraftTitle(`${currentPurposeVal} - ${effectiveRecipient}`);

      confetti({ particleCount: 35, spread: 55, origin: { y: 0.7 } });
      toast.success('Email draft successfully generated!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefine = async (
    action: 'makeShorter' | 'makeLonger' | 'improveProfessionalism' | 'changeTone',
    targetTone?: string
  ) => {
    if (!body) return;

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
      toast.success('Draft refined successfully');
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
    toast.success('Subject line copied!');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDownloadTxt = () => {
    const fullText = `Subject: ${subject}\n\n${greeting}\n\n${body}\n\n${closing}\n${senderName}\n\n---\nDrafted with MailCraft AI`;
    const element = document.createElement('a');
    const file = new Blob([fullText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${subject.replace(/[^a-zA-Z0-9_-]/g, '_') || 'email_draft'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Downloaded draft as TXT file');
  };

  const handleSaveDraft = async () => {
    if (!user) {
      toast.error('Please sign in to save drafts to your library');
      return;
    }
    if (!body.trim()) {
      toast.error('Draft content cannot be empty');
      return;
    }

    setIsSaving(true);
    try {
      const fullBody = `${greeting ? `${greeting}\n\n` : ''}${body}\n\n${closing}\n${senderName}`;
      await emailApi.saveDraft({
        title: draftTitle || subject || 'Untitled Draft',
        recipient: recipient === 'Custom' ? customRecipient : recipient,
        purpose: purpose === 'Custom' ? customPurpose : purpose,
        subject,
        body: fullBody,
        tone,
        tags: draftTags.split(',').map((t) => t.trim()).filter(Boolean),
        isPinned: false,
      });

      toast.success('Draft successfully saved to your library!');
      setSaveModalOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || 'Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  };

  // Preset Prompts for Quick Testing
  const loadPreset = (presetName: string) => {
    if (presetName === 'leave') {
      setRecipient('Manager');
      setPurpose('Leave request');
      setTone('Professional');
      setLength('Medium');
      setContext('Need medical leave for 3 days starting next Monday due to a scheduled minor surgery and recovery. Project tasks have been handed over to Sarah.');
    } else if (presetName === 'job') {
      setRecipient('HR');
      setPurpose('Job application');
      setTone('Confident');
      setLength('Detailed');
      setContext('Applying for Full-Stack Developer position. Experienced in React, Node.js, and relational databases. Resume and portfolio link attached.');
    } else if (presetName === 'meeting') {
      setRecipient('Client');
      setPurpose('Meeting request');
      setTone('Formal');
      setLength('Short');
      setContext('Need a 20-minute sync this Thursday to review sprint deliverables and confirm requirements.');
    }
  };

  const hasGeneratedContent = Boolean(body.trim());

  return (
    <div className="space-y-6">
      {/* Header Bar with Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <PenTool className="w-5 h-5 text-indigo-500" />
            Email Drafting
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure recipient and context to generate tailored emails.
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
                    label="Recipient"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    options={recipientOptions}
                  />
                  {recipient === 'Custom' && (
                    <Input
                      placeholder="e.g. Dean, Investor, Client"
                      value={customRecipient}
                      onChange={(e) => setCustomRecipient(e.target.value)}
                      required
                    />
                  )}
                </div>

                {/* Purpose */}
                <div className="space-y-2">
                  <Select
                    label="Purpose"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    options={purposeOptions}
                  />
                  {purpose === 'Custom' && (
                    <Input
                      placeholder="e.g. Project Sign-Off, Partnership"
                      value={customPurpose}
                      onChange={(e) => setCustomPurpose(e.target.value)}
                      required
                    />
                  )}
                </div>

                {/* Tone & Length */}
                <div className="grid grid-cols-2 gap-3">
                  <Select
                    label="Tone"
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
                  label="Sender name"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Your name for the sign-off"
                />

                {/* Context Details */}
                <Textarea
                  label="Context"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Describe the situation, dates, details, or commitments to include in the email..."
                  rows={4}
                  required
                />

                {/* Expandable Section for Additional Instructions */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>{showAdvanced ? 'Hide Additional Instructions' : 'Add Additional Instructions'}</span>
                    {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {showAdvanced && (
                    <div className="mt-2.5">
                      <Input
                        label="Additional instructions"
                        value={additionalInstructions}
                        onChange={(e) => setAdditionalInstructions(e.target.value)}
                        placeholder="e.g. Mention attached report, specify follow-up date"
                      />
                    </div>
                  )}
                </div>

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
                  Generated Output
                </span>
                {result?.needsClarification ? (
                  <Badge variant="warning" size="sm">Clarification Required</Badge>
                ) : result?.isDemoMode ? (
                  <Badge variant="warning" size="sm">Demo Engine</Badge>
                ) : result ? (
                  <Badge variant="success" size="sm">AI Generated</Badge>
                ) : null}
              </div>

              {/* Action Buttons (Disabled when empty) */}
              <div className="flex items-center gap-1.5">
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
                  disabled={!hasGeneratedContent}
                  icon={copiedField === 'all' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                >
                  {copiedField === 'all' ? 'Copied' : 'Copy Email'}
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              {result?.needsClarification ? (
                <div className="py-6 px-5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/30 text-left space-y-5 animate-in fade-in duration-300">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        Purpose & Context Conflict Detected
                      </h3>
                      <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                        {result.clarificationMessage}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1 border-t border-amber-500/20">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Select which request you want to generate:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {result.clarificationOptions?.map((opt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          disabled={isGenerating}
                          onClick={() => handleGenerate(undefined, opt.purpose)}
                          className="group flex flex-col items-start p-4 rounded-xl border border-amber-500/30 bg-white dark:bg-slate-900 hover:border-brand-500 hover:shadow-md transition-all text-left cursor-pointer"
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 transition-colors">
                              {opt.label}
                            </span>
                            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
                          </div>
                          {opt.description && (
                            <span className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-snug">
                              {opt.description}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : hasGeneratedContent ? (
                <>
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
                      placeholder="Generated body paragraphs will appear here. Edit directly before copying or saving..."
                      rows={8}
                      className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3.5 text-sm leading-relaxed text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/30 resize-y"
                    />
                  </div>

                  {/* Closing & Sender Name */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Sign-Off
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
                        placeholder="Your name"
                        className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3.5 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                      />
                    </div>
                  </div>

                  {/* Refinement Toolbar */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-semibold flex items-center gap-1 text-slate-600 dark:text-slate-300">
                        <Wand2 className="w-3.5 h-3.5 text-brand-600" />
                        Instant Refinements:
                      </span>
                      {isRefining && <span className="text-brand-600 font-bold animate-pulse">Refining...</span>}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={isRefining}
                        onClick={() => handleRefine('makeShorter')}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-40"
                      >
                        Make Shorter
                      </button>
                      <button
                        type="button"
                        disabled={isRefining}
                        onClick={() => handleRefine('makeLonger')}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-40"
                      >
                        Make Longer
                      </button>
                      <button
                        type="button"
                        disabled={isRefining}
                        onClick={() => handleRefine('improveProfessionalism')}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-40"
                      >
                        Elevate Professionalism
                      </button>
                      <button
                        type="button"
                        disabled={isRefining}
                        onClick={() => handleRefine('changeTone', 'Friendly')}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-40"
                      >
                        Friendly Tone
                      </button>
                      <button
                        type="button"
                        disabled={isRefining}
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

                  {/* Bottom Actions */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadTxt}
                      icon={<Download className="w-3.5 h-3.5" />}
                    >
                      Download TXT
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setSaveModalOpen(true)}
                      icon={<Bookmark className="w-3.5 h-3.5" />}
                    >
                      Save Draft
                    </Button>
                  </div>
                </>
              ) : (
                /* Clean Empty Preview State */
                <div className="py-16 px-4 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-850 flex items-center justify-center mx-auto text-slate-400">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      No draft generated yet
                    </p>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
                      Configure your recipient and context on the left, then click{' '}
                      <strong className="text-slate-600 dark:text-slate-300 font-medium">Generate Email Draft</strong>.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Save Draft Modal */}
      <Modal
        isOpen={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        title="Save Email Draft"
        description="Persist this drafted email to your personal drafts library."
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
            placeholder="academic, urgent, work"
          />
          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs space-y-1 border border-slate-200/60 dark:border-slate-800/60">
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
