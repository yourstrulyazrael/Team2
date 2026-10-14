// The planning rules from docs/SPEC.md, kept in one place so every screen
// splits time the same way.

export type Difficulty = "easy" | "medium" | "hard";

export const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

// A "share" is how much of the study time a subject gets, relative to
// the others. A Hard subject gets twice as much time as an Easy one.
export const SHARES: Record<Difficulty, number> = {
  easy: 1,
  medium: 1.5,
  hard: 2,
};

export type PlannedSubject = {
  name: string;
  difficulty: Difficulty;
};

export type SubjectBudget = PlannedSubject & {
  budgetSeconds: number;
};

// Splits the study time (total minus break allowance) across subjects in
// proportion to their shares. Returns each subject with its budget.
export function splitBudgets(
  studyMinutes: number,
  subjects: PlannedSubject[],
): SubjectBudget[] {
  const totalShares = subjects.reduce((sum, s) => sum + SHARES[s.difficulty], 0);
  if (totalShares === 0 || studyMinutes <= 0) {
    return subjects.map((s) => ({ ...s, budgetSeconds: 0 }));
  }
  const secondsPerShare = (studyMinutes * 60) / totalShares;
  return subjects.map((s) => ({
    ...s,
    budgetSeconds: Math.round(secondsPerShare * SHARES[s.difficulty]),
  }));
}

// Formats a number of seconds as "1h 7m", rounded to the nearest minute.
export function formatDuration(seconds: number): string {
  const totalMinutes = Math.round(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}
