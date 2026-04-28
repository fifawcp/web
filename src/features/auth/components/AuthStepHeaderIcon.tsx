import { LucideIcon } from "lucide-react";

interface AuthStepHeaderIconProps {
  icon: LucideIcon;
  className?: string;
}

export function AuthStepHeaderIcon({ icon: Icon, className }: AuthStepHeaderIconProps) {
  return (
    <div className="flex justify-center mb-2">
      <div className="rounded-lg bg-muted p-2">
        <Icon className={className ?? "h-6 w-6"} />
      </div>
    </div>
  );
}
