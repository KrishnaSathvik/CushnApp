import { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import useSubscriptions from "../hooks/useSubscriptions";
import { useSettings } from "../context/SettingsContext";
import { evaluatePassword } from "../lib/passwordPolicy";
import { formatCurrency } from "../lib/formatCurrency";
import { PUBLIC_TYPE } from "../lib/publicLayout";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import PageShell from "../components/layout/PageShell";
import PageIntro from "../components/layout/PageIntro";
import AppHeroCard from "../components/ui/AppHeroCard";

// ─── Component: Field ────────────────────────────────────────────────────────
export function Field({
  label,
  type = "text",
  placeholder,
  icon: Icon,
  required,
  error,
  hint,
  onHintClick,
  value,
  onChange,
}) {
  const { T } = useTheme()
  const [focused, setFocused] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1.5">
        <label style={{ fontSize: 12, color: T.fgSecondary, fontWeight: 500 }}>
          {label}
          {required && (
            <span style={{ color: T.accentPrimary, marginLeft: 2 }}>*</span>
          )}
        </label>
        {hint && (
          <span
            onClick={onHintClick}
            className="font-mono font-bold"
            style={{
              fontSize: 10,
              color: T.accentPrimary,
              cursor: onHintClick ? "pointer" : "default",
              opacity: onHintClick ? 1 : 0.7,
            }}
          >
            {hint}
          </span>
        )}
      </div>
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 pointer-events-none">
            <Icon size={15} color={focused ? T.accentPrimary : T.fgTertiary} />
          </div>
        )}
        <input
          type={isPassword ? (showPw ? "text" : "password") : type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="interactive-input w-full text-[13px] outline-none transition-all duration-150"
          style={{
            height: 44,
            background: T.bgElevated,
            border: `1px solid ${error ? T.semDanger : focused ? T.accentPrimary : T.border}`,
            borderRadius: 10,
            color: T.fgPrimary,
            paddingLeft: Icon ? 38 : 14,
            paddingRight: isPassword ? 40 : 14,
            boxShadow: focused ? `0 0 0 3px ${T.accentPrimary}22` : "none",
          }}
        />
        {isPassword && (
          <div
            onClick={() => setShowPw(!showPw)}
            className="absolute right-3.5 cursor-pointer"
          >
            {showPw ? (
              <EyeOff size={16} color={T.fgTertiary} />
            ) : (
              <Eye size={16} color={T.fgTertiary} />
            )}
          </div>
        )}
      </div>
      {error && (
        <div
          className="text-[11px] mt-1.5 flex items-center gap-1"
          style={{ color: T.semDanger }}
        >
          <AlertCircle size={12} />
          {error}
        </div>
      )}
    </div>
  );
}

// ─── Component: StrengthBar ──────────────────────────────────────────────────
function StrengthBar({ analysis, password = "" }) {
  const { T } = useTheme();
  const score = analysis?.score ?? 0;
  const label = analysis?.label ?? "";
  const color = score <= 2 ? T.semDanger : score <= 4 ? T.semWarning : T.semSuccess;
  const progress = Math.min(score, 4);
  const hasInput = password.length > 0;

  return (
    <div className="mb-5">
      <div className="flex gap-1 mb-1.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex-1 h-[3px] rounded-sm transition-colors duration-200"
            style={{
              background: hasInput && progress >= i ? color : T.border,
            }}
          />
        ))}
      </div>
      {hasInput && score > 0 && (
        <div
          className="text-[10px] font-mono font-bold"
          style={{ color }}
        >
          {label}
        </div>
      )}
    </div>
  );
}

function PasswordTipsPanel({ open, analysis }) {
  const { T } = useTheme();
  if (!open) return null;

  return (
    <div
      style={{
        marginTop: -10,
        marginBottom: 14,
        background: T.bgElevated,
        border: `1px solid ${T.border}`,
        borderRadius: 10,
        padding: 10,
      }}
    >
      <div
        className="font-mono"
        style={{ fontSize: 10, color: T.fgSecondary, marginBottom: 8, fontWeight: 700 }}
      >
        PASSWORD TIPS
      </div>
      {(analysis?.checks || []).map((check) => (
        <div
          key={check.id}
          className="flex items-center gap-2"
          style={{ marginBottom: 6 }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: check.passed ? T.semSuccess : T.fgDivider,
            }}
          />
          <span
            style={{
              fontSize: 11,
              color: check.passed ? T.fgSecondary : T.fgSecondary,
            }}
          >
            {check.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Component: Banners ──────────────────────────────────────────────────────
function ErrorBanner({ message }) {
  const { T } = useTheme();
  if (!message) return null;
  return (
    <div
      className="motion-rise-in flex items-center gap-2 px-3 py-2.5 mb-5 rounded-lg"
      style={{
        background: T.semDanger + "12",
        border: `1px solid ${T.semDanger}33`,
      }}
    >
      <AlertCircle size={14} color={T.semDanger} className="shrink-0" />
      <span className="text-xs" style={{ color: T.semDanger }}>
        {message}
      </span>
    </div>
  );
}

function SuccessBanner({ message }) {
  const { T } = useTheme();
  if (!message) return null;
  return (
    <div
      className="motion-rise-in flex items-center gap-2 px-3 py-2.5 mb-5 rounded-lg"
      style={{
        background: T.semSuccess + "12",
        border: `1px solid ${T.semSuccess}33`,
      }}
    >
      <Check size={14} color={T.semSuccess} className="shrink-0" />
      <span className="text-xs" style={{ color: T.semSuccess }}>
        {message}
      </span>
    </div>
  );
}

function AuthFeaturePills() {
  const { T } = useTheme();
  const items = [
    "AI text parsing",
    "Voice input",
    "Renewal calendar",
    "Budget tracking",
    "CSV export",
    "Guest + Sync",
  ];

  return (
    <div className="flex flex-wrap gap-2 mt-5 relative z-10">
      {items.map((f) => (
        <div
          key={f}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
          style={{
            background: T.bgElevated,
            border: `1px solid ${T.border}`,
          }}
        >
          <Check size={11} color={T.semSuccess} />
          <span className="text-[10px]" style={{ color: T.fgSecondary }}>
            {f}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Component: PreviewPanel ─────────────────────────────────────────────────
const PreviewPanel = ({ mode, blurb, valuePoints = [] }) => {
  const { T } = useTheme();

  return (
    <div
      className="w-full flex flex-col justify-center px-4 sm:px-6 md:px-8 xl:px-8 2xl:px-10 pt-0 pb-8 xl:pt-10 xl:pb-8 relative overflow-hidden border-t xl:border-t-0 xl:border-l"
      style={{
        background: `linear-gradient(135deg, ${T.bgSurface} 0%, ${T.bgBase} 100%)`,
        borderColor: T.border,
      }}
    >
      <div
        className="absolute -bottom-24 -right-24 w-[320px] h-[320px] pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${T.accentPrimary}18 0%, transparent 70%)`,
        }}
      />
      <div
        className="absolute top-10 left-10 w-[200px] h-[200px] pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${T.semInfo}0A 0%, transparent 70%)`,
        }}
      />

      <div className="mb-7 relative z-10">
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles size={14} color={T.accentPrimary} />
          <span
            className="text-[11px] font-mono font-bold tracking-[1.5px]"
            style={{ color: T.accentPrimary }}
          >
            {mode === "signup" ? "PREVIEW · NEW ACCOUNT" : "PREVIEW · EXISTING ACCOUNT"}
          </span>
        </div>
        <div
          className="text-[22px] font-bold leading-tight"
          style={{ color: T.fgPrimary }}
        >
          {mode === "signup"
            ? "Keep the insights. Add sync and reminders."
            : "Continue where your subscription audit left off."}
        </div>
        <div style={{ color: T.fgSecondary, fontSize: 13, lineHeight: 1.7, marginTop: 10, maxWidth: 420 }}>
          {blurb}
        </div>
      </div>
      <AppHeroCard
        style={{
          background: T.bgSurface,
          border: `1px solid ${T.border}`,
          padding: "18px 16px",
        }}
      >
        <div className="font-mono" style={{ fontSize: 10, color: T.fgTertiary, letterSpacing: 1, fontWeight: 700 }}>
          WHY CREATE AN ACCOUNT
        </div>
        <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
          {valuePoints.map((item) => (
            <div key={item} className="flex items-start gap-2">
              <Check size={13} color={T.semSuccess} style={{ marginTop: 2 }} />
              <div style={{ fontSize: 13, color: T.fgSecondary, lineHeight: 1.6 }}>{item}</div>
            </div>
          ))}
        </div>
      </AppHeroCard>
      <AuthFeaturePills />
    </div>
  );
};

// ─── Auth Split Layout ───────────────────────────────────────────────────────
export function AuthSplitLayout({ children, mode, blurb = "Your subscriptions sync across devices, and reminders arrive before renewals hit.", valuePoints = [] }) {
  const { T } = useTheme()
  return (
    <div style={{ minHeight: "100vh", background: T.bgBase, display: "flex", flexDirection: "column" }}>
      <div className="flex-1" style={{ position: "relative", overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.04,
            backgroundImage: `linear-gradient(${T.accentPrimary} 1px, transparent 1px), linear-gradient(90deg, ${T.accentPrimary} 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
            pointerEvents: "none",
          }}
        />

        <PageShell width="default" className="relative z-10 grid h-full grid-cols-1 xl:grid-cols-[560px_minmax(0,1fr)] xl:items-stretch" style={{ minHeight: "100vh" }}>
          <div
            className="w-full flex flex-col justify-center xl:justify-start px-4 sm:px-6 md:px-8 py-8 xl:pt-10 xl:pb-8 overflow-y-auto xl:border-r"
            style={{
              borderColor: T.border,
              background: `${T.bgBase}e6`,
              backdropFilter: "blur(8px)",
            }}
          >
            <AppHeroCard
              className="motion-scale-in w-full max-w-md md:max-w-lg xl:max-w-md mx-auto"
              style={{
                background: T.bgSurface,
                border: `1px solid ${T.border}`,
                padding: "24px 20px",
              }}
            >
              {children}
            </AppHeroCard>
          </div>

          <PreviewPanel mode={mode} blurb={blurb} valuePoints={valuePoints} />
        </PageShell>
      </div>
    </div>
  );
}

export function AuthPageHeader({ title, subtitle }) {
  const { T } = useTheme();

  return (
    <>
      <Link
        to="/"
        className="motion-rise-in inline-flex items-center gap-2 mb-6 no-underline"
        aria-label="Go to Cushn landing page"
      >
        <img src="/logo.png" alt="Cushn" className="w-7 h-7 rounded-lg" />
        <span
          className="text-[16px] font-bold tracking-tight"
          style={{ color: T.fgPrimary }}
        >
          Cushn
        </span>
      </Link>

      <div className="mb-6">
        <PageIntro
          title={title}
          subtitle={subtitle}
          titleStyle={{ fontSize: PUBLIC_TYPE.authTitle }}
          subtitleStyle={{ fontSize: 13, lineHeight: 1.65 }}
        />
      </div>
    </>
  );
}

// ═════════════════════════════════════════════════════════════════════════════════
// SIGN UP PAGE
// ═════════════════════════════════════════════════════════════════════════════════
export function SignUpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { T } = useTheme()
  const { signUp, loginAsGuest, isGuest } = useAuth();
  const { subscriptions, monthlyTotal, annualTotal } = useSubscriptions();
  const { currency } = useSettings();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPasswordTips, setShowPasswordTips] = useState(false);
  const passwordAnalysis = evaluatePassword(password);
  const guestSubCount = subscriptions.filter((item) => item.status === "active").length;
  const isGuestConversion = guestSubCount > 0;
  const redirectParam = new URLSearchParams(location.search).get("redirect");
  const redirectTo =
    redirectParam && redirectParam.startsWith("/") ? redirectParam : "/";
  const signupSubtitle = isGuestConversion
    ? `Sync your ${guestSubCount} subscription${guestSubCount === 1 ? "" : "s"} worth ${formatCurrency(monthlyTotal, currency).replace(".00", "")}/month across devices and get reminders before renewals hit.`
    : "Most users discover they are wasting real money on subscriptions they forgot about. Create an account to keep the insights and stay ahead of renewals.";

  const handleSubmit = async () => {
    if (!fullName.trim() || !email.trim() || !password) {
      setError("Please fill in all fields");
      return;
    }
    if (passwordAnalysis.score < 3) {
      const tip = passwordAnalysis.suggestions[0] || "Use a stronger password";
      setError(`Password too weak. Try: ${tip.toLowerCase()}.`);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await signUp(email, password, fullName);
      if (data.user && !data.session) {
        setSuccess("Check your email for a confirmation link!");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthSplitLayout
      mode="signup"
      blurb={isGuestConversion ? signupSubtitle : "Your subscriptions sync across devices, and reminder emails land before charges hit."}
      valuePoints={[
        "Sync guest-mode subscriptions across all devices",
        "Get email reminders before renewals hit",
        "Keep your duplicate and trim-candidate insights",
      ]}
    >
      <AuthPageHeader
        title="Create your account"
        subtitle={signupSubtitle}
      />

      {isGuestConversion && (
        <div
          className="motion-rise-in"
          style={{
            marginBottom: 16,
            background: `${T.accentPrimary}10`,
            border: `1px solid ${T.accentPrimary}33`,
            borderRadius: 12,
            padding: 12,
          }}
        >
          <div className="font-mono" style={{ fontSize: 10, color: T.accentPrimary, fontWeight: 700, letterSpacing: 1 }}>
            GUEST SNAPSHOT
          </div>
          <div style={{ fontSize: 13, color: T.fgPrimary, fontWeight: 700, marginTop: 6 }}>
            You already found {formatCurrency(monthlyTotal, currency).replace(".00", "")}/month in recurring spend.
          </div>
          <div style={{ fontSize: 12, color: T.fgSecondary, lineHeight: 1.6, marginTop: 6 }}>
            That is {formatCurrency(annualTotal, currency).replace(".00", "")}/year of renewals ready to sync across devices.
          </div>
        </div>
      )}

      <ErrorBanner message={error} />
      <SuccessBanner message={success} />

      <Field
        label="Full name"
        placeholder="Your full name"
        icon={User}
        required
        value={fullName}
        onChange={setFullName}
      />
      <Field
        label="Email address"
        type="email"
        placeholder="you@example.com"
        icon={Mail}
        required
        value={email}
        onChange={setEmail}
      />
      <Field
        label="Password"
        type="password"
        placeholder="Min. 8 characters"
        icon={Lock}
        required
        hint="Password tips"
        onHintClick={() => setShowPasswordTips((prev) => !prev)}
        value={password}
        onChange={setPassword}
      />

      <PasswordTipsPanel open={showPasswordTips} analysis={passwordAnalysis} />
      <StrengthBar analysis={passwordAnalysis} password={password} />

      {/* Terms checkbox */}
      <div
        className="flex items-start gap-2.5 mb-5 cursor-pointer selection:bg-transparent"
        onClick={() => setAgreed(!agreed)}
      >
        <div
          className="w-4 h-4 rounded mt-0.5 shrink-0 flex items-center justify-center transition-colors"
          style={{
            background: agreed ? T.accentPrimary : T.bgElevated,
            border: `1px solid ${agreed ? T.accentPrimary : T.border}`,
          }}
        >
          {agreed && <Check size={10} color="#fff" />}
        </div>
        <span className="text-[12px] leading-[1.6]" style={{ color: T.fgSecondary }}>
          I agree to the{" "}
          <Link to="/terms" className="cursor-pointer" style={{ color: T.accentPrimary }}>
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="cursor-pointer" style={{ color: T.accentPrimary }}>
            Privacy Policy
          </Link>
        </span>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading || !agreed}
        className="interactive-btn interactive-btn-primary w-full h-12 rounded-xl flex items-center justify-center gap-2 font-bold text-[14px] cursor-pointer"
        style={{
          background: T.accentPrimary,
          border: "none",
          color: "#fff",
          boxShadow: `0 0 24px ${T.accentPrimary}44`,
          opacity: loading || !agreed ? 0.7 : 1,
        }}
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <>
            Create account <ArrowRight size={14} />
          </>
        )}
      </button>

      <button
        onClick={async () => {
          if (!isGuest) {
            await loginAsGuest("Guest");
          }
          navigate(redirectTo);
        }}
        className="interactive-btn w-full h-11 rounded-xl flex items-center justify-center gap-2 font-bold text-[13px] cursor-pointer mt-3"
        style={{
          background: T.bgElevated,
          border: `1px solid ${T.border}`,
          color: T.fgPrimary,
        }}
      >
        {isGuest ? "Keep going in guest mode" : "Continue as guest"}
      </button>

      {/* Sign in link */}
      <div className="mt-6 text-center">
        <span className="text-[13px]" style={{ color: T.fgTertiary }}>
          Already have an account?{" "}
        </span>
        <Link
          to="/login"
          className="text-[13px] font-semibold cursor-pointer"
          style={{ color: T.accentPrimary }}
        >
          Sign in
        </Link>
      </div>
    </AuthSplitLayout>
  );
}

// ═════════════════════════════════════════════════════════════════════════════════
// LOGIN PAGE
// ═════════════════════════════════════════════════════════════════════════════════
export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { T } = useTheme()
  const { login, loginAsGuest, isGuest } = useAuth();
  const { subscriptions, monthlyTotal } = useSubscriptions();
  const { currency } = useSettings();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const redirectParam = new URLSearchParams(location.search).get("redirect");
  const redirectTo =
    redirectParam && redirectParam.startsWith("/") ? redirectParam : "/";
  const guestSubCount = subscriptions.filter((item) => item.status === "active").length;
  const loginSubtitle = guestSubCount > 0
    ? `You already have ${guestSubCount} active subscription${guestSubCount === 1 ? "" : "s"} totaling ${formatCurrency(monthlyTotal, currency).replace(".00", "")}/month in guest mode. Sign in to keep them synced.`
    : "Sign in to continue with your subscription insights and upcoming renewals.";

  const handleSubmit = async () => {
    if (!email.trim() || !password) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      navigate(redirectTo);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthSplitLayout
      mode="login"
      blurb="Your subscriptions sync across devices, and reminder emails arrive before charges hit."
      valuePoints={[
        "Pick up your dashboard on any device",
        "Get renewal reminders without re-entering data",
        "Continue as guest if you just want to try the product first",
      ]}
    >
      <AuthPageHeader
        title="Welcome back"
        subtitle={loginSubtitle}
      />

      {guestSubCount > 0 && (
        <div
          className="motion-rise-in"
          style={{
            marginBottom: 16,
            background: `${T.semSuccess}10`,
            border: `1px solid ${T.semSuccess}33`,
            borderRadius: 12,
            padding: 12,
          }}
        >
          <div className="font-mono" style={{ fontSize: 10, color: T.semSuccess, fontWeight: 700, letterSpacing: 1 }}>
            READY TO SYNC
          </div>
          <div style={{ fontSize: 13, color: T.fgPrimary, fontWeight: 700, marginTop: 6 }}>
            Guest mode already has your current dashboard context.
          </div>
          <div style={{ fontSize: 12, color: T.fgSecondary, lineHeight: 1.6, marginTop: 6 }}>
            Sign in to keep those subscriptions across devices and turn reminders on without re-entering them.
          </div>
        </div>
      )}

      <ErrorBanner message={error} />

      <Field
        label="Email address"
        type="email"
        placeholder="you@example.com"
        icon={Mail}
        required
        value={email}
        onChange={setEmail}
        error={error ? " " : undefined}
      />
      <Field
        label="Password"
        type="password"
        placeholder="Your password"
        icon={Lock}
        required
        hint="Forgot password?"
        onHintClick={() => navigate("/forgot-password")}
        value={password}
        onChange={setPassword}
        error={error ? " " : undefined}
      />

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="interactive-btn interactive-btn-primary w-full h-12 rounded-xl flex items-center justify-center gap-2 font-bold text-[14px] cursor-pointer"
        style={{
          background: T.accentPrimary,
          border: "none",
          color: "#fff",
          boxShadow: `0 0 24px ${T.accentPrimary}44`,
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <>
            Sign in <ArrowRight size={14} />
          </>
        )}
      </button>

      <button
        onClick={async () => {
          if (!isGuest) {
            await loginAsGuest("Guest");
          }
          navigate(redirectTo);
        }}
        className="interactive-btn w-full h-11 rounded-xl flex items-center justify-center gap-2 font-bold text-[13px] cursor-pointer mt-3"
        style={{
          background: T.bgElevated,
          border: `1px solid ${T.border}`,
          color: T.fgPrimary,
        }}
      >
        {isGuest ? "Keep going in guest mode" : "Continue as guest"}
      </button>

      {/* Sign up link */}
      <div className="mt-6 text-center">
        <span className="text-[13px]" style={{ color: T.fgTertiary }}>
          Don't have an account?{" "}
        </span>
        <Link
          to="/signup"
          className="text-[13px] font-semibold cursor-pointer"
          style={{ color: T.accentPrimary }}
        >
          Create one free
        </Link>
      </div>
    </AuthSplitLayout>
  );
}

// ═════════════════════════════════════════════════════════════════════════════════
// FORGOT PASSWORD PAGE
// ═════════════════════════════════════════════════════════════════════════════════
export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { T } = useTheme()
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthSplitLayout mode="login">
      <AuthPageHeader
        title={sent ? "Check your email" : "Reset your password"}
        subtitle={
          sent
            ? `We sent a reset link to ${email}. It expires in 15 minutes.`
            : "Enter the email linked to your account and we will send a reset link."
        }
      />

      <ErrorBanner message={error} />

      {sent ? (
        <>
          <div
            className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-5"
            style={{
              background: T.semSuccess + "22",
              border: `1px solid ${T.semSuccess}44`,
            }}
          >
            <Check size={26} color={T.semSuccess} />
          </div>
          <button
            onClick={() => navigate("/login")}
            className="interactive-btn interactive-btn-surface w-full h-[46px] rounded-[10px] text-[13px] font-bold cursor-pointer transition-colors"
            style={{
              background: T.bgElevated,
              border: `1px solid ${T.border}`,
              color: T.fgPrimary,
            }}
          >
            Back to Login
          </button>
        </>
      ) : (
        <>
          <Field
            label="Email address"
            type="email"
            placeholder="you@example.com"
            icon={Mail}
            required
            value={email}
            onChange={setEmail}
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="interactive-btn interactive-btn-primary w-full h-[46px] rounded-[10px] text-[13px] font-bold mt-1 cursor-pointer flex items-center justify-center gap-2"
            style={{
              background: T.accentPrimary,
              border: `1px solid ${T.accentPrimary}`,
              color: "#fff",
              boxShadow: `0 0 20px ${T.accentPrimary}33`,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              "Send reset link"
            )}
          </button>

          <div className="mt-5 text-center">
            <Link
              to="/login"
              className="text-[13px] font-semibold no-underline"
              style={{ color: T.fgTertiary }}
            >
              ← Back to sign in
            </Link>
          </div>
        </>
      )}
    </AuthSplitLayout>
  );
}

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { T } = useTheme();
  const { updatePassword, logout, isAuthenticated } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPasswordTips, setShowPasswordTips] = useState(false);
  const [hasRecoveryToken, setHasRecoveryToken] = useState(false);
  const passwordAnalysis = evaluatePassword(password);

  useEffect(() => {
    const hash = location.hash || window.location.hash || "";
    const params = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
    const query = new URLSearchParams(location.search);
    const tokenType = params.get("type") || query.get("type");
    const hasToken =
      params.has("access_token") ||
      params.has("token_hash") ||
      query.has("token_hash") ||
      tokenType === "recovery";
    setHasRecoveryToken(hasToken);
  }, [location.hash, location.search]);

  const canResetPassword = hasRecoveryToken || isAuthenticated;

  const handleSubmit = async () => {
    if (!password || !confirmPassword) {
      setError("Please enter and confirm your new password");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (passwordAnalysis.score < 3) {
      const tip = passwordAnalysis.suggestions[0] || "Use a stronger password";
      setError(`Password too weak. Try: ${tip.toLowerCase()}.`);
      return;
    }

    setLoading(true);
    setError("");
    try {
      await updatePassword(password);
      await logout();
      setSuccess("Password updated. Sign in with your new password.");
      setPassword("");
      setConfirmPassword("");
      window.history.replaceState({}, document.title, "/reset-password");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(err.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthSplitLayout mode="login">
      <AuthPageHeader
        title="Create a new password"
        subtitle={
          canResetPassword
            ? "Enter a new password for your Cushn account. After saving, you can sign in immediately."
            : "Open the reset link from your email, then set a new password here."
        }
      />

      <ErrorBanner message={error} />
      <SuccessBanner message={success} />

      {!canResetPassword && !success ? (
        <div
          style={{
            background: T.bgElevated,
            border: `1px solid ${T.border}`,
            borderRadius: 12,
            padding: 14,
            marginBottom: 18,
          }}
        >
          <div style={{ color: T.fgPrimary, fontSize: 13, fontWeight: 700 }}>
            Recovery link required
          </div>
          <div style={{ color: T.fgSecondary, fontSize: 12, lineHeight: 1.7, marginTop: 6 }}>
            Request a password reset email first, then open the link from your inbox to finish changing your password.
          </div>
          <button
            onClick={() => navigate("/forgot-password")}
            className="interactive-btn interactive-btn-surface w-full h-[44px] rounded-[10px] text-[13px] font-bold mt-4 cursor-pointer"
            style={{
              background: T.bgBase,
              border: `1px solid ${T.border}`,
              color: T.fgPrimary,
            }}
          >
            Request reset email
          </button>
        </div>
      ) : !success ? (
        <>
          <Field
            label="New password"
            type="password"
            placeholder="Enter a new password"
            icon={Lock}
            required
            hint="Password tips"
            onHintClick={() => setShowPasswordTips((prev) => !prev)}
            value={password}
            onChange={setPassword}
          />
          <PasswordTipsPanel open={showPasswordTips} analysis={passwordAnalysis} />
          <StrengthBar analysis={passwordAnalysis} password={password} />
          <Field
            label="Confirm password"
            type="password"
            placeholder="Re-enter your new password"
            icon={Lock}
            required
            value={confirmPassword}
            onChange={setConfirmPassword}
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="interactive-btn interactive-btn-primary w-full h-[46px] rounded-[10px] text-[13px] font-bold mt-1 cursor-pointer flex items-center justify-center gap-2"
            style={{
              background: T.accentPrimary,
              border: `1px solid ${T.accentPrimary}`,
              color: "#fff",
              boxShadow: `0 0 20px ${T.accentPrimary}33`,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : "Update password"}
          </button>
        </>
      ) : null}

      <div className="mt-5 text-center">
        <Link
          to="/login"
          className="text-[13px] font-semibold no-underline"
          style={{ color: T.fgTertiary }}
        >
          ← Back to sign in
        </Link>
      </div>
    </AuthSplitLayout>
  );
}

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { T } = useTheme();
  const [error, setError] = useState("");
  const [status, setStatus] = useState("Confirming your email...");

  useEffect(() => {
    let active = true;

    async function handleAuthCallback() {
      if (!isSupabaseConfigured() || !supabase) {
        if (active) {
          setError("Supabase is not configured.");
        }
        return;
      }

      const query = new URLSearchParams(location.search);
      const hash = location.hash || window.location.hash || "";
      const hashParams = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
      const type = query.get("type") || hashParams.get("type") || "";

      if (type === "recovery") {
        navigate(`/reset-password${location.search}${location.hash}`, { replace: true });
        return;
      }

      try {
        const code = query.get("code");
        const tokenHash = query.get("token_hash") || hashParams.get("token_hash");

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        } else if (tokenHash && type) {
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type,
          });
          if (verifyError) throw verifyError;
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          throw new Error("Confirmation succeeded, but no session was created.");
        }

        if (!active) return;
        setStatus("Email confirmed. Redirecting...");
        window.history.replaceState({}, document.title, "/");
        navigate("/", { replace: true });
      } catch (err) {
        if (!active) return;
        setError(err.message || "Could not complete authentication.");
      }
    }

    handleAuthCallback();

    return () => {
      active = false;
    };
  }, [location.hash, location.search, navigate]);

  return (
    <AuthSplitLayout mode="login">
      <AuthPageHeader
        title="Finishing sign in"
        subtitle="We’re confirming your account and opening your dashboard."
      />

      <ErrorBanner message={error} />

      {!error && (
        <div
          className="flex items-center gap-3 rounded-xl px-4 py-4"
          style={{
            background: T.bgElevated,
            border: `1px solid ${T.border}`,
            color: T.fgPrimary,
          }}
        >
          <Loader2 size={16} className="animate-spin shrink-0" />
          <span className="text-[13px]">{status}</span>
        </div>
      )}

      {error && (
        <div className="mt-5">
          <button
            onClick={() => navigate("/login", { replace: true })}
            className="interactive-btn interactive-btn-primary w-full h-[46px] rounded-[10px] text-[13px] font-bold cursor-pointer flex items-center justify-center gap-2"
            style={{
              background: T.accentPrimary,
              border: `1px solid ${T.accentPrimary}`,
              color: "#fff",
            }}
          >
            Go to sign in
          </button>
        </div>
      )}
    </AuthSplitLayout>
  );
}

// Default export for lazy loading — routes based on `page` prop
export default function AuthPages({ page }) {
  if (page === 'callback') return <AuthCallbackPage />
  if (page === 'signup') return <SignUpPage />
  if (page === 'forgot') return <ForgotPasswordPage />
  if (page === 'reset') return <ResetPasswordPage />
  return <LoginPage />
}
