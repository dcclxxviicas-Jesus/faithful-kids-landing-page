-- Faithful Kids Weekly send log (Nov 16, 2026). Run once in the Supabase SQL
-- editor. One row per (issue, address): the primary key is what guarantees an
-- issue can never go twice to the same person, even if "Send" is pressed twice.
create table if not exists newsletter_sends (
  issue_id   text not null,
  email      text not null,
  status     text not null default 'sending' check (status in ('sending', 'sent', 'failed')),
  resend_id  text,
  error      text,
  created_at timestamptz not null default now(),
  sent_at    timestamptz,
  primary key (issue_id, email)
);
create index if not exists newsletter_sends_issue_idx on newsletter_sends (issue_id, status);
-- Service role only, like the other Parenting tables: RLS on, no policies.
alter table newsletter_sends enable row level security;
