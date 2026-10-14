"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DIFFICULTY_LABELS, formatDuration } from "@/lib/plan";
import type { HistoryEntry } from "@/lib/history";

type Props = {
  history: HistoryEntry[];
  onBack: () => void;
};

export function HistoryScreen({ history, onBack }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">History</h2>
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
          Back to plan
        </Button>
      </div>

      {history.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No sessions yet. Finish a session with &quot;End session&quot; and it will appear here.
        </p>
      ) : (
        history.map((entry) => (
          <Card key={entry.endedAt}>
            <CardHeader>
              <CardTitle className="text-base">
                {new Date(entry.startedAt).toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
                <span className="font-normal text-muted-foreground">
                  {" · "}
                  {new Date(entry.startedAt).toLocaleTimeString(undefined, {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Subject</span>
                <span>Spent / planned</span>
              </div>
              {entry.subjects.map((s, i) => (
                <div key={i} className="flex items-center justify-between gap-4">
                  <span className="truncate">
                    {s.name}{" "}
                    <span className="text-muted-foreground">· {DIFFICULTY_LABELS[s.difficulty]}</span>
                  </span>
                  <span className="shrink-0 font-mono tabular-nums">
                    {formatDuration(s.spentSeconds)} / {formatDuration(s.plannedSeconds)}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between gap-4 border-t border-border pt-3 text-muted-foreground">
                <span>Breaks</span>
                <span className="font-mono tabular-nums">
                  {formatDuration(entry.breakUsedSeconds)} / {formatDuration(entry.breakAllowanceSeconds)}
                </span>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
