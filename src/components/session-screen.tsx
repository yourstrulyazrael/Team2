"use client";

import { useEffect, useState } from "react";
import { Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { DIFFICULTY_LABELS } from "@/lib/plan";
import {
  budgetMs,
  formatClock,
  pause,
  remainingMs,
  select,
  spentMs,
  start,
  stopIfFinished,
  type Session,
} from "@/lib/session";

type Props = {
  session: Session;
  update: (change: (session: Session) => Session) => void;
  onEnd: () => void;
};

export function SessionScreen({ session, update, onEnd }: Props) {
  const [now, setNow] = useState(() => Date.now());
  const running = session.runningSince !== null;

  // While a timer runs, refresh the clock four times a second. The time
  // shown is always worked out from timestamps, so a slow tick never
  // makes it drift.
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);
      update((s) => stopIfFinished(s, t));
    }, 250);
    return () => clearInterval(id);
  }, [running, update]);

  function act(change: (s: Session, t: number) => Session) {
    const t = Date.now();
    setNow(t);
    update((s) => change(s, t));
  }

  const active = session.activeIndex;
  const activeSubject = active === null ? null : session.subjects[active];

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-6">
          {activeSubject === null || active === null ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Tap a subject below to begin.
            </p>
          ) : (
            <>
              <div className="text-center">
                <p className="text-lg font-semibold">{activeSubject.name}</p>
                <p className="text-sm text-muted-foreground">
                  {DIFFICULTY_LABELS[activeSubject.difficulty]}
                </p>
              </div>
              <p
                className="font-mono text-6xl font-semibold tabular-nums tracking-tight"
                aria-live="off"
              >
                {formatClock(remainingMs(session, active, now))}
              </p>
              {running ? (
                <Button size="lg" variant="secondary" onClick={() => act(pause)}>
                  <Pause className="h-4 w-4" />
                  Pause
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={() => act(start)}
                  disabled={remainingMs(session, active, now) <= 0}
                >
                  <Play className="h-4 w-4" />
                  Start
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        {session.subjects.map((subject, i) => {
          const isActive = i === active;
          const total = budgetMs(subject);
          const progress = total > 0 ? spentMs(session, i, now) / total : 1;
          return (
            <button
              key={i}
              type="button"
              onClick={() => act((s, t) => select(s, i, t))}
              aria-pressed={isActive}
              className={cn(
                "flex flex-col gap-2 rounded-[var(--radius)] border bg-card p-4 text-left transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive ? "border-ring" : "border-border hover:bg-secondary",
              )}
            >
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="truncate font-medium">
                  {subject.name}{" "}
                  <span className="font-normal text-muted-foreground">
                    · {DIFFICULTY_LABELS[subject.difficulty]}
                  </span>
                </span>
                <span className="font-mono tabular-nums text-muted-foreground">
                  {formatClock(remainingMs(session, i, now))} / {formatClock(total)}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.min(100, progress * 100)}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      <Button variant="ghost" onClick={onEnd}>
        End session
      </Button>
    </div>
  );
}
