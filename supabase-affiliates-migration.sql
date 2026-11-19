-- Faithful Kids affiliate program (Nov 2026).
-- Run once in Supabase -> SQL Editor. Service-role only: RLS on, no policies,
-- so nothing here is readable or writable with the anon key.
--
-- Money truth stays in Stripe. These tables are the ledger we compute FROM
-- Stripe (lib/affiliates-ledger.ts, run daily inside /api/leads/drip), plus
-- the affiliates themselves and the payouts we have sent.

create table if not exists public.affiliates (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text not null default 'applied'
    check (status in ('applied', 'active', 'declined', 'paused', 'closed')),
  name text not null,
  email text not null,
  website text,
  audience text,
  plan text,
  country text,
  -- The public link is faithfulkids.app/r/<code>. Lowercase letters, digits, hyphens.
  code text unique check (code is null or code ~ '^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$'),
  -- Secret for the private stats page /affiliates/account/<token>.
  token text unique,
  payout_method text not null default 'paypal',
  payout_email text,
  tax_form text not null default 'none' check (tax_form in ('none', 'w9', 'w8ben', 'w8bene')),
  tax_form_received_at timestamptz,
  terms_version text,
  terms_accepted_at timestamptz,
  approved_at timestamptz,
  decided_at timestamptz,
  admin_notes text,
  source text,
  ip_hash text
);
create index if not exists affiliates_email_idx on public.affiliates (lower(email));
create index if not exists affiliates_status_idx on public.affiliates (status);
alter table public.affiliates enable row level security;

create table if not exists public.affiliate_clicks (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  affiliate_id uuid not null references public.affiliates(id) on delete cascade,
  path text,
  referrer_host text
);
create index if not exists affiliate_clicks_aff_idx on public.affiliate_clicks (affiliate_id, at desc);
alter table public.affiliate_clicks enable row level security;

-- One row per Stripe subscription that carried an affiliate code at checkout.
create table if not exists public.affiliate_referrals (
  subscription_id text primary key,
  affiliate_id uuid not null references public.affiliates(id) on delete cascade,
  customer_id text,
  customer_email text,
  plan text,
  sub_status text,
  started_at timestamptz,
  first_paid_at timestamptz,
  flag text,             -- e.g. 'self_referral': no commission is ever earned
  updated_at timestamptz not null default now()
);
create index if not exists affiliate_referrals_aff_idx on public.affiliate_referrals (affiliate_id);
alter table public.affiliate_referrals enable row level security;

-- One row per paid invoice ('sale'), plus at most one 'adjustment' row per
-- invoice when a refund or dispute lands after that commission was paid out.
create table if not exists public.affiliate_commissions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,          -- '<invoice_id>' or '<invoice_id>:adj'
  kind text not null default 'sale' check (kind in ('sale', 'adjustment')),
  affiliate_id uuid not null references public.affiliates(id) on delete cascade,
  subscription_id text,
  invoice_id text not null,
  payment_intent text,
  amount_paid_cents integer not null default 0,
  refunded_cents integer not null default 0,
  commission_cents integer not null,
  charged_at timestamptz not null,
  payable_at timestamptz not null,
  status text not null default 'pending'
    check (status in ('pending', 'payable', 'paid', 'void')),
  void_reason text,
  payout_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists affiliate_commissions_aff_idx on public.affiliate_commissions (affiliate_id, status);
alter table public.affiliate_commissions enable row level security;

create table if not exists public.affiliate_payouts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  affiliate_id uuid not null references public.affiliates(id) on delete cascade,
  amount_cents integer not null,
  method text not null default 'paypal',
  sent_to text,
  reference text,                    -- PayPal transaction id
  note text
);
create index if not exists affiliate_payouts_aff_idx on public.affiliate_payouts (affiliate_id, created_at desc);
alter table public.affiliate_payouts enable row level security;

alter table public.affiliate_commissions
  drop constraint if exists affiliate_commissions_payout_fk;
alter table public.affiliate_commissions
  add constraint affiliate_commissions_payout_fk
  foreign key (payout_id) references public.affiliate_payouts(id) on delete set null;
