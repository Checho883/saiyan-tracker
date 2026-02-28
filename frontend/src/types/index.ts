// ============ CORE TYPES ============

export interface Task {
  id: string;
  user_id: string;
  category_id: string;
  title: string;
  description: string | null;
  base_points: number;
  energy_level: EnergyLevel;
  estimated_minutes: number | null;
  recurring: boolean;
  recurrence_pattern: string | null;
  is_active: boolean;
  category_name?: string;
  category_color?: string;
  category_multiplier?: number;
  effective_points?: number;
  created_at: string;
}

export interface TaskCategory {
  id: string;
  name: string;
  point_multiplier: number;
  color_code: string;
  icon: string;
}

export interface TaskCompletion {
  id: string;
  task_id: string;
  task_title?: string;
  points_awarded: number;
  energy_at_completion: string | null;
  completed_at: string;
  category_name?: string;
}

export interface CompletionResult {
  completion_id: string;
  points_awarded: number;
  base_points: number;
  bonus_points: number;
  streak_bonus_pct: number;
  new_total_power: number;
  daily_points: number;
  daily_minimum_met: boolean;
  new_transformation: TransformationEvent | null;
}

// ============ POWER / GAMIFICATION ============

export type TransformationLevel = 'base' | 'ssj' | 'ssj2' | 'ssj3' | 'ssg' | 'ssb' | 'ui';

export interface PowerLevel {
  total_power_points: number;
  transformation_level: TransformationLevel;
  transformation_name: string;
  next_transformation: TransformationLevel | null;
  next_transformation_name: string | null;
  points_to_next: number | null;
  progress_percentage: number;
  daily_points_today: number;
  current_streak: number;
  daily_minimum: number;
  daily_minimum_met: boolean;
}

export interface TransformationEvent {
  new_level: TransformationLevel;
  new_name: string;
  total_points: number;
}

export interface TransformationInfo {
  level: TransformationLevel;
  name: string;
  threshold: number;
  unlocked: boolean;
  unlocked_at?: string;
}

// ============ ENERGY ============

export type EnergyLevel = 'low' | 'medium' | 'high';

// ============ HABITS ============

export interface Habit {
  id: string;
  user_id: string;
  category_id: string;
  title: string;
  description: string | null;
  icon_emoji: string;
  base_points: number;
  frequency: 'daily' | 'weekdays' | 'custom';
  custom_days: string[] | null;
  target_time: string | null;
  is_temporary: boolean;
  start_date: string | null;
  end_date: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  category_name?: string;
  category_color?: string;
  category_multiplier?: number;
}

export interface HabitToday {
  id: string;
  title: string;
  icon_emoji: string;
  base_points: number;
  category_id: string;
  category_name: string | null;
  category_color: string | null;
  category_multiplier: number | null;
  completed: boolean;
  completed_at: string | null;
  points_awarded: number;
  current_streak: number;
  best_streak: number;
}

export interface HabitCheckResult {
  habit_id: string;
  completed: boolean;
  points_awarded: number;
  base_points: number;
  streak_bonus_points: number;
  habit_streak: number;
  new_total_power: number;
  daily_points: number;
  daily_minimum_met: boolean;
  all_habits_completed: boolean;
  consistency_bonus_applied: boolean;
  new_transformation: TransformationEvent | null;
}

export interface HabitCalendarDay {
  date: string;
  habits_due: number;
  habits_completed: number;
  completion_rate: number;
  total_points: number;
}

export interface HabitCalendarResponse {
  year: number;
  month: number;
  days: HabitCalendarDay[];
}

// ============ QUOTES ============

export interface Quote {
  character: 'vegeta' | 'goku' | 'gohan';
  quote_text: string;
  context: string;
  severity: number;
  source_saga?: string;
}

// ============ ANALYTICS ============

export interface DailyStats {
  date: string;
  points: number;
  tasks_completed: number;
  minimum_met: boolean;
  is_off_day: boolean;
}

export interface CategoryBreakdown {
  category_name: string;
  category_color: string;
  total_points: number;
  percentage: number;
  task_count: number;
}

export interface WeeklyAnalytics {
  days: DailyStats[];
  total_points: number;
  average_daily: number;
  days_minimum_met: number;
}

export interface PowerHistoryEntry {
  date: string;
  total_power_points: number;
  transformation_level: string;
}

// ============ OFF DAYS ============

export interface OffDay {
  id: string;
  off_day_date: string;
  reason: string;
  notes: string | null;
}

// ============ SETTINGS ============

export interface UserSettings {
  daily_point_minimum: number;
  username: string;
  email: string;
}

// ============ CONSTANTS ============

export const TRANSFORMATION_COLORS: Record<TransformationLevel, string> = {
  base: '#888899',
  ssj: '#FFD700',
  ssj2: '#FFD700',
  ssj3: '#FFD700',
  ssg: '#FF4444',
  ssb: '#1E90FF',
  ui: '#C0C0FF',
};

export const TRANSFORMATION_NAMES: Record<TransformationLevel, string> = {
  base: 'Base Form',
  ssj: 'Super Saiyan',
  ssj2: 'Super Saiyan 2',
  ssj3: 'Super Saiyan 3',
  ssg: 'Super Saiyan God',
  ssb: 'Super Saiyan Blue',
  ui: 'Ultra Instinct',
};

export const ENERGY_CONFIG: Record<EnergyLevel, { label: string; color: string; emoji: string }> = {
  low: { label: 'Low Energy', color: '#10B981', emoji: '🔋' },
  medium: { label: 'Medium Energy', color: '#F59E0B', emoji: '⚡' },
  high: { label: 'Full Power', color: '#EF4444', emoji: '🔥' },
};
