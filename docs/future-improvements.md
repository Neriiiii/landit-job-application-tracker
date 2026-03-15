# Future Improvements

- Persist quick links in the database (job_links) so they sync across devices; currently some flows may use local storage.
- Email reminders for upcoming interviews (e.g. Supabase Edge or a cron job).
- Optional invite code for sign-up (env-driven) to limit access during beta.
- Bulk actions: archive multiple applications, move multiple cards.
- Export dashboard or pipeline data (e.g. CSV).
- Dark/light theme toggle in the UI (theme variables already exist).
- Accessibility: full keyboard navigation and screen reader coverage for Kanban and dialogs.
- Rate limiting and abuse protection for auth and file uploads beyond current in-memory limits.
