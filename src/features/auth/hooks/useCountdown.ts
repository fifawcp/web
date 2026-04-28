"use client";

import { useCallback, useEffect, useState } from "react";

export interface UseCountdownResult {
  seconds: number;
  isActive: boolean;
  reset: (nextSeconds?: number) => void;
}

export function useCountdown(initialSeconds: number = 30): UseCountdownResult {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const reset = useCallback(
    (nextSeconds?: number) => {
      setSeconds(nextSeconds ?? initialSeconds);
    },
    [initialSeconds]
  );

  return {
    seconds,
    isActive: seconds > 0,
    reset,
  };
}
