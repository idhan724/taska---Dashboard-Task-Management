-- ============================================
-- 1. TABLES
-- ============================================

create table public.users (
  id uuid not null,
  full_name text not null,
  created_at timestamp with time zone not null default now(),
  email text not null,
  constraint users_pkey primary key (id),
  constraint users_id_fkey foreign key (id) references auth.users (id) on delete cascade
) tablespace pg_default;

create table public.workspaces (
  id uuid not null default gen_random_uuid (),
  name text not null,
  description text null,
  owner_id uuid not null,
  created_at timestamp with time zone not null default now(),
  constraint workspaces_pkey primary key (id),
  constraint workspaces_owner_id_fkey foreign key (owner_id) references users (id) on delete cascade
) tablespace pg_default;

create table public.workspace_members (
  id uuid not null default gen_random_uuid (),
  workspace_id uuid not null,
  user_id uuid not null,
  role text not null,
  invited_by uuid null,
  joined_at timestamp with time zone null default now(),
  constraint workspace_members_pkey primary key (id),
  constraint workspace_members_workspace_id_user_id_key unique (workspace_id, user_id),
  constraint workspace_members_invited_by_fkey foreign key (invited_by) references users (id) on delete set null,
  constraint workspace_members_user_id_fkey foreign key (user_id) references users (id) on delete cascade,
  constraint workspace_members_workspace_id_fkey foreign key (workspace_id) references workspaces (id) on delete cascade,
  constraint workspace_members_role_check check (
    (role = any (array['owner'::text, 'member'::text]))
  )
) tablespace pg_default;

create table public.workspace_invite_links (
  id uuid not null default gen_random_uuid (),
  workspace_id uuid not null,
  token uuid not null default gen_random_uuid (),
  role text not null default 'member'::text,
  created_by uuid null,
  expires_at timestamp with time zone not null default (now() + '30 days'::interval),
  created_at timestamp with time zone not null default now(),
  constraint workspace_invite_links_pkey primary key (id),
  constraint workspace_invite_links_token_key unique (token),
  constraint workspace_invite_links_workspace_id_key unique (workspace_id),
  constraint workspace_invite_links_created_by_fkey foreign key (created_by) references users (id),
  constraint workspace_invite_links_workspace_id_fkey foreign key (workspace_id) references workspaces (id) on delete cascade
) tablespace pg_default;

create table public.projects (
  id uuid not null default gen_random_uuid (),
  workspace_id uuid not null,
  name text not null,
  description text null,
  color text not null default '#7c3aed'::text,
  created_at timestamp with time zone not null default now(),
  status text not null default 'active'::text,
  constraint projects_pkey primary key (id),
  constraint projects_workspace_id_fkey foreign key (workspace_id) references workspaces (id) on delete cascade,
  constraint projects_status_check check (
    (status = any (array['active'::text, 'paused'::text, 'completed'::text]))
  )
) tablespace pg_default;

create table public.tasks (
  id uuid not null default gen_random_uuid (),
  workspace_id uuid not null,
  title text not null,
  description text null,
  status text not null default 'todo'::text,
  priority text not null default 'medium'::text,
  due_date date null,
  position integer null default 0,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone null,
  project_id uuid not null,
  constraint tasks_pkey primary key (id),
  constraint tasks_project_id_fkey foreign key (project_id) references projects (id) on delete cascade,
  constraint tasks_workspace_id_fkey foreign key (workspace_id) references workspaces (id) on delete cascade,
  constraint tasks_priority_check check (
    (priority = any (array['low'::text, 'medium'::text, 'high'::text]))
  ),
  constraint tasks_status_check check (
    (status = any (array['todo'::text, 'in-progress'::text, 'done'::text]))
  )
) tablespace pg_default;

-- ============================================
-- 2. FUNCTIONS
-- ============================================

-- RLS helper functions (bypass RLS to avoid recursion — see is_workspace_member/owner)
create or replace function is_workspace_member(_workspace_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from workspace_members
    where workspace_id = _workspace_id
      and user_id = auth.uid()
  );
$$;

create or replace function is_workspace_owner(_workspace_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from workspace_members
    where workspace_id = _workspace_id
      and user_id = auth.uid()
      and role = 'owner'
  );
$$;

-- Trigger functions
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, full_name, email)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email
  );

  insert into public.workspaces (owner_id, name)
  values (
    new.id,
    'My Workspace'
  );

  return new;
end;
$$ language plpgsql security definer set search_path = public;

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end
$$ language plpgsql;

create or replace function sync_user_email()
returns trigger as $$
begin
  update public.users
  set email = new.email
  where id = new.id;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create or replace function handle_workspace_deleted()
returns trigger as $$
declare
  remaining_count int;
  new_workspace_id uuid;
  owner_still_exists boolean;
begin
  select exists(select 1 from auth.users where id = old.owner_id)
  into owner_still_exists;

  if not owner_still_exists then
    return old;
  end if;

  select count(*) into remaining_count
  from public.workspaces
  where owner_id = old.owner_id;

  if remaining_count = 0 then
    insert into public.workspaces (owner_id, name)
    values (old.owner_id, 'My Workspace')
    returning id into new_workspace_id;

    insert into public.workspace_members (workspace_id, user_id, role)
    values (new_workspace_id, old.owner_id, 'owner');
  end if;

  return old;
end;
$$ language plpgsql security definer set search_path = public;

create or replace function handle_new_workspace()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into workspace_members (workspace_id, user_id, role)
  values (new.id, new.owner_id, 'owner');
  return new;
end;
$$;

-- RPC functions (invite link flow)
create or replace function public.get_or_create_invite_link(p_workspace_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_link workspace_invite_links%rowtype;
begin
  if not is_workspace_owner(p_workspace_id) then
    raise exception 'NOT_WORKSPACE_OWNER' using errcode = 'P0005';
  end if;

  select * into v_link from workspace_invite_links where workspace_id = p_workspace_id;

  if v_link.id is null then
    insert into workspace_invite_links (workspace_id, created_by)
    values (p_workspace_id, auth.uid())
    returning * into v_link;
  elsif v_link.expires_at < now() then
    update workspace_invite_links
    set token = gen_random_uuid(),
        expires_at = now() + interval '30 days',
        created_by = auth.uid(),
        created_at = now()
    where id = v_link.id
    returning * into v_link;
  end if;

  return jsonb_build_object('token', v_link.token, 'expires_at', v_link.expires_at);
end;
$$;

grant execute on function public.get_or_create_invite_link(uuid) to authenticated;

create or replace function public.regenerate_invite_link(p_workspace_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_link workspace_invite_links%rowtype;
begin
  if not is_workspace_owner(p_workspace_id) then
    raise exception 'NOT_WORKSPACE_OWNER' using errcode = 'P0005';
  end if;

  insert into workspace_invite_links (workspace_id, created_by)
  values (p_workspace_id, auth.uid())
  on conflict (workspace_id) do update
    set token = gen_random_uuid(),
        expires_at = now() + interval '30 days',
        created_by = auth.uid(),
        created_at = now()
  returning * into v_link;

  return jsonb_build_object('token', v_link.token, 'expires_at', v_link.expires_at);
end;
$$;

grant execute on function public.regenerate_invite_link(uuid) to authenticated;

create or replace function public.preview_invite_link(p_token uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_link workspace_invite_links%rowtype;
  v_workspace_name text;
begin
  select * into v_link from workspace_invite_links where token = p_token;

  if v_link.id is null then
    raise exception 'INVALID_TOKEN' using errcode = 'P0001';
  end if;

  if v_link.expires_at < now() then
    raise exception 'INVITE_EXPIRED' using errcode = 'P0003';
  end if;

  select name into v_workspace_name from workspaces where id = v_link.workspace_id;

  return jsonb_build_object('workspace_name', v_workspace_name);
end;
$$;

grant execute on function public.preview_invite_link(uuid) to anon, authenticated;

create or replace function public.accept_invite_link(p_token uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_link workspace_invite_links%rowtype;
begin
  select * into v_link from workspace_invite_links where token = p_token;

  if v_link.id is null then
    raise exception 'INVALID_TOKEN' using errcode = 'P0001';
  end if;

  if v_link.expires_at < now() then
    raise exception 'INVITE_EXPIRED' using errcode = 'P0003';
  end if;

  insert into workspace_members (workspace_id, user_id, role, invited_by)
  values (v_link.workspace_id, auth.uid(), v_link.role, v_link.created_by)
  on conflict (workspace_id, user_id) do nothing;

  return jsonb_build_object('workspace_id', v_link.workspace_id);
end;
$$;

grant execute on function public.accept_invite_link(uuid) to authenticated;

-- ============================================
-- 3. TRIGGERS
-- ============================================

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

create or replace trigger on_auth_user_updated
  after update on auth.users
  for each row execute function sync_user_email();

create or replace trigger tasks_updated_at
  before update on tasks
  for each row execute function update_updated_at();

create or replace trigger on_workspace_created
  after insert on workspaces
  for each row execute function handle_new_workspace();

create or replace trigger on_workspace_deleted
  after delete on workspaces
  for each row execute function handle_workspace_deleted();

-- ============================================
-- 4. ROW LEVEL SECURITY
-- ============================================

alter table public.users enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.workspace_invite_links enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;

-- users
create policy "users can update own profile"
on public.users
for update
using (auth.uid() = id);

create policy "users can view workspace members profiles"
on public.users
for select
using (
  auth.uid() = id
  or exists (
    select 1 from workspace_members
    where workspace_members.user_id = users.id
      and is_workspace_member(workspace_members.workspace_id)
  )
);

-- workspaces
create policy "users can create workspace"
on public.workspaces
for insert
with check (auth.uid() = owner_id);

create policy "members can view their workspaces"
on public.workspaces
for select
using (is_workspace_member(id));

create policy "only owner can update workspace"
on public.workspaces
for update
using (owner_id = auth.uid());

create policy "only owner can delete workspace"
on public.workspaces
for delete
using (owner_id = auth.uid());

-- workspace_members
create policy "members can view workspace member"
on public.workspace_members
for select
using (is_workspace_member(workspace_id));

create policy "owner can insert members"
on public.workspace_members
for insert
with check (is_workspace_owner(workspace_id) or auth.uid() = user_id);

create policy "owner can delete members"
on public.workspace_members
for delete
using (is_workspace_owner(workspace_id) or auth.uid() = user_id);

-- workspace_invite_links
create policy "workspace_invite_links_select_by_owner"
on public.workspace_invite_links
for select
using (is_workspace_owner(workspace_id));

create policy "workspace_invite_links_insert_by_owner"
on public.workspace_invite_links
for insert
with check (is_workspace_owner(workspace_id));

create policy "workspace_invite_links_update_by_owner"
on public.workspace_invite_links
for update
using (is_workspace_owner(workspace_id));

-- projects
create policy "members can view project"
on public.projects
for select
using (is_workspace_member(workspace_id));

create policy "members can create project"
on public.projects
for insert
with check (is_workspace_member(workspace_id));

create policy "members can update project"
on public.projects
for update
using (is_workspace_member(workspace_id));

create policy "only owner can delete project"
on public.projects
for delete
using (is_workspace_owner(workspace_id));

-- tasks
create policy "members can view task"
on public.tasks
for select
using (is_workspace_member(workspace_id));

create policy "members can create task"
on public.tasks
for insert
with check (is_workspace_member(workspace_id));

create policy "members can update tasks"
on public.tasks
for update
using (is_workspace_member(workspace_id));

create policy "members can delete task"
on "public"."tasks"
for delete
using (is_workspace_member(workspace_id));