import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

const AuthContext = createContext<any>(null);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setUser(null);
      setLoading(false);
      return;
    }

    // Helper to clear broken session data in localStorage
    const clearSupabaseSession = () => {
      try {
        for (const key of Object.keys(localStorage)) {
          if (key.startsWith("sb-") && key.endsWith("-auth-token")) {
            localStorage.removeItem(key);
          }
        }
      } catch (e) {
        console.error("Local storage cleanup exception:", e);
      }
    };

    // Get current session
    supabase.auth.getUser()
      .then(({ data, error }) => {
        if (error) {
          if (
            error.message?.toLowerCase().includes("session") ||
            error.message?.toLowerCase().includes("missing")
          ) {
            console.info("AuthContext: No active auth session (user is in sandbox/logged-out state).");
          } else {
            console.warn("AuthContext user recovery reminder:", error);
          }
          if (
            error.message?.toLowerCase().includes("refresh") || 
            error.message?.toLowerCase().includes("invalid") ||
            error.status === 400 || 
            error.status === 401
          ) {
            clearSupabaseSession();
            supabase.auth.signOut().catch(() => {});
          }
          setUser(null);
        } else {
          setUser(data?.user ?? null);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.info("AuthContext info catching initial user:", err);
        clearSupabaseSession();
        supabase.auth.signOut().catch(() => {});
        setUser(null);
        setLoading(false);
      });

    // Listen for auth changes
    const {
      data: listener,
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };

  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
