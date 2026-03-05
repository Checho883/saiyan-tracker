import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock Howler.js for test environment (jsdom has no Web Audio API)
vi.mock('howler', () => {
  class MockHowl {
    play = vi.fn().mockReturnValue(1);
    rate = vi.fn();
    unload = vi.fn();
    on = vi.fn();
    off = vi.fn();
    constructor(_opts?: Record<string, unknown>) {}
  }
  return {
    Howl: MockHowl,
    Howler: {
      mute: vi.fn(),
      volume: vi.fn(),
      ctx: { state: 'running' },
    },
  };
});

// Polyfill IntersectionObserver for jsdom
class MockIntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];
  constructor(_callback: IntersectionObserverCallback, _options?: IntersectionObserverInit) {}
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] { return []; }
}

if (typeof globalThis.IntersectionObserver === 'undefined') {
  globalThis.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;
}
