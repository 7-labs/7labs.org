-- Base Supabase / PostgreSQL schema for the English-first 7labs.org MVP.

create table if not exists users_profile (
  id uuid primary key,
  email text unique,
  plan text not null default 'free' check (plan in ('free', 'pro', 'team', 'admin')),
  credits integer not null default 20 check (credits >= 0),
  created_at timestamptz default now()
);

create table if not exists tool_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users_profile(id),
  tool_slug text not null,
  input jsonb not null,
  output text,
  token_estimate integer default 0,
  created_at timestamptz default now()
);

create table if not exists saved_prompts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users_profile(id),
  title text not null,
  tool_slug text,
  prompt text not null,
  tags text[] default '{}',
  created_at timestamptz default now()
);

create table if not exists ai_tools_catalog (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  category text not null,
  url text,
  pricing_note text,
  free_tier text,
  english_fit text,
  strengths text[] default '{}',
  limitations text[] default '{}',
  tags text[] default '{}',
  last_verified_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users_profile(id),
  tool_slug text not null,
  rating integer check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

create index if not exists idx_tool_runs_user_created_at on tool_runs(user_id, created_at desc);
create index if not exists idx_tool_runs_tool_created_at on tool_runs(tool_slug, created_at desc);
create index if not exists idx_saved_prompts_user_created_at on saved_prompts(user_id, created_at desc);
create index if not exists idx_feedback_tool_created_at on feedback(tool_slug, created_at desc);
create index if not exists idx_ai_tools_catalog_category on ai_tools_catalog(category);
create index if not exists idx_ai_tools_catalog_last_verified_at on ai_tools_catalog(last_verified_at desc);

alter table users_profile enable row level security;
alter table tool_runs enable row level security;
alter table saved_prompts enable row level security;
alter table ai_tools_catalog enable row level security;
alter table feedback enable row level security;

-- Supabase production note:
-- Add owner-only policies that bind users_profile.id to auth.uid() before exposing
-- these tables to browser clients. Keep tool_runs.input and tool_runs.output out of
-- analytics events, define a retention window, and avoid storing secrets or private
-- documents unless paid-user deletion/export controls are implemented.
