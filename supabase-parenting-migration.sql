-- Parenting editorial section (landing page). Run once in the Supabase SQL editor.
-- Three tables, service-role only: RLS on with NO policies, same as `leads`
-- and `contracts`. The site talks to them only through server routes holding
-- SUPABASE_SECRET_KEY; nothing here is ever readable from a browser.
--
-- Articles and author profiles are NOT in the database. They are Markdown in
-- the repo (content/parenting/), published through git like the blog.

-- ---------------------------------------------------------------- pitches
create table if not exists parenting_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  name text not null,
  email text not null,
  role text not null,                       -- Parent | Homeschool parent | ... (free text, from the form's list)
  topic text not null,                      -- working title
  pitch text not null,
  experience text,
  url text,                                 -- writing sample / website / profile
  wants_interview boolean not null default false,

  source text,                              -- page the form was on
  referrer text,
  ip_hash text,                             -- sha256(ip + day); never the raw address
  user_agent text,

  -- Received -> Under Review -> Accepted -> Drafting -> Editing -> Awaiting Approval -> Scheduled -> Published
  -- plus Declined | Withdrawn | Archived
  status text not null default 'received',
  assigned_to text,                         -- editor name
  notes text,                               -- private editorial notes (append-only by convention)
  consent_terms_at timestamptz,             -- ticked the terms box on submit
  consent_adult boolean not null default false,
  consent_publish_at timestamptz,           -- written permission to publish a specific piece, recorded by the editor
  consent_publish_note text,                -- how it was given (email date, etc.)
  article_slug text,                        -- content/parenting/<slug>.md once one exists
  author_slug text                          -- content/parenting/authors/<slug>.md once one exists
);
create index if not exists parenting_submissions_status_idx on parenting_submissions (status, created_at desc);
create index if not exists parenting_submissions_email_idx on parenting_submissions (email);
alter table parenting_submissions enable row level security;

-- ---------------------------------------------------------------- outreach
create table if not exists parenting_outreach (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  name text not null,
  organization text,
  email text,
  role text,
  relationship_source text,                 -- creator | church | publisher | homeschool | referral | ...
  expertise text,
  suggested_topic text,

  -- Not Contacted -> Contacted -> Interested -> Pitched -> Accepted -> Published; also Declined | Do Not Contact
  status text not null default 'not_contacted',
  last_contact_at timestamptz,
  next_follow_up_at date,
  notes text,
  contact_preference text,                  -- email | phone | do-not-contact | ...
  do_not_contact boolean not null default false,
  submission_id uuid references parenting_submissions (id) on delete set null,
  article_slug text
);
create index if not exists parenting_outreach_status_idx on parenting_outreach (status, updated_at desc);
alter table parenting_outreach enable row level security;

-- ------------------------------------------------------------ newsletter
-- Separate from `leads` on purpose: the printable drip is a five-email
-- sequence with its own state machine, and a person may legitimately be on
-- both lists. Double opt-in: a row is `pending` until the confirm link is
-- clicked. Nothing is ever sent to a pending or unsubscribed row.
create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  email text not null unique,
  list text not null default 'parenting-weekly',
  status text not null default 'pending',   -- pending | confirmed | unsubscribed
  source text,                              -- which card: parenting-home, article:<slug>, ...
  source_path text,
  consent_at timestamptz not null default now(),   -- the form submit
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  ip_hash text,
  user_agent text
);
create index if not exists newsletter_subscribers_status_idx on newsletter_subscribers (status, created_at desc);
alter table newsletter_subscribers enable row level security;

-- ------------------------------------------------------------ updated_at
create or replace function parenting_touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists parenting_submissions_touch on parenting_submissions;
create trigger parenting_submissions_touch before update on parenting_submissions
  for each row execute function parenting_touch_updated_at();

drop trigger if exists parenting_outreach_touch on parenting_outreach;
create trigger parenting_outreach_touch before update on parenting_outreach
  for each row execute function parenting_touch_updated_at();

drop trigger if exists newsletter_subscribers_touch on newsletter_subscribers;
create trigger newsletter_subscribers_touch before update on newsletter_subscribers
  for each row execute function parenting_touch_updated_at();
