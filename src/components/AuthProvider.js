"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { isAdminEmail } from "../lib/admin";

const AuthContext = createContext({
  user: null,
  isLoading: true,
  isAdmin: false,
  refreshAdminStatus: () => {},
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
  const loadAdminStatus = useMemo(() => {
    return async () => {
      try {
        if (!supabase || !user?.id) {
          setDbIsAdmin(false);
          setDbSuspended(false);
          return;
        }
        const { data, error } = await supabase
          .from("users")
          .select("is_admin, suspended")
          .eq("id", user.id)
          .maybeSingle();
        if (error) throw error;
        setDbIsAdmin(!!data?.is_admin);
        setDbSuspended(!!data?.suspended);
      } catch {
        setDbIsAdmin(false);
        setDbSuspended(false);
      }
    };
  }, [user?.id]);

  useEffect(() => {
    let active = true;
    loadAdminStatus().then(() => {
      if (!active) {
        setDbIsAdmin(false);
        setDbSuspended(false);
      }
    });

    // Set up realtime subscription to listen for changes to the user's record
    let subscription = null;
    if (supabase && user?.id) {
      subscription = supabase
        .channel(`user-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "users",
            filter: `id=eq.${user.id}`,
          },
          (payload) => {
            console.log("User record changed:", payload);
            // Reload admin status when the user record changes
            if (active) {
              loadAdminStatus();
            }
          }
        )
        .subscribe();
    }

    return () => {
      active = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [loadAdminStatus, user?.id]);

  const value = useMemo(() => {
    const emailIsAdmin = isAdminEmail(user?.email);
    const isAdmin = !!(dbIsAdmin || emailIsAdmin);
    return {
      user,
      isLoading,
      isAdmin,
      suspended: dbSuspended,
      refreshAdminStatus: loadAdminStatus,
    };
  }, [user, isLoading, dbIsAdmin, dbSuspended, loadAdminStatus]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
