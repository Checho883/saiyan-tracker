import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock motion/react
vi.mock('motion/react', () => ({
  motion: new Proxy({}, {
    get: (_target, prop) => {
      if (typeof prop === 'string') {
        return ({ children, ...props }: Record<string, unknown>) => {
          const Tag = prop as keyof JSX.IntrinsicElements;
          return <Tag {...(props as Record<string, unknown>)}>{children as React.ReactNode}</Tag>;
        };
      }
      return undefined;
    },
  }),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  MotionConfig: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAnimation: () => ({ start: vi.fn(), stop: vi.fn(), set: vi.fn() }),
  useReducedMotion: () => false,
}));

// Mock vaul
vi.mock('vaul', () => ({
  Drawer: {
    Root: ({ children, open }: { children: React.ReactNode; open: boolean }) => open ? <div data-testid="drawer">{children}</div> : null,
    Portal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Overlay: () => <div data-testid="drawer-overlay" />,
    Content: ({ children }: { children: React.ReactNode }) => <div data-testid="drawer-content">{children}</div>,
    Title: ({ children, className }: { children: React.ReactNode; className: string }) => <h2 className={className}>{children}</h2>,
    Description: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  },
}));

// Mock stores
const mockRewards = [
  { id: '1', title: 'Ice Cream', rarity: 'common' as const, is_active: true, created_at: '2026-03-01' },
  { id: '2', title: 'New Game', rarity: 'rare' as const, is_active: true, created_at: '2026-03-02' },
  { id: '3', title: 'Vacation Day', rarity: 'epic' as const, is_active: true, created_at: '2026-03-03' },
];

const mockWishes = [
  { id: '1', title: 'World Peace', is_active: true, times_wished: 3, created_at: '2026-03-01' },
  { id: '2', title: 'Unlimited Power', is_active: false, times_wished: 1, created_at: '2026-03-02' },
];

const mockCategories = [
  { id: '1', name: 'Fitness', color_code: '#EF4444', icon: '💪', sort_order: 0 },
  { id: '2', name: 'Learning', color_code: '#3B82F6', icon: '📚', sort_order: 1 },
];

const mockStore = {
  rewards: mockRewards,
  wishes: mockWishes,
  categories: mockCategories,
  settings: { display_name: 'Goku', sound_enabled: true, theme: 'dark' as const },
  isLoading: false,
  error: null,
  fetchRewards: vi.fn(),
  fetchWishes: vi.fn(),
  fetchCategories: vi.fn(),
  fetchSettings: vi.fn(),
  createReward: vi.fn(),
  updateReward: vi.fn(),
  deleteReward: vi.fn(),
  createWish: vi.fn(),
  updateWish: vi.fn(),
  deleteWish: vi.fn(),
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
  updateSettings: vi.fn(),
};

vi.mock('../store/rewardStore', () => ({
  useRewardStore: Object.assign(
    (selector: (s: typeof mockStore) => unknown) => selector(mockStore),
    { getState: () => mockStore }
  ),
}));

// Mock offDaysApi
vi.mock('../services/api', () => ({
  offDaysApi: {
    list: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock useTheme
vi.mock('../hooks/useTheme', () => ({
  useTheme: () => ({
    theme: 'dark',
    isDark: true,
    toggleTheme: vi.fn(),
  }),
}));

// Mock recharts for Analytics import in routing
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AreaChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Area: () => null,
  LineChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
}));

vi.mock('../hooks/useAnalyticsData', () => ({
  useAnalyticsData: () => ({ summary: null, calendarDays: [], isLoading: false }),
}));

import { RewardSection } from '../components/settings/RewardSection';
import { WishSection } from '../components/settings/WishSection';
import { CategorySection } from '../components/settings/CategorySection';
import Settings from '../pages/Settings';

describe('Settings CRUD Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('RewardSection renders list of rewards with rarity badges', () => {
    render(<RewardSection />);
    expect(screen.getByText('Ice Cream')).toBeInTheDocument();
    expect(screen.getByText('New Game')).toBeInTheDocument();
    expect(screen.getByText('Vacation Day')).toBeInTheDocument();
    expect(screen.getByText('common')).toBeInTheDocument();
    expect(screen.getByText('rare')).toBeInTheDocument();
    expect(screen.getByText('epic')).toBeInTheDocument();
    expect(screen.getByText('Add Reward')).toBeInTheDocument();
  });

  test('RewardSection shows distribution stats', () => {
    render(<RewardSection />);
    expect(screen.getByText('Common: 1')).toBeInTheDocument();
    expect(screen.getByText('Rare: 1')).toBeInTheDocument();
    expect(screen.getByText('Epic: 1')).toBeInTheDocument();
  });

  test('WishSection renders wishes with active toggle and times-wished count', () => {
    render(<WishSection />);
    expect(screen.getByText('World Peace')).toBeInTheDocument();
    expect(screen.getByText('wished 3x')).toBeInTheDocument();
    expect(screen.getByText('Unlimited Power')).toBeInTheDocument();
    expect(screen.getByText('wished 1x')).toBeInTheDocument();
    expect(screen.getByText('Add Wish')).toBeInTheDocument();
  });

  test('CategorySection renders categories with color and emoji', () => {
    render(<CategorySection />);
    expect(screen.getByText('Fitness')).toBeInTheDocument();
    expect(screen.getByText('💪')).toBeInTheDocument();
    expect(screen.getByText('Learning')).toBeInTheDocument();
    expect(screen.getByText('📚')).toBeInTheDocument();
    expect(screen.getByText('Add Category')).toBeInTheDocument();
  });

  test('Settings page renders all collapsible sections', () => {
    render(<Settings />);
    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
    expect(screen.getByText('Preferences')).toBeInTheDocument();
    expect(screen.getByText('Categories')).toBeInTheDocument();
    expect(screen.getByText('Capsule Rewards')).toBeInTheDocument();
    expect(screen.getByText('Shenron Wishes')).toBeInTheDocument();
  });

  test('Preferences section expanded by default', () => {
    render(<Settings />);
    // Preferences section should be visible (expanded by default)
    const prefButton = screen.getByText('Preferences').closest('button');
    expect(prefButton?.getAttribute('aria-expanded')).toBe('true');

    // Other sections collapsed
    const catButton = screen.getByText('Categories').closest('button');
    expect(catButton?.getAttribute('aria-expanded')).toBe('false');
  });
});
