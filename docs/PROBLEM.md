# Study Split

## Who
A student studying several subjects in one sitting, especially during
exam week. Specifically: our own team member, plus testers Miki, Ryne
and Jaylo.

## The struggle
Every time we study, and worst during exam week, we spend too much time
on one subject and leave the others behind. We have personally lived
this: one subject took over the session and the rest got little or no
time.

## Today's workaround
A self-built timer app with break, lunch and pause options. It tracks
how much time was spent on each subject, but only *after* the fact. It
never says in advance how much time each subject should get, so it does
not stop one subject from eating the whole session.

## The MVP
Enter your total study hours and your subjects (rated Easy, Medium or
Hard); the app sets aside a break allowance, splits the rest by
difficulty, and gives each subject its own countdown timer that you can
start, pause, switch between and extend when time runs out.

Agreed rules:
- Shares: Easy = 1, Medium = 1.5, Hard = 2.
- Break allowance: 10 minutes per study hour by default, set aside from
  the total before splitting. Breaks only use the allowance, never a
  subject's budget.
- Break types: Short break (10 min) and Lunch (45 min).
- When a subject's budget runs out: the app asks "+15 min" or "Switch
  subject". The extra 15 minutes is added on top of the plan, not taken
  from other subjects.
- Saving: everything stays in the browser (localStorage). No login, no
  personal data stored on a server.
- History: a list of past sessions with date, subjects and actual time
  spent on each.

## How we'll know it worked
Demo (three minutes): enter 6 hours → add 3 subjects (Easy / Medium /
Hard) → see the split → start a subject → pause → switch subjects → take
a break → a subject runs out → choose "+15 min" or "Switch".

Before Session 3, Miki, Ryne and Jaylo each use it for one real study
session and tell us whether they covered all their subjects.

## Out of scope
- Accounts and login (username/password)
- Syncing sessions between devices
- Custom difficulty weights beyond Easy / Medium / Hard
- Custom break schedules (beyond Short break and Lunch)
- Auto-advancing to the next subject when time runs out

## Glossary
- **Session**: one study sitting, from entering your hours to finishing.
- **Subject**: one course studied in a session, with a difficulty rating.
- **Share**: the difficulty weight that decides how much time a subject
  gets (Easy 1, Medium 1.5, Hard 2).
- **Budget**: the planned time for one subject.
- **Break allowance**: time set aside for breaks out of the total hours.
