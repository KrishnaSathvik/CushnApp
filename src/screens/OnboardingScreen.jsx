import { useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Bell, CheckCircle2, Sparkles, Wallet } from "lucide-react";
import useBudget from "../hooks/useBudget";
import useNotificationPreferences from "../hooks/useNotificationPreferences";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { SUPPORTED_CURRENCIES, useSettings } from "../context/SettingsContext";
import { DEFAULT_BUDGET } from "../lib/constants";
import { formatCurrency } from "../lib/formatCurrency";

const STEPS = [
  { key: "intro", title: "What is Cushn?" },
  { key: "budget", title: "Enter your monthly budget" },
  { key: "currency", title: "Choose your currency" },
  { key: "reminders", title: "Get renewal reminders" },
  { key: "done", title: "You are ready" },
];

export default function OnboardingScreen() {
  const navigate = useNavigate();
  const { T } = useTheme();
  const { isAuthenticated, isLoggedIn, isLoading, session, markOnboarded } = useAuth();
  const { currency, setCurrency } = useSettings();
  const { saveBudget } = useBudget();
  const { savePreferences } = useNotificationPreferences();

  const ONBOARDED_KEY = "cushn_onboarded";
  const [step, setStep] = useState(0);
  const [budgetInput, setBudgetInput] = useState(String(DEFAULT_BUDGET));
  const [selectedCurrency, setSelectedCurrency] = useState(currency || "USD");
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const numericBudget = useMemo(() => {
    const parsed = Number(budgetInput);
    if (!Number.isFinite(parsed)) return 0;
    return Math.max(0, parsed);
  }, [budgetInput]);

  const currentStep = STEPS[step];
  const isLastStep = step === STEPS.length - 1;
  const canContinue = currentStep.key !== "budget" || numericBudget > 0;
  const hasLocalOnboarded = localStorage.getItem(ONBOARDED_KEY) === "true";
  const hasRemoteOnboarded = session?.user?.user_metadata?.cushn_onboarded;

  if (isLoading) return null;
  if (!isLoggedIn) return <Navigate to="/" replace />;
  if (hasLocalOnboarded || (isAuthenticated && hasRemoteOnboarded)) {
    return <Navigate to="/" replace />;
  }

  async function finishOnboarding() {
    try {
      setSaving(true);
      setError("");
      setCurrency(selectedCurrency);
      await saveBudget({
        monthlyGoal: numericBudget || DEFAULT_BUDGET,
        currency: selectedCurrency,
      });
      await savePreferences({ inAppEnabled: remindersEnabled });
      localStorage.setItem(ONBOARDED_KEY, "true");
      if (markOnboarded) markOnboarded().catch(() => {});
      navigate("/");
    } catch (err) {
      setError(
        err?.message ||
          "Could not save onboarding preferences. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  function onNext() {
    if (isLastStep) {
      finishOnboarding();
      return;
    }
    setStep((s) => s + 1);
  }

  function onSkip() {
    savePreferences({ inAppEnabled: false }).catch(() => {});
    localStorage.setItem(ONBOARDED_KEY, "true");
    if (markOnboarded) markOnboarded().catch(() => {});
    navigate("/");
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
          maxWidth: 460,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -36,
            right: -22,
            width: 140,
            height: 140,
            background: `${T.accentPrimary}12`,
            filter: "blur(26px)",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            padding: "16px 16px 12px",
            borderBottom: `1px solid ${T.border}`,
            background: T.bgGlass,
            backdropFilter: "blur(18px)",
          }}
        >
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="Cushn"
              style={{ width: 24, height: 24, borderRadius: 7 }}
            />
            <span
              style={{
                fontSize: 15,
                color: T.fgHigh,
                fontWeight: 800,
                letterSpacing: -0.4,
              }}
            >
              Cushn Onboarding
            </span>
          </div>
          <div
            className="font-mono"
            style={{ fontSize: 10, color: T.fgSubtle, marginTop: 6 }}
          >
            STEP {step + 1} / {STEPS.length}
          </div>
          <div className="flex gap-1 mt-3">
            {STEPS.map((_, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: 5,
                  borderRadius: 999,
                  background: i <= step ? T.accentPrimary : T.fgDivider,
                }}
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep.key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            style={{
              padding: "20px 16px 18px",
              minHeight: 320,
              position: "relative",
            }}
          >
            {currentStep.key === "intro" && (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={16} color={T.accentPrimary} />
                  <span
                    className="font-mono"
                    style={{
                      fontSize: 10,
                      letterSpacing: 1,
                      color: T.accentPrimary,
                      fontWeight: 700,
                    }}
                  >
                    SIMPLE SETUP
                  </span>
                </div>
                <h1
                  style={{
                    margin: 0,
                    fontSize: 24,
                    color: T.fgHigh,
                    letterSpacing: -0.6,
                  }}
                >
                  Track all subscriptions in one place.
                </h1>
                <p
                  style={{
                    margin: "10px 0 0",
                    fontSize: 13,
                    color: T.fgMedium,
                    lineHeight: 1.7,
                  }}
                >
                  Cushn helps you build a financial buffer with faster
                  subscription tracking, smarter renewal reminders, and cleaner
                  budget visibility.
                </p>
                <div
                  className="glass-panel support-panel"
                  style={{ marginTop: 16, padding: "12px 14px" }}
                >
                  <div
                    className="font-mono"
                    style={{
                      fontSize: 10,
                      color: T.fgSubtle,
                      textTransform: "uppercase",
                      letterSpacing: 0.8,
                    }}
                  >
                    What you get
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: T.fgMedium,
                      marginTop: 8,
                      lineHeight: 1.7,
                    }}
                  >
                    A premium dashboard for budgets, renewals, analytics, and
                    quick subscription management.
                  </div>
                </div>
              </>
            )}

            {currentStep.key === "budget" && (
              <>
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
                    MONTHLY GOAL
                  </span>
                </div>
                <h1
                  style={{
                    margin: 0,
                    fontSize: 22,
                    color: T.fgHigh,
                    letterSpacing: -0.4,
                  }}
                >
                  Enter your budget amount
                </h1>
                <p
                  style={{
                    margin: "8px 0 12px",
                    fontSize: 13,
                    color: T.fgMedium,
                    lineHeight: 1.6,
                  }}
                >
                  You can change this anytime in Budget settings.
                </p>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
                  className="interactive-input w-full outline-none font-mono"
                  placeholder="200"
                  style={{
                    height: 46,
                    background: T.bgGlassStrong,
                    border: `1px solid ${T.border}`,
                    borderRadius: 14,
                    color: T.fgHigh,
                    fontSize: 16,
                    padding: "0 14px",
                    boxSizing: "border-box",
                  }}
                />
                <p
                  className="font-mono"
                  style={{ margin: "8px 0 0", fontSize: 11, color: T.fgSubtle }}
                >
                  Preview:{" "}
                  {formatCurrency(numericBudget || 0, selectedCurrency).replace(
                    ".00",
                    "",
                  )}{" "}
                  / month
                </p>
              </>
            )}

            {currentStep.key === "currency" && (
              <>
                <h1
                  style={{
                    margin: 0,
                    fontSize: 22,
                    color: T.fgHigh,
                    letterSpacing: -0.4,
                  }}
                >
                  Choose your currency
                </h1>
                <p
                  style={{
                    margin: "8px 0 12px",
                    fontSize: 13,
                    color: T.fgMedium,
                    lineHeight: 1.6,
                  }}
                >
                  All dashboard totals and budgets will use this currency.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SUPPORTED_CURRENCIES.map((c) => {
                    const active = selectedCurrency === c.code;
                    return (
                      <button
                        key={c.code}
                        onClick={() => setSelectedCurrency(c.code)}
                        className="interactive-btn cursor-pointer"
                        style={{
                          borderRadius: 14,
                          border: `1px solid ${active ? T.accentPrimary : T.border}`,
                          background: active
                            ? `${T.accentPrimary}1f`
                            : T.bgGlassStrong,
                          color: active ? T.accentPrimary : T.fgHigh,
                          fontSize: 12,
                          fontWeight: 600,
                          padding: "10px 8px",
                        }}
                      >
                        {c.symbol} {c.code}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {currentStep.key === "reminders" && (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <Bell size={16} color={T.accentPrimary} />
                  <span
                    className="font-mono"
                    style={{
                      fontSize: 10,
                      letterSpacing: 1,
                      color: T.accentPrimary,
                      fontWeight: 700,
                    }}
                  >
                    RENEWAL ALERTS
                  </span>
                </div>
                <h1
                  style={{
                    margin: 0,
                    fontSize: 22,
                    color: T.fgHigh,
                    letterSpacing: -0.4,
                  }}
                >
                  Do you want renewal reminders?
                </h1>
                <p
                  style={{
                    margin: "8px 0 12px",
                    fontSize: 13,
                    color: T.fgMedium,
                    lineHeight: 1.6,
                  }}
                >
                  You can update reminder settings later.
                </p>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => setRemindersEnabled(true)}
                    className="interactive-btn cursor-pointer"
                    style={{
                      borderRadius: 14,
                      border: `1px solid ${remindersEnabled ? T.accentPrimary : T.border}`,
                      background: remindersEnabled
                        ? `${T.accentPrimary}1f`
                        : T.bgGlassStrong,
                      color: remindersEnabled ? T.accentPrimary : T.fgHigh,
                      fontSize: 13,
                      fontWeight: 600,
                      padding: "11px 10px",
                    }}
                  >
                    Yes, remind me
                  </button>
                  <button
                    onClick={() => setRemindersEnabled(false)}
                    className="interactive-btn cursor-pointer"
                    style={{
                      borderRadius: 14,
                      border: `1px solid ${!remindersEnabled ? T.semDanger : T.border}`,
                      background: !remindersEnabled
                        ? `${T.semDanger}14`
                        : T.bgGlassStrong,
                      color: !remindersEnabled ? T.semDanger : T.fgHigh,
                      fontSize: 13,
                      fontWeight: 600,
                      padding: "11px 10px",
                    }}
                  >
                    Not now
                  </button>
                </div>
              </>
            )}

            {currentStep.key === "done" && (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 size={16} color={T.semSuccess} />
                  <span
                    className="font-mono"
                    style={{
                      fontSize: 10,
                      letterSpacing: 1,
                      color: T.semSuccess,
                      fontWeight: 700,
                    }}
                  >
                    READY
                  </span>
                </div>
                <h1
                  style={{
                    margin: 0,
                    fontSize: 22,
                    color: T.fgHigh,
                    letterSpacing: -0.4,
                  }}
                >
                  Setup complete
                </h1>
                <div
                  className="glass-panel support-panel"
                  style={{
                    marginTop: 12,
                    padding: "10px 12px",
                  }}
                >
                  <div
                    className="font-mono"
                    style={{ fontSize: 11, color: T.fgMedium, lineHeight: 1.8 }}
                  >
                    Budget:{" "}
                    {formatCurrency(
                      numericBudget || 0,
                      selectedCurrency,
                    ).replace(".00", "")}
                    /mo
                  </div>
                  <div
                    className="font-mono"
                    style={{ fontSize: 11, color: T.fgMedium, lineHeight: 1.8 }}
                  >
                    Currency: {selectedCurrency}
                  </div>
                  <div
                    className="font-mono"
                    style={{ fontSize: 11, color: T.fgMedium, lineHeight: 1.8 }}
                  >
                    Reminders: {remindersEnabled ? "Enabled" : "Disabled"}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {error && (
          <div
            className="glass-panel support-panel"
            style={{
              margin: "0 16px 0",
              padding: "9px 10px",
              border: `1px solid ${T.semDanger}44`,
              background: `${T.semDanger}14`,
              color: T.semDanger,
              fontSize: 12,
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            padding: "14px 16px 16px",
            display: "grid",
            gap: 8,
            borderTop: `1px solid ${T.border}`,
            background: T.bgGlass,
            backdropFilter: "blur(18px)",
          }}
        >
          <button
            onClick={onNext}
            disabled={!canContinue || saving}
            className="interactive-btn interactive-btn-primary cursor-pointer"
            style={{
              borderRadius: 14,
              border: "none",
              background: T.accentPrimary,
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
              padding: "11px 12px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
              boxShadow: `0 0 18px ${T.accentPrimary}44`,
            }}
          >
            {isLastStep
              ? saving
                ? "Saving..."
                : "Start using Cushn"
              : "Continue"}
            {!isLastStep && <ArrowRight size={14} />}
          </button>
          {step < STEPS.length - 1 && (
            <button
              onClick={onSkip}
              className="interactive-btn cursor-pointer font-mono"
              style={{
                border: "none",
                background: "transparent",
                color: T.fgSubtle,
                fontSize: 11,
                padding: "6px",
              }}
            >
              Skip onboarding
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
