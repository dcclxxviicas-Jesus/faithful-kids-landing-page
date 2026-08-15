-- Leads table for email capture + nurture drip (landing page)
-- Run in Supabase SQL editor. Service-role only: no client policies on purpose.

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  magnet text not null default 'challenge',          -- 'challenge' | 'trivia-pack'
  source text not null default 'blog-inline',        -- 'blog-inline' | 'blog-exit' | 'quiz-exit'
  source_post text,                                  -- blog slug or 'quiz'
  quiz_answers jsonb,                                -- only for quiz-exit leads
  sequence_stage int not null default 0,             -- 0=none sent, 1..5 = last email sent
  next_send_at timestamptz,                          -- when the next drip email is due
  unsubscribed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists leads_due_idx on leads (next_send_at)
  where unsubscribed = false and sequence_stage < 5;

alter table leads enable row level security;
-- No policies: anon/authenticated clients get nothing; service_role bypasses RLS.
