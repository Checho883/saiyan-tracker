import { describe, test, expect } from 'vitest';
import {
  api,
  habitsApi,
  powerApi,
  categoriesApi,
  rewardsApi,
  wishesApi,
  offDaysApi,
  quotesApi,
  analyticsApi,
  settingsApi,
} from '../services/api';

describe('API Client (STATE-03)', () => {
  test('api instance is defined', () => {
    expect(api).toBeDefined();
  });

  test('habitsApi has all expected methods', () => {
    expect(habitsApi.list).toBeDefined();
    expect(habitsApi.create).toBeDefined();
    expect(habitsApi.get).toBeDefined();
    expect(habitsApi.update).toBeDefined();
    expect(habitsApi.delete).toBeDefined();
    expect(habitsApi.todayList).toBeDefined();
    expect(habitsApi.check).toBeDefined();
    expect(habitsApi.calendarAll).toBeDefined();
    expect(habitsApi.contributionGraph).toBeDefined();
  });

  test('powerApi has current and attributes methods', () => {
    expect(powerApi.current).toBeDefined();
    expect(powerApi.attributes).toBeDefined();
  });

  test('all endpoint groups are exported', () => {
    expect(categoriesApi).toBeDefined();
    expect(rewardsApi).toBeDefined();
    expect(wishesApi).toBeDefined();
    expect(offDaysApi).toBeDefined();
    expect(quotesApi).toBeDefined();
    expect(analyticsApi).toBeDefined();
    expect(settingsApi).toBeDefined();
  });
});
