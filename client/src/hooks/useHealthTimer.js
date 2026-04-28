import { useState, useEffect, useRef, useCallback } from 'react';

const BREAK_SCHEDULE = [
  { at: 20 * 60,  type: 'eye',      icon: '👁️',  title: '20-Minute Eye Break',   msg: 'Use the 20-20-20 rule: look at something 20 feet away for 20 seconds.', duration: 20 },
  { at: 45 * 60,  type: 'stretch',  icon: '🧘',  title: '45-Minute Stretch',     msg: 'Stand up, roll your shoulders, and do a quick full-body stretch.', duration: 5 * 60 },
  { at: 60 * 60,  type: 'water',    icon: '💧',  title: '1-Hour Water Break',    msg: 'Drink a full glass of water. Staying hydrated keeps your focus sharp!', duration: 2 * 60 },
  { at: 90 * 60,  type: 'move',     icon: '🚶',  title: '90-Minute Movement',    msg: 'Walk around for 3-5 minutes. Your spine will thank you.', duration: 5 * 60 },
  { at: 120 * 60, type: 'long',     icon: '⏰',  title: '2-Hour Long Break',     msg: 'Take at least 15 minutes away from the screen. Rest your eyes and move your body!', duration: 15 * 60 },
];

const REPEAT_INTERVAL = 30 * 60; // every 30 min after 2 hrs

export function useHealthTimer() {
  const [status, setStatus] = useState('idle'); // idle | running | paused
  const [elapsed, setElapsed] = useState(0);
  const [reminder, setReminder] = useState(null);
  const [breakLog, setBreakLog] = useState([]);
  const [healthScore, setHealthScore] = useState(100);

  const intervalRef = useRef(null);
  const triggeredRef = useRef(new Set());

  const tick = useCallback(() => {
    setElapsed(prev => {
      const next = prev + 1;

      // Check scheduled breaks
      for (const b of BREAK_SCHEDULE) {
        if (next === b.at && !triggeredRef.current.has(b.at)) {
          triggeredRef.current.add(b.at);
          setReminder(b);
        }
      }

      // Repeating reminders after 2 hours
      if (next > 120 * 60) {
        const extra = next - 120 * 60;
        if (extra % REPEAT_INTERVAL === 0) {
          const totalHrs = (next / 3600).toFixed(1);
          setReminder({
            type: 'urgent',
            icon: '🔴',
            title: `${totalHrs}h — Take a Break!`,
            msg: `You've been gaming for ${totalHrs} hours. Step away for at least 15 minutes.`,
            duration: 15 * 60,
          });
        }
      }

      return next;
    });
  }, []);

  useEffect(() => {
    if (status === 'running') {
      intervalRef.current = setInterval(tick, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [status, tick]);

  const start = () => {
    triggeredRef.current.clear();
    setElapsed(0);
    setStatus('running');
    setBreakLog([]);
    setHealthScore(100);
  };

  const pause = () => setStatus(s => s === 'running' ? 'paused' : 'running');

  const stop = () => {
    setStatus('idle');
    setElapsed(0);
    triggeredRef.current.clear();
    setReminder(null);
  };

  const dismissReminder = (tookBreak) => {
    if (tookBreak && reminder) {
      setBreakLog(log => [
        { ...reminder, takenAt: elapsed, time: new Date().toLocaleTimeString() },
        ...log,
      ]);
      setHealthScore(s => Math.min(100, s + 10));
    } else {
      setHealthScore(s => Math.max(0, s - 5));
    }
    setReminder(null);
  };

  // Progress to next break (0-1)
  const nextBreak = BREAK_SCHEDULE.find(b => b.at > elapsed);
  const prevBreakAt = (() => {
    const prev = [...BREAK_SCHEDULE].reverse().find(b => b.at <= elapsed);
    return prev ? prev.at : 0;
  })();
  const nextBreakAt = nextBreak ? nextBreak.at : elapsed + REPEAT_INTERVAL - ((elapsed - 120 * 60) % REPEAT_INTERVAL);
  const progress = nextBreakAt > prevBreakAt
    ? (elapsed - prevBreakAt) / (nextBreakAt - prevBreakAt)
    : 1;

  const nextBreakIn = Math.max(0, nextBreakAt - elapsed);

  return {
    status, elapsed, reminder, breakLog, healthScore,
    progress, nextBreakIn, nextBreak,
    start, pause, stop, dismissReminder,
  };
}
