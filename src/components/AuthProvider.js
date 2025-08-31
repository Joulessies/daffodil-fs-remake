"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { isAdminEmail } from "../lib/admin";

const AuthContext = createContext({
  user: null,
  isLoading: true,
  isAdmin: false,
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dbIsAdmin, setDbIsAdmin] = useState(false);
  const [dbSuspended, setDbSuspended] = useState(false);

  useEffect(() => {
    let isMounted = true;

    if (!supabase) {
      setIsLoading(false);
      return () => {
        isMounted = false;
      };
    }

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!isMounted) return;
        setUser(data.session?.user ?? null);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Load role flags from DB (fallback to email list when unavailable)
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        if (!supabase || !user?.id) {
          if (active) {
            setDbIsAdmin(false);
            setDbSuspended(false);
          }
          return;
        }
        const { data, error } = await supabase
          .from("users")
          .select("is_admin, suspended")
          .eq("id", user.id)
          .maybeSingle();
        if (error) throw error;
        if (active) {
          setDbIsAdmin(!!data?.is_admin);
          setDbSuspended(!!data?.suspended);
        }
      } catch {
        if (active) {
          setDbIsAdmin(false);
          setDbSuspended(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [user?.id]);

  const value = useMemo(() => {
    const emailIsAdmin = isAdminEmail(user?.email);
    const isAdmin = !!(dbIsAdmin || emailIsAdmin);
    return { user, isLoading, isAdmin, suspended: dbSuspended };
  }, [user, isLoading, dbIsAdmin, dbSuspended]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
