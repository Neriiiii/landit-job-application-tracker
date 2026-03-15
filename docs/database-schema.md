# Database Schema

Source of truth: migration files in `supabase/migrations/` (01–05). For **new** setups, run migrations 01–05 in order. **Existing** databases that already ran the previous 001–027 set need no re-run.

## Main tables

- **job_applications** — User applications: company, role, link, description, notes, current_status (Wishlist, Applied, Interview, Offer, Rejected, Ghosted), archived, resume_file_id, cover_letter_file_id, is_fake.
- **job_offers** — One row per application with offer details (salary, benefits, start date, accepted_at).
- **interviews** — Rounds per application: date, time, type (Phone, Video, Onsite), meeting_link, status, round_label.
- **application_status_history** — One row per status change for an application.
- **job_links** — User-defined quick links (name, url, sort_order, color).
- **activity_log** — Optional audit trail (entity_type, entity_id, action).
- **resume_files** — Metadata for PDFs in Storage (user_id, name, file_path, file_size, role, uploaded_at, is_fake).
- **cover_letter_files** — Metadata for cover letter PDFs.
- **user_settings** — Per user: weekly_application_goal.
- **checklist_items** — User checklist (name, description, link, status, sort_order, is_fake).
- **interview_question_categories** — User-defined categories (title, description, sort_order).
- **interview_questions** — Questions per category (question, sort_order).
- **interview_question_notes** — Per-user, per-question notes (user_id, question_id, notes).

## Storage buckets

- **resumes** — Resume PDFs (path: userId/resume-files/).
- **cover-letters** — Cover letter PDFs.
- **avatars** — Profile images (public read).

All tables use RLS; policies restrict access to the current user’s rows (or rows tied to their applications).
