-- Daily stats snapshots for the /cas-admin dashboard.
-- One row per day (America/New_York), written by the nightly cron at
-- /api/cas-admin/collect and read by /api/cas-admin/stats.
-- RLS enabled with no policies: only the service_role key can read/write.

create table if not exists admin_daily_stats (
  day date primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table admin_daily_stats enable row level security;
