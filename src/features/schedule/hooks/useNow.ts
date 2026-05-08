"use client";

import { useEffect, useState } from "react";

export function useNow(): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    // add the component to the subscribers
    subscribers.add(setNow);
    // start the interval
    ensureRunning();

    return () => {
      subscribers.delete(setNow);
      stopIfIdle();
    };
  }, []);

  return now;
}

const TICK_MS = 30_000; // every 30 seconds

// subscribers are the components that need to be updated when the time changes
const subscribers = new Set<(now: Date) => void>();
let interval: ReturnType<typeof setInterval> | null = null;

function ensureRunning() {
  if (interval) return;

  interval = setInterval(() => {
    const now = new Date();
    subscribers.forEach((cb) => cb(now));
  }, TICK_MS);
}

// if there are no subscribers, stop the interval
function stopIfIdle() {
  if (interval && subscribers.size === 0) {
    clearInterval(interval);
    interval = null;
  }
}
