"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EMPTY_PLAN, PlanScreen, type PlanDraft } from "@/components/plan-screen";

export default function Home() {
  const [draft, setDraft] = useState<PlanDraft>(EMPTY_PLAN);
  const [screen, setScreen] = useState<"plan" | "session">("plan");

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-8 sm:py-12">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Study Split</h1>
        <p className="text-sm text-muted-foreground">
          Split your study time by difficulty, one timer per subject.
        </p>
      </header>

      {screen === "plan" ? (
        <PlanScreen draft={draft} onChange={setDraft} onStart={() => setScreen("session")} />
      ) : (
        // Placeholder until Ticket 03 builds the Session screen.
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">Session timers are coming in Ticket 03.</p>
          <Button variant="outline" onClick={() => setScreen("plan")}>
            Back to plan
          </Button>
        </div>
      )}
    </main>
  );
}
