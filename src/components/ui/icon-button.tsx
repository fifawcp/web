import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost";
  size?: "sm" | "md" | "lg";
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(({ className, variant = "default", size = "md", ...props }, ref) => {
  const baseStyles = "cursor-pointer rounded-md transition-colors inline-flex items-center justify-center";

  const variantStyles = {
    default: "hover:bg-zinc-100 dark:hover:bg-zinc-800",
    ghost: "hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50",
  };

  const sizeStyles = {
    sm: "p-1.5",
    md: "p-2",
    lg: "p-3",
  };

  return <button ref={ref} className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)} {...props} />;
});

IconButton.displayName = "IconButton";

export { IconButton };
