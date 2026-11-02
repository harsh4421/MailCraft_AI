import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authApi } from '../services/api';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../components/ui/Toast';
import {
  Settings,
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Sliders,
  Moon,
  Sun,
  Loader2,
  Cpu,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const toast = useToast();

  const [defaultTone, setDefaultTone] = useState(user?.settings?.defaultTone || 'Professional');
  const [defaultRecipient, setDefaultRecipient] = useState(user?.settings?.defaultRecipient || 'Professor');
  const [defaultLength, setDefaultLength] = useState(user?.settings?.defaultLength || 'Medium');
  const [customApiKey, setCustomApiKey] = useState(user?.settings?.customApiKey || '');
  const [selectedModel, setSelectedModel] = useState(user?.settings?.selectedModel || '');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [useDemoMode, setUseDemoMode] = useState(user?.settings?.useDemoMode ?? false);
  const [isSaving, setIsSaving] = useState(false);

  // Key testing state
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    stage?: string;
    provider?: string;
    activeModel?: string;
  } | null>(null);

  useEffect(() => {
    if (user?.settings) {
      setDefaultTone(user.settings.defaultTone);
      setDefaultRecipient(user.settings.defaultRecipient);
      setDefaultLength(user.settings.defaultLength);
      setCustomApiKey(user.settings.customApiKey || '');
      setSelectedModel(user.settings.selectedModel || '');
      setUseDemoMode(user.settings.useDemoMode);
    }
  }, [user]);

  // Load available models if user has a configured key
  useEffect(() => {
    if (user?.settings?.customApiKey && user.settings.customApiKey.length > 5) {
      authApi
        .getGeminiModels()
        .then((res) => {
          if (res.models && res.models.length > 0) {
            setAvailableModels(res.models);
            if (!user.settings?.selectedModel) {
              setSelectedModel(res.defaultModel);
            }
          }
        })
        .catch(() => {
          // Ignore background fetch error
        });
    }
  }, [user?.settings?.customApiKey]);

  const handleTestKey = async () => {
    if (!customApiKey || customApiKey.trim().length < 5) {
      toast.error('Please enter an API key to test');
      return;
    }

    setIsTestingKey(true);
    setTestResult(null);
    try {
      const res = await authApi.testApiKey(customApiKey.trim());
      setTestResult({
        success: true,
        message: res.message || 'API key verified successfully!',
        provider: res.provider,
        activeModel: res.activeModel,
      });

      if (res.availableModels && res.availableModels.length > 0) {
        setAvailableModels(res.availableModels);
        if (!selectedModel || !res.availableModels.includes(selectedModel)) {
          setSelectedModel(res.activeModel || res.availableModels[0]);
        }
      }

      toast.success(`Verified: ${res.provider} is active!`);
    } catch (err: any) {
      const errMsg = err.response?.data?.error || err.message || 'API key verification failed';
      const stage = err.response?.data?.stage;
      setTestResult({
        success: false,
        message: errMsg,
        stage,
      });
      toast.error(errMsg);
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await authApi.updateSettings({
        defaultTone,
        defaultRecipient,
        defaultLength,
        customApiKey: customApiKey.trim() || undefined,
        selectedModel: selectedModel || undefined,
        useDemoMode,
      });

      if (user) {
        updateUser({ settings: updated });
      }
      toast.success('Preferences and AI settings saved!');
    } catch (err: any) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-500" />
          Application & AI Preferences
        </h2>
        <p className="text-xs text-slate-500">
          Configure AI provider credentials, select Gemini models, customize drafting parameters, and visual theme.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* AI Provider & Engine Settings */}
        <Card>
          <CardHeader className="py-3 px-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-brand-600" />
              AI Intelligence Engine Configuration
            </span>
            <Badge variant={useDemoMode || !customApiKey ? 'warning' : 'success'} size="sm">
              {useDemoMode || !customApiKey
                ? 'Demo Mode Fallback'
                : `Live Cloud AI Active (${selectedModel || 'Auto'})`}
            </Badge>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                Supported Live AI Providers:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-emerald-600 block">1. Google Gemini</span>
                  <p className="text-slate-400">Keys starting with <code>AQ...</code> or <code>AIza...</code></p>
                  <p className="text-[10px] text-emerald-600 font-medium mt-1">Free Tier • Dynamic Discovery</p>
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-sky-600 block">2. Groq (Llama 3.3)</span>
                  <p className="text-slate-400">Keys starting with <code>gsk_...</code></p>
                  <p className="text-[10px] text-sky-600 font-medium mt-1">Ultra-fast & 100% Free</p>
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-brand-600 block">3. OpenAI</span>
                  <p className="text-slate-400">Keys starting with <code>sk-...</code></p>
                  <p className="text-[10px] text-slate-500 mt-1">Requires paid billing credits</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Force Local Demo Mode
                </label>
                <p className="text-[11px] text-slate-400">
                  Use built-in deterministic NLP engine even if an API key is provided.
                </p>
              </div>
              <input
                type="checkbox"
                checked={useDemoMode}
                onChange={(e) => setUseDemoMode(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <Input
                label="AI Provider API Key (Google Gemini / Groq / OpenAI)"
                type="password"
                value={customApiKey}
                onChange={(e) => {
                  setCustomApiKey(e.target.value);
                  setTestResult(null);
                }}
                placeholder="AQ... / AIzaSy... / gsk_... / sk-..."
                icon={<Key className="w-4 h-4" />}
                hint="Stored securely encrypted with AES-256-GCM in PostgreSQL. Never logged or exposed."
              />

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleTestKey}
                  disabled={!customApiKey || isTestingKey}
                  icon={isTestingKey ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                >
                  {isTestingKey ? 'Verifying with Provider...' : 'Test & Verify API Key'}
                </Button>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-emerald-600 flex items-center gap-1 text-[11px] font-medium"
                  >
                    Get Free Gemini Key <ExternalLink className="w-3 h-3" />
                  </a>
                  <span>•</span>
                  <a
                    href="https://console.groq.com/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-sky-600 flex items-center gap-1 text-[11px] font-medium"
                  >
                    Get Free Groq Key <ExternalLink className="w-3 h-3" />
                  </a>
                  <span>•</span>
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-brand-600 flex items-center gap-1 text-[11px]"
                  >
                    OpenAI Keys <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {testResult && (
                <div
                  className={`p-3.5 rounded-xl border text-xs flex flex-col gap-2 ${
                    testResult.success
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                      : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <strong>{testResult.success ? 'Success:' : 'Verification Failed:'}</strong>{' '}
                      {testResult.stage && <span className="opacity-75 font-mono text-[10px]">[{testResult.stage}] </span>}
                      {testResult.message}
                    </div>
                  </div>

                  {!testResult.success && testResult.message.includes('Quota Exceeded') && (
                    <div className="mt-1 p-2.5 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-rose-200 dark:border-rose-900 text-slate-700 dark:text-slate-300 text-[11px] space-y-1">
                      <p className="font-semibold text-rose-600 dark:text-rose-400">💡 Recommended Solution:</p>
                      <p>
                        OpenAI accounts require prepaid billing credits. You can get an instant free API key from{' '}
                        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-emerald-600 underline font-medium">
                          Google AI Studio (Gemini)
                        </a>{' '}
                        or{' '}
                        <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="text-sky-600 underline font-medium">
                          Groq Cloud
                        </a>
                        .
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Task 5: Dynamic Gemini Model Selector */}
            {availableModels.length > 0 && (
              <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/20 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    Active Gemini Model
                  </label>
                  <Badge variant="brand" size="sm">
                    Discovered via ListModels ({availableModels.length} compatible)
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Select which compatible Gemini model powers email drafting, quality reviews, and revisions.
                </p>
                <Select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  options={availableModels.map((m) => ({
                    value: m,
                    label: `${m}${m.includes('flash') ? ' ⭐ (Recommended - Fast & Free Tier)' : ''}`,
                  }))}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Default Drafting Preferences */}
        <Card>
          <CardHeader className="py-3 px-5 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-indigo-500" />
              Default Workspace Parameters
            </span>
          </CardHeader>
          <CardContent className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Default Recipient"
              value={defaultRecipient}
              onChange={(e) => setDefaultRecipient(e.target.value)}
              options={['Professor', 'Manager', 'HR', 'Client', 'Colleague', 'Customer', 'Friend']}
            />
            <Select
              label="Default Tone"
              value={defaultTone}
              onChange={(e) => setDefaultTone(e.target.value)}
              options={['Professional', 'Formal', 'Casual', 'Urgent', 'Friendly', 'Assertive']}
            />
            <Select
              label="Default Length"
              value={defaultLength}
              onChange={(e) => setDefaultLength(e.target.value)}
              options={['Short', 'Medium', 'Detailed']}
            />
          </CardContent>
        </Card>

        {/* Appearance & Theme */}
        <Card>
          <CardHeader className="py-3 px-5 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Visual Appearance
            </span>
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid grid-cols-2 gap-3 max-w-sm">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-xs font-medium transition-all ${
                  theme === 'light'
                    ? 'border-brand-600 bg-brand-50/50 dark:bg-brand-950/20 text-brand-600 font-bold shadow-sm ring-2 ring-brand-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Sun className="w-5 h-5 text-amber-500" />
                Light Theme
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-xs font-medium transition-all ${
                  theme === 'dark'
                    ? 'border-brand-600 bg-brand-50/50 dark:bg-brand-950/20 text-brand-600 font-bold shadow-sm ring-2 ring-brand-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Moon className="w-5 h-5 text-indigo-400" />
                Dark Theme
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Save Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="submit"
            variant="primary"
            isLoading={isSaving}
            icon={<ShieldCheck className="w-4 h-4" />}
          >
            Save Preferences & AI Settings
          </Button>
        </div>
      </form>
    </div>
  );
};
