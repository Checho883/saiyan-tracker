import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router';
import { BottomTabBar } from '../components/layout/BottomTabBar';
import Dashboard from '../pages/Dashboard';
import Analytics from '../pages/Analytics';
import Settings from '../pages/Settings';

// Mock useInitApp so AppShell renders content immediately
vi.mock('../hooks/useInitApp', () => ({
  useInitApp: () => ({ isReady: true, error: null }),
}));

// Mock stores to prevent API calls — selector-compatible mocks
const habitState = {
  todayHabits: [],
  isLoading: false,
  error: null,
  fetchToday: vi.fn(),
  checkHabit: vi.fn(),
  createHabit: vi.fn(),
  updateHabit: vi.fn(),
  deleteHabit: vi.fn(),
};
vi.mock('../store/habitStore', () => ({
  useHabitStore: Object.assign(
    (selector: (s: typeof habitState) => unknown) => selector(habitState),
    { getState: () => habitState }
  ),
}));

const powerState = {
  powerLevel: 0,
  transformation: 'base',
  transformationName: 'Base',
  nextTransformation: null,
  nextThreshold: null,
  dragonBallsCollected: 0,
  wishesGranted: 0,
  attributes: [],
  isLoading: false,
  error: null,
  fetchPower: vi.fn(),
  updateFromCheck: vi.fn(),
};
vi.mock('../store/powerStore', () => ({
  usePowerStore: Object.assign(
    (selector: (s: typeof powerState) => unknown) => selector(powerState),
    { getState: () => powerState }
  ),
}));

const rewardState = {
  categories: [],
  rewards: [],
  wishes: [],
  settings: null,
  isLoading: false,
  error: null,
  fetchCategories: vi.fn(),
  fetchRewards: vi.fn(),
  fetchWishes: vi.fn(),
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
    (selector: (s: typeof rewardState) => unknown) => selector(rewardState),
    { getState: () => rewardState }
  ),
}));

const uiState = {
  animationQueue: [],
  enqueueAnimation: vi.fn(),
  dequeueAnimation: vi.fn(),
  clearAnimations: vi.fn(),
  activeModal: null as string | null,
  openModal: vi.fn(),
  closeModal: vi.fn(),
};
vi.mock('../store/uiStore', () => ({
  useUiStore: Object.assign(
    (selector: (s: typeof uiState) => unknown) => selector(uiState),
    { getState: () => uiState }
  ),
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  Toaster: () => null,
  default: { error: vi.fn() },
}));

// Mock audio module (BottomTabBar uses useAudio)
vi.mock('../audio/useAudio', () => ({
  useAudio: () => ({
    play: vi.fn(),
    toggleMute: vi.fn(),
    isMuted: true,
  }),
}));

// Mock recharts to avoid JSDOM issues
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

// Mock analytics data hook
vi.mock('../hooks/useAnalyticsData', () => ({
  useAnalyticsData: () => ({ summary: null, calendarDays: [], isLoading: false }),
}));

function renderApp(initialRoute = '/') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <div>
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
        </Routes>
        <BottomTabBar />
      </div>
    </MemoryRouter>,
  );
}

describe('Page Routing (STATE-06)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders Dashboard at root path', () => {
    renderApp('/');
    // Dashboard now shows empty state when no habits
    expect(screen.getByText('No habits yet')).toBeInTheDocument();
  });

  test('navigates to Analytics page', () => {
    renderApp('/analytics');
    expect(screen.getByRole('heading', { name: 'Analytics' })).toBeInTheDocument();
  });

  test('navigates to Settings page', () => {
    renderApp('/settings');
    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
  });

  test('bottom tab bar shows 3 navigation links', () => {
    renderApp('/');
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(3);
  });

  test('clicking tabs navigates between pages', async () => {
    const user = userEvent.setup();
    renderApp('/');

    expect(screen.getByText('No habits yet')).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /analytics/i }));
    expect(screen.getByRole('heading', { name: 'Analytics' })).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /settings/i }));
    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /dashboard/i }));
    expect(screen.getByText('No habits yet')).toBeInTheDocument();
  });
});
