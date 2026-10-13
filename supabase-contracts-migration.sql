-- Creator contracts (landing page). Run in the Supabase SQL editor.
-- Service-role only: RLS on with no policies, same as `leads`.
--
-- The row IS the contract. body_html is the exact document the signer saw,
-- frozen at send time, and body_sha256 is its fingerprint. Re-rendering from
-- the template later would not reproduce it if the template has changed, so
-- nothing ever re-renders a sent contract.

create table if not exists contracts (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,                 -- the personalised /sign/<token> link
  template text not null,                     -- contracts/<id>.md
  template_version text not null,             -- `version:` from that file at send time

  -- Three identities, because they diverge often: a manager may sign for the
  -- creator, and payment may go to an agency entity.
  talent_name text not null,                  -- the creator (the person on camera)
  talent_handle text,
  signer_name text not null,                  -- whoever actually signs
  signer_email text not null,
  signer_capacity text,                       -- null = the creator signs for themselves
  payee_name text,                            -- entity paid, if not the creator

  vars jsonb not null default '{}'::jsonb,    -- this deal's terms, structured
  body_html text not null,                    -- FROZEN rendered contract
  body_sha256 text not null,

  status text not null default 'sent',        -- sent | viewed | signed | voided
  sent_at timestamptz not null default now(),
  expires_at timestamptz not null,
  first_viewed_at timestamptz,
  signed_at timestamptz,
  voided_at timestamptz,
  void_reason text,

  -- ESIGN/UETA evidence
  signer_typed_name text,
  signer_ip text,
  signer_user_agent text,
  consent_electronic boolean not null default false,

  -- A creator who brought their own paper (it happens — one already has).
  -- Recorded so the dashboard stays a complete deal register.
  external boolean not null default false,
  external_note text,

  created_at timestamptz not null default now()
);

create index if not exists contracts_status_idx on contracts (status, sent_at desc);
create index if not exists contracts_email_idx on contracts (signer_email);

-- An executed contract is immutable. This is enforced here rather than in
-- application code on purpose: the audit trail is only worth anything if
-- nothing can quietly rewrite it, including us.
create or replace function contracts_freeze_executed() returns trigger
language plpgsql as $$
begin
  if old.signed_at is not null then
    raise exception 'contract % is executed and cannot be modified or deleted', old.id;
  end if;
  return new;
end;
$$;

drop trigger if exists contracts_no_update_after_signed on contracts;
create trigger contracts_no_update_after_signed
  before update on contracts
  for each row execute function contracts_freeze_executed();

drop trigger if exists contracts_no_delete_after_signed on contracts;
create trigger contracts_no_delete_after_signed
  before delete on contracts
  for each row execute function contracts_freeze_executed();

alter table contracts enable row level security;
-- No policies: anon/authenticated get nothing; service_role bypasses RLS.
