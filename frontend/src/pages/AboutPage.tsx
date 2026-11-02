import React from 'react';
import {
  GraduationCap,
  User,
  Layers,
  Database,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  Mail,
  ExternalLink,
  Code2,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <Badge variant="brand" size="sm">Academic Mini-Project</Badge>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-2">
          About MailCraft AI
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Complete project documentation, academic credentials, and software specifications.
        </p>
      </div>

      {/* Student Profile Card */}
      <Card>
        <CardHeader className="py-4 px-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-brand-600" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Student & Curriculum Information
            </span>
          </div>
          <Badge variant="accent">Sem 3 • Sprint 2</Badge>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="space-y-3">
              <div>
                <span className="text-slate-400 font-medium block">Lead Developer / Student:</span>
                <span className="text-base font-extrabold text-slate-900 dark:text-white">
                  Harsh Kumar
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Project Category:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Professional Productivity
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Course / Semester:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  ITM Semester 3 — Sprint 2 — AI Tools Mini Project
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-slate-400 font-medium block">Project Topic:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  AI Email Drafting and Review Assistant
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Official Practical Task:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Draft emails based on purpose, recipient, context and tone. Review emails based on grammar, professionalism, context and tone.
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Expected Output:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  Reviewed professional email with score breakdown.
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Core Objectives & Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="py-3 px-5 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Module A: AI Email Drafting
            </h3>
          </CardHeader>
          <CardContent className="p-5 space-y-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            <p>
              Generates production-grade emails based on recipient hierarchy (Professor, Manager, HR, Client, etc.), intent/purpose, situational details, and length.
            </p>
            <ul className="space-y-1 list-disc list-inside text-[11px] pt-1">
              <li>Configurable user sender name</li>
              <li>Live inline editable subject and body</li>
              <li>One-click tone and length transformation</li>
              <li>Direct database saving & text export</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3 px-5 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Module B: AI Email Review
            </h3>
          </CardHeader>
          <CardContent className="p-5 space-y-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            <p>
              Performs exhaustive quality analysis on raw user emails across 5 dimensions: Grammar, Professionalism, Context Completeness, Tone, and Clarity.
            </p>
            <ul className="space-y-1 list-disc list-inside text-[11px] pt-1">
              <li>Honest calculated scores (0-100)</li>
              <li>Specific mistake detection with substring citations</li>
              <li>Complete rewritten and improved email draft</li>
              <li>Side-by-side diff comparison</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Full Stack Architecture Specifications */}
      <Card>
        <CardHeader className="py-3 px-5 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Technical Architecture Specifications
          </h3>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 space-y-1.5">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">Frontend Stack</span>
              <p className="text-slate-500">• React 18 + Vite</p>
              <p className="text-slate-500">• TypeScript Strict Mode</p>
              <p className="text-slate-500">• Tailwind CSS Design System</p>
              <p className="text-slate-500">• Framer Motion Animations</p>
              <p className="text-slate-500">• Lucide Icons</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 space-y-1.5">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">Backend Architecture</span>
              <p className="text-slate-500">• Node.js + Express</p>
              <p className="text-slate-500">• RESTful JSON API</p>
              <p className="text-slate-500">• Zod Request Validation</p>
              <p className="text-slate-500">• JWT Bearer Authentication</p>
              <p className="text-slate-500">• bcrypt Password Hashing</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 space-y-1.5">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">Database & AI</span>
              <p className="text-slate-500">• PostgreSQL Relational DB</p>
              <p className="text-slate-500">• Prisma ORM Client</p>
              <p className="text-slate-500">• Google Gemini (Dynamic Flash & Pro)</p>
              <p className="text-slate-500">• Multi-Provider (Groq & OpenAI)</p>
              <p className="text-slate-500">• Zero-Setup Deterministic Demo Engine</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
