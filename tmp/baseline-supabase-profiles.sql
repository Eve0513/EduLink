-- EduLink additive migration: secure invite-code regeneration.
-- Safe to execute after the previous onboarding/membership migration.

create or replace function public.regenerate_company_invite_code()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  target_company_id uuid;
  new_code text;
begin
  select company_id into target_company_id
  from public.company_members
  where user_id = auth.uid() and role = 'admin'
  order by created_at asc
  limit 1;

  if target_company_id is null then
    raise exception 'Only a company administrator can regenerate an invite code';
  end if;

  loop
    new_code := public.generate_16_char_code();
    begin
      update public.companies
      set invite_code = new_code, updated_at = timezone('utc', now())
      where id = target_company_id;
      exit;
    exception when unique_violation then
      -- Generate again if the unique invite-code index detects a collision.
    end;
  end loop;

  return new_code;
end;
$$;

create or replace function public.regenerate_institution_invite_code()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  target_institution_id uuid;
  new_code text;
begin
  select institution_id into target_institution_id
  from public.institution_members
  where user_id = auth.uid() and role = 'admin'
  order by created_at asc
  limit 1;

  if target_institution_id is null then
    raise exception 'Only an institution administrator can regenerate an invite code';
  end if;

  loop
    new_code := public.generate_16_char_code();
    begin
      update public.institutions
      set invite_code = new_code, updated_at = timezone('utc', now())
      where id = target_institution_id;
      exit;
    exception when unique_violation then
      -- Generate again if the unique invite-code index detects a collision.
    end;
  end loop;

  return new_code;
end;
$$;

revoke all on function public.regenerate_company_invite_code() from public;
revoke all on function public.regenerate_institution_invite_code() from public;
grant execute on function public.regenerate_company_invite_code() to authenticated;
grant execute on function public.regenerate_institution_invite_code() to authenticated;
