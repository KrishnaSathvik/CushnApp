import { useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ArrowRight, Wallet } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { SUPPORTED_CURRENCIES, useSettings } from "../context/SettingsContext";

const ONBOARDED_KEY = "cushn_onboarded";

function detectCurrencyCode() {
  try {
    const parts = new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
    }).resolvedOptions();

    const locale = parts.locale || navigator.language || "en-US";
    const region = locale.split("-")[1]?.toUpperCase();
    const match = SUPPORTED_CURRENCIES.find((item) => {
      if (item.code === "USD" && region === "US") return true;
      if (item.code === "EUR" && ["DE", "FR", "IT", "ES", "NL", "IE"].includes(region)) return true;
      if (item.code === "GBP" && region === "GB") return true;
      if (item.code === "INR" && region === "IN") return true;
      if (item.code === "JPY" && region === "JP") return true;
      if (item.code === "CAD" && region === "CA") return true;
      if (item.code === "AUD" && region === "AU") return true;
      if (item.code === "CHF" && region === "CH") return true;
      if (item.code === "CNY" && region === "CN") return true;
      if (item.code === "BRL" && region === "BR") return true;
      return false;
    });

    if (match) {
      return { code: match.code, confidence: "high" };
    }

    return { code: "USD", confidence: "low" };
  } catch {
    return { code: "USD", confidence: "low" };
  }
}

export default function OnboardingScreen() {
  const navigate = useNavigate();
  const { T } = useTheme();
  const { isAuthenticated, isLoggedIn, isLoading, session, markOnboarded } = useAuth();
  const { currency, setCurrency } = useSettings();
  const detectedCurrency = useMemo(() => detectCurrencyCode(), []);
  const [manualSelection, setManualSelection] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const hasLocalOnboarded = localStorage.getItem(ONBOARDED_KEY) === "true";
  const hasRemoteOnboarded = session?.user?.user_metadata?.cushn_onboarded;
  const selectedCurrency =
    manualSelection || currency || (detectedCurrency.confidence === "high" ? detectedCurrency.code : null);
  const showDetectedConfirmation = !currency && detectedCurrency.confidence === "high";

  async function finishOnboarding(nextCurrency) {
    if (isSaving || !nextCurrency) return;
    setIsSaving(true);

    try {
      setCurrency(nextCurrency);
      localStorage.setItem(ONBOARDED_KEY, "true");
      if (markOnboarded) {
        markOnboarded().catch(() => {});
      }
      navigate("/add", { replace: true });
    } catch (error) {
      console.error("Failed to finish onboarding:", error);
      setIsSaving(false);
    }
  }

  if (isLoading) return null;
  if (!isLoggedIn) return <Navigate to="/" replace />;
  if (hasLocalOnboarded || (isAuthenticated && hasRemoteOnboarded)) {
    return <Navigate to="/" replace />;
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: T.bgBase, padding: "24px 16px" }}
    >
      <div
        className="glass-panel hero-panel"
        style={{
          width: "100%",
          maxWidth: 760,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            padding: "16px 16px 12px",
            borderBottom: `1px solid ${T.border}`,
            background: T.bgGlass,
            backdropFilter: "blur(18px)",
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <img
                src="/logo.png"
                alt="Cushn"
                style={{ width: 24, height: 24, borderRadius: 7 }}
              />
              <span
                style={{
                  fontSize: 15,
                  color: T.fgPrimary,
                  fontWeight: 800,
                  letterSpacing: -0.4,
                }}
              >
                Cushn Setup
              </span>
            </div>
            <div className="font-mono" style={{ fontSize: 10, color: T.fgTertiary }}>
              CURRENCY
            </div>
          </div>
          <div className="flex gap-1 mt-3">
            <div
              style={{
                flex: 1,
                height: 5,
                borderRadius: 999,
                background: T.accentPrimary,
              }}
            />
          </div>
        </div>

        <div style={{ padding: "24px 18px 20px" }}>
          <div className="flex items-center gap-2 mb-2">
            <Wallet size={16} color={T.accentPrimary} />
            <span
              className="font-mono"
              style={{
                fontSize: 10,
                letterSpacing: 1,
                color: T.accentPrimary,
                fontWeight: 700,
              }}
            >
              CURRENCY
            </span>
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: 28,
              color: T.fgPrimary,
              letterSpacing: -0.8,
            }}
          >
            {showDetectedConfirmation
              ? `We detected ${selectedCurrency}. Is that right?`
              : "Choose the currency you use for subscriptions."}
          </h1>
          <p
            style={{
              margin: "10px 0 16px",
              fontSize: 14,
              color: T.fgSecondary,
              lineHeight: 1.7,
              maxWidth: 560,
            }}
          >
            {showDetectedConfirmation
              ? "Tap continue to confirm it, or pick a different currency below. This controls how every total is displayed across the app."
              : "This controls how every total is displayed across the app. Pick your currency to continue to Add."}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {SUPPORTED_CURRENCIES.map((item) => {
              const active = selectedCurrency === item.code;
              return (
                <button
                  key={item.code}
                  onClick={() => setManualSelection(item.code)}
                  className="interactive-btn cursor-pointer"
                  style={{
                    borderRadius: 14,
                    border: `1px solid ${active ? T.accentPrimary : T.border}`,
                    background: active ? `${T.accentPrimary}1f` : T.bgGlassStrong,
                    color: active ? T.accentPrimary : T.fgPrimary,
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "12px 10px",
                  }}
                >
                  {item.symbol} {item.code}
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: 18 }}>
            <button
              onClick={() => void finishOnboarding(selectedCurrency)}
              disabled={isSaving || !selectedCurrency}
              className="interactive-btn interactive-btn-primary cursor-pointer"
              style={{
                borderRadius: 14,
                border: "none",
                background: T.accentPrimary,
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                padding: "11px 14px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
                boxShadow: `0 0 18px ${T.accentPrimary}44`,
                opacity: isSaving || !selectedCurrency ? 0.7 : 1,
              }}
            >
              {isSaving ? "Saving..." : "Continue to Add"}
              {!isSaving && <ArrowRight size={14} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
