-- IFGT ID profiles and role-based administration
do $$ begin
  create type public.user_role as enum ('player', 'developer', 'moderator', 'admin');
exception when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  username text unique check (username ~ '^[a-z0-9_]{3,20}$'),
  avatar_url text,
  bio text,
  country text,
  ifgt_id text not null unique default ('IFGT-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))),
  role public.user_role not null default 'player',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create or replace function public.is_admin()
returns boolean language sql security definer stable set search_path = public
as $$ select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') $$;

drop policy if exists "Users read their profile" on public.profiles;
drop policy if exists "Users create their profile" on public.profiles;
drop policy if exists "Users update their profile" on public.profiles;
drop policy if exists "Admins manage profiles" on public.profiles;
drop policy if exists "Anyone can read email by username for login" on public.profiles;
create policy "Users read their profile" on public.profiles for select using (auth.uid() = id or public.is_admin());
create policy "Users create their profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users update their profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "Admins manage profiles" on public.profiles for update using (public.is_admin()) with check (public.is_admin());

create or replace function public.prevent_role_change()
returns trigger language plpgsql security definer set search_path = public
as $$ begin if old.role <> new.role and not public.is_admin() then raise exception 'Only admins can change roles'; end if; return new; end; $$;
drop trigger if exists protect_profile_role on public.profiles;
create trigger protect_profile_role before update on public.profiles for each row execute procedure public.prevent_role_change();

create or replace function public.create_profile_for_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$ begin insert into public.profiles (id, email) values (new.id, new.email); return new; end; $$;

create or replace function public.sync_profile_email_from_auth_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  update public.profiles
  set email = new.email,
      updated_at = now()
  where id = new.id;
  return new;
end;
$$;

create or replace function public.is_username_available(candidate text)
returns boolean language sql security definer stable set search_path = public
as $$
  select not exists (
    select 1
    from public.profiles
    where username = lower(trim(candidate))
  )
$$;

create or replace function public.get_login_email(candidate text)
returns text language sql security definer stable set search_path = public
as $$
  select email
  from public.profiles
  where username = lower(trim(candidate))
  limit 1
$$;

grant execute on function public.is_username_available(text) to anon, authenticated;
grant execute on function public.get_login_email(text) to anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.create_profile_for_new_user();
drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated after update of email on auth.users for each row execute procedure public.sync_profile_email_from_auth_user();

-- Content CMS
create table if not exists public.games (
  id uuid primary key default gen_random_uuid(), title text not null, slug text not null unique,
  genre text not null, platform text not null, description text not null,
  cover_gradient text not null default 'from-blue-950 via-slate-900 to-cyan-500',
  status text not null default 'In development', published boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.news_posts (
  id uuid primary key default gen_random_uuid(), title text not null, slug text not null unique,
  category text not null, excerpt text not null, body text not null,
  cover_gradient text not null default 'from-blue-700 to-slate-950', published boolean not null default false,
  published_at timestamptz, created_at timestamptz not null default now()
);
-- Existing tables from earlier experiments may be missing these CMS fields.
alter table public.games add column if not exists slug text;
alter table public.games add column if not exists genre text;
alter table public.games add column if not exists platform text;
alter table public.games add column if not exists description text;
alter table public.games add column if not exists cover_gradient text default 'from-blue-950 via-slate-900 to-cyan-500';
alter table public.games add column if not exists status text default 'In development';
alter table public.games add column if not exists published boolean not null default false;
alter table public.games add column if not exists created_at timestamptz not null default now();
alter table public.games add column if not exists cover_image_url text;
alter table public.games add column if not exists trailer_url text;
alter table public.games add column if not exists image_gallery jsonb not null default '[]'::jsonb;
alter table public.games add column if not exists video_gallery jsonb not null default '[]'::jsonb;
alter table public.news_posts add column if not exists slug text;
alter table public.news_posts add column if not exists category text;
alter table public.news_posts add column if not exists excerpt text;
alter table public.news_posts add column if not exists body text;
alter table public.news_posts add column if not exists cover_gradient text default 'from-blue-700 to-slate-950';
alter table public.news_posts add column if not exists published boolean not null default false;
alter table public.news_posts add column if not exists published_at timestamptz;
alter table public.news_posts add column if not exists created_at timestamptz not null default now();
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists country text;
alter table public.games enable row level security;
alter table public.news_posts enable row level security;
drop policy if exists "Public reads published games" on public.games;
drop policy if exists "Admins manage games" on public.games;
drop policy if exists "Public reads published news" on public.news_posts;
drop policy if exists "Admins manage news" on public.news_posts;
create policy "Public reads published games" on public.games for select using (published or public.is_admin());
create policy "Admins manage games" on public.games for all using (public.is_admin()) with check (public.is_admin());
create policy "Public reads published news" on public.news_posts for select using (published or public.is_admin());
create policy "Admins manage news" on public.news_posts for all using (public.is_admin()) with check (public.is_admin());

create table if not exists public.announcements (id uuid primary key default gen_random_uuid(), title text not null, body text not null, published boolean not null default false, created_at timestamptz not null default now());
create table if not exists public.developer_posts (id uuid primary key default gen_random_uuid(), title text not null, body text not null, image_url text, video_url text, published boolean not null default false, created_at timestamptz not null default now());
create table if not exists public.jobs (id uuid primary key default gen_random_uuid(), title text not null, team text not null, location text not null, description text not null, apply_url text, published boolean not null default false, created_at timestamptz not null default now());
alter table public.announcements enable row level security; alter table public.developer_posts enable row level security; alter table public.jobs enable row level security;
drop policy if exists "Public reads published announcements" on public.announcements;
drop policy if exists "Admins manage announcements" on public.announcements;
drop policy if exists "Public reads published developer posts" on public.developer_posts;
drop policy if exists "Admins manage developer posts" on public.developer_posts;
drop policy if exists "Public reads published jobs" on public.jobs;
drop policy if exists "Admins manage jobs" on public.jobs;
create policy "Public reads published announcements" on public.announcements for select using (published or public.is_admin());
create policy "Admins manage announcements" on public.announcements for all using (public.is_admin()) with check (public.is_admin());
create policy "Public reads published developer posts" on public.developer_posts for select using (published or public.is_admin());
create policy "Admins manage developer posts" on public.developer_posts for all using (public.is_admin()) with check (public.is_admin());
create policy "Public reads published jobs" on public.jobs for select using (published or public.is_admin());
create policy "Admins manage jobs" on public.jobs for all using (public.is_admin()) with check (public.is_admin());

-- After creating your first account, run this once with your own email.
-- update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'ksitahayasin@gmail.com');
