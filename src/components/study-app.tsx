"use client";

import { useCallback, useEffect, useState } from "react";
import { EMPTY_PLAN, PlanScreen, readPlan, type PlanDraft } from "@/components/plan-screen";
import { SessionScreen } from "@/components/session-screen";
import { createSession, loadSession, saveSession, type Session } from "@/lib/session";

// The whole app. It only ever runs in the browser (see page.tsx), so it
// can read the saved session from localStorage straight away.
export function StudyApp() {
  const [draft, setDraft] = useState<PlanDraft>(EMPTY_PLAN);
  const [session, setSession] = useState<Session | null>(() => loadSession());

  // Save the session every time it changes, so a refresh picks up where
  // the student left off.
  useEffect(() => {
    saveSession(session);
  }, [session]);

  const update = useCallback((change: (s: Session) => Session) => {
    setSession((s) => (s ? change(s) : s));
  }, []);

  function startSession() {
    const { totalMinutes, breakMinutes, budgets } = readPlan(draft);
    setSession(createSession(totalMinutes, breakMinutes, budgets, Date.now()));
  }

  function endSession() {
    // Ticket 06 will save the session to History here.
    if (window.confirm("End this session? Your timers will be cleared.")) {
      setSession(null);
    }
  }

  return session ? (
    <SessionScreen session={session} update={update} onEnd={endSession} />
  ) : (
    <PlanScreen draft={draft} onChange={setDraft} onStart={startSession} />
  );
}
