alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists country text;

drop policy if exists "Anyone can read email by username for login" on public.profiles;

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

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated after update of email on auth.users for each row execute procedure public.sync_profile_email_from_auth_user();
