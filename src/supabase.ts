import { createClient } from '@supabase/supabase-js';

const getEnvVar = (key: string): string => {
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta && import.meta.env) {
      // @ts-ignore
      const val = import.meta.env[key];
      if (val) return val;
    }
  } catch (e) {}
  try {
    if (typeof process !== 'undefined' && process && process.env) {
      const val = process.env[key];
      if (val) return val;
    }
  } catch (e) {}
  return '';
};

const rawUrl = getEnvVar('VITE_SUPABASE_URL');
const rawKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

const DEFAULT_SUPABASE_URL = "https://dvpnwzinajfqxmfylkiy.supabase.co";
const DEFAULT_SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2cG53emluYWpmcXhtZnlsa2l5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5MTA0NzIsImV4cCI6MjA5ODQ4NjQ3Mn0.zyRm4dkQmthVvnKdg0fLT9KNm0pdHDqivbYRvxaO2hI";

function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') return DEFAULT_SUPABASE_URL;
  let clean = url.trim();
  if (!clean || clean === 'undefined' || clean === 'null' || clean === 'YOUR_SUPABASE_URL') {
    return DEFAULT_SUPABASE_URL;
  }
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    clean = `https://${clean}`;
  }
  try {
    const parsed = new URL(clean);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.origin;
    }
  } catch (e) {
    console.warn("Invalid VITE_SUPABASE_URL provided, falling back to default:", url);
  }
  return DEFAULT_SUPABASE_URL;
}

function sanitizeKey(key: string): string {
  if (!key || typeof key !== 'string') return DEFAULT_SUPABASE_KEY;
  const clean = key.trim();
  if (!clean || clean === 'undefined' || clean === 'null' || clean === 'YOUR_SUPABASE_ANON_KEY') {
    return DEFAULT_SUPABASE_KEY;
  }
  return clean;
}

const supabaseUrl = sanitizeUrl(rawUrl);
const supabaseAnonKey = sanitizeKey(rawKey);

let client;
try {
  client = createClient(supabaseUrl, supabaseAnonKey);
} catch (err) {
  console.error("Failed to initialize Supabase client with provided params, using default fallback:", err);
  client = createClient(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_KEY);
}

export const supabase = client;

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
