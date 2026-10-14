"use client";

import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  DIFFICULTIES,
  DIFFICULTY_LABELS,
  formatDuration,
  splitBudgets,
  type Difficulty,
} from "@/lib/plan";

// What the student types into the Plan screen. Hours and break minutes
// are kept as text so the inputs can be empty while someone is typing.
export type PlanDraft = {
  hours: string;
  breakPerHour: string;
  subjects: { id: number; name: string; difficulty: Difficulty }[];
};

export const EMPTY_PLAN: PlanDraft = {
  hours: "",
  breakPerHour: "10",
  subjects: [{ id: 1, name: "", difficulty: "medium" }],
};

// Turns the draft into numbers: total minutes, break allowance minutes,
// and the subjects that have a name (blank rows are ignored).
export function readPlan(draft: PlanDraft) {
  const hours = Number(draft.hours) || 0;
  const breakPerHour = Number(draft.breakPerHour) || 0;
  const totalMinutes = Math.max(0, hours * 60);
  const breakMinutes = Math.min(totalMinutes, Math.max(0, hours * breakPerHour));
  const subjects = draft.subjects
    .filter((s) => s.name.trim() !== "")
    .map((s) => ({ name: s.name.trim(), difficulty: s.difficulty }));
  const budgets = splitBudgets(totalMinutes - breakMinutes, subjects);
  const canStart = totalMinutes - breakMinutes > 0 && subjects.length > 0;
  return { totalMinutes, breakMinutes, budgets, canStart };
}

type Props = {
  draft: PlanDraft;
  onChange: (draft: PlanDraft) => void;
  onStart: () => void;
};

export function PlanScreen({ draft, onChange, onStart }: Props) {
  const { totalMinutes, breakMinutes, budgets, canStart } = readPlan(draft);

  function updateSubject(id: number, change: Partial<PlanDraft["subjects"][number]>) {
    onChange({
      ...draft,
      subjects: draft.subjects.map((s) => (s.id === id ? { ...s, ...change } : s)),
    });
  }

  function addSubject() {
    const nextId = Math.max(0, ...draft.subjects.map((s) => s.id)) + 1;
    onChange({
      ...draft,
      subjects: [...draft.subjects, { id: nextId, name: "", difficulty: "medium" }],
    });
  }

  function removeSubject(id: number) {
    onChange({ ...draft, subjects: draft.subjects.filter((s) => s.id !== id) });
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Your time</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="hours">Total study hours</Label>
            <Input
              id="hours"
              type="number"
              inputMode="decimal"
              min={0}
              max={24}
              step={0.5}
              placeholder="e.g. 6"
              value={draft.hours}
              onChange={(e) => onChange({ ...draft, hours: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="break">Break min per hour</Label>
            <Input
              id="break"
              type="number"
              inputMode="numeric"
              min={0}
              max={30}
              value={draft.breakPerHour}
              onChange={(e) => onChange({ ...draft, breakPerHour: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subjects</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {draft.subjects.map((subject, i) => (
            <div key={subject.id} className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Input
                  aria-label={`Subject ${i + 1} name`}
                  placeholder={`Subject ${i + 1}`}
                  value={subject.name}
                  onChange={(e) => updateSubject(subject.id, { name: e.target.value })}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove subject ${i + 1}`}
                  onClick={() => removeSubject(subject.id)}
                  disabled={draft.subjects.length === 1}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2" role="group" aria-label="Difficulty">
                {DIFFICULTIES.map((d) => (
                  <Button
                    key={d}
                    size="sm"
                    variant={subject.difficulty === d ? "default" : "outline"}
                    aria-pressed={subject.difficulty === d}
                    onClick={() => updateSubject(subject.id, { difficulty: d })}
                  >
                    {DIFFICULTY_LABELS[d]}
                  </Button>
                ))}
              </div>
            </div>
          ))}
          <Button variant="outline" onClick={addSubject}>
            <Plus className="h-4 w-4" />
            Add subject
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your plan</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          {totalMinutes === 0 || budgets.length === 0 ? (
            <p className="text-muted-foreground">
              Enter your hours and name at least one subject to see the split.
            </p>
          ) : (
            <>
              {budgets.map((b, i) => (
                <div key={i} className="flex items-center justify-between gap-4">
                  <span className="truncate">
                    {b.name}{" "}
                    <span className="text-muted-foreground">
                      · {DIFFICULTY_LABELS[b.difficulty]}
                    </span>
                  </span>
                  <span className="font-mono tabular-nums">
                    {formatDuration(b.budgetSeconds)}
                  </span>
                </div>
              ))}
              <div
                className={cn(
                  "flex items-center justify-between gap-4 border-t border-border pt-3",
                  "text-muted-foreground",
                )}
              >
                <span>Break allowance</span>
                <span className="font-mono tabular-nums">
                  {formatDuration(breakMinutes * 60)}
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Button size="lg" onClick={onStart} disabled={!canStart}>
        Start session
      </Button>
    </div>
  );
}
