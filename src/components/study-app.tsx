"use client";

import { useCallback, useEffect, useState } from "react";
import { History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HistoryScreen } from "@/components/history-screen";
import { EMPTY_PLAN, PlanScreen, readPlan, type PlanDraft } from "@/components/plan-screen";
import { SessionScreen } from "@/components/session-screen";
import { loadHistory, saveHistory, toHistoryEntry, type HistoryEntry } from "@/lib/history";
import { createSession, loadSession, saveSession, type Session } from "@/lib/session";

// The whole app. It only ever runs in the browser (see page.tsx), so it
// can read saved data from localStorage straight away.
export function StudyApp() {
  const [draft, setDraft] = useState<PlanDraft>(EMPTY_PLAN);
  const [session, setSession] = useState<Session | null>(() => loadSession());
  const [history, setHistory] = useState<HistoryEntry[]>(() => loadHistory());
  const [showHistory, setShowHistory] = useState(false);

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
    if (!session) return;
    if (!window.confirm("End this session and save it to History?")) return;
    const next = [toHistoryEntry(session, Date.now()), ...history];
    saveHistory(next);
    setHistory(next);
    setSession(null);
  }

  if (session) {
    return <SessionScreen session={session} update={update} onEnd={endSession} />;
  }

  if (showHistory) {
    return <HistoryScreen history={history} onBack={() => setShowHistory(false)} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <Button variant="outline" className="self-end" size="sm" onClick={() => setShowHistory(true)}>
        <History className="h-4 w-4" />
        History{history.length > 0 && ` (${history.length})`}
      </Button>
      <PlanScreen draft={draft} onChange={setDraft} onStart={startSession} />
    </div>
  );
}
