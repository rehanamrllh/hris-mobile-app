create table if not exists public.leave_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (length(btrim(type)) > 0),
  start_date date not null,
  end_date date not null,
  reason text not null,
  status text not null default 'Pending',
  created_at timestamptz not null default now(),
  constraint leave_requests_end_date_after_start_date
    check (end_date >= start_date)
);

create index if not exists leave_requests_user_id_idx
  on public.leave_requests (user_id);

alter table public.leave_requests enable row level security;

drop policy if exists "Users can read their own leave requests"
  on public.leave_requests;
create policy "Users can read their own leave requests"
  on public.leave_requests
  for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Users can create their own leave requests"
  on public.leave_requests;
create policy "Users can create their own leave requests"
  on public.leave_requests
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "Users can update their own leave requests"
  on public.leave_requests;
create policy "Users can update their own leave requests"
  on public.leave_requests
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "Users can delete their own leave requests"
  on public.leave_requests;
create policy "Users can delete their own leave requests"
  on public.leave_requests
  for delete
  to authenticated
  using (user_id = (select auth.uid()));

grant select, insert, update, delete on public.leave_requests to authenticated;
