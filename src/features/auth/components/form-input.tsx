import { LucideIcon } from "lucide-react";
import { InputHTMLAttributes, forwardRef } from "react";

type FormInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon: LucideIcon;
  hint?: string;
  error?: string;
};

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(({ label, icon: Icon, hint, error, id, ...props }, ref) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-zinc-400" />
        </div>
        <input
          ref={ref}
          id={id}
          className={`block w-full pl-10 pr-3 py-2 border rounded-lg bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:border-transparent ${
            error ? "border-red-500 dark:border-red-500 focus:ring-red-500" : "border-zinc-300 dark:border-zinc-700 focus:ring-wc-red dark:focus:ring-wc-orange"
          }`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
      {!error && hint && <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">{hint}</p>}
    </div>
  );
});

FormInput.displayName = "FormInput";
