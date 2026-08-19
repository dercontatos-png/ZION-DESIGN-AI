import { createClient } from '@supabase/supabase-js';

// =============================================================================
// CREDENCIAIS DO PROJETO SUPABASE ATUAL (produção)
// Projeto: ESTÚDIO ZION -> dwyvpytblzqacnbfisuf
// IMPORTANTE: valores fixos no código para que o build no Vercel NUNCA use as
// env vars antigas quebradas (com sufixo /rest/v1/) do dashboard.
// =============================================================================
export const supabaseUrl = "https://dwyvpytblzqacnbfisuf.supabase.co";

export const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3eXZweXRibHpxYWNuYmZpc3VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4MTAwNDcsImV4cCI6MjEwMTM4NjA0N30.k-dvnJCH3RkTb8KUvZQeQ3hT0RGOtDqEya62k1Xy3AQ";

// Initialize Supabase Client
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
export const supabase = supabaseClient;
export default supabaseClient;
