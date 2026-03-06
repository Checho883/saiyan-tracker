import ky from 'ky';
import type {
  HabitResponse,
  HabitTodayResponse,
  HabitCreate,
  HabitUpdate,
  CheckHabitRequest,
  CheckHabitResponse,
  PowerResponse,
  AttributeDetail,
  CategoryResponse,
  CategoryCreate,
  CategoryUpdate,
  RewardResponse,
  RewardCreate,
  RewardUpdate,
  WishResponse,
  WishCreate,
  WishUpdate,
  WishGrantRequest,
  WishGrantResponse,
  OffDayResponse,
  OffDayCreate,
  OffDayMarkResponse,
  QuoteResponse,
  SettingsResponse,
  SettingsUpdate,
  AnalyticsSummary,
  CapsuleHistoryItem,
  WishHistoryItem,
  CalendarDay,
  CalendarDayDetail,
  ContributionDay,
  AchievementResponse,
  StatusResponse,
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8000/api/v1';

export const api = ky.extend({
  prefixUrl: API_BASE,
  retry: { limit: 2, methods: ['get'] },
  hooks: {
    afterResponse: [
      async (_request, _options, response) => {
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error((body as Record<string, string>).detail ?? `HTTP ${response.status}`);
        }
      },
    ],
  },
});

// Habits
export const habitsApi = {
  list: () => api.get('habits/').json<HabitResponse[]>(),
  create: (data: HabitCreate) => api.post('habits/', { json: data }).json<HabitResponse>(),
  get: (id: string) => api.get(`habits/${id}`).json<HabitResponse>(),
  update: (id: string, data: HabitUpdate) => api.put(`habits/${id}`, { json: data }).json<HabitResponse>(),
  delete: (id: string) => api.delete(`habits/${id}`),
  todayList: (date: string) => api.get('habits/today/list', { searchParams: { local_date: date } }).json<HabitTodayResponse[]>(),
  check: (id: string, data: CheckHabitRequest) => api.post(`habits/${id}/check`, { json: data }).json<CheckHabitResponse>(),
  calendarAll: (month: string) => api.get('habits/calendar/all', { searchParams: { month } }).json<CalendarDay[]>(),
  contributionGraph: (id: string, days?: number) =>
    api.get(`habits/${id}/contribution-graph`, { searchParams: days ? { days } : {} }).json<ContributionDay[]>(),
  reorder: (habitIds: string[]) =>
    api.put('habits/reorder', { json: { habit_ids: habitIds } }).json<HabitResponse[]>(),
  calendarDayDetail: (date: string) =>
    api.get('habits/calendar/day-detail', { searchParams: { date } }).json<CalendarDayDetail>(),
  listArchived: () => api.get('habits/archived').json<HabitResponse[]>(),
  restore: (id: string) => api.put(`habits/${id}/restore`).json<HabitResponse>(),
};

// Power
export const powerApi = {
  current: () => api.get('power/current').json<PowerResponse>(),
  attributes: () => api.get('attributes/').json<AttributeDetail[]>(),
};

// Categories
export const categoriesApi = {
  list: () => api.get('categories/').json<CategoryResponse[]>(),
  create: (data: CategoryCreate) => api.post('categories/', { json: data }).json<CategoryResponse>(),
  update: (id: string, data: CategoryUpdate) => api.put(`categories/${id}`, { json: data }).json<CategoryResponse>(),
  delete: (id: string) => api.delete(`categories/${id}`),
};

// Rewards
export const rewardsApi = {
  list: () => api.get('rewards/').json<RewardResponse[]>(),
  create: (data: RewardCreate) => api.post('rewards/', { json: data }).json<RewardResponse>(),
  update: (id: string, data: RewardUpdate) => api.put(`rewards/${id}`, { json: data }).json<RewardResponse>(),
  delete: (id: string) => api.delete(`rewards/${id}`),
};

// Wishes
export const wishesApi = {
  list: () => api.get('wishes/').json<WishResponse[]>(),
  create: (data: WishCreate) => api.post('wishes/', { json: data }).json<WishResponse>(),
  update: (id: string, data: WishUpdate) => api.put(`wishes/${id}`, { json: data }).json<WishResponse>(),
  delete: (id: string) => api.delete(`wishes/${id}`),
  grant: (data: WishGrantRequest) => api.post('wishes/grant', { json: data }).json<WishGrantResponse>(),
};

// Off Days
export const offDaysApi = {
  list: (month?: string) => api.get('off-days/', { searchParams: month ? { month } : {} }).json<OffDayResponse[]>(),
  create: (data: OffDayCreate) => api.post('off-days/', { json: data }).json<OffDayMarkResponse>(),
  delete: (date: string) => api.delete(`off-days/${date}`),
};

// Quotes
export const quotesApi = {
  random: (triggerEvent?: string) =>
    api.get('quotes/random', { searchParams: triggerEvent ? { trigger_event: triggerEvent } : {} }).json<QuoteResponse>(),
};

// Analytics
export const analyticsApi = {
  summary: (period?: 'week' | 'month' | 'all') =>
    api.get('analytics/summary', { searchParams: period ? { period } : {} }).json<AnalyticsSummary>(),
  capsuleHistory: () => api.get('analytics/capsule-history').json<CapsuleHistoryItem[]>(),
  wishHistory: () => api.get('analytics/wish-history').json<WishHistoryItem[]>(),
};

// Settings
export const settingsApi = {
  get: () => api.get('settings/').json<SettingsResponse>(),
  update: (data: SettingsUpdate) => api.put('settings/', { json: data }).json<SettingsResponse>(),
};

// Achievements
export const achievementsApi = {
  list: () => api.get('achievements/').json<AchievementResponse[]>(),
};

// Status (welcome-back + roast)
export const statusApi = {
  get: (date: string) => api.get('status/', { searchParams: { local_date: date } }).json<StatusResponse>(),
};
