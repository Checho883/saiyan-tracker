import { describe, test, expect, beforeEach, vi } from 'vitest';
import { useHabitStore } from '../store/habitStore';
import { usePowerStore } from '../store/powerStore';
import { useRewardStore } from '../store/rewardStore';
import { useUiStore } from '../store/uiStore';
import type { AnimationEvent } from '../store/uiStore';

// Mock the API modules
vi.mock('../services/api', () => ({
  habitsApi: {
    todayList: vi.fn(),
    check: vi.fn(),
  },
  powerApi: {
    current: vi.fn(),
  },
  rewardsApi: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  wishesApi: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  categoriesApi: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  settingsApi: {
    get: vi.fn(),
    update: vi.fn(),
  },
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn(),
  },
}));

describe('Zustand Stores (STATE-04)', () => {
  beforeEach(() => {
    // Reset all stores to initial state
    useHabitStore.setState({
      todayHabits: [],
      isLoading: false,
      error: null,
    });
    usePowerStore.setState({
      powerLevel: 0,
      transformation: '',
      transformationName: '',
      nextTransformation: null,
      nextThreshold: null,
      dragonBallsCollected: 0,
      wishesGranted: 0,
      attributes: [],
      isLoading: false,
      error: null,
    });
    useRewardStore.setState({
      rewards: [],
      wishes: [],
      categories: [],
      settings: null,
      isLoading: false,
      error: null,
    });
    useUiStore.setState({
      animationQueue: [],
      inlineEvents: [],
      activeModal: null,
    });
  });

  test('habitStore initializes with empty todayHabits', () => {
    const state = useHabitStore.getState();
    expect(state.todayHabits).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
    expect(typeof state.fetchToday).toBe('function');
    expect(typeof state.checkHabit).toBe('function');
  });

  test('powerStore initializes with default values', () => {
    const state = usePowerStore.getState();
    expect(state.powerLevel).toBe(0);
    expect(state.transformation).toBe('');
    expect(state.transformationName).toBe('');
    expect(state.nextTransformation).toBeNull();
    expect(state.nextThreshold).toBeNull();
    expect(state.dragonBallsCollected).toBe(0);
    expect(state.wishesGranted).toBe(0);
    expect(state.attributes).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
    expect(typeof state.fetchPower).toBe('function');
    expect(typeof state.updateFromCheck).toBe('function');
  });

  test('rewardStore initializes with empty arrays', () => {
    const state = useRewardStore.getState();
    expect(state.rewards).toEqual([]);
    expect(state.wishes).toEqual([]);
    expect(state.categories).toEqual([]);
    expect(state.settings).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
    expect(typeof state.fetchRewards).toBe('function');
    expect(typeof state.fetchWishes).toBe('function');
    expect(typeof state.fetchCategories).toBe('function');
    expect(typeof state.fetchSettings).toBe('function');
  });

  test('uiStore has animation queue methods', () => {
    const state = useUiStore.getState();
    expect(state.animationQueue).toEqual([]);
    expect(state.activeModal).toBeNull();
    expect(typeof state.enqueueAnimation).toBe('function');
    expect(typeof state.dequeueAnimation).toBe('function');
    expect(typeof state.clearAnimations).toBe('function');
    expect(typeof state.openModal).toBe('function');
    expect(typeof state.closeModal).toBe('function');
  });

  test('uiStore enqueue/dequeue/clear works correctly', () => {
    const { enqueueAnimation, dequeueAnimation, clearAnimations } =
      useUiStore.getState();

    const event1: AnimationEvent = { type: 'perfect_day' };
    const event2: AnimationEvent = {
      type: 'capsule_drop',
      rewardTitle: 'Senzu',
      rarity: 'rare',
    };

    enqueueAnimation(event1);
    enqueueAnimation(event2);
    expect(useUiStore.getState().animationQueue).toHaveLength(2);

    const dequeued = dequeueAnimation();
    expect(dequeued).toEqual(event1);
    expect(useUiStore.getState().animationQueue).toHaveLength(1);

    clearAnimations();
    expect(useUiStore.getState().animationQueue).toEqual([]);
  });

  test('uiStore modal open/close works correctly', () => {
    const { openModal, closeModal } = useUiStore.getState();

    openModal('habit-form');
    expect(useUiStore.getState().activeModal).toBe('habit-form');

    closeModal();
    expect(useUiStore.getState().activeModal).toBeNull();
  });

  test('powerStore updateFromCheck sets power and transformation', () => {
    usePowerStore.getState().updateFromCheck(9001, 'super_saiyan');
    const state = usePowerStore.getState();
    expect(state.powerLevel).toBe(9001);
    expect(state.transformation).toBe('super_saiyan');
  });

  test('powerStore updateFromCheck with 3 args sets transformationName', () => {
    usePowerStore.getState().updateFromCheck(9001, 'ssj', 'Super Saiyan');
    const state = usePowerStore.getState();
    expect(state.powerLevel).toBe(9001);
    expect(state.transformation).toBe('ssj');
    expect(state.transformationName).toBe('Super Saiyan');
  });

  test('powerStore updateFromCheck with 2 args leaves transformationName unchanged', () => {
    // Set initial transformationName
    usePowerStore.setState({ transformationName: 'Base Form' });
    usePowerStore.getState().updateFromCheck(100, 'base');
    const state = usePowerStore.getState();
    expect(state.powerLevel).toBe(100);
    expect(state.transformation).toBe('base');
    expect(state.transformationName).toBe('Base Form');
  });

  test('powerStore updateFromCheck with undefined transformationName leaves existing unchanged', () => {
    usePowerStore.setState({ transformationName: 'Base Form' });
    usePowerStore.getState().updateFromCheck(100, 'base', undefined);
    const state = usePowerStore.getState();
    expect(state.transformationName).toBe('Base Form');
  });
});
