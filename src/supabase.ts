import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) ||
  "https://dvpnwzinajfqxmfylkiy.supabase.co";

const supabaseAnonKey = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2cG53emluYWpmcXhtZnlsa2l5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5MTA0NzIsImV4cCI6MjA5ODQ4NjQ3Mn0.zyRm4dkQmthVvnKdg0fLT9KNm0pdHDqivbYRvxaO2hI";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function loadUserAppState(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('data')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error("Error loading app state from Supabase:", error);
    return null;
  }
  return data?.data || null;
}

export async function saveUserAppState(userId: string, appState: any) {
  const { error } = await supabase
    .from('users')
    .upsert({
      id: userId,
      updated_at: new Date().toISOString(),
      data: appState
    });

  if (error) {
    console.error("Error saving app state to Supabase:", error);
    throw error;
  }
}
