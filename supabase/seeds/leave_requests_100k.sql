-- Development-only seed. Run manually after the leave_requests migration.
-- Replace the placeholder with the UUID of a dedicated test user before running.
do $seed$
declare
  requested_test_user_id constant uuid :=
    '00000000-0000-0000-0000-000000000000';
  target_user_id uuid;
  matching_users integer;
  seeded_rows integer;
begin
  select count(*)
    into matching_users
    from auth.users
   where id = requested_test_user_id;

  if matching_users <> 1 then
    raise exception
      'Expected exactly one dedicated test account; found % matching accounts.',
      matching_users;
  end if;

  select id
    into target_user_id
    from auth.users
   where id = requested_test_user_id;

  insert into public.leave_requests (
    id,
    user_id,
    type,
    start_date,
    end_date,
    reason,
    status,
    created_at
  )
  select
    (
      '00000000-0000-4000-8000-' || lpad(to_hex(request_number), 12, '0')
    )::uuid,
    target_user_id,
    (array['Cuti Tahunan', 'Izin Sakit', 'Cuti Pribadi', 'Cuti Keluarga'])
      [((request_number - 1) % 4 + 1)::integer],
    date '2024-01-01' + ((request_number - 1) % 1095)::integer,
    date '2024-01-01' + ((request_number - 1) % 1095)::integer
      + (request_number % 5)::integer,
    format('Data fiktif pengujian #%s', request_number),
    'Pending',
    timestamptz '2024-01-01 00:00:00+00'
      + (request_number - 1) * interval '1 minute'
  from generate_series(1, 100000) as requests(request_number)
  on conflict (id) do nothing;

  select count(*)
    into seeded_rows
    from public.leave_requests
   where user_id = target_user_id
     and id in (
       select (
         '00000000-0000-4000-8000-' || lpad(to_hex(request_number), 12, '0')
       )::uuid
         from generate_series(1, 100000) as requests(request_number)
     );

  if seeded_rows <> 100000 then
    raise exception
      'Expected 100000 seed rows for the test account; found %.',
      seeded_rows;
  end if;
end
$seed$;
