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
  if (i === null || session.runningSince !== null || remainingMs(session, i, now) <= 0) {
    return session;
  }
  return { ...session, runningSince: now };
}

// Selecting a subject pauses whichever one was running.
export function select(session: Session, index: number, now: number): Session {
  if (index === session.activeIndex) return session;
  return { ...pause(session, now), activeIndex: index };
}

// Stops the running timer once its subject's budget is used up.
export function stopIfFinished(session: Session, now: number): Session {
  const i = session.activeIndex;
  if (i === null || session.runningSince === null) return session;
  return remainingMs(session, i, now) <= 0 ? pause(session, now) : session;
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
