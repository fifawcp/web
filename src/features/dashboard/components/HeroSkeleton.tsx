import Image from "next/image";

import { Card } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function HeroSkeleton() {
  return (
    <Card className="relative p-4 sm:p-6 md:p-8 bg-linear-to-br from-primary/10 via-background to-background">
      {/* Mobile stadium image */}
      <div className="pointer-events-none absolute inset-0 sm:hidden mask-[radial-gradient(circle_at_bottom_right,black_0%,transparent_70%)] [-webkit-mask-image:radial-gradient(circle_at_bottom_right,black_0%,transparent_70%)]">
        <Image src="/banner-stadium-mobile.webp" alt="" fill className="object-cover object-right-bottom opacity-50 dark:opacity-15" sizes="100vw" />
      </div>
      {/* Desktop stadium image */}
      <div className="pointer-events-none absolute inset-0 hidden sm:block mask-[radial-gradient(circle_at_bottom_right,black_0%,transparent_70%)] [-webkit-mask-image:radial-gradient(circle_at_bottom_right,black_0%,transparent_70%)]">
        <Image src="/banner-stadium.webp" alt="" fill className="object-cover object-bottom-right opacity-50 dark:opacity-15" sizes="(max-width: 1024px) 80vw, 1376px" />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-white/65 dark:bg-black/20" />
      <div className="flex flex-col gap-4 sm:gap-5 relative z-10">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-14 md:h-10 w-full max-w-2xl" />
        <Skeleton className="h-8 w-full max-w-xl" />
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <Skeleton className="h-9 w-full sm:w-36" />
          <Skeleton className="h-9 w-full sm:w-36" />
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:divide-x divide-border border-t border-border pt-2 mt-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-2 sm:px-4 py-2 sm:py-3 flex-1 border-b sm:border-b-0 border-border">
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />
              <div className="flex flex-col gap-2 flex-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-12" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
