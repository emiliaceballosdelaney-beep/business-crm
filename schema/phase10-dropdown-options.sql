-- Custom dropdown options (source, income_source, finance_tools)
-- Stored per category so new values added by the user persist across all clients.

create table if not exists dropdown_options (
  id         uuid        primary key default gen_random_uuid(),
  category   text        not null,
  value      text        not null,
  created_at timestamptz default now(),
  constraint dropdown_options_unique unique (category, value)
);

alter table dropdown_options enable row level security;

create policy "anon_read_dropdown_options"
  on dropdown_options for select
  using (true);

create policy "anon_insert_dropdown_options"
  on dropdown_options for insert
  with check (true);
