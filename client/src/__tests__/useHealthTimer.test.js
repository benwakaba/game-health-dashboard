import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHealthTimer } from '../hooks/useHealthTimer.js';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

const advance = (ms) => act(() => { vi.advanceTimersByTime(ms); });

describe('useHealthTimer — initial state', () => {
  it('starts idle with zero elapsed', () => {
    const { result } = renderHook(() => useHealthTimer());
    expect(result.current.status).toBe('idle');
    expect(result.current.elapsed).toBe(0);
    expect(result.current.reminder).toBeNull();
    expect(result.current.healthScore).toBe(100);
    expect(result.current.breakLog).toHaveLength(0);
  });
});

describe('useHealthTimer — controls', () => {
  it('transitions to running on start()', () => {
    const { result } = renderHook(() => useHealthTimer());
    act(() => result.current.start());
    expect(result.current.status).toBe('running');
  });

  it('increments elapsed each second while running', () => {
    const { result } = renderHook(() => useHealthTimer());
    act(() => result.current.start());
    advance(5000);
    expect(result.current.elapsed).toBe(5);
  });

  it('pauses and stops incrementing', () => {
    const { result } = renderHook(() => useHealthTimer());
    act(() => result.current.start());
    advance(3000);
    act(() => result.current.pause());
    expect(result.current.status).toBe('paused');
    advance(5000);
    expect(result.current.elapsed).toBe(3); // did not advance while paused
  });

  it('resumes from paused state', () => {
    const { result } = renderHook(() => useHealthTimer());
    act(() => result.current.start());
    advance(2000);
    act(() => result.current.pause()); // pause
    act(() => result.current.pause()); // resume
    expect(result.current.status).toBe('running');
    advance(3000);
    expect(result.current.elapsed).toBe(5);
  });

  it('stop() resets everything to idle', () => {
    const { result } = renderHook(() => useHealthTimer());
    act(() => result.current.start());
    advance(10000);
    act(() => result.current.stop());
    expect(result.current.status).toBe('idle');
    expect(result.current.elapsed).toBe(0);
    expect(result.current.reminder).toBeNull();
  });

  it('start() resets elapsed and break log from a previous session', () => {
    const { result } = renderHook(() => useHealthTimer());
    act(() => result.current.start());
    advance(20 * 60 * 1000);
    act(() => result.current.dismissReminder(true)); // take the break
    act(() => result.current.start());              // new session
    expect(result.current.elapsed).toBe(0);
    expect(result.current.breakLog).toHaveLength(0);
    expect(result.current.healthScore).toBe(100);
  });
});

describe('useHealthTimer — break reminders', () => {
  it('fires the 20-min eye break', () => {
    const { result } = renderHook(() => useHealthTimer());
    act(() => result.current.start());
    advance(20 * 60 * 1000);
    expect(result.current.reminder).not.toBeNull();
    expect(result.current.reminder.type).toBe('eye');
  });

  it('fires the 45-min stretch break', () => {
    const { result } = renderHook(() => useHealthTimer());
    act(() => result.current.start());
    advance(20 * 60 * 1000);
    act(() => result.current.dismissReminder(true));
    advance(25 * 60 * 1000); // total: 45 min
    expect(result.current.reminder).not.toBeNull();
    expect(result.current.reminder.type).toBe('stretch');
  });

  it('fires the 2-hour long break', () => {
    const { result } = renderHook(() => useHealthTimer());
    act(() => result.current.start());
    // Dismiss earlier breaks so they don't block
    advance(20 * 60 * 1000); act(() => result.current.dismissReminder(true));
    advance(25 * 60 * 1000); act(() => result.current.dismissReminder(true));
    advance(15 * 60 * 1000); act(() => result.current.dismissReminder(true));
    advance(30 * 60 * 1000); act(() => result.current.dismissReminder(true));
    advance(30 * 60 * 1000); // total: 120 min
    expect(result.current.reminder.type).toBe('long');
  });

  it('does not fire the same break twice', () => {
    const { result } = renderHook(() => useHealthTimer());
    act(() => result.current.start());
    advance(20 * 60 * 1000);
    act(() => result.current.dismissReminder(true));
    advance(1000); // 1 second past the 20-min mark
    expect(result.current.reminder).toBeNull();
  });
});

describe('useHealthTimer — health score & break log', () => {
  it('awards +10 points when a break is taken', () => {
    const { result } = renderHook(() => useHealthTimer());
    act(() => result.current.start());
    advance(20 * 60 * 1000);
    act(() => result.current.dismissReminder(true));
    expect(result.current.healthScore).toBe(100); // min(100, 100+10) = 100
    expect(result.current.breakLog).toHaveLength(1);
  });

  it('deducts 5 points when a break is skipped', () => {
    const { result } = renderHook(() => useHealthTimer());
    act(() => result.current.start());
    advance(20 * 60 * 1000);
    act(() => result.current.dismissReminder(false));
    expect(result.current.healthScore).toBe(95);
    expect(result.current.breakLog).toHaveLength(0);
  });

  it('score does not drop below 0', () => {
    const { result } = renderHook(() => useHealthTimer());
    act(() => result.current.start());
    // Skip many breaks
    for (let i = 0; i < 25; i++) {
      act(() => result.current.dismissReminder(false));
    }
    expect(result.current.healthScore).toBeGreaterThanOrEqual(0);
  });

  it('break log records icon, title, and time', () => {
    const { result } = renderHook(() => useHealthTimer());
    act(() => result.current.start());
    advance(20 * 60 * 1000);
    act(() => result.current.dismissReminder(true));
    const entry = result.current.breakLog[0];
    expect(entry.icon).toBeDefined();
    expect(entry.title).toBeDefined();
    expect(entry.time).toBeDefined();
  });
});

describe('useHealthTimer — progress ring', () => {
  it('progress is 0 at session start', () => {
    const { result } = renderHook(() => useHealthTimer());
    act(() => result.current.start());
    expect(result.current.progress).toBeCloseTo(0, 1);
  });

  it('progress approaches 1 just before the first break', () => {
    const { result } = renderHook(() => useHealthTimer());
    act(() => result.current.start());
    advance((20 * 60 - 1) * 1000);
    expect(result.current.progress).toBeGreaterThan(0.99);
  });

  it('nextBreakIn counts down correctly', () => {
    const { result } = renderHook(() => useHealthTimer());
    act(() => result.current.start());
    advance(5 * 60 * 1000); // 5 minutes elapsed
    expect(result.current.nextBreakIn).toBe(15 * 60); // 15 min until the 20-min break
  });
});
