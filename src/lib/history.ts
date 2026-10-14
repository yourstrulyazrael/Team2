// Finished sessions, kept in the browser's localStorage (newest first).

import type { Difficulty } from "@/lib/plan";
import { allowanceLeftMs, endBreak, pause, type Session } from "@/lib/session";

export type HistoryEntry = {
  startedAt: number;
  endedAt: number;
  totalMinutes: number;
  breakAllowanceSeconds: number;
  breakUsedSeconds: number;
  subjects: {
    name: string;
    difficulty: Difficulty;
    plannedSeconds: number; // budget plus any "+15 min" added
    spentSeconds: number;
  }[];
};

// Freezes a session into a history entry: stops any running timer or
// break first so the time spent is final.
export function toHistoryEntry(session: Session, now: number): HistoryEntry {
  const s = endBreak(pause(session, now), now);
  return {
    startedAt: s.startedAt,
    endedAt: now,
    totalMinutes: s.totalMinutes,
    breakAllowanceSeconds: s.breakAllowanceSeconds,
    breakUsedSeconds: s.breakAllowanceSeconds - allowanceLeftMs(s, now) / 1000,
    subjects: s.subjects.map((sub) => ({
      name: sub.name,
      difficulty: sub.difficulty,
      plannedSeconds: sub.budgetSeconds + sub.extraSeconds,
      spentSeconds: Math.round(sub.spentMs / 1000),
    })),
  };
}

// Wrapped in try/catch because some browsers (e.g. private mode) block
// localStorage — the app still works, history just won't be kept.
const STORAGE_KEY = "study-split:history:v1";

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveHistory(history: HistoryEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // Storage unavailable — nothing to do.
  }
}
