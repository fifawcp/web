import { LucideIcon } from "lucide-react";
import { InputHTMLAttributes } from "react";

type FormInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon: LucideIcon;
  hint?: string;
};

export function FormInput({ label, icon: Icon, hint, id, ...props }: FormInputProps) {
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
          id={id}
          className="block w-full pl-10 pr-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-wc-red dark:focus:ring-wc-orange focus:border-transparent"
          {...props}
        />
      </div>
      {hint && <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">{hint}</p>}
    </div>
  );
}
