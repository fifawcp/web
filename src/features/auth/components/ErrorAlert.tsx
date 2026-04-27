"use client";

import { AlertCircleIcon } from "lucide-react";
import { Alert, AlertTitle } from "@/shared/components/ui/alert";

interface ErrorAlertProps {
  message: string;
}

export function ErrorAlert({ message }: ErrorAlertProps) {
  return (
    <Alert className="max-w-md border-destructive bg-destructive/5 text-destructive dark:border-destructive dark:bg-destructive/20">
      <AlertCircleIcon />
      <AlertTitle>{message}</AlertTitle>
    </Alert>
  );
}
