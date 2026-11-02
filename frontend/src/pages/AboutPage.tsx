import React from 'react';
import {
  Layers,
  Database,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  Mail,
  ExternalLink,
  Code2,
  Sparkles,
  Lock,
  Server,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <Badge variant="brand" size="sm">System Architecture</Badge>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-2">
          About MailCraft AI
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Technical specifications, multi-provider AI architecture, and security design.
        </p>
      </div>

      {/* Core Objectives & Capabilities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="py-3 px-5 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-600" />
              Generative Drafting Engine
            </h3>
          </CardHeader>
          <CardContent className="p-5 space-y-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            <p>
              Generates emails based on recipient hierarchy (Professor, Manager, HR, Client, Colleague), user intent/purpose, situational details, and target length.
            </p>
            <ul className="space-y-1 list-disc list-inside text-[11px] pt-1">
              <li>Configurable user sender name with profile prefill</li>
              <li>Live inline editable subject, greeting, and body</li>
              <li>One-click tone and length transformation</li>
              <li>Direct library persistence and TXT export</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3 px-5 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Multi-Dimensional Quality Review
            </h3>
          </CardHeader>
          <CardContent className="p-5 space-y-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            <p>
              Performs quality analysis on user emails across 5 dimensions: Grammar, Professionalism, Context Completeness, Tone Alignment, and Clarity.
            </p>
            <ul className="space-y-1 list-disc list-inside text-[11px] pt-1">
              <li>Objective quality scores (0–100)</li>
              <li>Specific mistake detection with substring citations</li>
              <li>Complete improved rewrite with side-by-side comparison</li>
              <li>Individual suggestion rejection and reapplication</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Full Stack Architecture Specifications */}
      <Card>
        <CardHeader className="py-3 px-5 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-500" />
            Full-Stack Technology Stack
          </h3>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                <Code2 className="w-4 h-4 text-brand-600" />
                <span>Frontend Stack</span>
              </div>
              <p className="text-slate-500">• React 18 + Vite</p>
              <p className="text-slate-500">• TypeScript Strict Mode</p>
              <p className="text-slate-500">• Tailwind CSS Design System</p>
              <p className="text-slate-500">• Framer Motion Physics</p>
              <p className="text-slate-500">• Lucide Icons</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                <Server className="w-4 h-4 text-indigo-600" />
                <span>Backend Architecture</span>
              </div>
              <p className="text-slate-500">• Node.js + Express</p>
              <p className="text-slate-500">• RESTful JSON API</p>
              <p className="text-slate-500">• Zod Request Validation</p>
              <p className="text-slate-500">• JWT Bearer Authentication</p>
              <p className="text-slate-500">• bcrypt Password Hashing</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                <Database className="w-4 h-4 text-emerald-600" />
                <span>Database & Security</span>
              </div>
              <p className="text-slate-500">• PostgreSQL Relational DB</p>
              <p className="text-slate-500">• Prisma ORM Schema</p>
              <p className="text-slate-500">• AES-256-GCM Key Encryption</p>
              <p className="text-slate-500">• Strict User Isolation</p>
              <p className="text-slate-500">• Key Masking & Redaction</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Provider Architecture */}
      <Card>
        <CardHeader className="py-3 px-5 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4 text-purple-600" />
            AI Intelligence & Provider Layer
          </h3>
        </CardHeader>
        <CardContent className="p-5 text-xs text-slate-600 dark:text-slate-400 space-y-3 leading-relaxed">
          <p>
            MailCraft AI implements an adaptive multi-provider intelligence pipeline:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">Google Gemini</span>
              <p className="text-[11px] text-slate-500">
                Dynamic model resolution via the official <code>@google/genai</code> SDK. Automatically discovers models (such as <code>gemini-2.5-flash</code>) with fallback resilience.
              </p>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">Groq Cloud</span>
              <p className="text-[11px] text-slate-500">
                Ultra-fast inference powered by open weights models (<code>llama-3.3-70b-versatile</code>) on Groq LPUs.
              </p>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">Deterministic NLP</span>
              <p className="text-[11px] text-slate-500">
                Local rule-based heuristic engine allowing the entire application to draft and audit emails offline without an external API key.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
