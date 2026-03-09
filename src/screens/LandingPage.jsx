import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Wallet,
  PieChart,
  Mic,
  Calendar,
  Bell,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { PUBLIC_TYPE } from "../lib/publicLayout";
import PublicHeader from "../components/PublicHeader";
import PublicFooter from "../components/PublicFooter";
import PageShell from "../components/layout/PageShell";
import PageIntro from "../components/layout/PageIntro";
import AppHeroCard from "../components/ui/AppHeroCard";
import AppSurfaceCard from "../components/ui/AppSurfaceCard";
import DashboardPreviewMock from "../components/ui/DashboardPreviewMock";

function TemplateHeroV1() {
  const { T } = useTheme();
  const navigate = useNavigate();


  return (
    <section
      style={{
        padding: "56px 0 30px",
        borderBottom: `1px solid ${T.border}`,
        position: "relative",
        overflow: "hidden",
      }}
    >
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

      <PageShell
        width="default"
        className="motion-scale-in"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 22,
          position: "relative",
          zIndex: 1,
        }}
      >
        <AppHeroCard
          className="motion-rise-in"
          style={{
            padding: 22,
            background: T.bgSurface,
            border: `1px solid ${T.border}`,
            display: "flex",
            alignItems: "center",
          }}
        >
          <div>
            <PageIntro
              eyebrow="Command center"
              title="A cleaner command center for every subscription."
              subtitle="Capture what you pay for, see upcoming renewals clearly, and keep recurring spend under control without another spreadsheet."
              titleStyle={{
                fontSize: PUBLIC_TYPE.heroTitle,
                lineHeight: 1.06,
                letterSpacing: -1.2,
              }}
              subtitleStyle={{
                marginTop: 14,
                fontSize: 14,
                lineHeight: 1.7,
                maxWidth: 520,
              }}
            />



            <div
              className="motion-rise-in motion-delay-3"
              style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}
            >
              <button
                onClick={() => navigate("/guest")}
                className="interactive-btn cursor-pointer border-none font-mono"
                style={{
                  height: 38,
                  padding: "0 16px",
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
                Start tracking free <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </AppHeroCard>

        <DashboardPreviewMock variant="landing" />
      </PageShell>
    </section>
  );
}

function TemplateFeaturesV1() {
  const { T } = useTheme();
  const cards = [
    {
      icon: Sparkles,
      title: "Capture in plain English",
      desc: "Paste a sentence and let the add flow parse the vendor, amount, and billing cadence.",
      color: T.accentPrimary,
    },
    {
      icon: Mic,
      title: "Add by voice",
      desc: "Dictate subscriptions on the go when typing is slower than speaking.",
      color: T.semCloud,
    },
    {
      icon: Calendar,
      title: "Track upcoming renewals",
      desc: "See what is due next in a calendar-first timeline before charges hit.",
      color: T.semInfo,
    },
    {
      icon: PieChart,
      title: "Analyze recurring spend",
      desc: "Break down subscriptions by category and spot where monthly cost is drifting.",
      color: T.semWarning,
    },
    {
      icon: Wallet,
      title: "Set budget guardrails",
      desc: "Compare recurring spend with a target and see overages before renewal week.",
      color: T.semDanger,
    },
    {
      icon: Bell,
      title: "Stay ahead with reminder delivery",
      desc: "Use in-app and email reminders so upcoming bills stay visible before charges hit.",
      color: T.semSuccess,
    },
  ];

  return (
    <section id="features" style={{ padding: "38px 0 44px" }}>
      <PageShell width="default">
        <div style={{ marginBottom: 18 }}>
          <PageIntro
            eyebrow="Features"
            title="What you can do from one dashboard"
            subtitle="Everything below points to a distinct part of the product instead of repeating the same flow in different words."
            titleStyle={{ fontSize: 26, letterSpacing: -0.5 }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {cards.map((card, idx) => (
            <AppSurfaceCard
              className="motion-rise-in"
              key={card.title}
              as="article"
              style={{
                background: T.bgSurface,
                padding: 16,
                animationDelay: `${idx * 60}ms`,
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: 8,
                  border: `1px solid ${card.color}55`,
                  background: `${card.color}1f`,
                  marginBottom: 10,
                }}
              >
                <card.icon size={16} color={card.color} />
              </div>
              <h3 style={{ margin: 0, color: T.fgHigh, fontSize: 14 }}>
                {card.title}
              </h3>
              <p
                style={{
                  margin: "8px 0 0",
                  color: T.fgMedium,
                  fontSize: 12,
                  lineHeight: 1.6,
                }}
              >
                {card.desc}
              </p>
            </AppSurfaceCard>
          ))}
        </div>
      </PageShell>
    </section>
  );
}

function TemplateCTAV1() {
  const { T } = useTheme();
  const navigate = useNavigate();

  return (
    <section style={{ padding: "28px 0 64px" }}>
      <PageShell width="default">
        <AppHeroCard
          style={{
            border: `1px solid ${T.border}`,
            padding: "26px 18px",
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
                color: T.fgHigh,
                fontSize: 24,
                letterSpacing: -0.6,
                fontWeight: 700,
              }}
            >
              Start before the next renewal sneaks through.
            </div>
            <div style={{ color: T.fgMedium, fontSize: 13, marginTop: 6 }}>
              Try the tracker in guest mode first, then create an account when you want sync across devices.
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={() => navigate("/guest")}
              className="interactive-btn cursor-pointer border-none font-mono"
              style={{
                height: 38,
                padding: "0 16px",
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
              Start tracking free <ChevronRight size={14} />
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="interactive-btn cursor-pointer font-mono"
              style={{
                height: 38,
                padding: "0 16px",
                background: T.bgBase,
                color: T.fgHigh,
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
      <TemplateHeroV1 />
      <TemplateFeaturesV1 />
      <TemplateCTAV1 />
      <PublicFooter />
    </div>
  );
}
