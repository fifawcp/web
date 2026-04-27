import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

type BaseProps = {
  label: string;
  icon?: LucideIcon;
  className?: string;
};

type LinkProps = BaseProps & {
  href: string;
  onClick?: () => void;
};

type ButtonProps = BaseProps & {
  href?: undefined;
  onClick: () => void;
  disabled?: boolean;
};

type AuthActionLinkProps = LinkProps | ButtonProps;

export function AuthActionLink({ label, icon: Icon, className, ...props }: AuthActionLinkProps) {
  const content = (
    <>
      {Icon ? <Icon className="size-4 shrink-0" aria-hidden /> : null}
      {label}
    </>
  );

  const classes = cn(
    "gap-1.5 px-0 text-sm font-semibold text-foreground underline-offset-4 hover:underline",
    className,
  );

  if ("href" in props && typeof props.href === "string") {
    const { href, onClick } = props;
    return (
      <Button asChild variant="link">
        <Link href={href} className={classes} onClick={onClick}>
          {content}
        </Link>
      </Button>
    );
  }

  return (
    <Button variant="link" className={classes} onClick={props.onClick} disabled={props.disabled}>
      {content}
    </Button>
  );
}
