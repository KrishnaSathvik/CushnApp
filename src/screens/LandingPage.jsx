import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Bell,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Mic,
  Paperclip,
  PieChart,
  Plus,
  Search,
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
  getQuickAuditServices,
} from "../lib/auditCalculator";
import { PUBLIC_TYPE } from "../lib/publicLayout";
import PublicHeader from "../components/PublicHeader";
import PublicFooter from "../components/PublicFooter";
import PageShell from "../components/layout/PageShell";
import PageIntro from "../components/layout/PageIntro";
import AppHeroCard from "../components/ui/AppHeroCard";
import AppSurfaceCard from "../components/ui/AppSurfaceCard";

const QUICK_SERVICES = getQuickAuditServices(10);
const LANDING_AUDIT_DRAFT_KEY = "cushn_landing_audit_draft_v1";

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
      <div style={{ marginTop: 8, fontSize: 26, fontWeight: 800, color: T.fgPrimary }}>
        {value}
      </div>
      {helper ? (
        <div style={{ marginTop: 6, fontSize: 12, color: T.fgSecondary }}>{helper}</div>
      ) : null}
    </AppSurfaceCard>
  );
}

function HeroAuditCalculator() {
  const { T } = useTheme();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  const matchedService = useMemo(() => findAuditService(query), [query]);
  const totals = useMemo(() => calculateAuditTotals(items), [items]);
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
  };

  const removeItem = (id) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  const persistDraftAndNavigate = (path) => {
    if (typeof window !== "undefined") {
      if (items.length > 0) {
        window.sessionStorage.setItem(LANDING_AUDIT_DRAFT_KEY, JSON.stringify(items));
      } else {
        window.sessionStorage.removeItem(LANDING_AUDIT_DRAFT_KEY);
      }
    }
    navigate(path);
  };

  return (
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
      <div className="flex items-center justify-between gap-3" style={{ flexWrap: "wrap" }}>
        <div>
          <div className="font-mono" style={{ fontSize: 10, letterSpacing: 1, color: T.fgTertiary }}>
            LIVE CALCULATOR
          </div>
          <div style={{ marginTop: 6, fontSize: 20, fontWeight: 800, color: T.fgPrimary }}>
            Build your estimate in seconds
          </div>
        </div>
        <div
          className="font-mono"
          style={{
            fontSize: 10,
            color: T.semWarning,
            border: `1px solid ${T.semWarning}44`,
            background: `${T.semWarning}14`,
            borderRadius: 999,
            padding: "4px 8px",
            fontWeight: 700,
            marginLeft: "auto",
            textAlign: "center",
            lineHeight: 1.2,
            whiteSpace: "normal",
          }}
        >
          NO BANK LOGIN
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
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
        }}
      >
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Type a service"
          className="interactive-input"
          style={{
            height: 46,
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
            height: 46,
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
            height: 46,
            padding: "0 16px",
            borderRadius: 14,
            border: "none",
            background: T.accentPrimary,
            color: "#fff",
            fontWeight: 700,
          }}
        >
          <span className="flex items-center justify-center gap-2">
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

      {auditReady ? (
        <div
          style={{
            borderRadius: 18,
            padding: 16,
            background: `${T.semWarning}10`,
            border: `1px solid ${T.semWarning}33`,
          }}
        >
          <div className="font-mono" style={{ fontSize: 10, color: T.semWarning, letterSpacing: 1 }}>
            CONVERSION PROMPT
          </div>
          <div style={{ marginTop: 8, fontSize: 15, fontWeight: 700, color: T.fgPrimary }}>
            {benchmark}
          </div>
          <div style={{ marginTop: 8, fontSize: 13, color: T.fgSecondary, lineHeight: 1.7 }}>
            Most people miss a few subscriptions on the first pass. Cushn helps you find the rest, stay ahead of renewals, and spot easy cuts.
          </div>
          <div className="flex flex-wrap gap-3" style={{ marginTop: 14 }}>
            <button
              onClick={() => persistDraftAndNavigate("/guest?redirect=/add")}
              className="interactive-btn cursor-pointer border-none font-mono"
              style={{
                height: 40,
                padding: "0 16px",
                borderRadius: 999,
                background: T.accentPrimary,
                color: T.fgOnAccent,
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              See what I am spending
            </button>
            <button
              onClick={() => persistDraftAndNavigate("/signup?redirect=/add")}
              className="interactive-btn cursor-pointer font-mono"
              style={{
                height: 40,
                padding: "0 16px",
                borderRadius: 999,
                border: `1px solid ${T.border}`,
                background: T.bgSurface,
                color: T.fgPrimary,
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              Create account
            </button>
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
            Add at least 3 subscriptions to see how fast the total builds and unlock a smarter next step.
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
      </div>
    </AppSurfaceCard>
  );
}

function HeroSection() {
  const { T } = useTheme();
  const navigate = useNavigate();

  const persistEmptyDraftAndNavigate = (path) => {
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(LANDING_AUDIT_DRAFT_KEY);
    }
    navigate(path);
  };

  return (
    <section
      style={{
        padding: "56px 0 34px",
        borderBottom: `1px solid ${T.border}`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.06,
          backgroundImage: `linear-gradient(${T.accentPrimary} 1px, transparent 1px), linear-gradient(90deg, ${T.accentPrimary} 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
          pointerEvents: "none",
        }}
      />

      <PageShell
        width="default"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 22,
          position: "relative",
          zIndex: 1,
        }}
      >
        <AppHeroCard
          className="motion-rise-in"
          style={{
            padding: 24,
            background: T.bgSurface,
            border: `1px solid ${T.border}`,
            display: "flex",
            alignItems: "center",
          }}
        >
          <div>
            <PageIntro
              eyebrow="Subscription intelligence"
              title="Your subscriptions are costing more than you think. Cushn finds the waste."
              subtitle="See what you are paying for, what looks wasteful, and which renewals are about to hit. No bank login required."
              titleStyle={{
                fontSize: PUBLIC_TYPE.heroTitle,
                lineHeight: 1.02,
                letterSpacing: -1.3,
                marginTop: 18,
              }}
              subtitleStyle={{
                marginTop: 16,
                fontSize: 15,
                lineHeight: 1.75,
                maxWidth: 560,
              }}
            />

            <div
              className="motion-rise-in motion-delay-2"
              style={{
                marginTop: 18,
                display: "grid",
                gap: 8,
                maxWidth: 560,
              }}
            >
              {[
                "Start with what you remember. Rough guesses work.",
                "Watch the monthly and annual total update instantly.",
                "Turn a quick estimate into a cleaner subscription plan.",
              ].map((item) => (
                <div
                  key={item}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    color: T.fgSecondary,
                    fontSize: 13,
                    lineHeight: 1.6,
                  }}
                >
                  <CheckCircle2 size={14} color={T.accentPrimary} />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div
              className="motion-rise-in motion-delay-3"
              style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20 }}
            >
              <button
                onClick={() => persistEmptyDraftAndNavigate("/guest?redirect=/add")}
                className="interactive-btn cursor-pointer border-none font-mono"
                style={{
                  height: 40,
                  padding: "0 18px",
                  background: T.accentPrimary,
                  color: T.fgOnAccent,
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: `0 0 24px ${T.accentPrimary}44`,
                }}
              >
                Find my waste <ArrowRight size={14} />
              </button>
              <button
                onClick={() => persistEmptyDraftAndNavigate("/signup")}
                className="interactive-btn cursor-pointer font-mono"
                style={{
                  height: 40,
                  padding: "0 18px",
                  background: T.bgElevated,
                  color: T.fgPrimary,
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  border: `1px solid ${T.border}`,
                }}
              >
                Create account <ChevronRight size={14} />
              </button>
            </div>

            <div
              className="font-mono"
              style={{ marginTop: 12, fontSize: 11, color: T.fgTertiary }}
            >
              Try it free in guest mode. Upgrade to sync anytime.
            </div>
          </div>
        </AppHeroCard>

        <HeroAuditCalculator />
      </PageShell>
    </section>
  );
}

function StatsStrip() {
  const { T } = useTheme();
  const stats = [
    {
      value: "$200+",
      label: "Typical monthly subscription spend once people add everything they forgot.",
    },
    {
      value: "3-4",
      label: "Forgotten subscriptions most users usually uncover in their first audit.",
    },
    {
      value: "1 tap",
      label: "From spotting a subscription worth reviewing to taking action in the app.",
    },
  ];

  return (
    <section style={{ padding: "22px 0 10px" }}>
      <PageShell width="default">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {stats.map((item) => (
            <AppSurfaceCard
              key={item.value}
              style={{
                padding: 16,
                background: T.bgSurface,
                border: `1px solid ${T.border}`,
              }}
            >
              <div
                className="font-mono"
                style={{ fontSize: 24, color: T.accentPrimary, fontWeight: 800 }}
              >
                {item.value}
              </div>
              <div style={{ marginTop: 6, fontSize: 12, color: T.fgSecondary, lineHeight: 1.6 }}>
                {item.label}
              </div>
            </AppSurfaceCard>
          ))}
        </div>
      </PageShell>
    </section>
  );
}

function TierCard({ title, subtitle, icon: Icon, color, items }) {
  const { T } = useTheme();

  return (
    <AppSurfaceCard
      style={{
        background: T.bgSurface,
        padding: 18,
        border: `1px solid ${T.border}`,
        height: "100%",
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          display: "grid",
          placeItems: "center",
          borderRadius: 10,
          border: `1px solid ${color}55`,
          background: `${color}1f`,
          marginBottom: 12,
        }}
      >
        <Icon size={16} color={color} />
      </div>
      <div style={{ color: T.fgPrimary, fontSize: 18, fontWeight: 700 }}>{title}</div>
      <div style={{ color: T.fgSecondary, fontSize: 13, lineHeight: 1.65, marginTop: 8 }}>
        {subtitle}
      </div>
      <div style={{ display: "grid", gap: 8, marginTop: 14 }}>
        {items.map((item) => (
          <div
            key={item}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: T.fgSecondary,
              fontSize: 12,
              lineHeight: 1.55,
            }}
          >
            <CheckCircle2 size={13} color={color} />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </AppSurfaceCard>
  );
}

function FeaturesSection() {
  const { T } = useTheme();

  return (
    <section id="features" style={{ padding: "34px 0 48px" }}>
      <PageShell width="default">
        <div style={{ marginBottom: 18 }}>
          <PageIntro
            eyebrow="Why Cushn"
            title="Three layers of value, in the order people actually care about"
            subtitle="First find everything. Then understand what it adds up to. Then stay ahead of the next charge."
            titleStyle={{ fontSize: 28, letterSpacing: -0.6 }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <TierCard
            title="Find what you are paying for"
            subtitle="Start with rough notes, quick memory, or uploads. Cushn turns scattered inputs into a clean subscription list."
            icon={Sparkles}
            color={T.accentPrimary}
            items={[
              "Smart paste for messy notes",
              "Voice input when typing is slower",
              "Review imports before anything gets saved",
            ]}
          />
          <TierCard
            title="See what you are wasting"
            subtitle="See clear totals, likely waste, and patterns that explain where your recurring spend is getting heavier than it should be."
            icon={PieChart}
            color={T.semWarning}
            items={[
              "Monthly and annual recurring totals",
              "Duplicate vendor detection",
              "Subscriptions worth reconsidering and spend trend insights",
            ]}
          />
          <TierCard
            title="Never get surprised"
            subtitle="Once the spend is visible, Cushn helps you stay ahead of renewal timing, heavier weeks, and upcoming charges."
            icon={Bell}
            color={T.semSuccess}
            items={[
              "Upcoming renewal calendar",
              "Due-soon alerts and weekly charge visibility",
              "Renewal reminders before charges hit",
            ]}
          />
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-3"
          style={{ marginTop: 14 }}
        >
          {[
            {
              icon: Mic,
              title: "Add subscriptions faster",
              desc: "Say or type what you remember and let Cushn structure it for you.",
            },
            {
              icon: Paperclip,
              title: "Catch what memory misses",
              desc: "Upload statements after your first pass to catch the subscriptions you forgot.",
            },
            {
              icon: Calendar,
              title: "See renewals by date",
              desc: "See the heavy charge days before they hit your account.",
            },
          ].map((item) => (
            <AppSurfaceCard
              key={item.title}
              style={{
                padding: 16,
                background: T.bgSurface,
                border: `1px solid ${T.border}`,
              }}
            >
              <div className="flex items-center gap-2">
                <item.icon size={15} color={T.accentPrimary} />
                <div style={{ color: T.fgPrimary, fontSize: 14, fontWeight: 700 }}>
                  {item.title}
                </div>
              </div>
              <div style={{ marginTop: 8, color: T.fgSecondary, fontSize: 12, lineHeight: 1.6 }}>
                {item.desc}
              </div>
            </AppSurfaceCard>
          ))}
        </div>
      </PageShell>
    </section>
  );
}

function BottomCTA() {
  const { T } = useTheme();
  const navigate = useNavigate();

  const persistEmptyDraftAndNavigate = (path) => {
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(LANDING_AUDIT_DRAFT_KEY);
    }
    navigate(path);
  };

  return (
    <section style={{ padding: "10px 0 64px" }}>
      <PageShell width="default">
        <AppHeroCard
          style={{
            border: `1px solid ${T.border}`,
            padding: "28px 20px",
            background: `linear-gradient(180deg, ${T.bgElevated}, ${T.bgSurface})`,
            display: "flex",
            flexWrap: "wrap",
            gap: 14,
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                color: T.fgPrimary,
                fontSize: 25,
                letterSpacing: -0.7,
                fontWeight: 700,
              }}
            >
              Try it free, no account needed.
            </div>
            <div style={{ color: T.fgSecondary, fontSize: 13, marginTop: 7, maxWidth: 560 }}>
              Start in guest mode, get a clear picture of your recurring spend, and upgrade to sync across devices whenever you want.
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={() => persistEmptyDraftAndNavigate("/guest?redirect=/add")}
              className="interactive-btn cursor-pointer border-none font-mono"
              style={{
                height: 40,
                padding: "0 18px",
                background: T.accentPrimary,
                color: T.fgOnAccent,
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              See what I am spending <ChevronRight size={14} />
            </button>
            <button
              onClick={() => persistEmptyDraftAndNavigate("/signup")}
              className="interactive-btn cursor-pointer font-mono"
              style={{
                height: 40,
                padding: "0 18px",
                background: T.bgBase,
                color: T.fgPrimary,
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                border: `1px solid ${T.border}`,
              }}
            >
              Create account <ArrowRight size={14} />
            </button>
          </div>
        </AppHeroCard>
      </PageShell>
    </section>
  );
}

export default function LandingPage() {
  const { T } = useTheme();

  return (
    <div className="public-page" style={{ background: T.bgBase }}>
      <PublicHeader />
      <HeroSection />
      <StatsStrip />
      <FeaturesSection />
      <BottomCTA />
      <PublicFooter />
    </div>
  );
}
