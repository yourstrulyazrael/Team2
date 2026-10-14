"use client";

import dynamic from "next/dynamic";

// The app keeps its data in the browser (localStorage), which doesn't
// exist on the server. ssr: false tells Next.js to only render it in the
// browser, so it can read saved data on the very first render.
const StudyApp = dynamic(
  () => import("@/components/study-app").then((m) => m.StudyApp),
  { ssr: false },
);

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-8 sm:py-12">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Study Split</h1>
        <p className="text-sm text-muted-foreground">
          Split your study time by difficulty, one timer per subject.
        </p>
      </header>
      <StudyApp />
    </main>
  );
}
