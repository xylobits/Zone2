-- Demo clubs for local/dev testing. Run after the 3 migrations.
--
-- Profiles cannot be seeded here: each profiles row requires a matching auth.users row
-- (created by the handle_new_user trigger), and auth.users can only be created through
-- Supabase Auth — either by signing up real accounts at /signup, or via a one-off script
-- using the service-role key's Admin API (supabase.auth.admin.createUser). Do that first,
-- then re-run the "assign yourself to a club" block below with real profile ids.

insert into public.clubs (name, slug, description, city) values
  ('Riverside Run Club', 'riverside-run-club', 'Tuesday/Thursday tempo, Saturday long run.', 'Austin'),
  ('Iron Works', 'iron-works', 'Strength-focused gym partnered with Zone2.', 'Austin')
on conflict (slug) do nothing;
