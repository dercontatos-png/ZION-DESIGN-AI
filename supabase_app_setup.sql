-- =============================================================================
-- SETUP DO PROJETO SUPABASE: ESTÚDIO ZION (dwyvpytblzqacnbfisuf)
-- Rode este script no Supabase Dashboard -> SQL Editor -> New query -> Run
-- =============================================================================

-- 1. Tabela de usuários (colunas usadas pelo app: id, email, role, data, updated_at)
CREATE TABLE IF NOT EXISTS public.users (
  id text PRIMARY KEY,
  email text,
  role text DEFAULT 'client',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Permissões para as roles do Supabase (anon e authenticated)
GRANT ALL ON public.users TO anon;
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;

-- 3. Row Level Security habilitado
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 4. POLÍTICA SEGURA (recomendada):
--    Só o usuário logado (authenticated) vê/altera o PRÓPRIO registro.
--    Anônimos (sem login) NÃO têm acesso a nada.
DROP POLICY IF EXISTS "Permitir acesso total público temporário" ON public.users;
DROP POLICY IF EXISTS "Usuário pode ver/editar o próprio registro" ON public.users;
CREATE POLICY "Usuário vê/edita apenas o próprio registro" ON public.users
  FOR ALL TO authenticated USING (auth.uid()::text = id) WITH CHECK (auth.uid()::text = id);
