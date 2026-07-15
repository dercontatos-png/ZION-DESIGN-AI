CREATE TABLE IF NOT EXISTS public.users (
  id text PRIMARY KEY,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir acesso total público temporário" ON public.users;

CREATE POLICY "Permitir acesso total público temporário" ON public.users
  FOR ALL TO public USING (true) WITH CHECK (true);
