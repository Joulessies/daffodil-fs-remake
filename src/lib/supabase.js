import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://rwsxqxwekjhxxjoajnal.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3c3hxeHdla2poeHhqb2FqbmFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NzU0ODAsImV4cCI6MjA3MDE1MTQ4MH0.94bctc6J4igmC0VVP7joUpSN2N5-RabYvk-hn62wHBE";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
