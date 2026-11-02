import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  PenTool,
  CheckCheck,
  Sliders,
  Bookmark,
  ChevronRight,
  Copy,
  Check,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card, CardContent } from '../components/ui/Card';
import { ScoreGauge } from '../components/ui/ScoreGauge';
import { HeroVisual3D } from '../components/home/HeroVisual3D';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'draft' | 'review'>('draft');
  const [copied, setCopied] = useState(false);

  // Smoothly scroll to section if URL has a hash
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 80);
      }
    }
  }, [location.hash]);

  // Interactive sample for Drafting Preview
  const sampleDraft = {
    recipient: 'Professor',
    purpose: 'Assignment extension',
    tone: 'Professional',
    subject: 'Request for Assignment Deadline Extension',
    greeting: 'Dear Professor Sharma,',
    body: `I hope this email finds you well.\n\nI am writing to respectfully request a 48-hour extension on the project submission originally due this Wednesday. Due to an unexpected high fever and medical consultation yesterday, I was unable to complete the remaining testing and documentation.\n\nI have already finished 80% of the implementation and will submit the complete work with all reports by Friday at 5:00 PM. I have attached the medical prescription for your reference.\n\nThank you very much for your understanding and consideration.`,
    closing: 'Sincerely,\nAlex Morgan',
  };

  // Interactive sample for Review Preview
  const sampleReview = {
    original: `hey prof, i wanna ask for extension for the assignment asap cuz i was sick untill yesterday and couldn't finish it thx`,
    improved: `Dear Professor Sharma,\n\nI hope you are having a productive week.\n\nI am writing to respectfully request a brief extension for the upcoming assignment deadline. I was unwell with fever until yesterday and consequently require an additional 48 hours to finalize my submission.\n\nThank you for your understanding.\n\nSincerely,\nAlex Morgan`,
    score: 88,
    mistakesCount: 5,
  };

  const handleCopyDraft = () => {
    navigator.clipboard.writeText(
      `${sampleDraft.subject}\n\n${sampleDraft.greeting}\n\n${sampleDraft.body}\n\n${sampleDraft.closing}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleScrollTo = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.pushState(null, '', `/#${id}`);
    }
  };

  return (
    <div className="min-h-screen bg-surface-soft dark:bg-surface-dark flex flex-col selection:bg-brand-500 selection:text-white">
      <Navbar />

      {/* Hero Section: Balanced 2-Column Layout */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden border-b border-slate-200/60 dark:border-slate-800/60">
        {/* Subtle ambient lighting */}
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[350px] bg-gradient-to-tr from-brand-600/15 via-accent-light/10 to-transparent blur-3xl -z-10 pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline & Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-7 space-y-6 text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-semibold shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                <span>AI-Powered Communication Assistant</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.12]">
                Every Email, <br className="hidden sm:inline" />
                <span className="text-gradient-brand">Written Better.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Draft contextual, polished messages and audit your writing for clarity, grammar, and tone in seconds.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <Button
                  size="lg"
                  variant="primary"
                  icon={<ArrowRight className="w-4 h-4" />}
                  onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
                  className="w-full sm:w-auto shadow-glow-md"
                >
                  {isAuthenticated ? 'Go to Dashboard' : 'Start Writing'}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={(e) => handleScrollTo(e, 'how-it-works')}
                  className="w-full sm:w-auto"
                >
                  See How It Works
                </Button>
              </div>

              {/* Benefit Badges */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-slate-500 dark:text-slate-400 text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Context-Tailored Drafting</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>5-Dimensional Review</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Instant Tone Adjustments</span>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Interactive 3D Mail Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-5 flex justify-center"
            >
              <HeroVisual3D />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Interactive Product Preview */}
      <section id="interactive-preview" className="scroll-mt-20 py-16 bg-white dark:bg-slate-950/60 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <Badge variant="accent" size="sm">Interactive Preview</Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              See MailCraft AI in Action
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
              Test drive the two core engines: generative drafting and multi-dimensional quality review.
            </p>
          </div>

          {/* Preview Tab Selector */}
          <div className="flex justify-center">
            <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setActiveTab('draft')}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'draft'
                    ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-300 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <PenTool className="w-3.5 h-3.5" />
                Drafting Assistant
              </button>
              <button
                onClick={() => setActiveTab('review')}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'review'
                    ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-300 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Writing Review
              </button>
            </div>
          </div>

          {/* Tab 1: Drafting Showcase */}
          {activeTab === 'draft' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
            >
              {/* Form Input parameters demo */}
              <div className="lg:col-span-5 bg-surface-soft dark:bg-slate-900/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Drafting Input
                  </span>
                  <Badge variant="brand" size="sm">Template</Badge>
                </div>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-400 font-medium">Recipient</label>
                    <div className="mt-1 p-2 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 font-semibold text-slate-800 dark:text-slate-200">
                      {sampleDraft.recipient}
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-400 font-medium">Purpose</label>
                    <div className="mt-1 p-2 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 font-semibold text-slate-800 dark:text-slate-200">
                      {sampleDraft.purpose}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-400 font-medium">Tone</label>
                      <div className="mt-1 p-2 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 font-semibold text-slate-800 dark:text-slate-200">
                        {sampleDraft.tone}
                      </div>
                    </div>
                    <div>
                      <label className="text-slate-400 font-medium">Length</label>
                      <div className="mt-1 p-2 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 font-semibold text-slate-800 dark:text-slate-200">
                        Medium
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Output Preview Card */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-brand-600" />
                    Generated Output Preview
                  </span>
                  <button
                    onClick={handleCopyDraft}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-300 text-xs flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="space-y-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60 font-semibold">
                    Subject: {sampleDraft.subject}
                  </div>
                  <p>{sampleDraft.greeting}</p>
                  <p className="whitespace-pre-line">{sampleDraft.body}</p>
                  <p className="whitespace-pre-line pt-2">{sampleDraft.closing}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab 2: Review Showcase */}
          {activeTab === 'review' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
            >
              <div className="lg:col-span-5 bg-surface-soft dark:bg-slate-900/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Original Draft
                </span>
                <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-rose-200 dark:border-rose-900/40 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line font-mono">
                  {sampleReview.original}
                </div>
                <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-xs space-y-1">
                  <p className="font-bold">Issues Identified ({sampleReview.mistakesCount}):</p>
                  <p className="text-[11px]">• Casual slang ("hey prof", "asap", "cuz", "thx")</p>
                  <p className="text-[11px]">• Spelling errors ("untill")</p>
                </div>
              </div>

              <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <CheckCheck className="w-4 h-4 text-emerald-500" />
                    Improved Output (Score: {sampleReview.score}/100)
                  </span>
                  <Badge variant="success" size="sm">Audit Complete</Badge>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
                  {sampleReview.improved}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Key Benefits Grid: User-Centric Practical Benefits */}
      <section id="features" className="scroll-mt-20 py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center space-y-3">
          <Badge variant="brand" size="sm">Capabilities</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Designed for Real-World Communication
          </h2>
          <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto">
            MailCraft AI eliminates blank page anxiety and communication errors with specialized drafting and analysis tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card hover glow>
            <CardContent className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 flex items-center justify-center">
                <PenTool className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Draft Emails
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Generate emails calibrated by recipient category (Professor, Manager, HR, Client), purpose, and desired length.
              </p>
            </CardContent>
          </Card>

          <Card hover glow>
            <CardContent className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                <CheckCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Review Writing
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Analyze existing emails across Grammar, Professionalism, Context, Tone, and Clarity with objective scoring.
              </p>
            </CardContent>
          </Card>

          <Card hover glow>
            <CardContent className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600 flex items-center justify-center">
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Refine Tone
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Adjust tone between Formal, Friendly, and Persuasive, or expand and condense length in a single click.
              </p>
            </CardContent>
          </Card>

          <Card hover glow>
            <CardContent className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
                <Bookmark className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Save Drafts
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Organize your emails with tags, pin important templates, and review your complete generation history.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="scroll-mt-20 py-20 bg-slate-50 dark:bg-slate-900/60 border-y border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2">
            <Badge variant="brand" size="sm">Workflow</Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              How MailCraft AI Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-3xl font-black text-brand-600/30">01</span>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Set Context or Paste Text
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Select your intended recipient, purpose, and key situation details, or paste an existing email you need to send.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-3xl font-black text-brand-600/30">02</span>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                AI Processes & Scores
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                The intelligence engine analyzes tone, grammar, and etiquette, calculating quality scores and generating a polished output.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-3xl font-black text-brand-600/30">03</span>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Refine, Copy & Send
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Make live edits directly in the workspace, adjust length or tone, and save to your personal library or copy to clipboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Link Card */}
      <section id="tech-stack" className="scroll-mt-20 py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-1.5 text-center sm:text-left">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Modern Full-Stack Architecture
            </h3>
            <p className="text-xs text-slate-500">
              Explore the database schema, multi-provider AI engine, and security details in our documentation.
            </p>
          </div>
          <Link to="/about">
            <Button variant="outline" size="sm" icon={<ChevronRight className="w-4 h-4" />}>
              View Architecture & About
            </Button>
          </Link>
        </div>
      </section>

      {/* Final CTA Banner: High-contrast button with 100% visible text */}
      <section className="py-16 bg-gradient-to-r from-brand-700 via-brand-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-5">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to upgrade your everyday communication?
          </h2>
          <p className="text-sm sm:text-base text-brand-100 max-w-xl mx-auto">
            Start drafting compelling, error-free emails with MailCraft AI today.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link to={isAuthenticated ? '/dashboard' : '/register'}>
              <Button
                size="lg"
                className="bg-white text-brand-700 hover:bg-slate-100 font-bold shadow-lg"
              >
                {isAuthenticated ? 'Open Dashboard' : 'Start Writing Free'}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
