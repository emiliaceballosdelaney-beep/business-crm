-- Ensure clients table has RLS enabled and a policy that allows all operations
-- for the anon key. Without this, UPDATE/DELETE silently do nothing (no error,
-- 0 rows affected), which is the default RLS behavior when no matching policy exists.

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'clients' AND policyname = 'Allow all on clients'
  ) THEN
    CREATE POLICY "Allow all on clients"
      ON public.clients
      FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;
