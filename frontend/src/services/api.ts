import axios from 'axios';
import {
  User,
  UserSettings,
  DraftEmailParams,
  DraftEmailResult,
  ReviewEmailParams,
  ReviewEmailResult,
  EmailDraft,
  DashboardStats,
  AIStatus,
} from '../types';

const getBaseUrl = (): string => {
  const customUrl = typeof window !== 'undefined' ? localStorage.getItem('mailcraft_api_url') : null;
  let envUrl = customUrl || (import.meta as any).env?.VITE_API_URL;
  
  if (!envUrl) {
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      return '/api';
    }
    return '/api';
  }

  envUrl = String(envUrl).trim();
  if (!envUrl.startsWith('http://') && !envUrl.startsWith('https://') && !envUrl.startsWith('/')) {
    envUrl = `https://${envUrl}`;
  }
  const trimmed = envUrl.replace(/\/$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization header automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mailcraft_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercept responses: detect HTML response from static server rewrites
api.interceptors.response.use(
  (response) => {
    if (
      typeof response.data === 'string' &&
      (response.data.includes('<!DOCTYPE html>') || response.data.includes('<!doctype html>'))
    ) {
      return Promise.reject({
        response: {
          data: {
            error: 'Backend API unreachable: Received static HTML instead of JSON. Ensure your Backend URL is set in Render environment variables as VITE_API_URL.',
          },
        },
      });
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
      // Clear token if invalid
      localStorage.removeItem('mailcraft_token');
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const res = await api.post<{ token: string; user: User }>('/auth/login', credentials);
    return res.data;
  },
  register: async (data: { email: string; password: string; fullName: string; jobTitle?: string }) => {
    const res = await api.post<{ token: string; user: User }>('/auth/register', data);
    return res.data;
  },
  logout: async () => {
    await api.post('/auth/logout');
  },
  getMe: async () => {
    const res = await api.get<{ user: User }>('/auth/me');
    return res.data.user;
  },
  updateProfile: async (data: { fullName?: string; jobTitle?: string; defaultSenderName?: string }) => {
    const res = await api.put<User>('/users/profile', data);
    return res.data;
  },
  updateSettings: async (settings: Partial<UserSettings>) => {
    const res = await api.put<UserSettings>('/users/settings', settings);
    return res.data;
  },
  changePassword: async (passwords: { currentPassword: string; newPassword: string }) => {
    const res = await api.put<{ success: boolean; message: string }>('/users/password', passwords);
    return res.data;
  },
  getAIStatus: async () => {
    const res = await api.get<AIStatus>('/users/ai-status');
    return res.data;
  },
  getGeminiModels: async (apiKey?: string) => {
    const res = await api.get<{ models: string[]; defaultModel: string }>('/users/gemini-models', {
      params: apiKey ? { apiKey } : {},
    });
    return res.data;
  },
  testApiKey: async (apiKey: string) => {
    const res = await api.post<{
      success: boolean;
      provider: string;
      activeModel?: string;
      availableModels?: string[];
      message: string;
      stage?: string;
      error?: string;
    }>('/users/test-api-key', { apiKey });
    return res.data;
  },
};

export const emailApi = {
  generateDraft: async (params: DraftEmailParams) => {
    const res = await api.post<DraftEmailResult>('/emails/draft', params);
    return res.data;
  },
  refineDraft: async (params: {
    currentDraft: {
      subject: string;
      greeting: string;
      body: string;
      closing: string;
      senderName: string;
    };
    action: string;
    targetTone?: string;
    instruction?: string;
  }) => {
    const res = await api.post<DraftEmailResult>('/emails/refine', params);
    return res.data;
  },
  saveDraft: async (data: {
    title?: string;
    subject: string;
    recipient: string;
    purpose: string;
    context?: string;
    tone: string;
    body: string;
    generationId?: string | null;
    tags?: string[];
    isPinned?: boolean;
  }) => {
    const res = await api.post<EmailDraft>('/emails/save', data);
    return res.data;
  },
  getDrafts: async (query?: { search?: string; recipient?: string; purpose?: string; page?: number; limit?: number }) => {
    const res = await api.get<{ drafts: EmailDraft[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>('/emails/drafts', { params: query });
    return res.data;
  },
  getDraftById: async (id: string) => {
    const res = await api.get<EmailDraft>(`/emails/${id}`);
    return res.data;
  },
  updateDraft: async (id: string, data: Partial<EmailDraft>) => {
    const res = await api.put<EmailDraft>(`/emails/${id}`, data);
    return res.data;
  },
  deleteDraft: async (id: string) => {
    const res = await api.delete<{ success: boolean; message: string }>(`/emails/${id}`);
    return res.data;
  },
  getGenerations: async () => {
    const res = await api.get<any[]>('/emails/generations');
    return res.data;
  },
};

export const reviewApi = {
  analyzeEmail: async (params: ReviewEmailParams) => {
    const res = await api.post<ReviewEmailResult>('/reviews/analyze', params);
    return res.data;
  },
  getReviews: async (query?: { search?: string; recipient?: string; purpose?: string; page?: number; limit?: number }) => {
    const res = await api.get<{ reviews: any[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>('/reviews', { params: query });
    return res.data;
  },
  getReviewById: async (id: string) => {
    const res = await api.get<any>(`/reviews/${id}`);
    return res.data;
  },
  deleteReview: async (id: string) => {
    const res = await api.delete<{ success: boolean; message: string }>(`/reviews/${id}`);
    return res.data;
  },
  getDashboardStats: async () => {
    const res = await api.get<DashboardStats>('/reviews/stats');
    return res.data;
  },
};

export default api;
