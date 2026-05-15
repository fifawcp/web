"use client";

import { useEffect, useRef, useState } from "react";

import { computeCountdown, type CountdownValues } from "../lib/computeCountdown";

const subscribers = new Set<() => void>();
let intervalId: ReturnType<typeof setInterval> | null = null;

function startIfNeeded() {
  if (intervalId !== null) return;
  intervalId = setInterval(() => {
    subscribers.forEach((cb) => cb());
  }, 1000);
}

function stopIfEmpty() {
  if (subscribers.size > 0 || intervalId === null) return;
  clearInterval(intervalId);
  intervalId = null;
}

export function useCountdown(targetDate: Date): CountdownValues {
  const [countdown, setCountdown] = useState(() => computeCountdown(targetDate));
  const targetRef = useRef(targetDate);

  useEffect(() => {
    targetRef.current = targetDate;
    const tick = () => setCountdown(computeCountdown(targetRef.current));
    subscribers.add(tick);
    startIfNeeded();
    return () => {
      subscribers.delete(tick);
      stopIfEmpty();
    };
  }, [targetDate]);

  return countdown;
}
