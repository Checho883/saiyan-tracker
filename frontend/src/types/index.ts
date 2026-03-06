// types/index.ts -- Matches backend/app/schemas/*.py exactly

// -- Enums / Literals --
export type Attribute = 'str' | 'vit' | 'int' | 'ki';
export type Importance = 'normal' | 'important' | 'critical';
export type Frequency = 'daily' | 'weekdays' | 'custom';
export type Rarity = 'common' | 'rare' | 'epic';
export type OffDayReason = 'sick' | 'vacation' | 'rest' | 'injury' | 'other';
export type Theme = 'dark' | 'light';
export type AnalyticsPeriod = 'week' | 'month' | 'all';

// -- Habits --
export interface HabitCreate {
  title: string;
  attribute: Attribute;
  importance?: Importance;
  frequency?: Frequency;
  custom_days?: number[] | null;
  description?: string | null;
  icon_emoji?: string;
  category_id?: string | null;
  target_time?: string | null;
  is_temporary?: boolean;
  start_date: string; // YYYY-MM-DD
  end_date?: string | null;
  sort_order?: number;
}

export interface HabitUpdate {
  title?: string;
  attribute?: Attribute;
  importance?: Importance;
  frequency?: Frequency;
  custom_days?: number[] | null;
  description?: string | null;
  icon_emoji?: string;
  category_id?: string | null;
  target_time?: string | null;
  is_temporary?: boolean;
  start_date?: string;
  end_date?: string | null;
  sort_order?: number;
  is_active?: boolean;
}

export interface HabitResponse {
  id: string;
  title: string;
  description: string | null;
  icon_emoji: string;
  importance: Importance;
  attribute: Attribute;
  frequency: Frequency;
  custom_days: number[] | null;
  target_time: string | null;
  is_temporary: boolean;
  start_date: string;
  end_date: string | null;
  sort_order: number;
  is_active: boolean;
  category_id: string | null;
  created_at: string; // ISO datetime
}

export interface HabitTodayResponse extends HabitResponse {
  completed: boolean;
  streak_current: number;
  streak_best: number;
}

// -- Check Habit --
export interface CheckHabitRequest {
  local_date: string; // YYYY-MM-DD
}

export interface DailyLogSummary {
  habits_due: number;
  habits_completed: number;
  completion_rate: number;
  completion_tier: string;
  xp_earned: number;
  streak_multiplier: number;
  zenkai_bonus_applied: boolean;
  dragon_ball_earned: boolean;
}

export interface StreakInfo {
  current_streak: number;
  best_streak: number;
}

export interface TransformChange {
  key: string;
  name: string;
  threshold: number;
}

export interface DragonBallInfo {
  dragon_balls_collected: number;
  wish_available: boolean;
}

export interface CapsuleDropDetail {
  id: string;
  reward_id: string;
  reward_title: string;
  reward_rarity: Rarity;
}

export interface QuoteDetail {
  character: string;
  quote_text: string;
  source_saga: string;
  avatar_path: string;
}

export interface CheckHabitResponse {
  is_checking: boolean;
  habit_id: string;
  log_date: string;
  attribute_xp_awarded: number;
  is_perfect_day: boolean;
  zenkai_activated: boolean;
  daily_log: DailyLogSummary;
  streak: StreakInfo;
  habit_streak: StreakInfo;
  power_level: number;
  transformation: string;
  transform_change: TransformChange | null;
  dragon_ball: DragonBallInfo | null;
  capsule: CapsuleDropDetail | null;
  quote: QuoteDetail | null;
  events: Array<Record<string, unknown>>;
}

// -- Power --
export interface AttributeDetail {
  attribute: Attribute;
  raw_xp: number;
  level: number;
  title: string | null;
  xp_for_current_level: number;
  xp_for_next_level: number;
  progress_percent: number;
}

export interface PowerResponse {
  power_level: number;
  transformation: string;
  transformation_name: string;
  next_transformation: string | null;
  next_threshold: number | null;
  dragon_balls_collected: number;
  wishes_granted: number;
  attributes: AttributeDetail[];
}

// -- Categories --
export interface CategoryCreate {
  name: string;
  color_code: string;
  icon: string;
  sort_order?: number;
}

export interface CategoryUpdate {
  name?: string;
  color_code?: string;
  icon?: string;
  sort_order?: number;
}

export interface CategoryResponse {
  id: string;
  name: string;
  color_code: string;
  icon: string;
  sort_order: number;
  created_at: string;
}

// -- Rewards --
export interface RewardCreate {
  title: string;
  rarity?: Rarity;
}

export interface RewardUpdate {
  title?: string;
  rarity?: Rarity;
  is_active?: boolean;
}

export interface RewardResponse {
  id: string;
  title: string;
  rarity: Rarity;
  is_active: boolean;
  created_at: string;
}

// -- Wishes --
export interface WishCreate {
  title: string;
}

export interface WishUpdate {
  title?: string;
  is_active?: boolean;
}

export interface WishResponse {
  id: string;
  title: string;
  is_active: boolean;
  times_wished: number;
  created_at: string;
}

export interface WishGrantRequest {
  wish_id: string;
}

export interface WishGrantResponse {
  wish_title: string;
  times_wished: number;
  wishes_granted: number;
}

// -- Off Days --
export interface OffDayCreate {
  local_date: string; // YYYY-MM-DD
  reason?: OffDayReason;
  notes?: string | null;
}

export interface OffDayResponse {
  id: string;
  off_date: string;
  reason: OffDayReason;
  notes: string | null;
  created_at: string;
}

export interface OffDayMarkResponse {
  off_date: string;
  habits_reversed: number;
  xp_clawed_back: number;
}

// -- Quotes --
export interface QuoteResponse {
  character: string;
  quote_text: string;
  source_saga: string;
  avatar_path: string;
}

// -- Settings --
export interface SettingsResponse {
  display_name: string;
  sound_enabled: boolean;
  theme: Theme;
}

export interface SettingsUpdate {
  display_name?: string;
  sound_enabled?: boolean;
  theme?: Theme;
}

// -- Analytics --
export interface AnalyticsSummary {
  perfect_days: number;
  avg_completion: number;
  total_xp: number;
  days_tracked: number;
  longest_streak: number;
}

export interface CapsuleHistoryItem {
  id: string;
  reward_title: string;
  reward_rarity: Rarity;
  habit_title: string;
  dropped_at: string;
}

export interface WishHistoryItem {
  id: string;
  wish_title: string;
  granted_at: string;
}

export interface CalendarDay {
  date: string;
  is_perfect_day: boolean;
  completion_tier: string;
  xp_earned: number;
  is_off_day: boolean;
}

export interface ContributionDay {
  date: string;
  completed: boolean;
}

// -- Achievements --
export interface AchievementResponse {
  id: string;
  achievement_type: string;
  achievement_key: string;
  milestone_type: string | null;
  unlocked_at: string;
  metadata_json: Record<string, unknown> | null;
}

// -- Status / Roast --
export interface StatusQuote {
  character: string;
  quote_text: string;
  source_saga: string;
  avatar_path: string;
}

export interface RoastInfo {
  quote: StatusQuote | null;
  severity: string;
  gap_days: number;
}

export interface StatusResponse {
  welcome_back: StatusQuote | null;
  roast: RoastInfo | null;
}
