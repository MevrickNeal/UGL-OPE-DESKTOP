import { useState, useEffect, useRef, useCallback } from 'react';
import { formatTime } from './helpers.js';

const timers = new Map();

// Helper to save active timer to localStorage
function saveTimerToStorage(id, endTime, durationMs) {
  try {
    const data = { id, endTime, durationMs, createdAt: Date.now() };
    localStorage.setItem(`ugl_timer_${id}`, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save timer to storage:', e);
  }
}

// Helper to clear timer from localStorage
function clearTimerFromStorage(id) {
  try {
    localStorage.removeItem(`ugl_timer_${id}`);
  } catch (e) {
    console.error('Failed to clear timer from storage:', e);
  }
}

// Helper to restore timer from localStorage
function restoreTimerFromStorage(id, defaultDurationMs) {
  try {
    const raw = localStorage.getItem(`ugl_timer_${id}`);
    if (raw) {
      const data = JSON.parse(raw);
      if (data && data.endTime) {
        const now = Date.now();
        const timeRemaining = Math.max(0, data.endTime - now);
        if (timeRemaining > 0) {
          return {
            durationMs: data.durationMs || defaultDurationMs,
            endTime: data.endTime,
            isRunning: true
          };
        } else {
          clearTimerFromStorage(id);
        }
      }
    }
  } catch (e) {
    console.error('Failed to restore timer:', e);
  }
  return null;
}

export function startTimer(id, durationMs, onComplete) {
  const validDuration = (typeof durationMs === 'number' && !isNaN(durationMs) && durationMs > 0) ? durationMs : 7200000;
  const endTime = Date.now() + validDuration;
  
  timers.set(id, {
    durationMs: validDuration,
    endTime,
    onComplete
  });

  saveTimerToStorage(id, endTime, validDuration);
}

export function stopTimer(id) {
  timers.delete(id);
  clearTimerFromStorage(id);
}

export function getTimerState(id) {
  let timer = timers.get(id);
  
  // Try restoring from localStorage if not in memory
  if (!timer) {
    const restored = restoreTimerFromStorage(id, 7200000);
    if (restored) {
      timers.set(id, restored);
      timer = restored;
    }
  }

  if (!timer) return { timeRemaining: 0, isRunning: false, isComplete: false, progress: 0 };
  
  const now = Date.now();
  const timeRemaining = Math.max(0, timer.endTime - now);
  const isComplete = timeRemaining === 0;
  const isRunning = !isComplete;
  const progress = 1 - (timeRemaining / timer.durationMs);

  if (isComplete) {
    clearTimerFromStorage(id);
  }
  
  return { timeRemaining, isRunning, isComplete, progress };
}

export function useTimer(id, durationMs = 7200000, onCompleteHook) {
  const validDuration = (typeof durationMs === 'number' && !isNaN(durationMs) && durationMs > 0) ? durationMs : 7200000;

  // Check if there is an active timer in storage on mount
  const restored = restoreTimerFromStorage(id, validDuration);
  const initialTimeMs = restored ? Math.max(0, restored.endTime - Date.now()) : validDuration;

  const [state, setState] = useState({
    timeRemainingFormatted: formatTime(initialTimeMs),
    timeRemainingMs: initialTimeMs,
    progress: restored ? (1 - (initialTimeMs / restored.durationMs)) : 0,
    isRunning: restored ? initialTimeMs > 0 : false,
    isComplete: restored ? initialTimeMs === 0 : false
  });

  const reqRef = useRef();

  const update = useCallback(() => {
    const s = getTimerState(id);
    if (!timers.has(id)) {
      if (reqRef.current) { clearInterval(reqRef.current); reqRef.current = null; }
      return;
    }
    setState({
      timeRemainingFormatted: formatTime(s.timeRemaining),
      timeRemainingMs: s.timeRemaining,
      progress: s.progress,
      isRunning: s.isRunning,
      isComplete: s.isComplete
    });
    
    if (s.isComplete) {
      const t = timers.get(id);
      if (t && t.onComplete) t.onComplete();
      if (onCompleteHook) onCompleteHook();
      timers.delete(id);
      clearTimerFromStorage(id);
      if (reqRef.current) { clearInterval(reqRef.current); reqRef.current = null; }
    } else if (!s.isRunning) {
      if (reqRef.current) { clearInterval(reqRef.current); reqRef.current = null; }
    }
  }, [id, onCompleteHook]);

  useEffect(() => {
    // If timer was running in storage, resume loop immediately
    if (restored && restored.isRunning) {
      timers.set(id, restored);
      reqRef.current = setInterval(update, 1000);
    } else if (timers.has(id) && getTimerState(id).isRunning) {
      reqRef.current = setInterval(update, 1000);
    }
    return () => {
      if (reqRef.current) clearInterval(reqRef.current);
    };
  }, [id, update]);

  const start = useCallback(() => {
    startTimer(id, validDuration);
    if (reqRef.current) clearInterval(reqRef.current);
    reqRef.current = setInterval(update, 1000);
  }, [id, validDuration, update]);

  const stop = useCallback(() => {
    stopTimer(id);
    if (reqRef.current) clearInterval(reqRef.current);
    reqRef.current = null;
    setState(prev => ({ ...prev, isRunning: false }));
  }, [id]);

  const reset = useCallback(() => {
    stop();
    setState({
      timeRemainingFormatted: formatTime(validDuration),
      timeRemainingMs: validDuration,
      progress: 0,
      isRunning: false,
      isComplete: false
    });
  }, [validDuration, stop]);

  return { 
    timeRemainingFormatted: state.timeRemainingFormatted,
    timeRemainingMs: state.timeRemainingMs,
    timeRemaining: state.timeRemainingFormatted, 
    progress: state.progress, 
    isRunning: state.isRunning, 
    isComplete: state.isComplete, 
    start, 
    stop, 
    reset 
  };
}
