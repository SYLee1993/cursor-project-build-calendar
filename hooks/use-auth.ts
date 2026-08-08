"use client";

import type { Session, User } from "@supabase/supabase-js";
import { useCallback, useEffect, useMemo, useState } from "react";

import { createClient } from "@/lib/supabase/client";

export function useAuth() {
  const supabase = useMemo(() => createClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!isMounted) return;
      if (error) setAuthError(error.message);
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signInWithOtp = useCallback(
    async (email: string) => {
      setAuthError(null);
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setAuthError(error.message);
        return false;
      }
      return true;
    },
    [supabase],
  );

  const signOut = useCallback(async () => {
    setAuthError(null);
    const { error } = await supabase.auth.signOut();
    if (error) setAuthError(error.message);
  }, [supabase]);

  return {
    supabase,
    session,
    user,
    isLoading,
    authError,
    signInWithOtp,
    signOut,
  };
}
