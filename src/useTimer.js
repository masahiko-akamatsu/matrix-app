import { useState, useEffect, useRef, useCallback } from 'react';

export function useTimer() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [alarmAt, setAlarmAt] = useState(null);
  const [alarmFired, setAlarmFired] = useState(false);
  const intervalRef = useRef(null);
  const onAlarmRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          const next = s + 1;
          if (alarmAt && !alarmFired && next >= alarmAt) {
            setAlarmFired(true);
            onAlarmRef.current?.();
          }
          return next;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, alarmAt, alarmFired]);

  const start = useCallback(() => setRunning(true), []);
  const stop = useCallback(() => setRunning(false), []);
  const reset = useCallback(() => {
    setRunning(false);
    setSeconds(0);
    setAlarmFired(false);
  }, []);

  const setAlarm = useCallback((hours, onAlarm) => {
    setAlarmAt(Math.round(hours * 3600));
    setAlarmFired(false);
    onAlarmRef.current = onAlarm;
  }, []);

  const fmt = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  };

  const warningLevel = alarmAt
    ? seconds >= alarmAt ? 'over'
    : seconds >= alarmAt - 300 ? 'warning'
    : seconds >= alarmAt - 60 ? 'danger'
    : 'normal'
    : 'normal';

  return { seconds, running, formatted: fmt(seconds), start, stop, reset, setAlarm, warningLevel };
}
