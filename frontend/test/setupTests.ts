import '@testing-library/jest-dom/vitest';
import {afterEach, beforeEach, vi} from 'vitest';
import {cleanup} from '@testing-library/react';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

beforeEach(() => {
  window.localStorage.clear();
});

// jsdom does not implement matchMedia; MUI's useMediaQuery relies on it.
if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

// jsdom does not implement ResizeObserver; used by MUI's DateCalendar/Autocomplete.
if (!window.ResizeObserver) {
  window.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

if (!window.scrollTo) {
  window.scrollTo = vi.fn();
}
