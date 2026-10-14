// A study session and the rules for its timers.
//
// Timers are based on clock timestamps, not on counting ticks: we store
// how much time was spent before the timer last started (spentMs) and
// WHEN it started (runningSince). Time spent = spentMs + (now - runningSince).
// This stays correct when the tab is in the background or the page is
// refreshed, because the clock keeps moving even when our code isn't running.

import type { SubjectBudget } from "@/lib/plan";

export type SessionSubject = SubjectBudget & {
  extraSeconds: number; // time added with "+15 min" (Ticket 05)
  spentMs: number; // time spent, not counting the current running stretch
};

export type Session = {
  startedAt: number;
  totalMinutes: number;
  breakAllowanceSeconds: number;
  breakUsedSeconds: number;
  subjects: SessionSubject[];
  activeIndex: number | null; // which subject is selected
  runningSince: number | null; // when the active subject's timer started, or null if paused
  timeUpIndex?: number | null; // subject whose time just ran out; shows the time's up prompt
  // Breaks (Ticket 04). Older saved sessions won't have these, hence "?".
  breakSince?: number | null; // when the current break started, or null if not on a break
  breakLengthSeconds?: number | null; // how long the current break lasts
  breakOver?: boolean; // true when a break just finished; shows the reminder
};

export function createSession(
  totalMinutes: number,
  breakMinutes: number,
  budgets: SubjectBudget[],
  now: number,
): Session {
  return {
    startedAt: now,
    totalMinutes,
    breakAllowanceSeconds: Math.round(breakMinutes * 60),
    breakUsedSeconds: 0,
    subjects: budgets.map((b) => ({ ...b, extraSeconds: 0, spentMs: 0 })),
    activeIndex: null,
    runningSince: null,
    timeUpIndex: null,
    breakSince: null,
    breakLengthSeconds: null,
    breakOver: false,
  };
}

export function budgetMs(subject: SessionSubject) {
  return (subject.budgetSeconds + subject.extraSeconds) * 1000;
}

export function spentMs(session: Session, index: number, now: number) {
  const subject = session.subjects[index];
  const running = session.activeIndex === index && session.runningSince !== null;
  const stretch = running ? Math.max(0, now - session.runningSince!) : 0;
  return Math.min(budgetMs(subject), subject.spentMs + stretch);
}

export function remainingMs(session: Session, index: number, now: number) {
  return budgetMs(session.subjects[index]) - spentMs(session, index, now);
}

export function pause(session: Session, now: number): Session {
  if (session.activeIndex === null || session.runningSince === null) return session;
  const i = session.activeIndex;
  const spent = spentMs(session, i, now);
  return {
    ...session,
    runningSince: null,
    subjects: session.subjects.map((s, j) => (j === i ? { ...s, spentMs: spent } : s)),
  };
}

export function start(session: Session, now: number): Session {
  const i = session.activeIndex;
  if (
    i === null ||
    session.runningSince !== null ||
    isOnBreak(session) ||
    remainingMs(session, i, now) <= 0
  ) {
    return session;
  }
  return { ...session, runningSince: now, breakOver: false };
}

// Selecting a subject pauses whichever one was running.
export function select(session: Session, index: number, now: number): Session {
  if (index === session.activeIndex) return session;
  return { ...pause(session, now), activeIndex: index, breakOver: false };
}

// Checked several times a second: stops a subject whose budget is used
// up (and shows the time's up prompt), and ends a break whose time is up
// (and shows the break-over reminder).
export function stopIfFinished(session: Session, now: number): Session {
  if (isOnBreak(session) && breakRemainingMs(session, now) <= 0) {
    return { ...endBreak(session, now), breakOver: true };
  }
  const i = session.activeIndex;
  if (i === null || session.runningSince === null) return session;
  if (remainingMs(session, i, now) > 0) return session;
  return { ...pause(session, now), timeUpIndex: i };
}

// --- Breaks -------------------------------------------------------------
// Breaks come out of the break allowance, never out of a subject's budget.

export const BREAKS = [
  { label: "Short break", seconds: 10 * 60 },
  { label: "Lunch", seconds: 45 * 60 },
];

export function isOnBreak(session: Session) {
  return session.breakSince != null;
}

function breakElapsedMs(session: Session, now: number) {
  if (session.breakSince == null) return 0;
  const length = (session.breakLengthSeconds ?? 0) * 1000;
  return Math.min(length, Math.max(0, now - session.breakSince));
}

export function breakRemainingMs(session: Session, now: number) {
  return (session.breakLengthSeconds ?? 0) * 1000 - breakElapsedMs(session, now);
}

// Break allowance left, counting a break that is happening right now.
export function allowanceLeftMs(session: Session, now: number) {
  const used = session.breakUsedSeconds * 1000 + breakElapsedMs(session, now);
  return Math.max(0, session.breakAllowanceSeconds * 1000 - used);
}

// Starts a break: pauses the active subject. A break never runs longer
// than the allowance that is left.
export function startBreak(session: Session, seconds: number, now: number): Session {
  if (isOnBreak(session)) return session;
  const length = Math.min(seconds, allowanceLeftMs(session, now) / 1000);
  if (length <= 0) return session;
  return {
    ...pause(session, now),
    breakSince: now,
    breakLengthSeconds: length,
    breakOver: false,
  };
}

// Ends the break (early or on time). Only the time actually taken is
// counted against the allowance. The subject stays paused.
export function endBreak(session: Session, now: number): Session {
  if (!isOnBreak(session)) return session;
  return {
    ...session,
    breakUsedSeconds: session.breakUsedSeconds + breakElapsedMs(session, now) / 1000,
    breakSince: null,
    breakLengthSeconds: null,
  };
}

export function dismissBreakOver(session: Session): Session {
  return { ...session, breakOver: false };
}

// "+15 min": adds time on top of the plan for this subject only (not
// taken from other subjects) and carries on studying it.
export const EXTEND_SECONDS = 15 * 60;

export function extend(session: Session, index: number, now: number): Session {
  const paused = pause(session, now);
  return {
    ...paused,
    subjects: paused.subjects.map((s, j) =>
      j === index ? { ...s, extraSeconds: s.extraSeconds + EXTEND_SECONDS } : s,
    ),
    activeIndex: index,
    runningSince: now,
    timeUpIndex: null,
  };
}

// "Switch subject": closes the prompt so the student can pick another.
export function dismissTimeUp(session: Session): Session {
  return { ...session, activeIndex: null, timeUpIndex: null };
}

// Formats milliseconds as a clock: "1:06:40" or "4:05".
export function formatClock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${ss}` : `${m}:${ss}`;
}

// Saving to localStorage: a small storage area in the browser that
// survives a page refresh. Wrapped in try/catch because some browsers
// (e.g. private mode) block it — the app still works, it just won't save.
const STORAGE_KEY = "study-split:session:v1";

export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function saveSession(session: Session | null) {
  try {
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage unavailable — nothing to do.
  }
}
