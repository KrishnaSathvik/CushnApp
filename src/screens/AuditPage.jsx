import React from "react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CircleDollarSign,
  Clock3,
  Plus,
  ScanSearch,
  Sparkles,
  Trash2,
  TriangleAlert,
} from "lucide-react";

import { useTheme } from "../context/ThemeContext";
import { formatCurrency } from "../lib/formatCurrency";
import {
  calculateAuditTotals,
  createAuditItem,
  findAuditService,
  getAuditSuggestions,
  getQuickAuditServices,
} from "../lib/auditCalculator";
import { PUBLIC_TYPE } from "../lib/publicLayout";
import PublicFooter from "../components/PublicFooter";
import PublicHeader from "../components/PublicHeader";
import PageShell from "../components/layout/PageShell";
import PageIntro from "../components/layout/PageIntro";
import AppHeroCard from "../components/ui/AppHeroCard";
import AppSurfaceCard from "../components/ui/AppSurfaceCard";

const QUICK_SERVICES = getQuickAuditServices(10);

function MetricCard({ label, value, accent, helper }) {
  const { T } = useTheme();

  return (
    <AppSurfaceCard
      style={{
        padding: 16,
        background: accent ? `${accent}12` : T.bgElevated,
        border: `1px solid ${accent ? `${accent}33` : T.border}`,
      }}
    >
      <div className="font-mono" style={{ fontSize: 10, letterSpacing: 1, color: T.fgTertiary }}>
        {label}
      </div>
      <div style={{ marginTop: 8, fontSize: 28, fontWeight: 800, color: T.fgPrimary }}>
        {value}
      </div>
      {helper ? (
        <div style={{ marginTop: 6, fontSize: 12, color: T.fgSecondary }}>{helper}</div>
      ) : null}
    </AppSurfaceCard>
  );
}

export default function AuditPage() {
  const { T } = useTheme();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [showResults, setShowResults] = useState(false);

  const matchedService = useMemo(() => findAuditService(query), [query]);
  const totals = useMemo(() => calculateAuditTotals(items), [items]);
  const suggestions = useMemo(() => getAuditSuggestions(items), [items]);
  const auditReady = items.length >= 3;
  const benchmark = useMemo(() => {
    if (!totals.monthly) return null;

    if (totals.monthly >= 250) {
      return "That is in the range of a monthly grocery bill for many households.";
    }

    if (totals.monthly >= 120) {
      return `That is ${Math.round(totals.monthly / 15.49)} months of Netflix every single month.`;
    }

    return `That is ${Math.round(totals.annual / 20)} months of ChatGPT over a year.`;
  }, [totals]);

  const clearComposer = () => {
    setQuery("");
    setCustomAmount("");
  };

  const handleAddService = (service) => {
    const item = createAuditItem({ service });
    if (!item) return;
    setItems((current) => [...current, item]);
    setError("");
    setShowResults(false);
  };

  const handleSubmit = () => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery && !matchedService) {
      setError("Add a service name or tap a quick pick.");
      return;
    }

    if (matchedService) {
      handleAddService(matchedService);
      clearComposer();
      return;
    }

    const parsedAmount = Number.parseFloat(customAmount);
    const item = createAuditItem({
      name: trimmedQuery,
      monthlyAmount: parsedAmount,
    });

    if (!item) {
      setError("Unknown services need a monthly amount.");
      return;
    }

    setItems((current) => [...current, item]);
    setError("");
    clearComposer();
    setShowResults(false);
  };

  const removeItem = (id) => {
    setItems((current) => current.filter((item) => item.id !== id));
    setShowResults(false);
  };

  const guestHref = "/guest?redirect=/add";
  const signupHref = "/signup?redirect=/add";

  return (
    <div style={{ minHeight: "100vh", background: T.bgBase }}>
      <PublicHeader />

      <section
        style={{
          position: "relative",
          overflow: "hidden",
          borderBottom: `1px solid ${T.border}`,
          background: `radial-gradient(circle at top left, ${T.accentPrimary}16, transparent 28%), linear-gradient(180deg, ${T.bgBase}, ${T.bgMuted})`,
        }}
      >
        <PageShell
          width="wide"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 22,
            paddingTop: 40,
            paddingBottom: 34,
          }}
        >
          <AppHeroCard
            className="motion-rise-in"
            style={{
              padding: 24,
              background: T.bgSurface,
              border: `1px solid ${T.border}`,
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px",
                borderRadius: 999,
                background: `${T.accentPrimary}14`,
                border: `1px solid ${T.accentPrimary}33`,
                color: T.accentPrimary,
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              <ScanSearch size={14} />
              Subscription cost audit
            </div>

            <PageIntro
              eyebrow="Zero-friction estimate"
              title="How much are you really spending on subscriptions?"
              subtitle="Type what you remember. We will add up the real number in under a minute, with no bank login and no account required."
              titleStyle={{
                fontSize: PUBLIC_TYPE.heroTitle,
                lineHeight: 1.02,
                letterSpacing: -1.2,
                marginTop: 18,
              }}
              subtitleStyle={{
                marginTop: 16,
                fontSize: 15,
                lineHeight: 1.75,
                maxWidth: 560,
              }}
            />

            <div style={{ display: "grid", gap: 10, marginTop: 18 }}>
              {[
                "No bank login",
                "Client-only calculator",
                "Known pricing for common services plus custom amount fallback",
              ].map((line) => (
                <div key={line} className="flex items-center gap-2" style={{ color: T.fgSecondary, fontSize: 13 }}>
                  <Sparkles size={14} color={T.accentPrimary} />
                  {line}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3" style={{ marginTop: 22 }}>
              <button
                onClick={() => navigate(guestHref)}
                className="interactive-btn cursor-pointer"
                style={{
                  height: 44,
                  padding: "0 16px",
                  borderRadius: 999,
                  border: "none",
                  background: T.accentPrimary,
                  color: "#fff",
                  fontWeight: 700,
                }}
              >
                Start my audit
              </button>
              <button
                onClick={() => navigate(signupHref)}
                className="interactive-btn cursor-pointer"
                style={{
                  height: 44,
                  padding: "0 16px",
                  borderRadius: 999,
                  border: `1px solid ${T.border}`,
                  background: T.bgSurface,
                  color: T.fgPrimary,
                  fontWeight: 700,
                }}
              >
                Create account
              </button>
            </div>
          </AppHeroCard>

          <AppSurfaceCard
            className="motion-rise-in motion-delay-1"
            style={{
              padding: 22,
              background: T.bgSurface,
              border: `1px solid ${T.border}`,
              display: "grid",
              gap: 16,
              alignContent: "start",
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-mono" style={{ fontSize: 10, letterSpacing: 1, color: T.fgTertiary }}>
                  {showResults ? "RESULTS" : "RUNNING TOTAL"}
                </div>
                <div style={{ marginTop: 4, fontSize: 18, fontWeight: 800, color: T.fgPrimary }}>
                  {showResults ? "Your subscription reality check" : "Your subscription burn rate"}
                </div>
              </div>
              <div
                style={{
                  minWidth: 72,
                  height: 72,
                  borderRadius: 20,
                  display: "grid",
                  placeItems: "center",
                  background: `${T.accentPrimary}12`,
                  border: `1px solid ${T.accentPrimary}33`,
                  color: T.accentPrimary,
                }}
              >
                <CircleDollarSign size={30} />
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: 12,
              }}
            >
              <MetricCard label="MONTHLY" value={formatCurrency(totals.monthly)} accent={T.accentPrimary} />
              <MetricCard label="ANNUAL" value={formatCurrency(totals.annual)} />
              <MetricCard label="DAILY" value={formatCurrency(totals.daily)} />
            </div>

            {showResults ? (
              <div
                style={{
                  borderRadius: 18,
                  padding: 16,
                  background: `${T.semWarning}10`,
                  border: `1px solid ${T.semWarning}33`,
                }}
              >
                <div className="font-mono" style={{ fontSize: 10, color: T.semWarning, letterSpacing: 1 }}>
                  RELATABLE BENCHMARK
                </div>
                <div style={{ marginTop: 8, fontSize: 15, fontWeight: 700, color: T.fgPrimary }}>
                  {benchmark}
                </div>
                <div style={{ marginTop: 8, fontSize: 13, color: T.fgSecondary, lineHeight: 1.7 }}>
                  Most people forget 3-4 subscriptions. Want Cushn to help find the rest?
                </div>
              </div>
            ) : (
              <div
                style={{
                  borderRadius: 18,
                  padding: 16,
                  background: T.bgElevated,
                  border: `1px solid ${T.border}`,
                }}
              >
                <div className="font-mono" style={{ fontSize: 10, color: T.fgTertiary, letterSpacing: 1 }}>
                  NEXT STEP
                </div>
                <div style={{ marginTop: 8, fontSize: 13, color: T.fgSecondary, lineHeight: 1.7 }}>
                  Add at least 3 subscriptions to unlock your results and see the monthly, annual, and daily impact.
                </div>
                <div className="flex items-center gap-2" style={{ marginTop: 12, color: auditReady ? T.semSuccess : T.fgTertiary }}>
                  <Clock3 size={14} />
                  <span style={{ fontSize: 12 }}>
                    {auditReady ? "Results ready" : `${Math.max(0, 3 - items.length)} more to see your results`}
                  </span>
                </div>
              </div>
            )}

            <div
              style={{
                borderRadius: 18,
                padding: 16,
                background: T.bgElevated,
                border: `1px solid ${T.border}`,
              }}
            >
              <div className="font-mono" style={{ fontSize: 10, color: T.fgTertiary, letterSpacing: 1 }}>
                ADDED SERVICES
              </div>
              <div style={{ marginTop: 8, fontSize: 13, color: T.fgSecondary }}>
                {totals.itemCount} subscriptions in this estimate.
              </div>

              <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
                {items.length ? (
                  items.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                        borderRadius: 14,
                        padding: "12px 14px",
                        background: T.bgBase,
                        border: `1px solid ${T.border}`,
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: T.fgPrimary }}>{item.name}</div>
                        <div style={{ fontSize: 12, color: T.fgSecondary, marginTop: 4 }}>
                          {item.category} {item.isKnownService ? "• known price" : "• custom amount"}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div style={{ fontSize: 14, fontWeight: 700, color: T.fgPrimary }}>
                          {formatCurrency(item.monthlyAmount)}/mo
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          aria-label={`Remove ${item.name}`}
                          className="interactive-btn cursor-pointer"
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 10,
                            border: `1px solid ${T.border}`,
                            background: T.bgSurface,
                            color: T.fgSecondary,
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div
                    style={{
                      borderRadius: 14,
                      padding: "14px 16px",
                      background: T.bgBase,
                      border: `1px dashed ${T.border}`,
                      color: T.fgSecondary,
                      fontSize: 13,
                    }}
                  >
                    No services added yet. Tap a quick pick or enter one manually.
                  </div>
                )}
              </div>

              {!showResults && (
                <button
                  onClick={() => setShowResults(true)}
                  disabled={!auditReady}
                  className="interactive-btn cursor-pointer"
                  style={{
                    marginTop: 16,
                    width: "100%",
                    height: 44,
                    borderRadius: 14,
                    border: "none",
                    background: auditReady ? T.accentPrimary : T.fgDivider,
                    color: "#fff",
                    fontWeight: 700,
                    opacity: auditReady ? 1 : 0.5,
                  }}
                >
                  See my results
                </button>
              )}
            </div>
          </AppSurfaceCard>
        </PageShell>
      </section>

      <PageShell width="wide" style={{ paddingTop: 28, paddingBottom: 40, display: "grid", gap: 22 }}>
        <AppSurfaceCard
          className="motion-rise-in motion-delay-2"
          style={{
            padding: 22,
            background: T.bgSurface,
            border: `1px solid ${T.border}`,
            display: "grid",
            gap: 18,
          }}
        >
          <div>
            <div className="font-mono" style={{ fontSize: 10, color: T.fgTertiary, letterSpacing: 1 }}>
              ADD SERVICES
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: T.fgPrimary, marginTop: 6 }}>
              Start with what you remember, then fill in the rest
            </div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {QUICK_SERVICES.map((service) => (
              <button
                key={service.id}
                onClick={() => handleAddService(service)}
                className="interactive-btn cursor-pointer"
                style={{
                  height: 38,
                  padding: "0 14px",
                  borderRadius: 999,
                  border: `1px solid ${T.border}`,
                  background: T.bgElevated,
                  color: T.fgPrimary,
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {service.name}
              </button>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 12,
            }}
          >
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Type a service, app, membership, or subscription"
              className="interactive-input"
              style={{
                height: 48,
                borderRadius: 14,
                border: `1px solid ${matchedService ? T.accentPrimary : T.border}`,
                background: T.bgElevated,
                color: T.fgPrimary,
                padding: "0 14px",
              }}
            />
            <input
              value={customAmount}
              onChange={(event) => setCustomAmount(event.target.value)}
              inputMode="decimal"
              placeholder={matchedService ? "Known price" : "Monthly amount"}
              disabled={Boolean(matchedService)}
              className="interactive-input"
              style={{
                height: 48,
                borderRadius: 14,
                border: `1px solid ${T.border}`,
                background: matchedService ? T.bgMuted : T.bgElevated,
                color: T.fgPrimary,
                padding: "0 14px",
                opacity: matchedService ? 0.7 : 1,
              }}
            />
            <button
              onClick={handleSubmit}
              className="interactive-btn cursor-pointer"
              style={{
                height: 48,
                padding: "0 16px",
                borderRadius: 14,
                border: "none",
                background: T.accentPrimary,
                color: "#fff",
                fontWeight: 700,
              }}
            >
              <span className="flex items-center gap-2">
                <Plus size={16} />
                Add
              </span>
            </button>
          </div>

          {matchedService ? (
            <div
              style={{
                borderRadius: 14,
                padding: "12px 14px",
                background: `${T.accentPrimary}10`,
                border: `1px solid ${T.accentPrimary}33`,
                color: T.fgSecondary,
                fontSize: 13,
              }}
            >
              Matched <strong style={{ color: T.fgPrimary }}>{matchedService.name}</strong> at{" "}
              <strong style={{ color: T.fgPrimary }}>
                {formatCurrency(
                  matchedService.monthlyPrice ||
                    (matchedService.annualPrice ? matchedService.annualPrice / 12 : 0),
                )}
                /mo
              </strong>
              .
            </div>
          ) : null}

          {error ? (
            <div
              className="flex items-center gap-2"
              style={{
                borderRadius: 14,
                padding: "12px 14px",
                background: `${T.semWarning}12`,
                border: `1px solid ${T.semWarning}33`,
                color: T.semWarning,
                fontSize: 13,
              }}
            >
              <TriangleAlert size={15} />
              {error}
            </div>
          ) : null}
        </AppSurfaceCard>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 22 }}>
          <AppSurfaceCard
            style={{
              padding: 22,
              background: T.bgSurface,
              border: `1px solid ${T.border}`,
            }}
          >
            <div className="font-mono" style={{ fontSize: 10, color: T.fgTertiary, letterSpacing: 1 }}>
              BIGGEST COSTS
            </div>
            <div style={{ marginTop: 8, fontSize: 18, fontWeight: 800, color: T.fgPrimary }}>
              Start with the priciest recurring charges
            </div>
            <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
              {suggestions.map((item, index) => (
                <div
                  key={`${item.id}-suggestion`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    paddingBottom: 12,
                    borderBottom: index === suggestions.length - 1 ? "none" : `1px solid ${T.border}`,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: T.fgPrimary }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: T.fgSecondary, marginTop: 4 }}>
                      {formatCurrency(item.monthlyAmount * 12)}/year
                    </div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.semWarning }}>
                    {formatCurrency(item.monthlyAmount)}/mo
                  </div>
                </div>
              ))}
            </div>
          </AppSurfaceCard>

          <AppHeroCard
            style={{
              padding: 22,
              background: `linear-gradient(180deg, ${T.bgSurface}, ${T.bgElevated})`,
              border: `1px solid ${T.border}`,
            }}
          >
            <div className="font-mono" style={{ fontSize: 10, color: T.fgTertiary, letterSpacing: 1 }}>
              NEXT STEP
            </div>
            <div style={{ marginTop: 8, fontSize: 24, fontWeight: 800, color: T.fgPrimary, lineHeight: 1.1 }}>
              Turn this estimate into an actual subscription dashboard.
            </div>
            <div style={{ marginTop: 12, fontSize: 14, color: T.fgSecondary, lineHeight: 1.7 }}>
              Use guest mode to keep going instantly, or create an account to sync, budget, and get renewal reminders.
            </div>

            <div style={{ display: "grid", gap: 12, marginTop: 20 }}>
              <Link
                to={guestHref}
                className="interactive-btn"
                style={{
                  height: 48,
                  borderRadius: 14,
                  background: T.accentPrimary,
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Continue in guest mode <ArrowRight size={16} />
              </Link>
              <Link
                to={signupHref}
                className="interactive-btn"
                style={{
                  height: 48,
                  borderRadius: 14,
                  background: T.bgSurface,
                  border: `1px solid ${T.border}`,
                  color: T.fgPrimary,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Create account <ArrowRight size={16} />
              </Link>
            </div>
          </AppHeroCard>
        </div>
      </PageShell>

      <PublicFooter />
    </div>
  );
}
