# Later

Good ideas that are not in the MVP.

Parking something here is a decision, not a loss. It is how the MVP
stays small enough to actually ship by Session 3.


## From /grill-with-docs (Study Split)

- **Accounts and login** (username/password, no email). Wanted for
  keeping history; the MVP keeps history in the browser instead. Note:
  Supabase auth expects an email, and username-only means no password
  reset.
- **Syncing sessions between devices** (phone and laptop).
- **Custom difficulty weights** beyond Easy 1 / Medium 1.5 / Hard 2.
- **Custom break schedules** beyond Short break (10 min) and Lunch (45 min).
- **Auto-advancing** to the next subject when a timer runs out.
- **Saving history to Supabase** using anonymous sign-in (a hidden ID per
  browser, no login screen) with a `study_sessions` table and RLS so each
  browser only sees its own rows. Discussed in /to-spec; the team chose
  localStorage for the MVP.
