import { Suspense, lazy, useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { useTheme } from "./context/ThemeContext";
import { SettingsProvider } from "./context/SettingsContext";
import { SubscriptionsProvider } from "./context/SubscriptionsContext";
import { BudgetProvider } from "./context/BudgetContext";
import TabBar from "./components/TabBar";
import SubscriptionDetail from "./screens/SubscriptionDetail";
import DashboardHeader from "./components/DashboardHeader";
import { applyRouteSeo } from "./lib/seo";

// Lazy-loaded screens — only downloaded when navigated to
const HomeScreen = lazy(() => import("./screens/HomeScreen"));
const AddScreen = lazy(() => import("./screens/AddScreen"));
const AnalyticsScreen = lazy(() => import("./screens/AnalyticsScreen"));
const BudgetScreen = lazy(() => import("./screens/BudgetScreen"));
const CalendarScreen = lazy(() => import("./screens/CalendarScreen"));
const SettingsScreen = lazy(() => import("./screens/SettingsScreen"));
const OnboardingScreen = lazy(() => import("./screens/OnboardingScreen"));
const LandingPage = lazy(() => import("./screens/LandingPage"));
const GuestEntry = lazy(() => import("./screens/GuestEntry"));
const AuthPages = lazy(() => import("./screens/AuthPages"));
const LegalPage = lazy(() => import("./screens/LegalPage"));
const PreferencesScreen = lazy(() => import("./screens/PreferencesScreen"));
const InstallBanner = lazy(() => import("./components/InstallBanner"));

const APP_ROUTES = [
  "/",
  "/add",
  "/analytics",
  "/budget",
  "/calendar",
  "/settings",
];
const ONBOARDED_KEY = "cushn_onboarded";
const LEGACY_ONBOARDED_KEY = "subtrackr_onboarded";

function PageLoader() {
  const { T } = useTheme();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: T.bgBase,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          border: `3px solid ${T.accentPrimary}`,
          borderTopColor: "transparent",
          animation: "spin 0.7s linear infinite",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { isLoggedIn, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isLoggedIn) return <Navigate to="/landing" replace />;
  return children;
}

function PublicOnlyRoute({ children }) {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  const redirectParam = new URLSearchParams(location.search).get("redirect");
  const redirectTo =
    redirectParam && redirectParam.startsWith("/") ? redirectParam : "/";
  if (isAuthenticated) return <Navigate to={redirectTo} replace />;
  return children;
}

function OnboardingGate({ children }) {
  const { isLoggedIn, isLoading, session } = useAuth();
  const [renderedAt] = useState(() => Date.now());
  if (isLoading) return null;
  if (!isLoggedIn) return <Navigate to="/landing" replace />;

  const hasLocalOnboarded =
    localStorage.getItem(ONBOARDED_KEY) ||
    localStorage.getItem(LEGACY_ONBOARDED_KEY);

  const hasRemoteOnboarded = session?.user?.user_metadata?.cushn_onboarded;

  // If account is older than 1 hour, they likely already completed onboarding in the past
  const isOldAccount =
    session?.user?.created_at &&
    renderedAt - new Date(session.user.created_at).getTime() > 1000 * 60 * 60;

  if (hasRemoteOnboarded || isOldAccount) {
    if (!hasLocalOnboarded) {
      localStorage.setItem(ONBOARDED_KEY, "true");
    }
    return children;
  }

  if (!hasLocalOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}

function ScrollManager() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1);
      const target = document.getElementById(id);
      if (target) {
        requestAnimationFrame(() => {
          target.scrollIntoView({ block: "start", behavior: "auto" });
        });
        return;
      }
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname, location.search, location.hash]);

  return null;
}

function AppShell() {
  const location = useLocation();
  const { isLoggedIn } = useAuth();
  const showDashboardHeader = isLoggedIn && location.pathname !== "/onboarding";
  const showTabBar = isLoggedIn && APP_ROUTES.includes(location.pathname);

  useEffect(() => {
    applyRouteSeo(location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-dvh bg-bgBase text-fgHigh">
      <ScrollManager />
      {showDashboardHeader && <DashboardHeader key={location.pathname} />}
      <main>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public pages (redirect to home if logged in) */}
            <Route
              path="/landing"
              element={
                <PublicOnlyRoute>
                  <LandingPage />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/guest"
              element={
                <PublicOnlyRoute>
                  <GuestEntry />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicOnlyRoute>
                  <AuthPages page="signup" />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <AuthPages page="login" />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <PublicOnlyRoute>
                  <AuthPages page="forgot" />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/reset-password"
              element={<AuthPages page="reset" />}
            />
            <Route
              path="/auth/callback"
              element={<AuthPages page="callback" />}
            />
            <Route path="/privacy" element={<LegalPage />} />
            <Route path="/terms" element={<LegalPage />} />
            <Route path="/contact" element={<LegalPage />} />

            {/* Onboarding — requires login but not onboarded check */}
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <OnboardingScreen />
                </ProtectedRoute>
              }
            />

            {/* Protected app pages — require login + onboarding */}
            <Route
              path="/"
              element={
                <OnboardingGate>
                  <HomeScreen />
                </OnboardingGate>
              }
            />
            <Route
              path="/add"
              element={
                <OnboardingGate>
                  <AddScreen />
                </OnboardingGate>
              }
            />
            <Route
              path="/analytics"
              element={
                <OnboardingGate>
                  <AnalyticsScreen />
                </OnboardingGate>
              }
            />
            <Route
              path="/budget"
              element={
                <OnboardingGate>
                  <BudgetScreen />
                </OnboardingGate>
              }
            />
            <Route
              path="/calendar"
              element={
                <OnboardingGate>
                  <CalendarScreen />
                </OnboardingGate>
              }
            />
            <Route
              path="/detail/:id"
              element={
                <OnboardingGate>
                  <SubscriptionDetail />
                </OnboardingGate>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/preferences"
              element={
                <ProtectedRoute>
                  <PreferencesScreen />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/landing" replace />} />
          </Routes>
        </Suspense>
      </main>
      {isLoggedIn && (
        <Suspense fallback={null}>
          {showTabBar && <TabBar />}
          <InstallBanner />
        </Suspense>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <SettingsProvider>
            <SubscriptionsProvider>
              <BudgetProvider>
                <AppShell />
              </BudgetProvider>
            </SubscriptionsProvider>
          </SettingsProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
