"use client";

import { FloatingShape } from "@/shared/components/ui/floating-shape";

import { floatingShapes } from "../lib/dashboardFloatingShapes";

import { CountdownCard } from "./CountdownCard";
import { GuestHero } from "./GuestHero";
import { NavigationCards } from "./NavigationCards";
import { PickemsSection } from "./PickemsSection";
import { TournamentStatsCard } from "./TournamentStatsCard";
import { TutorialSection } from "./TutorialSection";

export function GuestDashboard() {
  return (
    <div className="flex flex-col">
      {floatingShapes.map((shape, index) => (
        <FloatingShape key={index} {...shape} />
      ))}
      {/* Hero Section */}
      <section className="bg-muted/30 dark:bg-zinc-950">
        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex-1">
              <GuestHero />
            </div>
            <div className="flex flex-col gap-4 w-full lg:w-auto lg:min-w-80">
              <CountdownCard />
              <TournamentStatsCard />
            </div>
          </div>
        </div>
      </section>

      {/* Pick'ems and Navigation Cards Section */}
      <section className="bg-background border-t border-border">
        <div className="container flex flex-col lg:flex-row gap-8 mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <PickemsSection />
          <NavigationCards />
        </div>
      </section>

      {/* Tutorial Section */}
      <TutorialSection isLoggedIn={false} />
    </div>
  );
}
