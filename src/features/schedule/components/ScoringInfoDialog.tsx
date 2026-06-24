"use client";

import { Timer } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/shared/components/ui/drawer";
import { useIsMobile } from "@/shared/hooks/useMediaQuery";

import { useScoringInfoStore } from "../store/scoringInfo.store";

// One-time disclaimer shown on the first pick: match-score picks settle on the full
// result after extra time (120'), unlike sportsbooks that close at 90'. Rendered once
// by ScheduleView; closing (any way) marks it seen and continues to the card's picker.
export function ScoringInfoDialog() {
  const t = useTranslations("schedule.scoringInfo");
  const isMobile = useIsMobile();
  const open = useScoringInfoStore((s) => s.open);
  const acknowledge = useScoringInfoStore((s) => s.acknowledge);

  const onOpenChange = (next: boolean) => {
    if (!next) acknowledge();
  };

  const icon = (
    <span className="flex size-11 items-center justify-center rounded-lg bg-page-accent-soft text-page-accent-strong">
      <Timer className="size-5" aria-hidden />
    </span>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader className="items-center gap-3 text-center">
            {icon}
            <DrawerTitle className="font-heading text-lg font-semibold">{t("title")}</DrawerTitle>
            <DrawerDescription className="text-sm text-muted-foreground">{t("body", { regular: 90, full: 120 })}</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button className="h-11 w-full bg-page-accent text-background hover:bg-page-accent-strong">{t("cta")}</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center gap-3 text-center sm:text-center">
          {icon}
          <DialogTitle className="font-heading text-lg font-semibold">{t("title")}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">{t("body", { regular: 90, full: 120 })}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button className="h-11 w-full bg-page-accent text-background hover:bg-page-accent-strong">{t("cta")}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
