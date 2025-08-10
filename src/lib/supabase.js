import { createClient } from "@supabase/supabase-js";

const isBrowser = typeof window !== "undefined";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Avoid throwing during build/SSR where envs may be unset in some environments.
// We still fail fast in the browser if the client is actually used without proper envs.
export const supabase =
  isBrowser && supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          storageKey: "daffodil-auth",
          autoRefreshToken: true,
        },
      })
    : null;
