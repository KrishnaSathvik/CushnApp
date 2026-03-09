import React, { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import AppSurfaceCard from "./AppSurfaceCard";
const DOMAINS = {
  Netflix: "netflix.com",
  Spotify: "spotify.com",
  GitHub: "github.com",
  Figma: "figma.com",
  "Claude Pro": "anthropic.com",
  "Apple One": "apple.com",
};

function PreviewLogo({ name, size = 18, radius = 5 }) {
  const { T } = useTheme();
  const [failed, setFailed] = useState(false);
  const domain = DOMAINS[name];
  const fallbackColors = [T.semDanger, T.semSuccess, T.semInfo, T.accentPrimary, T.semCloud, T.semWarning];
  const fallbackColor = fallbackColors[Math.max(name.length - 1, 0) % fallbackColors.length] || T.accentPrimary;
  const color = fallbackColor;
  const src = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : null;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: failed || !src ? `${color}18` : T.bgElevated,
        border: failed || !src ? `1px solid ${color}33` : `1px solid ${T.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        overflow: "hidden",
        padding: failed || !src ? 0 : 3,
        fontSize: size * 0.42,
        fontWeight: 800,
        color,
        letterSpacing: -0.2,
      }}
    >
      {failed || !src ? (
        name[0]
      ) : (
        <img
          src={src}
          alt={name}
          onError={() => setFailed(true)}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      )}
    </div>
  );
}

const VARIANTS = {
  landing: {
    metrics: [
      { label: "Active", value: "12" },
      { label: "Due soon", value: "4" },
      { label: "Monthly", value: "$186" },
    ],
    trendLabel: "RENEWAL OUTLOOK",
    trendValue: "4 due this week",
    trendStops: ["semInfo", "accentPrimary"],
    trendPath: "M0 64 L40 58 L80 62 L120 50 L160 52 L200 40 L240 28 L260 24",
    trendDotColor: "accentPrimary",
    listLabel: "UPCOMING RENEWALS",
    rows: [
      { name: "Netflix", amount: "$15.99", meta: "Due today" },
      { name: "Spotify", amount: "$10.99", meta: "In 2 days" },
      { name: "Claude Pro", amount: "$20.00", meta: "In 6 days" },
    ],
  },
  auth: {
    metrics: [
      { label: "Active", value: "12" },
      { label: "Next due", value: "Today" },
      { label: "Budget left", value: "$84" },
    ],
    trendLabel: "SYNCED OVERVIEW",
    trendValue: "Budget + renewals aligned",
    trendStops: ["accentPrimary", "semSuccess"],
    trendPath: "M0 68 L36 66 L72 61 L108 57 L144 49 L180 42 L216 37 L252 33",
    trendDotColor: "semSuccess",
    listLabel: "SPEND BY CATEGORY",
    rows: [
      { name: "Entertainment", amount: "38%", meta: 38, colorKey: "semDanger", bar: true },
      { name: "Productivity", amount: "34%", meta: 34, colorKey: "accentPrimary", bar: true },
      { name: "Utilities", amount: "28%", meta: 28, colorKey: "semInfo", bar: true },
    ],
  },
};

export default function DashboardPreviewMock({ compact = false, variant = "landing" }) {
  const { T } = useTheme();
  const config = VARIANTS[variant] || VARIANTS.landing;
  const gridColumns = compact ? "repeat(2, minmax(0, 1fr))" : "repeat(3, minmax(0, 1fr))";
  const gradientId = `preview-${variant}-${compact ? "compact" : "full"}`;

  return (
    <AppSurfaceCard
      className="relative z-10"
      style={{
        background: T.bgSurface,
        padding: compact ? 12 : 14,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${T.border}`,
          paddingBottom: 10,
          marginBottom: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <img
            src="/logo.png"
            alt="Cushn"
            style={{ width: 18, height: 18, borderRadius: 5 }}
          />
          <span
            className="font-mono"
            style={{
              fontSize: 11,
              color: T.fgHigh,
              letterSpacing: 0.6,
              fontWeight: 700,
            }}
          >
            CUSHN DASHBOARD
          </span>
        </div>
        <span
          className="status-chip-pulse font-mono"
          style={{
            fontSize: 10,
            color: T.semSuccess,
            padding: "3px 8px",
            borderRadius: 999,
            border: `1px solid ${T.semSuccess}44`,
            background: `${T.semSuccess}12`,
            fontWeight: 700,
          }}
        >
          SYNCED
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: gridColumns,
          gap: 8,
          marginBottom: 10,
        }}
      >
        {config.metrics.map((item) => (
          <AppSurfaceCard key={item.label} tone="muted" style={{ padding: "9px 8px", background: T.bgElevated }}>
            <div className="font-mono" style={{ fontSize: 9, color: T.fgSubtle }}>
              {item.label}
            </div>
            <div className="font-mono" style={{ marginTop: 4, fontSize: 15, color: T.fgHigh, fontWeight: 700 }}>
              {item.value}
            </div>
          </AppSurfaceCard>
        ))}
      </div>

      <AppSurfaceCard tone="muted" style={{ background: T.bgElevated, padding: 10, marginBottom: 10 }}>
        <div className="flex justify-between items-center mb-2">
          <span className="font-mono" style={{ fontSize: 10, color: T.fgMedium, fontWeight: 700 }}>
            {config.trendLabel}
          </span>
          <span className="font-mono" style={{ fontSize: 10, color: T[config.trendDotColor] || T.accentPrimary, fontWeight: 700 }}>
            {config.trendValue}
          </span>
        </div>
        <svg viewBox="0 0 260 90" width="100%" height="90" aria-hidden="true">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={T[config.trendStops[0]]} />
              <stop offset="100%" stopColor={T[config.trendStops[1]]} />
            </linearGradient>
          </defs>
          <line x1="0" y1="74" x2="260" y2="74" stroke={T.border} />
          <path className="trend-line-animate" d={config.trendPath} fill="none" stroke={`url(#${gradientId})`} strokeWidth="3" strokeLinecap="round" />
          <circle className="trend-dot-pulse" cx={variant === "auth" ? "252" : "260"} cy={variant === "auth" ? "28" : "24"} r="4" fill={T[config.trendDotColor] || T.accentPrimary} />
        </svg>
      </AppSurfaceCard>

      <AppSurfaceCard tone="muted" style={{ background: T.bgElevated, padding: 10 }}>
        <div className="font-mono" style={{ fontSize: 10, color: T.fgMedium, letterSpacing: 0.8, fontWeight: 700, marginBottom: 8 }}>
          {config.listLabel}
        </div>
        {config.rows.map((row) =>
          row.bar ? (
            <div key={row.name} className="flex items-center gap-2.5" style={{ padding: "4px 0", marginBottom: 2 }}>
              <div className="flex-1">
                <div className="font-mono" style={{ fontSize: 9, color: T.fgMedium, marginBottom: 4 }}>
                  {row.name}
                </div>
                <div style={{ height: 6, borderRadius: 999, background: T.border, overflow: "hidden" }}>
                  <div style={{ width: `${row.meta}%`, height: "100%", background: T[row.colorKey] || T.accentPrimary, borderRadius: 999 }} />
                </div>
              </div>
              <div className="font-mono" style={{ fontSize: 11, color: T.fgHigh, fontWeight: 700 }}>
                {row.amount}
              </div>
            </div>
          ) : (
            <div key={row.name} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderTop: `1px solid ${T.border}` }}>
              <PreviewLogo name={row.name} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: T.fgHigh }}>{row.name}</div>
                <div style={{ fontSize: 10, color: T.fgSubtle }}>{row.meta}</div>
              </div>
              <div style={{ fontSize: 11, color: T.accentPrimary, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
                {row.amount}
              </div>
            </div>
          ),
        )}
      </AppSurfaceCard>
    </AppSurfaceCard>
  );
}
