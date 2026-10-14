"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Pause, Play, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { playChime } from "@/lib/chime";
import { DIFFICULTY_LABELS } from "@/lib/plan";
import {
  budgetMs,
  dismissTimeUp,
  extend,
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

  // Play the chime when a subject's time runs out. The ref remembers the
  // last value we saw, so a page refresh with the prompt already open
  // doesn't chime again.
  const timeUp = session.timeUpIndex ?? null;
  const lastTimeUp = useRef(timeUp);
  useEffect(() => {
    if (timeUp !== null && timeUp !== lastTimeUp.current) playChime();
    lastTimeUp.current = timeUp;
  }, [timeUp]);

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
              ) : remainingMs(session, active, now) <= 0 ? (
                <Button size="lg" onClick={() => act((s, t) => extend(s, active, t))}>
                  <Plus className="h-4 w-4" />
                  15 min
                </Button>
              ) : (
                <Button size="lg" onClick={() => act(start)}>
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
          const done = remainingMs(session, i, now) <= 0;
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
                <span className="flex min-w-0 items-center gap-1.5 truncate font-medium">
                  {done && <Check className="h-4 w-4 shrink-0" aria-label="Done" />}
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

      {timeUp !== null && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/20 p-4 sm:items-center">
          <Card
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="time-up-title"
            className="w-full max-w-sm"
          >
            <CardContent className="flex flex-col gap-4 p-6 text-center">
              <div className="flex flex-col gap-1">
                <p id="time-up-title" className="text-lg font-semibold">
                  Time&apos;s up for {session.subjects[timeUp].name}
                </p>
                <p className="text-sm text-muted-foreground">
                  Move on to another subject, or keep going a little longer?
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={() => update(dismissTimeUp)}>
                  Switch subject
                </Button>
                <Button onClick={() => act((s, t) => extend(s, timeUp, t))}>
                  <Plus className="h-4 w-4" />
                  15 min
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
