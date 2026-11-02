import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mail,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  PenTool,
  CheckCheck,
  ShieldCheck,
  Zap,
  Sliders,
  Award,
  Layers,
  Database,
  Terminal,
  ExternalLink,
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

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'draft' | 'review'>('draft');
  const [copied, setCopied] = useState(false);

  // Interactive sample for Drafting Preview
  const sampleDraft = {
    recipient: 'Professor',
    purpose: 'Assignment extension',
    tone: 'Professional',
    subject: 'Request for Assignment Deadline Extension - Harsh Kumar',
    greeting: 'Dear Professor Sharma,',
    body: `I hope this email finds you well.\n\nI am writing to respectfully request a 48-hour extension on the Final AI Mini-Project submission originally due this Wednesday. Due to an unexpected high viral fever and medical consultation yesterday, I was unable to complete the remaining testing and documentation.\n\nI have already finished 80% of the implementation and will submit the complete repository with all test reports by Friday at 5:00 PM. I have attached the medical prescription for your reference.\n\nThank you very much for your understanding and consideration.`,
    closing: 'Sincerely,\nHarsh Kumar',
  };

  // Interactive sample for Review Preview
  const sampleReview = {
    original: `hey prof, i wanna ask for extension for the assignment asap cuz i was sick untill yesterday and couldn't finish it thx harsh`,
    improved: `Dear Professor Sharma,\n\nI hope you are having a productive week.\n\nI am writing to respectfully request a brief extension for the upcoming assignment deadline. I was unwell with fever until yesterday and consequently require an additional 48 hours to finalize my submission.\n\nThank you for your understanding.\n\nSincerely,\nHarsh Kumar`,
    score: 88,
    mistakesCount: 5,
  };

  const handleCopyDraft = () => {
    navigator.clipboard.writeText(`${sampleDraft.subject}\n\n${sampleDraft.greeting}\n\n${sampleDraft.body}\n\n${sampleDraft.closing}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-surface-soft dark:bg-surface-dark flex flex-col selection:bg-brand-500 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-20 md:pt-28 md:pb-28 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-brand-600/15 via-accent-light/10 to-transparent blur-3xl -z-10 pointer-events-none rounded-full" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-semibold shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>AI-Powered Communication Suite • Developed by Harsh Kumar</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1]"
          >
            Every Email, <br className="hidden sm:inline" />
            <span className="text-gradient-brand">Written Better.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed"
          >
            Draft professional emails, refine your writing, and communicate with confidence using AI. Built for students, professionals, and teams.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4"
          >
            <Button
              size="lg"
              variant="primary"
              icon={<ArrowRight className="w-4 h-4" />}
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto shadow-glow-md"
            >
              Start Writing Free
            </Button>
            <a href="#interactive-preview" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Explore Features
              </Button>
            </a>
          </motion.div>

          {/* Social Proof / Stats ticker */}
          <div className="pt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-slate-500 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Full PostgreSQL & Prisma Stack</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>5-Dimensional Email Review</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Zero-Setup Deterministic Demo Engine</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Product Preview */}
      <section id="interactive-preview" className="py-16 bg-white dark:bg-slate-950/60 border-y border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <Badge variant="accent" size="sm">Interactive Product Experience</Badge>
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
                AI Email Drafting
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
                AI Email Review
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
                  <Badge variant="brand" size="sm">Template Example</Badge>
                </div>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-400 font-medium">Recipient</label>
                    <div className="mt-1 p-2 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 font-semibold text-slate-800 dark:text-slate-200">
                      {sampleDraft.recipient} (Professor Sharma)
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-400 font-medium">Purpose</label>
                    <div className="mt-1 p-2 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 font-semibold text-slate-800 dark:text-slate-200">
                      {sampleDraft.purpose}
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-400 font-medium">Context</label>
                    <div className="mt-1 p-2.5 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                      High fever since yesterday, medical doctor prescribed 2 days bed rest, request extension till Friday.
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
                      <label className="text-slate-400 font-medium">Sender</label>
                      <div className="mt-1 p-2 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 font-semibold text-slate-800 dark:text-slate-200">
                        Harsh Kumar
                      </div>
                    </div>
                  </div>
                </div>
                <Link to="/draft" className="block pt-2">
                  <Button variant="primary" className="w-full" icon={<Sparkles className="w-3.5 h-3.5" />}>
                    Open Live Drafting Workspace
                  </Button>
                </Link>
              </div>

              {/* Generated Output Showcase */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      AI Generated Output
                    </span>
                  </div>
                  <button
                    onClick={handleCopyDraft}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy Email'}
                  </button>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-3 font-mono">
                  <div>
                    <span className="text-slate-400 font-bold">Subject:</span>{' '}
                    <span className="text-slate-900 dark:text-white font-semibold">
                      {sampleDraft.subject}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3 whitespace-pre-line text-slate-700 dark:text-slate-300 font-sans text-sm leading-relaxed">
                    <p className="font-semibold">{sampleDraft.greeting}</p>
                    <p>{sampleDraft.body}</p>
                    <p className="font-semibold">{sampleDraft.closing}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-slate-500">
                  <span>Actions available in workspace:</span>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md">Shorten</span>
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md">Lengthen</span>
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md">Change Tone</span>
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md">Save Draft</span>
                  </div>
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
              {/* Original with identified mistakes */}
              <div className="lg:col-span-6 bg-surface-soft dark:bg-slate-900/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-500">
                    Original Email (5 Issues Detected)
                  </span>
                  <Badge variant="danger" size="sm">Unpolished</Badge>
                </div>
                <div className="p-4 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-2 leading-relaxed">
                  <p className="text-slate-700 dark:text-slate-300">
                    <mark className="bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 px-1 rounded">hey prof</mark>,
                  </p>
                  <p className="text-slate-700 dark:text-slate-300">
                    i <mark className="bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 px-1 rounded">wanna</mark> ask for extension for the assignment <mark className="bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 px-1 rounded">asap</mark> cuz i was sick <mark className="bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 px-1 rounded">untill</mark> yesterday and couldn't finish it <mark className="bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 px-1 rounded">thx</mark>
                  </p>
                  <p className="text-slate-700 dark:text-slate-300">harsh</p>
                </div>

                <div className="space-y-2 pt-1 text-xs">
                  <div className="p-2.5 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300">
                    • <strong>Casual Greeting:</strong> "hey prof" is inappropriate for academic faculty. Recommended: "Dear Professor Sharma,"
                  </div>
                  <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300">
                    • <strong>Slang & Urgency:</strong> "asap", "wanna", and "thx" reduce professionalism score by 35%.
                  </div>
                </div>

                <Link to="/review" className="block pt-2">
                  <Button variant="primary" className="w-full" icon={<CheckCheck className="w-3.5 h-3.5" />}>
                    Open Live Review Workspace
                  </Button>
                </Link>
              </div>

              {/* Improved version with Score Gauge */}
              <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    Improved & Rewritten Version
                  </span>
                  <Badge variant="success" size="sm">Polished</Badge>
                </div>

                <div className="flex items-center gap-6 p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
                  <ScoreGauge score={88} size={90} strokeWidth={8} label="Quality Score" />
                  <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                    <p className="font-bold text-slate-900 dark:text-slate-100">Quality Improved: +42 pts</p>
                    <p>• Grammar: 95/100</p>
                    <p>• Professionalism: 92/100</p>
                    <p>• Clarity: 88/100</p>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-sans text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
                  {sampleReview.improved}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center space-y-3">
          <Badge variant="brand" size="sm">Core Architecture</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Designed for Real-World Communication
          </h2>
          <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto">
            MailCraft AI eliminates blank page anxiety and embarrassing email mistakes through specialized generative and analytic intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card hover glow>
            <CardContent className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 flex items-center justify-center">
                <PenTool className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Context-Aware Drafting
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Generate complete email drafts calibrated by recipient category (Professor, HR, Client, Manager), purpose, situation details, tone, and desired length.
              </p>
            </CardContent>
          </Card>

          <Card hover glow>
            <CardContent className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                <CheckCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                5-Dimensional Review
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Analyze existing emails across Grammar, Professionalism, Context, Tone, and Clarity. Get honest scores from 0 to 100 with actionable feedback.
              </p>
            </CardContent>
          </Card>

          <Card hover glow>
            <CardContent className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600 flex items-center justify-center">
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Instant Refinements
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Make emails shorter or longer, change tone between Formal, Friendly, Persuasive, and Apologetic, and elevate corporate formality in one click.
              </p>
            </CardContent>
          </Card>

          <Card hover glow>
            <CardContent className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                PostgreSQL & Prisma Persistence
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Full relational database schema with user data isolation. Save drafts, organize with tags, pin favorites, and access complete generation logs.
              </p>
            </CardContent>
          </Card>

          <Card hover glow>
            <CardContent className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Zero-Key Demo Engine
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Built with a sophisticated deterministic heuristic NLP engine that functions out-of-the-box without requiring an external API key or internet access.
              </p>
            </CardContent>
          </Card>

          <Card hover glow>
            <CardContent className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                JWT & bcrypt Security
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Robust token-based authentication with bcrypt password hashing, input sanitization via Zod schemas, and strict record ownership checks.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-slate-50 dark:bg-slate-900/60 border-y border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2">
            <Badge variant="brand" size="sm">Simple Workflow</Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              How MailCraft AI Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 relative">
              <span className="text-3xl font-black text-brand-600/30">01</span>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Provide Context or Paste Text
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Select your intended recipient, purpose, and key situation details, or paste an existing email you need to send.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 relative">
              <span className="text-3xl font-black text-brand-600/30">02</span>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                AI Processes & Scores
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Our dual-provider architecture analyzes tone, grammar, and etiquette, calculating quality scores and generating a polished output.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 relative">
              <span className="text-3xl font-black text-brand-600/30">03</span>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Refine, Copy & Send
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Make live edits directly in the workspace, adjust length or tone, save to your personal drafts library, or download as TXT.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section id="tech-stack" className="py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <Badge variant="neutral" size="sm">Engineering Stack</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Modern, Resilient Full-Stack Architecture
          </h2>
          <p className="text-xs text-slate-500">
            Engineered with strict TypeScript contracts from frontend components to database queries.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">React & Vite</p>
            <p className="text-[11px] text-slate-400">TypeScript UI</p>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Tailwind CSS</p>
            <p className="text-[11px] text-slate-400">Custom Design System</p>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Node & Express</p>
            <p className="text-[11px] text-slate-400">REST API Architecture</p>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">PostgreSQL & Prisma</p>
            <p className="text-[11px] text-slate-400">Relational Database</p>
          </div>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="py-16 bg-gradient-to-r from-brand-700 via-brand-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-5">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to upgrade your professional communication?
          </h2>
          <p className="text-sm sm:text-base text-brand-100 max-w-xl mx-auto">
            Join Harsh Kumar's MailCraft AI platform and start writing compelling, error-free emails today.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link to="/register">
              <Button size="lg" className="bg-white text-brand-700 hover:bg-slate-100 shadow-md">
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
