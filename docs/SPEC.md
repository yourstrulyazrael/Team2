# Spec: Study Split

## Problem
When I study several subjects in one sitting, especially during exam
week, one subject takes over and the others get left behind. My current
timer only tells me how long I spent after the fact; it never tells me in
advance how much time each subject should get.

## Solution
I enter my total study hours and my subjects, each rated Easy, Medium or
Hard. The app sets aside a break allowance, splits the rest into a budget
for each subject by difficulty, and gives each subject its own countdown
timer. I can start, pause and switch between subjects, take breaks, and
when a subject's time is up the app asks whether to add 15 minutes or
switch subject. Finished sessions are kept in a history list.

## The user
A student studying several subjects in one sitting on their own device.
No accounts; one person per browser.

## User stories
1. As a student, I want to enter my total study hours and my subjects
   with a difficulty, so that I know in advance how much time each
   subject gets.
2. As a student, I want harder subjects to get a bigger budget (Easy 1,
   Medium 1.5, Hard 2 shares), so that my time matches the effort each
   subject needs.
3. As a student, I want a separate timer for each subject that I can
   start, pause and switch between, so that I can move between subjects
   without losing track.
4. As a student, I want to take a Short break or Lunch that comes out of
   a break allowance, so that resting never eats into a subject's budget.
5. As a student, I want to be told when a subject's budget runs out and
   choose "+15 min" or "Switch subject", so that I don't overspend on one
   subject without deciding to.
6. As a student, I want my session to survive a page refresh, so that an
   accidental reload doesn't wipe my progress.
7. As a student, I want to see a history of past sessions with planned
   versus actual time per subject, so that I can see whether I'm
   balancing my subjects.

## Screens
1. **Plan**: enter total study hours, adjust the break allowance
   (default 10 minutes per study hour), and add subjects with a name and
   a difficulty (Easy / Medium / Hard). A live preview shows each
   subject's budget. "Start session" begins the session.
2. **Session**: every subject is listed with its budget and remaining
   time. Tapping a subject makes it the active subject; its countdown is
   shown large with Start / Pause. Only one subject runs at a time —
   switching pauses the previous one. Short break (10 min) and Lunch
   (45 min) buttons pause the active subject and count down; the
   remaining break allowance is shown, and a break never runs longer
   than what is left of it. When a break ends, the app shows a reminder
   and the subject stays paused until Start is pressed. When a subject's
   budget reaches zero, a short sound plays and a prompt offers "+15 min"
   (added on top of the plan) or "Switch subject". "End session" saves
   the session to History and returns to Plan.
3. **History**: past sessions, newest first, each showing the date and,
   for each subject, the planned budget versus the time actually spent.

## Data
No Supabase tables. All data is stored in the browser's localStorage:

- **Current session**: total hours, break allowance and break time used,
  which subject is active and whether a timer or break is running, and
  for each subject its name, difficulty, budget, any extra time added and
  time spent.
- **History**: a list of finished sessions — date, total hours, break
  time used, and each subject's name, difficulty, budget and time spent.

Who may read and write: only the person using that browser. Nothing is
sent to a server, so there is no Row Level Security to configure and no
personal data stored anywhere. Trade-off: clearing browser data erases
history, and history does not follow you to another device.

Timers must be based on clock timestamps (when a timer started), not on
counting ticks, so the time stays correct if the tab is in the background
or the page is refreshed.

## Login
No. The app works fully without accounts.

## Done for the demo
On the live Vercel URL:
- [ ] Enter 6 hours and 3 subjects (Easy, Medium, Hard); the preview
      shows 5 hours split 1h 7m / 1h 40m / 2h 13m and 60 min of break
      allowance.
- [ ] Start a subject, pause it, switch to another; each keeps its own
      remaining time.
- [ ] Take a Short break; the allowance goes down and the subject stays
      paused afterwards.
- [ ] A subject reaching zero plays a sound and offers "+15 min" or
      "Switch subject"; both work.
- [ ] Refreshing the page mid-session keeps everything.
- [ ] "End session" adds the session to History with planned vs actual
      time.
- [ ] Works on a phone screen.

## Out of scope
- Accounts and login (username/password)
- Saving sessions to Supabase (e.g. with anonymous sign-in)
- Syncing sessions between devices
- Custom difficulty weights beyond Easy / Medium / Hard
- Custom break schedules beyond Short break and Lunch
- Auto-advancing to the next subject when time runs out
