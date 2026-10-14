# 03 — Session timers

**What to build:** "Start session" opens the Session screen. Every
subject is listed with its budget and remaining time. Tapping a subject
makes it active; its countdown is shown large with Start / Pause. Only
one subject runs at a time — switching pauses the previous one. The
session is saved in the browser and survives a page refresh. Timers are
based on clock timestamps, not on counting ticks.

**Blocked by:** 02

**Status:** done

- [x] "Start session" opens the Session screen with every subject and its budget
- [x] Tapping a subject makes it active; Start / Pause control its countdown
- [x] Switching subject pauses the previous one; each keeps its own remaining time
- [x] Refreshing the page mid-session keeps all subjects and remaining times, including a running timer
- [x] Time stays correct when the tab is in the background
- [x] Works on the live URL
