import axios from 'axios';
import type {
  Task, TaskCategory, TaskCompletion, CompletionResult,
  PowerLevel, TransformationInfo, PowerHistoryEntry,
  Quote, WeeklyAnalytics, CategoryBreakdown,
  OffDay, UserSettings,
} from '@/types';

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// ============ TASKS ============

export const taskApi = {
  list: (params?: { energy_level?: string; category_id?: string }) =>
    api.get<Task[]>('/tasks/', { params }).then(r => r.data),

  get: (id: string) =>
    api.get<Task>(`/tasks/${id}`).then(r => r.data),

  create: (data: {
    category_id: string;
    title: string;
    description?: string;
    base_points?: number;
    energy_level?: string;
    estimated_minutes?: number;
  }) => api.post<Task>('/tasks/', data).then(r => r.data),

  update: (id: string, data: Partial<Task>) =>
    api.put<Task>(`/tasks/${id}`, data).then(r => r.data),

  delete: (id: string) =>
    api.delete(`/tasks/${id}`).then(r => r.data),
};

// ============ CATEGORIES ============

export const categoryApi = {
  list: () =>
    api.get<TaskCategory[]>('/categories/').then(r => r.data),

  create: (data: { name: string; point_multiplier: number; color_code: string; icon?: string }) =>
    api.post<TaskCategory>('/categories/', data).then(r => r.data),

  update: (id: string, data: { name: string; point_multiplier: number; color_code: string; icon?: string }) =>
    api.put<TaskCategory>(`/categories/${id}`, data).then(r => r.data),
};

// ============ COMPLETIONS ============

export const completionApi = {
  complete: (data: { task_id: string; energy_at_completion?: string; notes?: string }) =>
    api.post<CompletionResult>('/completions/', data).then(r => r.data),

  today: () =>
    api.get<TaskCompletion[]>('/completions/today').then(r => r.data),

  undo: (id: string) =>
    api.delete(`/completions/${id}`).then(r => r.data),
};

// ============ POWER ============

export const powerApi = {
  current: () =>
    api.get<PowerLevel>('/power/current').then(r => r.data),

  transformations: () =>
    api.get<TransformationInfo[]>('/power/transformations').then(r => r.data),

  history: (days: number = 30) =>
    api.get<PowerHistoryEntry[]>('/power/history', { params: { days } }).then(r => r.data),
};

// ============ QUOTES ============

export const quoteApi = {
  vegetaRoast: (missedDays: number = 1) =>
    api.get<Quote>('/quotes/vegeta/roast', { params: { missed_days: missedDays } }).then(r => r.data),

  gokuMotivation: (context: string = 'motivation') =>
    api.get<Quote>('/quotes/goku/motivation', { params: { context } }).then(r => r.data),

  contextual: () =>
    api.get<Quote>('/quotes/contextual').then(r => r.data),
};

// ============ ANALYTICS ============

export const analyticsApi = {
  weekly: () =>
    api.get<WeeklyAnalytics>('/analytics/weekly').then(r => r.data),

  categoryBreakdown: (days: number = 30) =>
    api.get<CategoryBreakdown[]>('/analytics/category-breakdown', { params: { days } }).then(r => r.data),
};

// ============ OFF DAYS ============

export const offDayApi = {
  list: () =>
    api.get<OffDay[]>('/off-days/').then(r => r.data),

  create: (data: { reason: string; notes?: string; off_day_date?: string }) =>
    api.post<OffDay>('/off-days/', data).then(r => r.data),

  delete: (id: string) =>
    api.delete(`/off-days/${id}`).then(r => r.data),
};

// ============ SETTINGS ============

export const settingsApi = {
  get: () =>
    api.get<UserSettings>('/settings/').then(r => r.data),

  update: (data: { daily_point_minimum?: number }) =>
    api.put<{ daily_point_minimum: number }>('/settings/', data).then(r => r.data),
};

export default api;
