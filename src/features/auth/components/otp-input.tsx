"use client";

import { cn } from "@/shared/lib/utils";
import { useRef, useState, KeyboardEvent, ClipboardEvent } from "react";

interface OtpInputProps {
  length?: number;
  onChange: (value: string) => void;
  error?: string;
}

export function OtpInput({ length = 6, onChange, error }: OtpInputProps) {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, digit: string) => {
    if (!/^\d*$/.test(digit)) return;

    const newOtp = [...otp];
    newOtp[index] = digit.slice(-1);
    setOtp(newOtp);
    onChange(newOtp.join(""));

    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").slice(0, length);

    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split("").concat(Array(length).fill("")).slice(0, length);
    setOtp(newOtp);
    onChange(newOtp.join(""));

    const nextEmptyIndex = newOtp.findIndex((digit) => !digit);
    const focusIndex = nextEmptyIndex === -1 ? length - 1 : nextEmptyIndex;
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2 justify-center">
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={otp[index] || ""}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className={cn(
              "w-12 h-14 text-center text-2xl font-semibold rounded-lg border-2 transition-all",
              "focus:outline-none focus:ring-2 focus:ring-wc-red focus:border-wc-red",
              "bg-white dark:bg-zinc-800",
              error ? "border-red-500 dark:border-red-500" : "border-zinc-300 dark:border-zinc-600 hover:border-zinc-400 dark:hover:border-zinc-500",
              "text-zinc-900 dark:text-white"
            )}
          />
        ))}
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>}
    </div>
  );
}
