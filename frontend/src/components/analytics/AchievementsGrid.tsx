import { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import type { AchievementResponse } from '../../types';
import { achievementsApi } from '../../services/api';

interface AchievementDefinition {
  type: string;
  key: string;
  label: string;
  category: 'Streak Milestones' | 'Transformation Unlocks' | 'Attribute Level-ups';
  icon: string;
}

const ACHIEVEMENT_CATALOG: AchievementDefinition[] = [
  // Streak Milestones
  { type: 'streak', key: '3', label: 'First Step (3 days)', category: 'Streak Milestones', icon: '\uD83D\uDD25' },
  { type: 'streak', key: '7', label: 'Warrior Spirit (7 days)', category: 'Streak Milestones', icon: '\u2694\uFE0F' },
  { type: 'streak', key: '21', label: 'Saiyan Pride (21 days)', category: 'Streak Milestones', icon: '\uD83D\uDCAA' },
  { type: 'streak', key: '30', label: '30 Day Warrior', category: 'Streak Milestones', icon: '\uD83C\uDFC6' },
  { type: 'streak', key: '60', label: '60 Day Elite', category: 'Streak Milestones', icon: '\uD83D\uDC51' },
  { type: 'streak', key: '90', label: '90 Day Legend', category: 'Streak Milestones', icon: '\uD83C\uDF1F' },
  { type: 'streak', key: '365', label: 'Year of Power', category: 'Streak Milestones', icon: '\uD83D\uDC8E' },
  // Transformation Unlocks
  { type: 'transformation', key: 'ssj', label: 'Super Saiyan', category: 'Transformation Unlocks', icon: '\u26A1' },
  { type: 'transformation', key: 'ssj2', label: 'Super Saiyan 2', category: 'Transformation Unlocks', icon: '\u26A1' },
  { type: 'transformation', key: 'ssg', label: 'Super Saiyan God', category: 'Transformation Unlocks', icon: '\uD83D\uDD34' },
  { type: 'transformation', key: 'ssb', label: 'Super Saiyan Blue', category: 'Transformation Unlocks', icon: '\uD83D\uDD35' },
  { type: 'transformation', key: 'ui', label: 'Ultra Instinct', category: 'Transformation Unlocks', icon: '\u26AA' },
  // Attribute Level-ups
  { type: 'level_up', key: 'str_5', label: 'STR Level 5: Fighter', category: 'Attribute Level-ups', icon: '\uD83D\uDCAA' },
  { type: 'level_up', key: 'str_10', label: 'STR Level 10: Warrior', category: 'Attribute Level-ups', icon: '\u2694\uFE0F' },
  { type: 'level_up', key: 'vit_5', label: 'VIT Level 5: Survivor', category: 'Attribute Level-ups', icon: '\uD83D\uDC9A' },
  { type: 'level_up', key: 'vit_10', label: 'VIT Level 10: Guardian', category: 'Attribute Level-ups', icon: '\uD83D\uDEE1\uFE0F' },
  { type: 'level_up', key: 'int_5', label: 'INT Level 5: Student', category: 'Attribute Level-ups', icon: '\uD83D\uDCD8' },
  { type: 'level_up', key: 'int_10', label: 'INT Level 10: Tactician', category: 'Attribute Level-ups', icon: '\uD83E\uDDE0' },
  { type: 'level_up', key: 'ki_5', label: 'KI Level 5: Apprentice', category: 'Attribute Level-ups', icon: '\u2728' },
  { type: 'level_up', key: 'ki_10', label: 'KI Level 10: Adept', category: 'Attribute Level-ups', icon: '\uD83C\uDF00' },
];

const CATEGORIES = ['Streak Milestones', 'Transformation Unlocks', 'Attribute Level-ups'] as const;

function isEarned(
  def: AchievementDefinition,
  earned: AchievementResponse[],
): AchievementResponse | undefined {
  return earned.find(
    (a) => a.achievement_type === def.type && a.achievement_key === def.key,
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Achievements grid showing all possible achievements grouped by category.
 * Earned badges are highlighted; unearned ones appear grayed/locked.
 */
export function AchievementsGrid() {
  const [achievements, setAchievements] = useState<AchievementResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    achievementsApi
      .list()
      .then(setAchievements)
      .catch(() => setAchievements([]))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-6 bg-space-700 rounded w-40" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-space-700 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div data-testid="achievements-grid">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-saiyan-500" />
        <h2 className="text-lg font-bold text-text-primary">Achievements</h2>
      </div>

      {CATEGORIES.map((category) => {
        const defs = ACHIEVEMENT_CATALOG.filter((d) => d.category === category);
        return (
          <div key={category} className="mb-5">
            <h3 className="text-sm font-semibold text-text-secondary mb-2">
              {category}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {defs.map((def) => {
                const earned = isEarned(def, achievements);
                return (
                  <div
                    key={`${def.type}-${def.key}`}
                    className={`rounded-lg p-3 border ${
                      earned
                        ? 'bg-space-700 border-saiyan-500/30'
                        : 'bg-space-800/50 border-space-700'
                    }`}
                    data-testid={`achievement-${def.type}-${def.key}`}
                    data-earned={earned ? 'true' : 'false'}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xl ${earned ? '' : 'grayscale opacity-40'}`}
                      >
                        {def.icon}
                      </span>
                      <span
                        className={`text-xs font-medium leading-tight ${
                          earned ? 'text-text-primary' : 'text-text-muted'
                        }`}
                      >
                        {def.label}
                      </span>
                    </div>
                    {earned ? (
                      <p className="text-text-muted text-[10px] mt-1.5">
                        {formatDate(earned.unlocked_at)}
                      </p>
                    ) : (
                      <p className="text-text-muted/50 text-[10px] mt-1.5 italic">
                        Locked
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
