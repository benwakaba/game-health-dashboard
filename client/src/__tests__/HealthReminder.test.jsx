import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HealthReminder from '../components/HealthReminder.jsx';

const EYE_BREAK = {
  type: 'eye',
  icon: '👁️',
  title: '20-Minute Eye Break',
  msg: 'Use the 20-20-20 rule: look at something 20 feet away for 20 seconds.',
  duration: 20,
};

const LONG_BREAK = {
  type: 'long',
  icon: '⏰',
  title: '2-Hour Long Break',
  msg: 'Take at least 15 minutes away from the screen.',
  duration: 15 * 60,
};

describe('HealthReminder — rendering', () => {
  it('renders the reminder title and message', () => {
    render(<HealthReminder reminder={EYE_BREAK} onDismiss={vi.fn()} />);
    expect(screen.getByText('20-Minute Eye Break')).toBeInTheDocument();
    expect(screen.getByText(/20-20-20 rule/i)).toBeInTheDocument();
  });

  it('renders the icon', () => {
    render(<HealthReminder reminder={EYE_BREAK} onDismiss={vi.fn()} />);
    expect(screen.getByText('👁️')).toBeInTheDocument();
  });

  it('shows the countdown timer when duration > 0', () => {
    render(<HealthReminder reminder={LONG_BREAK} onDismiss={vi.fn()} />);
    // 15 minutes = "15:00"
    expect(screen.getByText('15:00')).toBeInTheDocument();
  });

  it('renders both action buttons', () => {
    render(<HealthReminder reminder={EYE_BREAK} onDismiss={vi.fn()} />);
    expect(screen.getByRole('button', { name: /break taken/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /skip/i })).toBeInTheDocument();
  });
});

describe('HealthReminder — interactions', () => {
  it('calls onDismiss(true) when "Break taken!" is clicked', async () => {
    const onDismiss = vi.fn();
    render(<HealthReminder reminder={EYE_BREAK} onDismiss={onDismiss} />);
    await userEvent.click(screen.getByRole('button', { name: /break taken/i }));
    expect(onDismiss).toHaveBeenCalledOnce();
    expect(onDismiss).toHaveBeenCalledWith(true);
  });

  it('calls onDismiss(false) when "Skip" is clicked', async () => {
    const onDismiss = vi.fn();
    render(<HealthReminder reminder={EYE_BREAK} onDismiss={onDismiss} />);
    await userEvent.click(screen.getByRole('button', { name: /skip/i }));
    expect(onDismiss).toHaveBeenCalledOnce();
    expect(onDismiss).toHaveBeenCalledWith(false);
  });
});

describe('HealthReminder — countdown timer', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('counts down every second', async () => {
    render(<HealthReminder reminder={LONG_BREAK} onDismiss={vi.fn()} />);
    expect(screen.getByText('15:00')).toBeInTheDocument();
    await act(async () => { await vi.advanceTimersByTimeAsync(1000); });
    expect(screen.getByText('14:59')).toBeInTheDocument();
  });

  it('hides the countdown display once it reaches zero', async () => {
    const tinyBreak = { ...EYE_BREAK, duration: 2 };
    render(<HealthReminder reminder={tinyBreak} onDismiss={vi.fn()} />);
    expect(screen.getByText('0:02')).toBeInTheDocument();
    // The component only renders the countdown div when countdown > 0
    await act(async () => { await vi.advanceTimersByTimeAsync(5000); });
    expect(screen.queryByText(/suggested break duration/i)).not.toBeInTheDocument();
  });
});
