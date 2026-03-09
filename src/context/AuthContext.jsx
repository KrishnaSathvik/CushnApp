import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { migrateLocalToSupabase } from "../lib/syncMigration";
import { seedDefaultCategories } from "../lib/dataService";
import {
  convertGuestSessionToUser,
  ensureGuestSession,
} from "../lib/guestSessions";
import {
  clearPendingGuestMigration,
  markGuestMigrationPending,
  shouldMigrateGuestData,
} from "../lib/guestMigrationState";
import { getSupabaseAuthStorageKey } from "../lib/supabase";

const AuthContext = createContext(null);

const GUEST_KEY = "subtrackr_guest";
const ONBOARDED_KEY = "cushn_onboarded";
const LEGACY_ONBOARDED_KEY = "subtrackr_onboarded";
const THEME_PREFERENCE_KEY = "cushn_theme";
const LEGACY_THEME_PREFERENCE_KEY = "subtrackr_theme";
const SIGN_OUT_TIMEOUT_MS = 1500;

function readPersistedGuest() {
  const stored = localStorage.getItem(GUEST_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

function persistGuest(guest) {
  localStorage.setItem(GUEST_KEY, JSON.stringify(guest));
}

function clearPersistedGuest() {
  localStorage.removeItem(GUEST_KEY);
}

function clearPersistedSupabaseSession() {
  const storageKey = getSupabaseAuthStorageKey();
  if (storageKey) {
    localStorage.removeItem(storageKey);
    sessionStorage.removeItem(storageKey);
  }
}

async function clearSupabaseSession() {
  if (!supabase) return;

  try {
    await Promise.race([
      supabase.auth.signOut({ scope: "local" }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("sign_out_timeout")), SIGN_OUT_TIMEOUT_MS),
      ),
    ]);
  } catch {
    clearPersistedSupabaseSession();
  }
}

/**
 * Auth provider with guest/trial mode support.
 *
 * Priority: Supabase session > guest localStorage > null (unauthenticated)
 *
 * On guest → auth transition:
 *   - Migrates all Dexie data to Supabase
 *   - Seeds default categories if new user
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined); // undefined = loading
  const [isBootstrapped, setIsBootstrapped] = useState(false);
  const welcomeEmailAttemptedRef = useRef(new Set());
  const authBootstrapDoneRef = useRef(false);

  // ─── Bootstrap auth state on mount ──────────────────────────────────
  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        // 1) Try Supabase first
        if (isSupabaseConfigured() && supabase) {
          const {
            data: { session: s },
          } = await supabase.auth.getSession();
          if (s?.user && mounted) {
            const persistedGuest = readPersistedGuest();
            const shouldMigrate = shouldMigrateGuestData(!!persistedGuest);
            const guestSessionId = persistedGuest?.guestSessionId || null;
            setSession({
              type: "auth",
              user: s.user,
              name:
                s.user.user_metadata?.full_name ||
                s.user.email?.split("@")[0] ||
                "User",
            });
            clearPersistedGuest();
            if (guestSessionId) {
              void convertGuestSessionToUser(guestSessionId, s.user.id).catch(() => {});
            }
            if (shouldMigrate) {
              await migrateLocalToSupabase(s.user.id).catch(() => {});
              clearPendingGuestMigration();
            } else {
              // Seed default categories for existing auth users (idempotent)
              await seedDefaultCategories(s.user.id).catch(() => {});
            }
            return;
          }
        }

        // 2) Fall back to guest
        const guest = readPersistedGuest();
        if (guest && mounted) {
          setSession({
            type: "guest",
            name: guest.name,
            createdAt: guest.createdAt,
            guestSessionId: guest.guestSessionId || null,
          });

          void ensureGuestSession(guest.guestSessionId, guest.name)
            .then((guestSessionId) => {
              if (!mounted || !guestSessionId || guest.guestSessionId === guestSessionId) {
                return;
              }

              const nextGuest = { ...guest, guestSessionId };
              persistGuest(nextGuest);
              setSession({
                type: "guest",
                name: nextGuest.name,
                createdAt: nextGuest.createdAt,
                guestSessionId,
              });
            })
            .catch(() => {});
          return;
        }

        // 3) Not logged in
        if (mounted) setSession(null);
      } finally {
        authBootstrapDoneRef.current = true;
        if (mounted) {
          setIsBootstrapped(true);
        }
      }
    }

    bootstrap();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return;
    if (session?.type !== "auth" || !session.user?.id) return;
    if (!session.user.email_confirmed_at) return;
    if (session.user.user_metadata?.welcome_email_sent_at) return;
    if (welcomeEmailAttemptedRef.current.has(session.user.id)) return;

    welcomeEmailAttemptedRef.current.add(session.user.id);
    void (async () => {
      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;
      if (!accessToken) return;

      await supabase.functions
        .invoke("send-welcome-email", {
          body: {},
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .catch(() => {});
    })();
  }, [session]);

  // ─── Listen to Supabase auth changes ───────────────────────────────
  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, s) => {
      if (!authBootstrapDoneRef.current && event === "INITIAL_SESSION") {
        return;
      }

      if (s?.user) {
        const shouldMigrate = shouldMigrateGuestData(
          !!localStorage.getItem(GUEST_KEY),
        );
        const persistedGuest = readPersistedGuest();
        const guestSessionId = persistedGuest?.guestSessionId || null;

        setSession({
          type: "auth",
          user: s.user,
          name:
            s.user.user_metadata?.full_name ||
            s.user.email?.split("@")[0] ||
            "User",
        });
        clearPersistedGuest();
        if (guestSessionId) {
          void convertGuestSessionToUser(guestSessionId, s.user.id).catch(() => {});
        }

        // Guest → Auth migration: migrate Dexie data to Supabase
        // Do not await these database calls inside onAuthStateChange to prevent GoTrue session deadlocks
        if (shouldMigrate) {
          migrateLocalToSupabase(s.user.id)
            .then(() => {
              clearPendingGuestMigration();
            })
            .catch(console.error);
        } else {
          // New auth user or returning user — seed categories (idempotent)
          seedDefaultCategories(s.user.id).catch(() => {});
        }
      } else if (!localStorage.getItem(GUEST_KEY)) {
        setSession(null);
      }

      authBootstrapDoneRef.current = true;
      setIsBootstrapped(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ─── Guest login ───────────────────────────────────────────────────
  const loginAsGuest = useCallback(async (name) => {
    const guest = {
      name,
      createdAt: new Date().toISOString(),
      guestSessionId: await ensureGuestSession(null, name),
    };
    persistGuest(guest);
    setSession({
      type: "guest",
      name,
      createdAt: guest.createdAt,
      guestSessionId: guest.guestSessionId,
    });
    return guest;
  }, []);

  // ─── Sign up with email ────────────────────────────────────────────
  const signUp = useCallback(async (email, password, fullName) => {
    if (!supabase) throw new Error("Supabase not configured");
    if (localStorage.getItem(GUEST_KEY)) {
      markGuestMigrationPending();
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
    return data;
  }, []);

  // ─── Login with email ──────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    if (!supabase) throw new Error("Supabase not configured");
    if (localStorage.getItem(GUEST_KEY)) {
      markGuestMigrationPending();
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }, []);

  // ─── Social OAuth ─────────────────────────────────────────────────
  const loginWithProvider = useCallback(async (provider) => {
    if (!supabase) throw new Error("Supabase not configured");
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    });
    if (error) throw error;
    return data;
  }, []);

  // ─── Password reset ───────────────────────────────────────────────
  const resetPassword = useCallback(async (email) => {
    if (!supabase) throw new Error("Supabase not configured");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  }, []);

  const updatePassword = useCallback(async (password) => {
    if (!supabase) throw new Error("Supabase not configured");
    const { data, error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
    return data;
  }, []);

  // ─── Update Profile ───────────────────────────────────────────────
  const updateProfile = useCallback(async (fullName) => {
    if (!supabase) throw new Error("Supabase not configured");
    const { data, error } = await supabase.auth.updateUser({
      data: { full_name: fullName },
    });
    if (error) throw error;
    return data;
  }, []);

  const markOnboarded = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.updateUser({
      data: { cushn_onboarded: true },
    });
  }, []);

  // ─── Logout ───────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    clearPersistedGuest();
    clearPendingGuestMigration();
    setSession(null);
    await clearSupabaseSession();
  }, []);

  const deleteAccount = useCallback(async () => {
    if (!supabase) throw new Error("Supabase not configured");

    const { data, error } = await supabase.functions.invoke("delete-account", {
      body: {},
    });
    if (error) throw error;

    clearPersistedGuest();
    clearPendingGuestMigration();
    localStorage.removeItem("subtrackr_bill_type_mapping");
    localStorage.removeItem("subtrackr_currency");
    localStorage.removeItem("subtrackr_notify_pref");
    localStorage.removeItem(ONBOARDED_KEY);
    localStorage.removeItem(LEGACY_ONBOARDED_KEY);
    if (typeof data?.themePreferenceKey === "string") {
      localStorage.removeItem(data.themePreferenceKey);
    } else {
      localStorage.removeItem(THEME_PREFERENCE_KEY);
    }
    localStorage.removeItem(LEGACY_THEME_PREFERENCE_KEY);

    setSession(null);
    await clearSupabaseSession();
    return data;
  }, []);

  const value = {
    session,
    isLoading: !isBootstrapped,
    isGuest: session?.type === "guest",
    isAuthenticated: session?.type === "auth",
    isLoggedIn: session !== null && session !== undefined,
    userName: session?.name || "",
    loginAsGuest,
    signUp,
    login,
    loginWithProvider,
    resetPassword,
    updatePassword,
    updateProfile,
    markOnboarded,
    logout,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
