import React, { useState } from 'react';
import {
  HelpCircle,
  BookOpen,
  Keyboard,
  Sparkles,
  ChevronDown,
  Mail,
  CheckCircle2,
  FileQuestion,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export const HelpPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What is MailCraft AI?',
      a: 'MailCraft AI is an intelligent email productivity platform that provides two core tools: an Email Drafting workspace that generates context-tailored emails, and an Email Review workspace that audits existing emails across Grammar, Professionalism, Context, Tone, and Clarity.',
    },
    {
      q: 'How does Demo Mode work? Do I need an API key?',
      a: 'No API key is required to use MailCraft AI. The application includes a built-in deterministic NLP engine that performs real grammatical, tone, and contextual checks locally. If you wish to use live cloud AI models (Google Gemini, Groq, or OpenAI), you can supply your API key in Settings.',
    },
    {
      q: 'How does the Email Review calculate quality scores?',
      a: 'The Quality Score (0-100) is calculated objectively from 5 specific dimensions: Grammar & Spelling (25%), Professionalism & Corporate Etiquette (25%), Context & Purpose Completeness (20%), Tone Alignment (15%), and Clarity & Sentence Length (15%). Points are deducted only for identified issues.',
    },
    {
      q: 'Are my saved drafts and email history private?',
      a: 'Yes. All records are persisted in a normalized PostgreSQL database with strict user isolation. Every database query checks user authentication and ownership.',
    },
    {
      q: 'Can I configure my own sender name in generated emails?',
      a: 'Yes! The sender name is completely configurable. You can set it directly in the drafting workspace or configure a default in your User Profile.',
    },
  ];

  const writingTips = [
    {
      title: 'State the Purpose in Sentence One',
      desc: 'Busy professors and managers scan the first 10 words. State whether you are requesting an extension, submitting a proposal, or following up immediately.',
    },
    {
      title: 'Avoid Casual Slang in Academic/Corporate Settings',
      desc: 'Phrases like "asap", "wanna", and "hey prof" decrease perceived professionalism. Use "at your earliest convenience" and "Dear Professor [Name]".',
    },
    {
      title: 'Keep Paragraphs Under 3 Sentences',
      desc: 'Long blocks of text get skipped on mobile screens. Break explanations into short paragraphs or crisp bullet points.',
    },
    {
      title: 'Always Include Concrete Next Steps',
      desc: 'Specify exact dates, deadlines, or time windows when requesting a meeting or response.',
    },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <Badge variant="brand" size="sm">Help Center & Knowledge Base</Badge>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-2">
          Help, FAQs & Email Writing Guide
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Everything you need to know about mastering professional email communication.
        </p>
      </div>

      {/* Professional Email Writing Guide */}
      <Card>
        <CardHeader className="py-4 px-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-brand-600" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Executive Email Writing Best Practices
          </span>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {writingTips.map((tip, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                {tip.title}
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed pl-5">
                {tip.desc}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Frequently Asked Questions Accordion */}
      <Card>
        <CardHeader className="py-4 px-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <FileQuestion className="w-5 h-5 text-indigo-500" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Frequently Asked Questions
          </span>
        </CardHeader>
        <CardContent className="p-6 divide-y divide-slate-100 dark:divide-slate-800">
          {faqs.map((faq, idx) => (
            <div key={idx} className="py-3">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between text-left text-xs font-bold text-slate-900 dark:text-slate-100 hover:text-brand-600 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    openFaq === idx ? 'rotate-180 text-brand-600' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <p className="mt-2 text-xs text-slate-500 leading-relaxed pl-1">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
