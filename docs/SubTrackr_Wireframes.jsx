import { useState } from "react";

// ─── Inline SVG Icons (zero dependencies) ────────────────────────────────────
const Ico = ({ d, size=16, color="currentColor", stroke=2, fill="none" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
    stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p,i) => <path key={i} d={p}/>) : <path d={d}/>}
  </svg>
);
const IcoC = ({ children, size=16, color="currentColor", stroke=2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

// Individual icon components
const RiHome4Line       = ({size=16,color="currentColor"}) => <Ico size={size} color={color} d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />;
const RiHome4Fill       = ({size=16,color="currentColor"}) => <Ico size={size} color={color} fill={color} stroke="none" d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />;
const RiAddCircleLine   = ({size=16,color="currentColor"}) => <IcoC size={size} color={color}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></IcoC>;
const RiAddCircleFill   = ({size=16,color="currentColor"}) => <IcoC size={size} color={color}><circle cx="12" cy="12" r="10" fill={color} stroke="none"/><line x1="12" y1="8" x2="12" y2="16" stroke="#fff" strokeWidth="2"/><line x1="8" y1="12" x2="16" y2="12" stroke="#fff" strokeWidth="2"/></IcoC>;
const RiPieChartLine    = ({size=16,color="currentColor"}) => <IcoC size={size} color={color}><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></IcoC>;
const RiPieChartFill    = ({size=16,color="currentColor"}) => <IcoC size={size} color={color}><path d="M21.21 15.89A10 10 0 1 1 8 2.83" fill={color} stroke={color}/><path d="M22 12A10 10 0 0 0 12 2v10z" fill={color} stroke={color}/></IcoC>;
const RiWallet3Line     = ({size=16,color="currentColor"}) => <IcoC size={size} color={color}><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M16 12h.01"/><path d="M2 10h20"/></IcoC>;
const RiWallet3Fill     = ({size=16,color="currentColor"}) => <IcoC size={size} color={color}><rect x="2" y="5" width="20" height="14" rx="2" fill={color} stroke={color}/><path d="M16 12h.01" stroke="#fff" strokeWidth="2"/><path d="M2 10h20" stroke="#fff" strokeWidth="1.5"/></IcoC>;
const RiSearchLine      = ({size=16,color="currentColor"}) => <IcoC size={size} color={color}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></IcoC>;
const RiSettingsLine    = ({size=16,color="currentColor"}) => <IcoC size={size} color={color}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></IcoC>;
const RiMicLine         = ({size=16,color="currentColor"}) => <IcoC size={size} color={color}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></IcoC>;
const RiMicFill         = ({size=16,color="currentColor"}) => <IcoC size={size} color={color}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill={color}/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></IcoC>;
const RiSparklingLine   = ({size=16,color="currentColor"}) => <IcoC size={size} color={color}><path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z"/></IcoC>;
const RiPencilLine      = ({size=16,color="currentColor"}) => <IcoC size={size} color={color}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></IcoC>;
const RiDeleteBin6Line  = ({size=16,color="currentColor"}) => <IcoC size={size} color={color}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></IcoC>;
const RiPauseCircleLine = ({size=16,color="currentColor"}) => <IcoC size={size} color={color}><circle cx="12" cy="12" r="10"/><line x1="10" y1="15" x2="10" y2="9"/><line x1="14" y1="15" x2="14" y2="9"/></IcoC>;
const RiAddLine         = ({size=16,color="currentColor"}) => <IcoC size={size} color={color}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></IcoC>;
const RiArrowLeftLine   = ({size=16,color="currentColor"}) => <IcoC size={size} color={color}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></IcoC>;
const RiArrowRightSLine = ({size=16,color="currentColor"}) => <IcoC size={size} color={color}><polyline points="9 18 15 12 9 6"/></IcoC>;
const RiCheckLine       = ({size=16,color="currentColor"}) => <IcoC size={size} color={color}><polyline points="20 6 9 17 4 12"/></IcoC>;
const RiCloseLine       = ({size=16,color="currentColor"}) => <IcoC size={size} color={color}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></IcoC>;
const RiAlertLine       = ({size=16,color="currentColor"}) => <IcoC size={size} color={color}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></IcoC>;
const RiDownloadLine    = ({size=16,color="currentColor"}) => <IcoC size={size} color={color}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></IcoC>;
const RiCalendarLine    = ({size=16,color="currentColor"}) => <IcoC size={size} color={color}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></IcoC>;
const RiFilmLine        = ({size=16,color="currentColor"}) => <IcoC size={size} color={color}><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></IcoC>;
const RiCodeLine        = ({size=16,color="currentColor"}) => <IcoC size={size} color={color}><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></IcoC>;
const RiHeartPulseLine  = ({size=16,color="currentColor"}) => <IcoC size={size} color={color}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></IcoC>;
const RiLightbulbLine   = ({size=16,color="currentColor"}) => <IcoC size={size} color={color}><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></IcoC>;
const RiNewspaperLine   = ({size=16,color="currentColor"}) => <IcoC size={size} color={color}><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6z"/></IcoC>;
const RiCloudLine       = ({size=16,color="currentColor"}) => <IcoC size={size} color={color}><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></IcoC>;
const RiFlashlightLine  = ({size=16,color="currentColor"}) => <IcoC size={size} color={color}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></IcoC>;
const RiBankLine        = ({size=16,color="currentColor"}) => <IcoC size={size} color={color}><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></IcoC>;
const RiShieldLine      = ({size=16,color="currentColor"}) => <IcoC size={size} color={color}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></IcoC>;
const RiMoreLine        = ({size=16,color="currentColor"}) => <IcoC size={size} color={color}><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></IcoC>;
const RiArrowDropDownLine = ({size=16,color="currentColor"}) => <IcoC size={size} color={color}><polyline points="6 9 12 15 18 9"/></IcoC>;
const RiSwapLine        = ({size=16,color="currentColor"}) => <IcoC size={size} color={color}><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></IcoC>;
const RiFilterLine      = ({size=16,color="currentColor"}) => <IcoC size={size} color={color}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></IcoC>;

// ─── Service → Domain map (Google Favicon API + logo.dev) ────────────────────
// Usage: https://www.google.com/s2/favicons?domain=netflix.com&sz=64
// Fallback: https://img.logo.dev/netflix.com?token=YOUR_TOKEN&size=64
// Final fallback: colored initial badge (onError handler)
const SERVICE_DOMAINS = {
  // Streaming / Entertainment
  "Netflix":       "netflix.com",
  "Spotify":       "spotify.com",
  "YouTube":       "youtube.com",
  "Hulu":          "hulu.com",
  "Disney+":       "disneyplus.com",
  "Apple TV+":     "tv.apple.com",
  "HBO Max":       "max.com",
  "Peacock":       "peacocktv.com",
  "Paramount+":    "paramountplus.com",
  "Crunchyroll":   "crunchyroll.com",
  "Twitch":        "twitch.tv",
  // Dev Tools
  "GitHub":        "github.com",
  "Figma":         "figma.com",
  "Vercel":        "vercel.com",
  "Netlify":       "netlify.com",
  "Linear":        "linear.app",
  "Notion":        "notion.so",
  "Jira":          "atlassian.com",
  "Postman":       "postman.com",
  "Sentry":        "sentry.io",
  "Datadog":       "datadoghq.com",
  "AWS":           "aws.amazon.com",
  "Azure":         "azure.microsoft.com",
  "DigitalOcean":  "digitalocean.com",
  "Heroku":        "heroku.com",
  // Productivity
  "Claude Pro":    "claude.ai",
  "ChatGPT":       "openai.com",
  "Perplexity":    "perplexity.ai",
  "Slack":         "slack.com",
  "Zoom":          "zoom.us",
  "Loom":          "loom.com",
  "Todoist":       "todoist.com",
  "Obsidian":      "obsidian.md",
  "Craft":         "craft.do",
  // Cloud Storage
  "Apple One":     "apple.com",
  "iCloud":        "icloud.com",
  "Dropbox":       "dropbox.com",
  "Google One":    "one.google.com",
  "OneDrive":      "microsoft.com",
  "Box":           "box.com",
  // Health & Fitness
  "Headspace":     "headspace.com",
  "Calm":          "calm.com",
  "MyFitnessPal":  "myfitnesspal.com",
  "Peloton":       "onepeloton.com",
  "Whoop":         "whoop.com",
  // News & Media
  "New York Times":"nytimes.com",
  "Medium":        "medium.com",
  "Substack":      "substack.com",
  "The Athletic":  "theathletic.com",
  "Economist":     "economist.com",
  // Finance / Password
  "1Password":     "1password.com",
  "Bitwarden":     "bitwarden.com",
  "NordVPN":       "nordvpn.com",
  "ExpressVPN":    "expressvpn.com",
  // Misc
  "Adobe":         "adobe.com",
  "Canva":         "canva.com",
  "Grammarly":     "grammarly.com",
  "Duolingo":      "duolingo.com",
};

// ─── ServiceLogo: Google Favicon → logo.dev → colored initial ────────────────
const ServiceLogo = ({ name, size = 32, catColor = "#6B7280", radius = 10 }) => {
  const domain = SERVICE_DOMAINS[name];
  const [src, setSrc] = useState(
    domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : null
  );
  const [failed, setFailed] = useState(!domain);
  const [triedLogo, setTriedLogo] = useState(false);

  const handleError = () => {
    if (!triedLogo && domain) {
      // Try logo.dev as second source (works without token for popular domains)
      setSrc(`https://img.logo.dev/${domain}?token=pk_test_s&size=64`);
      setTriedLogo(true);
    } else {
      setFailed(true);
    }
  };

  if (failed || !src) {
    // Colored initial badge fallback
    return (
      <div style={{
        width: size, height: size, borderRadius: radius,
        background: catColor + "22", border: `1px solid ${catColor}44`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.42, fontWeight: 700, color: catColor,
        flexShrink: 0, fontFamily: "system-ui",
      }}>
        {name.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <div style={{
      width: size, height: size, borderRadius: radius,
      background: T.elevated, border: `1px solid ${T.border}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      overflow: "hidden", flexShrink: 0,
      padding: size > 28 ? 4 : 2,
    }}>
      <img
        src={src}
        alt={name}
        onError={handleError}
        style={{
          width: "100%", height: "100%",
          objectFit: "contain", borderRadius: radius - 3,
        }}
      />
    </div>
  );
};

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
  bg:       "#000000",
  surface:  "#141414",
  elevated: "#1C1C1C",
  hover:    "#252525",
  border:   "#27272A",
  accent:   "#0D9488",
  accentDim:"#042F2E",
  accentLt: "#99F6E4",
  white:    "#FFFFFF",
  gray2:    "#A1A1AA",
  gray3:    "#52525B",
  gray4:    "#27272A",
  red:      "#EF4444",
  amber:    "#FBBF24",
  green:    "#34D399",
  blue:     "#60A5FA",
  purple:   "#A78BFA",
  // category colors
  cat: {
    entertainment: "#F87171",
    devtools:      "#60A5FA",
    health:        "#34D399",
    productivity:  "#0D9488",
    news:          "#FBBF24",
    cloud:         "#A78BFA",
    other:         "#6B7280",
  }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const Chip = ({ children, color = T.accent, size = 9 }) => (
  <span style={{ display:"inline-flex", alignItems:"center", padding:"2px 7px",
    background: color + "22", color, fontSize: size, borderRadius: 4,
    fontFamily:"monospace", fontWeight:700, border:`1px solid ${color}44`, whiteSpace:"nowrap" }}>
    {children}
  </span>
);

const Spec = ({ label, value }) => (
  <div style={{ display:"flex", justifyContent:"space-between", borderBottom:`1px solid ${T.border}`,
    padding:"4px 0", gap:8 }}>
    <span style={{ color:T.gray2, fontSize:10, fontFamily:"monospace" }}>{label}</span>
    <span style={{ color:T.accent, fontSize:10, fontFamily:"monospace", fontWeight:700 }}>{value}</span>
  </div>
);

const SpecPanel = ({ title, specs }) => (
  <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:14, minWidth:190 }}>
    <div style={{ fontSize:10, color:T.accent, fontFamily:"monospace", fontWeight:700,
      letterSpacing:1.5, textTransform:"uppercase", marginBottom:10 }}>{title}</div>
    {specs.map(([l,v]) => <Spec key={l} label={l} value={v} />)}
  </div>
);

const Note = ({ children, pos = "right", color = T.accent }) => {
  const p = {
    right:  { left:"calc(100% + 8px)", top:"50%", transform:"translateY(-50%)" },
    left:   { right:"calc(100% + 8px)", top:"50%", transform:"translateY(-50%)" },
    bottom: { top:"calc(100% + 8px)", left:"50%", transform:"translateX(-50%)" },
    top:    { bottom:"calc(100% + 8px)", left:"50%", transform:"translateX(-50%)" },
  };
  return (
    <div style={{ position:"absolute", zIndex:50, ...p[pos], background:color, color:"#fff",
      fontSize:9, fontFamily:"monospace", padding:"3px 7px", borderRadius:4,
      whiteSpace:"nowrap", pointerEvents:"none", lineHeight:1.4 }}>
      {children}
    </div>
  );
};

const WB = ({ children, style={}, ann, annPos="right" }) => (
  <div style={{ position:"relative", ...style }}>
    {children}
    {ann && <Note pos={annPos}>{ann}</Note>}
  </div>
);

// ─── Phone Frame ──────────────────────────────────────────────────────────────
const Phone = ({ children, label, note }) => (
  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10, flexShrink:0 }}>
    <div style={{ fontSize:11, color:T.gray2, fontFamily:"monospace", letterSpacing:2, textTransform:"uppercase" }}>
      {label}
    </div>
    <div style={{ width:300, height:630, border:`2px solid ${T.border}`, borderRadius:30,
      background:T.bg, overflow:"hidden", position:"relative",
      boxShadow:`0 0 0 1px ${T.gray4}, 0 24px 64px rgba(0,0,0,0.9)` }}>
      {/* notch */}
      <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)",
        width:76, height:20, background:T.bg, borderRadius:"0 0 12px 12px", zIndex:10,
        borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ width:8, height:8, borderRadius:"50%", background:T.gray4 }} />
      </div>
      <div style={{ paddingTop:22, height:"100%", overflow:"hidden", position:"relative" }}>
        {children}
      </div>
    </div>
    {note && <div style={{ fontSize:10, color:T.gray3, fontFamily:"monospace", textAlign:"center", maxWidth:300 }}>{note}</div>}
  </div>
);

// ─── Desktop Frame ────────────────────────────────────────────────────────────
const Desktop = ({ children, label }) => (
  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
    <div style={{ fontSize:11, color:T.gray2, fontFamily:"monospace", letterSpacing:2, textTransform:"uppercase" }}>{label}</div>
    <div style={{ border:`2px solid ${T.border}`, borderRadius:12, background:T.bg, overflow:"hidden",
      boxShadow:`0 0 0 1px ${T.gray4}, 0 24px 64px rgba(0,0,0,0.9)` }}>
      <div style={{ height:32, background:T.surface, borderBottom:`1px solid ${T.border}`,
        display:"flex", alignItems:"center", padding:"0 12px", gap:6 }}>
        <div style={{ width:10, height:10, borderRadius:"50%", background:"#FF5F57" }} />
        <div style={{ width:10, height:10, borderRadius:"50%", background:"#FEBC2E" }} />
        <div style={{ width:10, height:10, borderRadius:"50%", background:"#28C840" }} />
        <div style={{ flex:1, height:18, borderRadius:4, background:T.elevated,
          margin:"0 40px", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <span style={{ fontSize:9, color:T.gray3, fontFamily:"monospace" }}>subtrackr.app</span>
        </div>
      </div>
      {children}
    </div>
  </div>
);

// ─── Tab Bar ──────────────────────────────────────────────────────────────────
const TabBar = ({ active = 0 }) => {
  const tabs = [
    { l: "Home",      Icon: RiHome4Line,      ActiveIcon: RiHome4Fill },
    { l: "Add",       Icon: RiAddCircleLine,  ActiveIcon: RiAddCircleFill, center: true },
    { l: "Analytics", Icon: RiPieChartLine,   ActiveIcon: RiPieChartFill },
    { l: "Budget",    Icon: RiWallet3Line,    ActiveIcon: RiWallet3Fill },
  ];
  return (
    <div style={{ position:"absolute", bottom:0, left:0, right:0, height:56,
      background:T.surface, borderTop:`1px solid ${T.border}`, display:"flex", alignItems:"center" }}>
      {tabs.map((tab, i) => {
        const isActive = i === active;
        const Ico = isActive ? tab.ActiveIcon : tab.Icon;
        return (
          <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
            {tab.center ? (
              <>
                <div style={{ width:40, height:40, borderRadius:"50%",
                  background: isActive ? T.accent : T.elevated,
                  border:`2px solid ${isActive ? T.accent : T.border}`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  marginBottom:2, boxShadow: isActive ? `0 0 16px ${T.accent}55` : "none" }}>
                  <Ico size={20} color={isActive ? "#fff" : T.gray3} />
                </div>
                <span style={{ fontSize:9, color:isActive ? T.accent : T.gray3, fontFamily:"monospace" }}>{tab.l}</span>
              </>
            ) : (
              <>
                <Ico size={20} color={isActive ? T.accent : T.gray3} />
                <span style={{ fontSize:9, color:isActive ? T.accent : T.gray3, fontFamily:"monospace" }}>{tab.l}</span>
                {isActive && <div style={{ width:4, height:4, borderRadius:"50%", background:T.accent, marginTop:1 }} />}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ─── Subscription Row ─────────────────────────────────────────────────────────
const SubRow = ({ name, amount, cycle, category, daysLeft, ann, paused }) => {
  const catColor = T.cat[category] || T.cat.other;
  return (
    <WB ann={ann} annPos="right">
      <div style={{ display:"flex", alignItems:"center", gap:10, padding:"0 14px", height:58,
        borderBottom:`1px solid ${T.border}`, opacity: paused ? 0.5 : 1 }}>
        {/* real service logo — Google Favicon API with fallback */}
        <ServiceLogo name={name} size={34} catColor={catColor} radius={10} />
        {/* info */}
        <div style={{ flex:1, overflow:"hidden" }}>
          <div style={{ fontSize:14, color:T.white, fontWeight:500, whiteSpace:"nowrap",
            overflow:"hidden", textOverflow:"ellipsis" }}>{name}</div>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:3 }}>
            <Chip color={catColor} size={9}>{category}</Chip>
            <span style={{ fontSize:9, color:T.gray3, fontFamily:"monospace" }}>{cycle}</span>
            {paused && <Chip color={T.gray3} size={9}>paused</Chip>}
          </div>
        </div>
        {/* amount + renewal */}
        <div style={{ textAlign:"right", flexShrink:0 }}>
          <div style={{ fontSize:15, color:T.white, fontWeight:700, fontFamily:"monospace" }}>${amount}</div>
          <div style={{ fontSize:9, color: daysLeft <= 5 ? T.amber : T.gray3, fontFamily:"monospace", marginTop:2 }}>
            {daysLeft}d left
          </div>
        </div>
      </div>
    </WB>
  );
};

// ─── Section Label ────────────────────────────────────────────────────────────
const SLabel = ({ children, right, total }) => (
  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
    padding:"10px 14px 4px" }}>
    <span style={{ fontSize:10, color:T.gray3, fontFamily:"monospace", letterSpacing:1, textTransform:"uppercase" }}>
      {children}
    </span>
    <div style={{ display:"flex", gap:8, alignItems:"center" }}>
      {total && <span style={{ fontSize:10, color:T.accent, fontFamily:"monospace", fontWeight:700 }}>${total}/mo</span>}
      {right && <span style={{ fontSize:10, color:T.gray3 }}>{right}</span>}
    </div>
  </div>
);

// ─── Arc Budget Gauge (SVG) ───────────────────────────────────────────────────
const ArcGauge = ({ spent, budget, size=160 }) => {
  const pct = Math.min(spent / budget, 1);
  const r = size * 0.38;
  const cx = size / 2, cy = size / 2 + 10;
  const startAngle = -200, endAngle = 20; // degrees
  const range = endAngle - startAngle;
  const arcPct = pct * range;
  const toRad = d => d * Math.PI / 180;
  const arcPath = (start, end, radius) => {
    const s = { x: cx + radius * Math.cos(toRad(start)), y: cy + radius * Math.sin(toRad(start)) };
    const e = { x: cx + radius * Math.cos(toRad(end)),   y: cy + radius * Math.sin(toRad(end)) };
    const lg = Math.abs(end - start) > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${lg} 1 ${e.x} ${e.y}`;
  };
  const color = pct < 0.7 ? T.accent : pct < 0.9 ? T.amber : T.red;
  return (
    <svg width={size} height={size * 0.75}>
      {/* track */}
      <path d={arcPath(startAngle, endAngle, r)} fill="none"
        stroke={T.border} strokeWidth={10} strokeLinecap="round" />
      {/* fill */}
      {pct > 0 && <path d={arcPath(startAngle, startAngle + arcPct, r)} fill="none"
        stroke={color} strokeWidth={10} strokeLinecap="round"
        style={{ filter:`drop-shadow(0 0 6px ${color}88)` }} />}
      {/* amount */}
      <text x={cx} y={cy - 6} textAnchor="middle"
        style={{ fill:T.white, fontSize:22, fontFamily:"monospace", fontWeight:700 }}>
        ${spent.toFixed(0)}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle"
        style={{ fill:T.gray3, fontSize:9, fontFamily:"monospace" }}>
        of ${budget} budget
      </text>
      <text x={cx} y={cy + 26} textAnchor="middle"
        style={{ fill:color, fontSize:9, fontFamily:"monospace", fontWeight:700 }}>
        {Math.round(pct*100)}% used
      </text>
    </svg>
  );
};

// ─── SCREEN 01: Home ──────────────────────────────────────────────────────────
const ScreenHome = () => (
  <Phone label="01 · Home" note="Main dashboard — budget gauge + subscription list">
    {/* status */}
    <div style={{ display:"flex", justifyContent:"space-between", padding:"2px 16px 0" }}>
      <span style={{ fontSize:9, color:T.gray2, fontFamily:"monospace" }}>9:41</span>
      <span style={{ fontSize:9, color:T.gray2, fontFamily:"monospace" }}>12 subs</span>
    </div>
    {/* header */}
    <WB style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
      padding:"6px 14px 4px" }} ann="Sticky header" annPos="right">
      <span style={{ fontSize:19, color:T.white, fontWeight:700, letterSpacing:-0.5 }}>SubTrackr</span>
      <div style={{ display:"flex", gap:8 }}>
        <div style={{ width:28, height:28, borderRadius:"50%", border:`1px solid ${T.border}`,
          display:"flex", alignItems:"center", justifyContent:"center" }}>
          <RiSearchLine size={14} color={T.gray2} />
        </div>
        <div style={{ width:28, height:28, borderRadius:"50%", background:T.accent+"22",
          border:`1px solid ${T.accent}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <RiSettingsLine size={14} color={T.accent} />
        </div>
      </div>
    </WB>

    {/* Budget hero card */}
    <WB style={{ margin:"4px 12px 6px", background:T.surface, borderRadius:16,
      border:`1px solid ${T.border}`, padding:"14px 14px 10px" }}
      ann="Budget hero card: 180px, SVG arc" annPos="right">
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div style={{ fontSize:10, color:T.gray3, fontFamily:"monospace", marginBottom:2 }}>MONTHLY BUDGET</div>
          <div style={{ fontSize:11, color:T.accent, fontFamily:"monospace" }}>$127.97 spent</div>
        </div>
        <Chip color={T.accent}>edit</Chip>
      </div>
      <div style={{ display:"flex", justifyContent:"center", marginTop:4 }}>
        <ArcGauge spent={127.97} budget={200} size={170} />
      </div>
    </WB>

    {/* Quick stats */}
    <WB style={{ display:"flex", gap:6, padding:"0 12px 6px" }} ann="Quick stats chips" annPos="right">
      {[
        { label:"12 subs", color:T.accent },
        { label:"$1,535/yr", color:T.purple },
        { label:"3d to next", color:T.amber },
      ].map((s,i) => (
        <div key={i} style={{ flex:1, background:T.elevated, borderRadius:8, padding:"6px 6px",
          textAlign:"center", border:`1px solid ${T.border}` }}>
          <span style={{ fontSize:10, color:s.color, fontFamily:"monospace", fontWeight:700 }}>{s.label}</span>
        </div>
      ))}
    </WB>

    {/* List */}
    <div style={{ overflowY:"auto", height:"calc(100% - 355px)" }}>
      <SLabel total="77.96">Monthly</SLabel>
      <SubRow name="Netflix" amount="15.99" cycle="monthly" category="entertainment" daysLeft={12} ann="Sub row: 58px h" />
      <SubRow name="Spotify" amount="9.99" cycle="monthly" category="entertainment" daysLeft={18} />
      <SubRow name="Claude Pro" amount="20.00" cycle="monthly" category="productivity" daysLeft={3} />
      <SubRow name="Figma" amount="15.00" cycle="monthly" category="devtools" daysLeft={22} />
      <SubRow name="GitHub" amount="7.00" cycle="monthly" category="devtools" daysLeft={8} />

      <SLabel total="49.99">Annual</SLabel>
      <SubRow name="Apple One" amount="32.99" cycle="annual" category="cloud" daysLeft={45} />
      <SubRow name="1Password" amount="2.99" cycle="annual" category="productivity" daysLeft={120} paused />
    </div>

    <TabBar active={0} />
  </Phone>
);

// ─── SCREEN 02: AI Input ──────────────────────────────────────────────────────
const ScreenAIInput = () => (
  <Phone label="02 · AI Notes Input" note="Full-screen — text + voice entry">
    {/* header */}
    <WB style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
      padding:"8px 14px 6px", borderBottom:`1px solid ${T.border}` }}
      ann="Header: back + title + mic" annPos="right">
      <span style={{ fontSize:14, color:T.gray2 }}>‹ Cancel</span>
      <span style={{ fontSize:14, color:T.white, fontWeight:600 }}>Add Subscriptions</span>
      <div style={{ width:32, height:32, borderRadius:"50%", background:T.elevated,
        border:`1px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <RiMicLine size={16} color={T.gray2} />
      </div>
    </WB>

    {/* notes input area */}
    <WB style={{ flex:1, padding:"20px 16px 0", position:"relative" }}
      ann="Full-screen textarea: 17px, auto-focus" annPos="right">
      <div style={{ fontSize:15, color:T.gray3, lineHeight:1.7 }}>
        Netflix 15.99 monthly, Spotify 9.99 monthly entertainment, Figma 15 monthly design tools,
        <span style={{ color:T.white }}> Claude Pro 20 monthly productivity</span>
        <span style={{ display:"inline-block", width:2, height:16, background:T.accent,
          marginLeft:2, animation:"none", verticalAlign:"middle" }} />
      </div>
    </WB>

    {/* hint */}
    <div style={{ padding:"12px 16px 0" }}>
      <div style={{ fontSize:11, color:T.gray3, lineHeight:1.6 }}>
        Type naturally — name, price, billing cycle, category. Add multiple at once.
      </div>
    </div>

    {/* example chips */}
    <WB style={{ padding:"10px 14px", display:"flex", gap:6, flexWrap:"wrap" }}
      ann="Example format hints" annPos="right">
      {['"Netflix 15.99 monthly"', '"gym 45/mo health"', '"AWS annual tools"'].map((ex,i) => (
        <div key={i} style={{ background:T.elevated, border:`1px solid ${T.border}`, borderRadius:6,
          padding:"4px 8px", fontSize:9, color:T.gray3, fontFamily:"monospace" }}>{ex}</div>
      ))}
    </WB>

    {/* bottom bar */}
    <WB style={{ position:"absolute", bottom:0, left:0, right:0, padding:"12px 14px",
      background:T.surface, borderTop:`1px solid ${T.border}`,
      display:"flex", alignItems:"center", justifyContent:"space-between" }}
      ann="Parse button: teal CTA" annPos="top">
      <span style={{ fontSize:11, color:T.gray3, fontFamily:"monospace" }}>4 subs detected</span>
      <button style={{ background:T.accent, color:"#fff", border:"none", borderRadius:10,
        padding:"10px 20px", fontSize:13, fontWeight:700, cursor:"pointer",
        boxShadow:`0 0 20px ${T.accent}55`, display:"flex", alignItems:"center", gap:6 }}>
        <RiSparklingLine size={14} color="#fff" /> Parse with AI
      </button>
    </WB>
  </Phone>
);

// ─── SCREEN 03: Voice Input ───────────────────────────────────────────────────
const ScreenVoice = () => (
  <Phone label="03 · Voice Input Mode" note="Speech-to-text via Web Speech API">
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
      padding:"8px 14px 6px", borderBottom:`1px solid ${T.border}` }}>
      <span style={{ fontSize:14, color:T.gray2 }}>‹ Cancel</span>
      <span style={{ fontSize:14, color:T.white, fontWeight:600 }}>Voice Input</span>
      <Chip color={T.red}>● live</Chip>
    </div>

    {/* live transcript */}
    <WB style={{ padding:"20px 16px 12px" }} ann="Live transcript: real-time gray text" annPos="right">
      <div style={{ fontSize:15, color:T.gray3, lineHeight:1.7 }}>
        Netflix fifteen ninety nine monthly{" "}
        <span style={{ color:T.white }}>Spotify nine ninety nine monthly entertainment...</span>
      </div>
    </WB>

    {/* waveform */}
    <WB style={{ display:"flex", justifyContent:"center", padding:"16px 0" }}
      ann="CSS waveform animation" annPos="right">
      <div style={{ display:"flex", alignItems:"center", gap:3, height:40 }}>
        {[8,14,22,18,30,24,16,28,20,12,26,18,10,22,16].map((h,i) => (
          <div key={i} style={{ width:3, height:h, borderRadius:2,
            background: i % 3 === 0 ? T.accent : T.gray4, opacity: 0.8 + (i%3)*0.1 }} />
        ))}
      </div>
    </WB>

    {/* mic button */}
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12, padding:"10px 0" }}>
      <WB ann="Mic: pulsing ring animation" annPos="right">
        <div style={{ width:72, height:72, borderRadius:"50%", background:T.red+"22",
          border:`2px solid ${T.red}`, display:"flex", alignItems:"center",
          justifyContent:"center", position:"relative" }}>
          <div style={{ position:"absolute", inset:-8, borderRadius:"50%",
            border:`1px solid ${T.red}44` }} />
          <span style={{ fontSize:28, color:T.red }}><RiMicFill size={28} color={T.red} /></span>
        </div>
      </WB>
      <span style={{ fontSize:11, color:T.gray3, fontFamily:"monospace" }}>Tap to stop recording</span>
    </div>

    {/* parsed so far */}
    <div style={{ padding:"8px 14px" }}>
      <div style={{ fontSize:10, color:T.gray3, fontFamily:"monospace", marginBottom:8 }}>DETECTED SO FAR</div>
      {[{n:"Netflix",a:"$15.99",c:"monthly"},{n:"Spotify",a:"$9.99",c:"monthly"}].map((s,i) => (
        <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 10px",
          background:T.elevated, borderRadius:8, marginBottom:6, border:`1px solid ${T.border}` }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:T.accent }} />
          <span style={{ flex:1, fontSize:12, color:T.white }}>{s.n}</span>
          <span style={{ fontSize:11, color:T.accent, fontFamily:"monospace" }}>{s.a}</span>
          <Chip color={T.gray3} size={8}>{s.c}</Chip>
        </div>
      ))}
    </div>
  </Phone>
);

// ─── SCREEN 04: Confirmation Dialog ──────────────────────────────────────────
const ScreenConfirm = () => (
  <Phone label="04 · Confirmation Dialog" note="Review AI-parsed subscriptions before saving">
    {/* dim bg */}
    <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.7)" }} />
    {/* bottom sheet */}
    <WB style={{ position:"absolute", bottom:0, left:0, right:0, height:"92%",
      background:T.elevated, borderRadius:"18px 18px 0 0" }}
      ann="Spring sheet: stiffness 400, damping 40" annPos="top">
      {/* handle */}
      <div style={{ display:"flex", justifyContent:"center", paddingTop:8 }}>
        <div style={{ width:32, height:4, borderRadius:2, background:T.gray4 }} />
      </div>
      {/* sheet header */}
      <WB style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
        padding:"10px 14px 8px", borderBottom:`1px solid ${T.border}` }}
        ann="Header: count + actions" annPos="right">
        <div>
          <div style={{ fontSize:15, color:T.white, fontWeight:700 }}>Review 4 subscriptions</div>
          <div style={{ fontSize:10, color:T.gray3, fontFamily:"monospace", marginTop:2 }}>
            AI detected from your input
          </div>
        </div>
        <button style={{ background:T.accent, color:"#fff", border:"none", borderRadius:8,
          padding:"7px 14px", fontSize:12, fontWeight:700, cursor:"pointer" }}>
          Confirm All
        </button>
      </WB>

      {/* parsed cards */}
      <div style={{ overflowY:"auto", padding:"8px 12px", height:"calc(100% - 100px)" }}>
        {[
          { name:"Netflix", amount:"15.99", cycle:"monthly", cat:"entertainment", color:T.cat.entertainment, renewal:"Apr 2" },
          { name:"Spotify", amount:"9.99", cycle:"monthly", cat:"entertainment", color:T.cat.entertainment, renewal:"Apr 8" },
          { name:"Figma", amount:"15.00", cycle:"monthly", cat:"devtools", color:T.cat.devtools, renewal:"Apr 15" },
          { name:"Claude Pro", amount:"20.00", cycle:"monthly", cat:"productivity", color:T.cat.productivity, renewal:"Apr 1" },
        ].map((sub, i) => (
          <WB key={i} style={{ background:T.surface, borderRadius:12, padding:"12px 12px 10px",
            marginBottom:8, border:`1px solid ${T.border}` }}
            ann={i===0?"Parsed card: editable fields":undefined} annPos="right">
            {/* card header */}
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
              <ServiceLogo name={sub.name} size={30} catColor={sub.color} radius={8} />
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, color:T.white, fontWeight:600 }}>{sub.name}</div>
                <div style={{ fontSize:10, color:T.gray3, fontFamily:"monospace" }}>renews {sub.renewal}</div>
              </div>
              <RiPencilLine size={14} color={T.gray3} style={{ cursor:"pointer" }} />
              <RiCloseLine size={16} color={T.red} style={{ cursor:"pointer", marginLeft:4 }} />
            </div>
            {/* tags */}
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              <Chip color={T.accent} size={9}>${sub.amount}</Chip>
              <Chip color={sub.color} size={9}>{sub.cat}</Chip>
              <Chip color={T.gray3} size={9}>{sub.cycle}</Chip>
            </div>
          </WB>
        ))}
        {/* total */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
          padding:"10px 4px 0", borderTop:`1px solid ${T.border}` }}>
          <span style={{ fontSize:12, color:T.gray2 }}>Monthly total added</span>
          <span style={{ fontSize:16, color:T.accent, fontFamily:"monospace", fontWeight:700 }}>+$60.98</span>
        </div>
      </div>
    </WB>
  </Phone>
);

// ─── SCREEN 05: Subscription Detail ──────────────────────────────────────────
const ScreenDetail = () => (
  <Phone label="05 · Sub Detail / Edit" note="Bottom sheet — all fields editable">
    {/* dim bg */}
    <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.6)" }}>
      <div style={{ padding:"10px 14px 0", opacity:0.4 }}>
        <SubRow name="Netflix" amount="15.99" cycle="monthly" category="entertainment" daysLeft={12} />
      </div>
    </div>
    {/* sheet */}
    <WB style={{ position:"absolute", bottom:0, left:0, right:0, height:"88%",
      background:T.elevated, borderRadius:"18px 18px 0 0" }}
      ann="Edit sheet: all fields" annPos="top">
      <div style={{ display:"flex", justifyContent:"center", paddingTop:8 }}>
        <div style={{ width:32, height:4, borderRadius:2, background:T.gray4 }} />
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
        padding:"8px 14px 10px", borderBottom:`1px solid ${T.border}` }}>
        <span style={{ fontSize:12, color:T.gray2 }}>Cancel</span>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:T.cat.entertainment+"22",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:14,
            color:T.cat.entertainment, fontWeight:700 }}>N</div>
          <span style={{ fontSize:14, color:T.white, fontWeight:600 }}>Netflix</span>
        </div>
        <span style={{ fontSize:12, color:T.accent, fontWeight:700 }}>Save</span>
      </div>
      {/* fields */}
      {[
        { Icon:RiPencilLine,    label:"Name",         value:"Netflix"                },
        { Icon:RiWallet3Line,   label:"Amount",       value:"$15.99",    mono:true   },
        { Icon:RiSwapLine,      label:"Billing Cycle",value:"Monthly"               },
        { Icon:RiFilterLine,    label:"Category",     value:"Entertainment", cat:true},
        { Icon:RiCalendarLine,  label:"Renewal Date", value:"Apr 2, 2026"           },
        { Icon:RiMoreLine,      label:"Notes",        value:"Shared with family plan"},
      ].map((f, i) => (
        <WB key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 14px",
          borderBottom:`1px solid ${T.border}` }}
          ann={i===0?"All fields editable":undefined} annPos="right">
          <f.Icon size={16} color={T.gray3} />
          <span style={{ flex:1, fontSize:13, color:T.white }}>{f.label}</span>
          {f.cat
            ? <Chip color={T.cat.entertainment}>{f.value}</Chip>
            : <span style={{ fontSize:12, color:T.accent,
                fontFamily: f.mono?"monospace":"inherit" }}>{f.value}</span>}
          <RiArrowRightSLine size={14} color={T.gray4} />
        </WB>
      ))}
      {/* danger zone */}
      <div style={{ display:"flex", gap:8, padding:"12px 14px" }}>
        <button style={{ flex:1, background:T.amber+"22", border:`1px solid ${T.amber}44`,
          borderRadius:8, padding:"9px", fontSize:12, color:T.amber, cursor:"pointer",
          display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}>
          <RiPauseCircleLine size={14} /> Pause
        </button>
        <button style={{ flex:1, background:T.red+"22", border:`1px solid ${T.red}44`,
          borderRadius:8, padding:"9px", fontSize:12, color:T.red, cursor:"pointer",
          display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}>
          <RiDeleteBin6Line size={14} /> Delete
        </button>
      </div>
    </WB>
  </Phone>
);

// ─── SCREEN 06: Analytics ─────────────────────────────────────────────────────
const ScreenAnalytics = () => (
  <Phone label="06 · Analytics" note="Spending breakdown by category">
    <div style={{ padding:"6px 14px 4px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
      <span style={{ fontSize:19, color:T.white, fontWeight:700, letterSpacing:-0.5 }}>Analytics</span>
    </div>

    {/* period toggle */}
    <WB style={{ display:"flex", gap:4, padding:"0 12px 10px" }} ann="Period toggle" annPos="right">
      {["Monthly","Annual"].map((p,i) => (
        <div key={p} style={{ flex:1, padding:"6px 4px", borderRadius:8, textAlign:"center",
          background:i===0?T.accent:T.elevated, border:`1px solid ${i===0?T.accent:T.border}` }}>
          <span style={{ fontSize:10, color:i===0?"#fff":T.gray3, fontFamily:"monospace" }}>{p}</span>
        </div>
      ))}
    </WB>

    {/* hero metric */}
    <WB style={{ textAlign:"center", padding:"0 14px 8px" }} ann="Hero: JetBrains Mono" annPos="right">
      <div style={{ fontSize:36, color:T.white, fontWeight:700, fontFamily:"monospace", letterSpacing:-1 }}>
        $127.97
      </div>
      <div style={{ fontSize:10, color:T.gray3, fontFamily:"monospace" }}>per month · March 2026</div>
      <div style={{ fontSize:11, color:T.accent, fontFamily:"monospace", marginTop:2 }}>
        $1,535.64/year projected
      </div>
    </WB>

    {/* donut */}
    <WB style={{ display:"flex", justifyContent:"center", marginBottom:6 }} ann="Recharts donut" annPos="right">
      <div style={{ position:"relative", width:150, height:150 }}>
        <svg width="150" height="150">
          {[
            { p:.35, c:T.cat.entertainment,  o:0    },
            { p:.22, c:T.cat.devtools,        o:.35  },
            { p:.18, c:T.cat.productivity,    o:.57  },
            { p:.12, c:T.cat.cloud,           o:.75  },
            { p:.08, c:T.cat.health,          o:.87  },
            { p:.05, c:T.cat.other,           o:.95  },
          ].map((s,i) => {
            const r=58, cx=75, cy=75, circ=2*Math.PI*r;
            return <circle key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke={s.c} strokeWidth={18}
              strokeDasharray={`${s.p*circ} ${circ-s.p*circ}`}
              style={{ transform:`rotate(${s.o*360-90}deg)`, transformOrigin:`${cx}px ${cy}px` }} />;
          })}
        </svg>
        <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center" }}>
          <div style={{ fontSize:16, color:T.white, fontWeight:700, fontFamily:"monospace" }}>$127.97</div>
          <div style={{ fontSize:8, color:T.gray3, fontFamily:"monospace" }}>total</div>
        </div>
      </div>
    </WB>

    {/* breakdown */}
    <div style={{ padding:"0 14px", overflowY:"auto", maxHeight:160 }}>
      {[
        { name:"Entertainment", amount:"$45.97", pct:36, color:T.cat.entertainment, limit:50 },
        { name:"Dev Tools",     amount:"$27.00", pct:21, color:T.cat.devtools,      limit:40 },
        { name:"Productivity",  amount:"$20.00", pct:16, color:T.cat.productivity,  limit:30 },
        { name:"Cloud",         amount:"$15.99", pct:13, color:T.cat.cloud,         limit:20 },
        { name:"Health",        amount:"$10.00", pct: 8, color:T.cat.health,        limit:15 },
      ].map((item,i) => (
        <div key={i} style={{ marginBottom:8 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:item.color, flexShrink:0 }} />
            <span style={{ flex:1, fontSize:11, color:T.white }}>{item.name}</span>
            <span style={{ fontSize:11, color:T.white, fontFamily:"monospace", fontWeight:600 }}>{item.amount}</span>
            <span style={{ fontSize:9, color:T.gray3, fontFamily:"monospace" }}>{item.pct}%</span>
          </div>
          {/* progress bar */}
          <div style={{ height:3, background:T.gray4, borderRadius:2, marginLeft:16 }}>
            <div style={{ height:"100%", width:`${Math.min(item.amount.replace('$','')/item.limit*100,100)}%`,
              background:item.color, borderRadius:2 }} />
          </div>
        </div>
      ))}
    </div>

    <TabBar active={2} />
  </Phone>
);

// ─── SCREEN 07: Budget ────────────────────────────────────────────────────────
const ScreenBudget = () => (
  <Phone label="07 · Budget Screen" note="Set monthly goal + category limits">
    <div style={{ padding:"6px 14px 10px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
      <span style={{ fontSize:19, color:T.white, fontWeight:700, letterSpacing:-0.5 }}>Budget</span>
      <button style={{ background:T.accent, color:"#fff", border:"none", borderRadius:8,
        padding:"6px 14px", fontSize:11, fontWeight:700, cursor:"pointer" }}>Save</button>
    </div>

    {/* monthly goal */}
    <WB style={{ margin:"0 12px 12px", background:T.surface, borderRadius:12, padding:"14px",
      border:`1px solid ${T.border}` }} ann="Monthly goal input" annPos="right">
      <div style={{ fontSize:10, color:T.gray3, fontFamily:"monospace", marginBottom:8 }}>MONTHLY BUDGET GOAL</div>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <button style={{ width:32, height:32, borderRadius:8, background:T.elevated,
          border:`1px solid ${T.border}`, fontSize:16, color:T.white, cursor:"pointer" }}>−</button>
        <div style={{ flex:1, textAlign:"center" }}>
          <span style={{ fontSize:32, color:T.white, fontWeight:700, fontFamily:"monospace" }}>$200</span>
          <span style={{ fontSize:12, color:T.gray3, fontFamily:"monospace" }}>/month</span>
        </div>
        <button style={{ width:32, height:32, borderRadius:8, background:T.elevated,
          border:`1px solid ${T.border}`, fontSize:16, color:T.white, cursor:"pointer" }}>+</button>
      </div>
      {/* current vs goal */}
      <div style={{ marginTop:10 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
          <span style={{ fontSize:10, color:T.gray3, fontFamily:"monospace" }}>Current: $127.97</span>
          <span style={{ fontSize:10, color:T.green, fontFamily:"monospace" }}>$72.03 remaining</span>
        </div>
        <div style={{ height:4, background:T.gray4, borderRadius:2 }}>
          <div style={{ height:"100%", width:"64%", background:T.accent, borderRadius:2 }} />
        </div>
      </div>
    </WB>

    {/* category limits */}
    <div style={{ padding:"0 12px" }}>
      <div style={{ fontSize:10, color:T.gray3, fontFamily:"monospace", marginBottom:8, letterSpacing:1 }}>
        CATEGORY LIMITS
      </div>
      {[
        { name:"Entertainment", spent:45.97, limit:50,  color:T.cat.entertainment },
        { name:"Dev Tools",     spent:27.00, limit:40,  color:T.cat.devtools },
        { name:"Productivity",  spent:20.00, limit:30,  color:T.cat.productivity },
        { name:"Cloud",         spent:15.99, limit:20,  color:T.cat.cloud },
        { name:"Health",        spent:10.00, limit:15,  color:T.cat.health },
      ].map((cat, i) => {
        const pct = cat.spent / cat.limit;
        const barColor = pct < 0.7 ? cat.color : pct < 0.9 ? T.amber : T.red;
        return (
          <WB key={i} style={{ marginBottom:10 }} ann={i===0?"Category row: tap to edit limit":undefined} annPos="right">
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:cat.color, flexShrink:0 }} />
              <span style={{ flex:1, fontSize:12, color:T.white }}>{cat.name}</span>
              <span style={{ fontSize:11, color:T.gray2, fontFamily:"monospace" }}>${cat.spent.toFixed(2)}</span>
              <span style={{ fontSize:11, color:T.gray3, fontFamily:"monospace" }}>/ $</span>
              <span style={{ fontSize:11, color:T.accent, fontFamily:"monospace", textDecoration:"underline",
                textDecorationStyle:"dotted", cursor:"pointer" }}>{cat.limit}</span>
            </div>
            <div style={{ height:4, background:T.gray4, borderRadius:2, marginLeft:16 }}>
              <div style={{ height:"100%", width:`${Math.min(pct*100,100)}%`,
                background:barColor, borderRadius:2,
                boxShadow: pct > 0.9 ? `0 0 6px ${T.red}88` : "none" }} />
            </div>
          </WB>
        );
      })}
    </div>

    <TabBar active={3} />
  </Phone>
);

// ─── SCREEN 08: Onboarding ────────────────────────────────────────────────────
const ScreenOnboard = () => (
  <Phone label="08 · Onboarding" note="First-run flow — set budget + first subs">
    <div style={{ height:"calc(100% - 56px)", display:"flex", flexDirection:"column",
      padding:"24px 20px", gap:0 }}>
      {/* logo */}
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10, marginBottom:28 }}>
        <div style={{ width:56, height:56, borderRadius:16, background:T.accent,
          display:"flex", alignItems:"center", justifyContent:"center",
          boxShadow:`0 0 30px ${T.accent}55`, fontSize:24, color:"#fff", fontWeight:700 }}>S</div>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:22, color:T.white, fontWeight:800, letterSpacing:-0.5 }}>SubTrackr</div>
          <div style={{ fontSize:12, color:T.gray3, marginTop:2 }}>Know exactly what you pay for</div>
        </div>
      </div>
      {/* steps */}
      <div style={{ display:"flex", flexDirection:"column", gap:16, marginBottom:28 }}>
        {[
          { n:"1", title:"Set your budget", desc:"How much do you want to spend on subscriptions per month?", active:true },
          { n:"2", title:"Add subscriptions", desc:"Type naturally or use voice — AI does the parsing" },
          { n:"3", title:"Track & optimize", desc:"See where your money goes and cut what you don't use" },
        ].map((s,i) => (
          <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
            <div style={{ width:28, height:28, borderRadius:"50%",
              background: s.active ? T.accent : T.elevated,
              border:`1px solid ${s.active ? T.accent : T.border}`,
              display:"flex", alignItems:"center", justifyContent:"center",
              flexShrink:0, fontSize:11, color:s.active?"#fff":T.gray3, fontWeight:700 }}>{s.n}</div>
            <div>
              <div style={{ fontSize:13, color:s.active?T.white:T.gray3, fontWeight:s.active?600:400 }}>{s.title}</div>
              <div style={{ fontSize:11, color:T.gray3, marginTop:2, lineHeight:1.4 }}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
      {/* budget input */}
      <WB style={{ background:T.surface, borderRadius:12, padding:"14px", border:`1px solid ${T.border}`,
        marginBottom:16 }} ann="Budget set on onboarding" annPos="right">
        <div style={{ fontSize:10, color:T.gray3, fontFamily:"monospace", marginBottom:6 }}>MONTHLY BUDGET</div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:24, color:T.gray3, fontFamily:"monospace" }}>$</span>
          <span style={{ fontSize:28, color:T.white, fontFamily:"monospace", fontWeight:700 }}>200</span>
          <span style={{ fontSize:12, color:T.gray3, fontFamily:"monospace" }}>/month</span>
        </div>
      </WB>
      {/* CTA */}
      <button style={{ background:T.accent, color:"#fff", border:"none", borderRadius:12,
        padding:"14px", fontSize:14, fontWeight:700, cursor:"pointer", width:"100%",
        boxShadow:`0 4px 24px ${T.accent}55` }}>
        Get Started →
      </button>
      <div style={{ textAlign:"center", marginTop:10, fontSize:10, color:T.gray3 }}>
        No account required · Works offline · No bank linking
      </div>
    </div>
  </Phone>
);

// ─── SCREEN 09: Desktop ───────────────────────────────────────────────────────
const ScreenDesktop = () => (
  <Desktop label="09 · Desktop Layout (3-column)">
    <div style={{ display:"flex", height:480 }}>
      {/* sidebar */}
      <WB style={{ width:200, background:T.surface, borderRight:`1px solid ${T.border}`,
        padding:"14px 0", flexShrink:0 }} ann="Sidebar: 200px fixed" annPos="right">
        <div style={{ padding:"0 14px 10px" }}>
          <div style={{ fontSize:14, color:T.white, fontWeight:700, letterSpacing:-0.5 }}>SubTrackr</div>
        </div>
        {[
          { l:"All Subscriptions", Icon:RiHome4Fill,    active:true },
          { l:"Analytics",         Icon:RiPieChartLine              },
          { l:"Budget",            Icon:RiWallet3Line               },
          { l:"Settings",          Icon:RiSettingsLine              },
        ].map((n,i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 14px",
            background:n.active?T.accent+"22":undefined }}>
            <n.Icon size={15} color={n.active?T.accent:T.gray3} />
            <span style={{ fontSize:12, color:n.active?T.accent:T.gray2 }}>{n.l}</span>
          </div>
        ))}
        <div style={{ margin:"10px 14px 6px", fontSize:9, color:T.gray4, fontFamily:"monospace", letterSpacing:1 }}>
          CATEGORIES
        </div>
        {Object.entries(T.cat).slice(0,5).map(([name, color]) => (
          <div key={name} style={{ display:"flex", alignItems:"center", gap:8, padding:"5px 14px" }}>
            <div style={{ width:8, height:8, borderRadius:2, background:color }} />
            <span style={{ fontSize:11, color:T.gray2, textTransform:"capitalize" }}>{name}</span>
          </div>
        ))}
      </WB>

      {/* main */}
      <div style={{ flex:1, overflow:"hidden" }}>
        {/* top bar */}
        <div style={{ height:44, borderBottom:`1px solid ${T.border}`,
          display:"flex", alignItems:"center", padding:"0 20px", justifyContent:"space-between" }}>
          <span style={{ fontSize:15, color:T.white, fontWeight:700 }}>All Subscriptions</span>
          <div style={{ display:"flex", gap:8 }}>
            <div style={{ padding:"5px 10px", background:T.elevated, borderRadius:6,
              fontSize:10, color:T.gray2, border:`1px solid ${T.border}`,
              display:"flex", alignItems:"center", gap:4 }}>
              <RiSearchLine size={11} color={T.gray2} /> Search
            </div>
            <div style={{ width:30, height:30, borderRadius:6, background:T.accent,
              display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
              <RiAddLine size={18} color="#fff" />
            </div>
          </div>
        </div>

        {/* budget summary bar */}
        <WB style={{ display:"flex", alignItems:"center", gap:16, padding:"8px 20px",
          background:T.surface, borderBottom:`1px solid ${T.border}` }}
          ann="Budget summary bar" annPos="right">
          <div>
            <div style={{ fontSize:9, color:T.gray3, fontFamily:"monospace" }}>MONTHLY</div>
            <div style={{ fontSize:18, color:T.white, fontWeight:700, fontFamily:"monospace" }}>$127.97</div>
          </div>
          <div style={{ flex:1, height:6, background:T.gray4, borderRadius:3 }}>
            <div style={{ height:"100%", width:"64%", background:T.accent, borderRadius:3 }} />
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:9, color:T.gray3, fontFamily:"monospace" }}>BUDGET</div>
            <div style={{ fontSize:14, color:T.accent, fontFamily:"monospace", fontWeight:700 }}>$200</div>
          </div>
        </WB>

        {/* sub list */}
        <div style={{ overflowY:"auto", height:"calc(100% - 88px)" }}>
          <SLabel total="77.96">Monthly</SLabel>
          <SubRow name="Netflix" amount="15.99" cycle="monthly" category="entertainment" daysLeft={12} ann="Same row component" />
          <SubRow name="Spotify" amount="9.99" cycle="monthly" category="entertainment" daysLeft={18} />
          <SubRow name="Claude Pro" amount="20.00" cycle="monthly" category="productivity" daysLeft={3} />
          <SubRow name="Figma" amount="15.00" cycle="monthly" category="devtools" daysLeft={22} />
          <SLabel total="49.99">Annual</SLabel>
          <SubRow name="Apple One" amount="32.99" cycle="annual" category="cloud" daysLeft={45} />
        </div>
      </div>

      {/* right: analytics panel */}
      <WB style={{ width:220, background:T.surface, borderLeft:`1px solid ${T.border}`,
        padding:"14px", flexShrink:0 }} ann="Analytics panel: 220px" annPos="left">
        <div style={{ fontSize:11, color:T.white, fontWeight:600, marginBottom:12 }}>Spending</div>
        {/* mini donut */}
        <div style={{ display:"flex", justifyContent:"center", marginBottom:12 }}>
          <svg width="100" height="100">
            {[{p:.35,c:T.cat.entertainment,o:0},{p:.22,c:T.cat.devtools,o:.35},
              {p:.18,c:T.cat.productivity,o:.57},{p:.25,c:T.cat.cloud,o:.75}].map((s,i) => {
              const r=38,cx=50,cy=50,circ=2*Math.PI*r;
              return <circle key={i} cx={cx} cy={cy} r={r} fill="none"
                stroke={s.c} strokeWidth={12}
                strokeDasharray={`${s.p*circ} ${circ-s.p*circ}`}
                style={{ transform:`rotate(${s.o*360-90}deg)`,transformOrigin:`${cx}px ${cy}px` }} />;
            })}
            <text x="50" y="53" textAnchor="middle"
              style={{ fill:T.white, fontSize:11, fontFamily:"monospace", fontWeight:700 }}>$127</text>
          </svg>
        </div>
        {Object.entries(T.cat).slice(0,4).map(([name,color],i) => (
          <div key={name} style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:color, flexShrink:0 }} />
            <span style={{ flex:1, fontSize:10, color:T.gray2, textTransform:"capitalize" }}>{name}</span>
            <span style={{ fontSize:10, color:T.white, fontFamily:"monospace" }}>${[45,27,20,16][i]}</span>
          </div>
        ))}
      </WB>
    </div>
  </Desktop>
);

// ─── TYPE CONFIG (bill types with clear visual identity) ──────────────────────
const BILL_TYPES = {
  subscription: { label:"Subscription", color:"#0D9488", Icon:RiAddCircleLine,  shape:"circle"  },
  utility:      { label:"Utility",      color:"#F97316", Icon:RiFlashlightLine, shape:"diamond" },
  loan:         { label:"Loan",         color:"#A78BFA", Icon:RiBankLine,       shape:"square"  },
  insurance:    { label:"Insurance",    color:"#60A5FA", Icon:RiShieldLine,     shape:"shield"  },
};

// ─── Type Badge (visually distinct per bill type) ─────────────────────────────
const TypeBadge = ({ type, size=9 }) => {
  const t = BILL_TYPES[type] || BILL_TYPES.subscription;
  const Ico = t.Icon;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:3, padding:"2px 7px",
      background: t.color+"22", color: t.color, fontSize: size, borderRadius:
        type==="utility"?"2px": type==="loan"?"0px":"4px",
      fontFamily:"monospace", fontWeight:700, border:`1px solid ${t.color}55`, whiteSpace:"nowrap" }}>
      <Ico size={size+1} /> {t.label}
    </span>
  );
};

// ─── SCREEN 09: Calendar View ─────────────────────────────────────────────────
const ScreenCalendar = () => {
  const today = 16;
  // Due events mapped to days in April
  const events = {
    1:  [{ name:"Claude Pro",    amount:20.00, type:"subscription", cat:"productivity" }],
    2:  [{ name:"Netflix",       amount:15.99, type:"subscription", cat:"entertainment" },
         { name:"Electric Bill", amount:82.50, type:"utility",      cat:"utilities"    }],
    5:  [{ name:"Car Loan",      amount:349.00,type:"loan",         cat:"loans"        }],
    8:  [{ name:"Spotify",       amount:9.99,  type:"subscription", cat:"entertainment"}],
    10: [{ name:"Water Bill",    amount:34.00, type:"utility",      cat:"utilities"    }],
    14: [{ name:"Internet",      amount:59.99, type:"utility",      cat:"utilities"    }],
    15: [{ name:"Rent",          amount:1250,  type:"loan",         cat:"loans"        },
         { name:"GitHub",        amount:7.00,  type:"subscription", cat:"devtools"     }],
    16: [{ name:"TODAY",         amount:null,  type:null,           cat:null           }],
    20: [{ name:"Apple One",     amount:32.99, type:"subscription", cat:"cloud"        }],
    22: [{ name:"Gym",           amount:45.00, type:"subscription", cat:"health"       }],
    25: [{ name:"Gas Bill",      amount:41.00, type:"utility",      cat:"utilities"    }],
    28: [{ name:"Student Loan",  amount:220.00,type:"loan",         cat:"loans"        }],
    30: [{ name:"Figma",         amount:15.00, type:"subscription", cat:"devtools"     }],
  };

  const days = ["Mo","Tu","We","Th","Fr","Sa","Su"];
  // April 1 2026 = Wednesday (index 2)
  const startOffset = 2;
  const totalDays = 30;
  const cells = Array(startOffset).fill(null).concat(
    Array.from({length:totalDays},(_,i)=>i+1)
  );
  // pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  const typeColor = (type) => BILL_TYPES[type]?.color || T.gray3;

  return (
    <Phone label="09 · Calendar View" note="Due dates — color-coded by bill type">
      {/* header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
        padding:"6px 14px 4px" }}>
        <span style={{ fontSize:19, color:T.white, fontWeight:700, letterSpacing:-0.5 }}>April 2026</span>
        <div style={{ display:"flex", gap:6 }}>
          <span style={{ fontSize:14, color:T.gray3, cursor:"pointer" }}>‹</span>
          <span style={{ fontSize:14, color:T.gray3, cursor:"pointer" }}>›</span>
        </div>
      </div>

      {/* legend */}
      <WB style={{ display:"flex", gap:6, padding:"0 12px 6px", flexWrap:"wrap" }}
        ann="Bill type legend" annPos="right">
        {Object.entries(BILL_TYPES).map(([key,t]) => (
          <div key={key} style={{ display:"flex", alignItems:"center", gap:4 }}>
            <div style={{ width:8, height:8, borderRadius: key==="utility"?"1px":key==="loan"?"0px":"50%",
              background:t.color, flexShrink:0,
              transform: key==="utility"?"rotate(45deg)":"none" }} />
            <span style={{ fontSize:8, color:T.gray3, fontFamily:"monospace" }}>{t.label}</span>
          </div>
        ))}
      </WB>

      {/* day headers */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)",
        padding:"0 8px", marginBottom:2 }}>
        {days.map(d => (
          <div key={d} style={{ textAlign:"center", fontSize:9, color:T.gray3,
            fontFamily:"monospace", padding:"2px 0" }}>{d}</div>
        ))}
      </div>

      {/* calendar grid */}
      <WB style={{ padding:"0 8px", overflowY:"auto", height:"calc(100% - 170px)" }}
        ann="Grid: 7-col, tap day → detail" annPos="right">
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2 }}>
          {cells.map((day, idx) => {
            const dayEvents = day ? (events[day] || []) : [];
            const isToday = day === today;
            const isPast  = day && day < today;
            const dots = dayEvents.filter(e=>e.type);
            return (
              <div key={idx} style={{
                minHeight:42, borderRadius:6, padding:"3px 2px",
                background: isToday ? T.accent+"22" : day ? "transparent" : "transparent",
                border: isToday ? `1px solid ${T.accent}` : `1px solid transparent`,
                opacity: isPast ? 0.45 : 1,
              }}>
                {day && (
                  <>
                    <div style={{ fontSize:10, color: isToday?T.accent:T.white,
                      fontWeight: isToday?700:400, textAlign:"center",
                      fontFamily:"monospace", lineHeight:1.4 }}>{day}</div>
                    {/* dot indicators */}
                    <div style={{ display:"flex", justifyContent:"center", gap:2, flexWrap:"wrap", marginTop:2 }}>
                      {dots.slice(0,3).map((e,i)=>(
                        <div key={i} style={{
                          width:6, height:6, flexShrink:0,
                          background: typeColor(e.type),
                          borderRadius: e.type==="loan"?"1px": e.type==="utility"?"1px":"50%",
                          transform: e.type==="utility"?"rotate(45deg)":"none",
                        }} />
                      ))}
                      {dots.length > 3 && (
                        <span style={{ fontSize:7, color:T.gray3, fontFamily:"monospace" }}>+{dots.length-3}</span>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </WB>

      {/* upcoming list — next 7 days */}
      <div style={{ borderTop:`1px solid ${T.border}`, padding:"6px 12px 60px" }}>
        <div style={{ fontSize:9, color:T.gray3, fontFamily:"monospace",
          letterSpacing:1, marginBottom:6 }}>UPCOMING THIS WEEK</div>
        {[
          { day:"Apr 20", name:"Apple One",  amount:32.99,  type:"subscription" },
          { day:"Apr 22", name:"Gym",        amount:45.00,  type:"subscription" },
          { day:"Apr 25", name:"Gas Bill",   amount:41.00,  type:"utility"      },
        ].map((e,i)=>{
          const tc = typeColor(e.type);
          return (
            <WB key={i} style={{ display:"flex", alignItems:"center", gap:8,
              padding:"5px 4px", borderBottom:`1px solid ${T.border}` }}
              ann={i===0?"Upcoming row: date + type badge":undefined} annPos="right">
              <div style={{ width:30, textAlign:"center", fontSize:9,
                color:T.gray3, fontFamily:"monospace", flexShrink:0 }}>
                {e.day.split(" ")[1]}
              </div>
              <div style={{ width:8, height:8, borderRadius:
                  e.type==="loan"?"1px":e.type==="utility"?"1px":"50%",
                background:tc, flexShrink:0,
                transform:e.type==="utility"?"rotate(45deg)":"none" }} />
              <span style={{ flex:1, fontSize:12, color:T.white }}>{e.name}</span>
              <TypeBadge type={e.type} />
              <span style={{ fontSize:12, color:tc, fontFamily:"monospace", fontWeight:700 }}>
                ${e.amount.toFixed(2)}
              </span>
            </WB>
          );
        })}
      </div>

      <TabBar active={0} />
    </Phone>
  );
};

// ─── SCREEN 10: Calendar Day Detail ──────────────────────────────────────────
const ScreenCalendarDay = () => {
  const items = [
    { name:"Netflix",       amount:15.99,  type:"subscription", cat:"entertainment", status:"due"  },
    { name:"Electric Bill", amount:82.50,  type:"utility",      cat:"utilities",     status:"due"  },
  ];
  return (
    <Phone label="10 · Calendar Day Detail" note="Tap a date → all dues that day">
      {/* back header */}
      <div style={{ display:"flex", alignItems:"center", gap:10,
        padding:"6px 14px 4px", borderBottom:`1px solid ${T.border}` }}>
        <span style={{ fontSize:14, color:T.gray3 }}>‹</span>
        <div>
          <div style={{ fontSize:15, color:T.white, fontWeight:700 }}>April 2, 2026</div>
          <div style={{ fontSize:10, color:T.gray3, fontFamily:"monospace" }}>2 payments due</div>
        </div>
        <div style={{ marginLeft:"auto", textAlign:"right" }}>
          <div style={{ fontSize:9, color:T.gray3, fontFamily:"monospace" }}>TOTAL DUE</div>
          <div style={{ fontSize:14, color:T.red, fontFamily:"monospace", fontWeight:700 }}>$98.49</div>
        </div>
      </div>

      {/* due items */}
      <div style={{ padding:"10px 12px" }}>
        <div style={{ fontSize:9, color:T.gray3, fontFamily:"monospace",
          letterSpacing:1, marginBottom:8 }}>DUE TODAY</div>
        {items.map((item,i) => {
          const tc = BILL_TYPES[item.type]?.color || T.accent;
          return (
            <WB key={i} style={{ background:T.surface, borderRadius:12, padding:"12px",
              marginBottom:8, border:`1px solid ${tc}44`,
              borderLeft:`3px solid ${tc}` }}
              ann={i===0?"Left border = bill type color":undefined} annPos="right">
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                <div style={{ width:32, height:32, borderRadius:
                    item.type==="loan"?"4px":item.type==="utility"?"4px":"50%",
                  background:tc+"22", border:`1px solid ${tc}44`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  color:tc }}>
                  {(() => { const Ico = BILL_TYPES[item.type]?.Icon; return Ico ? <Ico size={16} /> : null; })()}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, color:T.white, fontWeight:600 }}>{item.name}</div>
                  <div style={{ display:"flex", gap:6, marginTop:2 }}>
                    <TypeBadge type={item.type} />
                    <Chip color={T.cat[item.cat]||T.gray3} size={9}>{item.cat}</Chip>
                  </div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:16, color:tc, fontFamily:"monospace", fontWeight:700 }}>
                    ${item.amount.toFixed(2)}
                  </div>
                  <div style={{ fontSize:9, color:T.gray3, fontFamily:"monospace" }}>due today</div>
                </div>
              </div>
              {/* mark paid */}
              <div style={{ display:"flex", gap:6 }}>
                <button style={{ flex:1, background:T.green+"22", border:`1px solid ${T.green}44`,
                  borderRadius:6, padding:"6px", fontSize:10, color:T.green, cursor:"pointer",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:4 }}>
                  <RiCheckLine size={12} /> Mark Paid
                </button>
                <button style={{ flex:1, background:T.elevated, border:`1px solid ${T.border}`,
                  borderRadius:6, padding:"6px", fontSize:10, color:T.gray2, cursor:"pointer",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:4 }}>
                  <RiPencilLine size={12} /> Edit
                </button>
              </div>
            </WB>
          );
        })}
      </div>

      {/* upcoming this month */}
      <div style={{ padding:"0 12px" }}>
        <div style={{ fontSize:9, color:T.gray3, fontFamily:"monospace",
          letterSpacing:1, marginBottom:8 }}>LATER THIS MONTH</div>
        {[
          { day:"Apr 5",  name:"Car Loan",    amount:349.00, type:"loan"         },
          { day:"Apr 8",  name:"Spotify",     amount:9.99,   type:"subscription" },
          { day:"Apr 14", name:"Internet",    amount:59.99,  type:"utility"      },
        ].map((e,i) => {
          const tc = BILL_TYPES[e.type]?.color||T.gray3;
          return (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:8,
              padding:"7px 4px", borderBottom:`1px solid ${T.border}` }}>
              <span style={{ fontSize:9, color:T.gray3, fontFamily:"monospace", minWidth:32 }}>{e.day}</span>
              <div style={{ width:8, height:8, borderRadius:
                  e.type==="loan"?"1px":e.type==="utility"?"1px":"50%",
                background:tc, flexShrink:0, transform:e.type==="utility"?"rotate(45deg)":"none" }} />
              <span style={{ flex:1, fontSize:12, color:T.white }}>{e.name}</span>
              <TypeBadge type={e.type} />
              <span style={{ fontSize:12, color:tc, fontFamily:"monospace" }}>${e.amount.toFixed(2)}</span>
            </div>
          );
        })}
      </div>
      <TabBar active={0} />
    </Phone>
  );
};

// ─── SCREEN 11: Grouped List ──────────────────────────────────────────────────
const ScreenGroupedList = () => {
  const [groupBy, setGroupBy] = useState("type");

  const byType = {
    subscription: [
      { name:"Netflix",   amount:15.99, cat:"entertainment", daysLeft:12 },
      { name:"Spotify",   amount:9.99,  cat:"entertainment", daysLeft:18 },
      { name:"Claude Pro",amount:20.00, cat:"productivity",  daysLeft:3  },
      { name:"Figma",     amount:15.00, cat:"devtools",      daysLeft:22 },
      { name:"GitHub",    amount:7.00,  cat:"devtools",      daysLeft:8  },
      { name:"Apple One", amount:32.99, cat:"cloud",         daysLeft:45 },
    ],
    utility: [
      { name:"Electric",  amount:82.50, cat:"utilities", daysLeft:2  },
      { name:"Water",     amount:34.00, cat:"utilities", daysLeft:10 },
      { name:"Internet",  amount:59.99, cat:"utilities", daysLeft:14 },
      { name:"Gas",       amount:41.00, cat:"utilities", daysLeft:25 },
    ],
    loan: [
      { name:"Car Loan",     amount:349.00, cat:"loans", daysLeft:5  },
      { name:"Student Loan", amount:220.00, cat:"loans", daysLeft:28 },
      { name:"Rent",         amount:1250.0, cat:"loans", daysLeft:15 },
    ],
  };

  const byCategory = {
    entertainment: [
      { name:"Netflix",  amount:15.99, type:"subscription", daysLeft:12 },
      { name:"Spotify",  amount:9.99,  type:"subscription", daysLeft:18 },
    ],
    devtools: [
      { name:"Figma",   amount:15.00, type:"subscription", daysLeft:22 },
      { name:"GitHub",  amount:7.00,  type:"subscription", daysLeft:8  },
    ],
    utilities: [
      { name:"Electric",amount:82.50, type:"utility",     daysLeft:2  },
      { name:"Internet",amount:59.99, type:"utility",     daysLeft:14 },
    ],
    loans: [
      { name:"Car Loan",amount:349.00,type:"loan",        daysLeft:5  },
      { name:"Rent",    amount:1250,  type:"loan",        daysLeft:15 },
    ],
  };

  const groupData = groupBy==="type" ? byType : byCategory;

  const groupMeta = {
    // type groups
    subscription:  { color:BILL_TYPES.subscription.color, Icon:RiAddCircleLine,  label:"Subscriptions"  },
    utility:       { color:BILL_TYPES.utility.color,      Icon:RiFlashlightLine, label:"Utilities"      },
    loan:          { color:BILL_TYPES.loan.color,         Icon:RiBankLine,       label:"Loans"          },
    insurance:     { color:BILL_TYPES.insurance.color,    Icon:RiShieldLine,     label:"Insurance"      },
    // category groups
    entertainment: { color:T.cat.entertainment, Icon:RiFilmLine,       label:"Entertainment"  },
    devtools:      { color:T.cat.devtools,       Icon:RiCodeLine,       label:"Dev Tools"      },
    utilities:     { color:T.cat.other,          Icon:RiFlashlightLine, label:"Utilities"      },
    loans:         { color:"#A78BFA",            Icon:RiBankLine,       label:"Loans"          },
    cloud:         { color:T.cat.cloud,          Icon:RiCloudLine,      label:"Cloud"          },
    productivity:  { color:T.cat.productivity,   Icon:RiLightbulbLine,  label:"Productivity"   },
  };

  return (
    <Phone label="11 · Grouped List" note="Group by Type or Category — collapsible sections">
      {/* header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
        padding:"6px 14px 6px" }}>
        <span style={{ fontSize:19, color:T.white, fontWeight:700, letterSpacing:-0.5 }}>All Bills</span>
        <div style={{ width:28, height:28, borderRadius:"50%", border:`1px solid ${T.border}`,
          display:"flex", alignItems:"center", justifyContent:"center" }}>
          <RiSearchLine size={14} color={T.gray2} />
        </div>
      </div>

      {/* group-by toggle */}
      <WB style={{ display:"flex", gap:4, padding:"0 12px 8px" }}
        ann="Group by: Type vs Category" annPos="right">
        {["type","category"].map(opt => (
          <button key={opt} onClick={()=>setGroupBy(opt)} style={{
            flex:1, padding:"6px 4px", borderRadius:8, border:"none", cursor:"pointer",
            background: groupBy===opt ? T.accent : T.elevated,
            color: groupBy===opt ? "#fff" : T.gray2,
            fontSize:11, fontFamily:"monospace", fontWeight:700,
          }}>
            {opt==="type" ? "By Bill Type" : "By Category"}
          </button>
        ))}
      </WB>

      {/* grouped list */}
      <div style={{ overflowY:"auto", height:"calc(100% - 120px)", paddingBottom:56 }}>
        {Object.entries(groupData).map(([groupKey, items]) => {
          const meta = groupMeta[groupKey] || { color:T.gray3, Icon:RiMoreLine, label:groupKey };
          const groupTotal = items.reduce((s,i)=>s+i.amount,0);
          const typeColor = meta.color;
          const MetaIcon = meta.Icon;
          return (
            <div key={groupKey} style={{ marginBottom:4 }}>
              {/* group header */}
              <WB style={{ display:"flex", alignItems:"center", gap:8,
                padding:"8px 14px 4px", background:typeColor+"11",
                borderTop:`1px solid ${typeColor}33`,
                borderBottom:`1px solid ${typeColor}22` }}
                ann={groupKey==="subscription"?"Group header: colored band":undefined}
                annPos="right">
                <div style={{ width:22, height:22, borderRadius:
                    groupKey==="utility"?"3px":groupKey==="loan"?"2px":"50%",
                  background:typeColor, display:"flex", alignItems:"center",
                  justifyContent:"center", flexShrink:0 }}>
                  <MetaIcon size={12} color="#fff" />
                </div>
                <span style={{ flex:1, fontSize:12, color:typeColor, fontWeight:700,
                  textTransform:"uppercase", letterSpacing:0.5 }}>{meta.label}</span>
                <span style={{ fontSize:11, color:typeColor, fontFamily:"monospace", fontWeight:700 }}>
                  ${groupTotal.toFixed(2)}/mo
                </span>
                <RiArrowDropDownLine size={18} color={T.gray3} />
              </WB>

              {/* items in group */}
              {items.map((item, i) => {
                const rowColor = groupBy==="type"
                  ? (T.cat[item.cat] || T.gray3)
                  : (BILL_TYPES[item.type]?.color || T.gray3);
                return (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:10,
                    padding:"0 14px", height:50, borderBottom:`1px solid ${T.border}`,
                    borderLeft:`3px solid ${typeColor}44` }}>
                    <div style={{ width:28, height:28, borderRadius:
                        item.type==="loan"?"6px":item.type==="utility"?"6px":"50%",
                      background:rowColor+"22", border:`1px solid ${rowColor}44`,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:12, fontWeight:700, color:rowColor, flexShrink:0 }}>
                      {item.name[0]}
                    </div>
                    <div style={{ flex:1, overflow:"hidden" }}>
                      <div style={{ fontSize:13, color:T.white, fontWeight:500 }}>{item.name}</div>
                      <div style={{ display:"flex", gap:4, marginTop:2 }}>
                        {groupBy==="type"
                          ? <Chip color={T.cat[item.cat]||T.gray3} size={8}>{item.cat}</Chip>
                          : <TypeBadge type={item.type} size={8} />
                        }
                      </div>
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <div style={{ fontSize:13, color:T.white, fontFamily:"monospace", fontWeight:700 }}>
                        ${item.amount.toFixed(2)}
                      </div>
                      <div style={{ fontSize:9,
                        color:item.daysLeft<=5?T.red:item.daysLeft<=10?T.amber:T.gray3,
                        fontFamily:"monospace" }}>
                        {item.daysLeft}d
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      <TabBar active={0} />
    </Phone>
  );
};

// ─── SCREEN 12: Grouped List — Category Detail ────────────────────────────────
const ScreenCategoryDetail = () => (
  <Phone label="12 · Category Detail" note="Drill into one category — all bills inside">
    {/* back */}
    <div style={{ display:"flex", alignItems:"center", gap:10,
      padding:"6px 14px 4px", borderBottom:`1px solid ${T.border}` }}>
      <span style={{ fontSize:14, color:T.gray3 }}>‹ All Bills</span>
    </div>

    {/* category hero */}
    <WB style={{ margin:"10px 12px 8px", background:BILL_TYPES.utility.color+"15",
      border:`1px solid ${BILL_TYPES.utility.color}44`, borderRadius:14, padding:"14px" }}
      ann="Category hero card" annPos="right">
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
        <div style={{ width:40, height:40, borderRadius:8, background:BILL_TYPES.utility.color,
          display:"flex", alignItems:"center", justifyContent:"center" }}>
          <RiFlashlightLine size={20} color="#fff" /></div>
        <div>
          <div style={{ fontSize:16, color:T.white, fontWeight:700 }}>Utilities</div>
          <div style={{ fontSize:10, color:T.gray3, fontFamily:"monospace" }}>4 bills · due this month</div>
        </div>
        <div style={{ marginLeft:"auto", textAlign:"right" }}>
          <div style={{ fontSize:22, color:BILL_TYPES.utility.color, fontFamily:"monospace", fontWeight:700 }}>$217.49</div>
          <div style={{ fontSize:9, color:T.gray3, fontFamily:"monospace" }}>/month</div>
        </div>
      </div>
      {/* mini progress */}
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
        <span style={{ fontSize:9, color:T.gray3, fontFamily:"monospace" }}>$217.49 of $250 limit</span>
        <span style={{ fontSize:9, color:T.amber, fontFamily:"monospace" }}>87% used</span>
      </div>
      <div style={{ height:4, background:T.gray4, borderRadius:2 }}>
        <div style={{ height:"100%", width:"87%", background:T.amber, borderRadius:2 }} />
      </div>
    </WB>

    {/* bills in this category */}
    <div style={{ padding:"0 12px 0" }}>
      <div style={{ fontSize:9, color:T.gray3, fontFamily:"monospace",
        letterSpacing:1, marginBottom:6 }}>BILLS</div>
    </div>
    {[
      { name:"Electric Bill", amount:82.50,  daysLeft:2,  status:"urgent"  },
      { name:"Internet",      amount:59.99,  daysLeft:14, status:"ok"      },
      { name:"Gas Bill",      amount:41.00,  daysLeft:25, status:"ok"      },
      { name:"Water Bill",    amount:34.00,  daysLeft:10, status:"soon"    },
    ].map((item, i) => {
      const statusColor = item.status==="urgent"?T.red:item.status==="soon"?T.amber:BILL_TYPES.utility.color;
      return (
        <WB key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"0 14px",
          height:54, borderBottom:`1px solid ${T.border}`,
          borderLeft:`3px solid ${statusColor}` }}
          ann={i===0?"Left stripe = urgency color":undefined} annPos="right">
          <div style={{ width:30, height:30, borderRadius:6,
            background:BILL_TYPES.utility.color+"22", border:`1px solid ${BILL_TYPES.utility.color}44`,
            display:"flex", alignItems:"center", justifyContent:"center",
            color:BILL_TYPES.utility.color }}><RiFlashlightLine size={14} /></div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, color:T.white, fontWeight:500 }}>{item.name}</div>
            <div style={{ fontSize:9, color:statusColor, fontFamily:"monospace", marginTop:2,
              display:"flex", alignItems:"center", gap:3 }}>
              {item.status==="urgent" && <RiAlertLine size={10} />}
              {item.status==="urgent"?"Due in":item.status==="soon"?"Soon —":"Due in"} {item.daysLeft} days
            </div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:14, color:T.white, fontFamily:"monospace", fontWeight:700 }}>
              ${item.amount.toFixed(2)}
            </div>
            {item.status==="urgent" && (
              <Chip color={T.red} size={8}>urgent</Chip>
            )}
          </div>
        </WB>
      );
    })}

    {/* quick add to category */}
    <div style={{ padding:"10px 14px" }}>
      <button style={{ width:"100%", background:BILL_TYPES.utility.color+"22",
        border:`1px solid ${BILL_TYPES.utility.color}44`, borderRadius:10,
        padding:"10px", fontSize:12, color:BILL_TYPES.utility.color, cursor:"pointer" }}>
        + Add Utility Bill
      </button>
    </div>
    <TabBar active={0} />
  </Phone>
);

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionHdr = ({ num, title, sub }) => (
  <div style={{ borderBottom:`1px solid ${T.border}`, paddingBottom:16, marginBottom:32 }}>
    <div style={{ fontSize:11, color:T.accent, fontFamily:"monospace", letterSpacing:3,
      textTransform:"uppercase", marginBottom:6 }}>Section {num}</div>
    <div style={{ fontSize:28, color:T.white, fontWeight:800, letterSpacing:-0.5 }}>{title}</div>
    {sub && <div style={{ fontSize:13, color:T.gray2, marginTop:4 }}>{sub}</div>}
  </div>
);

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function SubTrackrWireframes() {
  const [tab, setTab] = useState(0);
  const sections = ["Mobile Screens","Calendar & Lists","Desktop","Components","Design Tokens"];

  return (
    <div style={{ background:T.bg, minHeight:"100vh", color:T.white,
      fontFamily:"system-ui, -apple-system, sans-serif" }}>

      {/* Top Nav */}
      <div style={{ position:"sticky", top:0, zIndex:100, background:T.bg+"F2",
        backdropFilter:"blur(16px)", borderBottom:`1px solid ${T.border}`,
        padding:"12px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:T.accent,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:14, color:"#fff", fontWeight:700, boxShadow:`0 0 12px ${T.accent}55` }}>S</div>
          <div>
            <div style={{ fontSize:14, fontWeight:700, color:T.white }}>SubTrackr</div>
            <div style={{ fontSize:10, color:T.gray3, fontFamily:"monospace" }}>UI/UX Wireframe Reference · v1.0</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:4 }}>
          {sections.map((s,i) => (
            <button key={i} onClick={() => setTab(i)} style={{ padding:"5px 12px", borderRadius:6,
              border:"none", cursor:"pointer",
              background: tab===i ? T.accent : T.elevated,
              color: tab===i ? "#fff" : T.gray2,
              fontSize:11, fontFamily:"monospace",
              boxShadow: tab===i ? `0 0 10px ${T.accent}44` : "none" }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding:"32px 24px", maxWidth:1400, margin:"0 auto" }}>

        {/* ── MOBILE SCREENS ── */}
        {tab === 0 && (
          <div>
            <SectionHdr num="01" title="Mobile Screen Wireframes"
              sub="300×630px phone frames. Annotated with component specs, pixel measurements, and interaction notes." />

            {/* Row 1 */}
            <div style={{ display:"flex", gap:28, flexWrap:"wrap", marginBottom:48 }}>
              <ScreenHome />
              <ScreenAIInput />
              <ScreenVoice />
            </div>

            {/* Row 2 */}
            <div style={{ display:"flex", gap:28, flexWrap:"wrap", marginBottom:48 }}>
              <ScreenConfirm />
              <ScreenDetail />
              <ScreenAnalytics />
            </div>

            {/* Row 3 */}
            <div style={{ display:"flex", gap:28, flexWrap:"wrap" }}>
              <ScreenBudget />
              <ScreenOnboard />

              {/* User flows */}
              <div style={{ display:"flex", flexDirection:"column", gap:12, maxWidth:260 }}>
                <div style={{ fontSize:11, color:T.accent, fontFamily:"monospace",
                  letterSpacing:2, textTransform:"uppercase", marginBottom:4 }}>Core User Flows</div>
                {[
                  { n:"01", t:"AI Text Input", col:T.accent, steps:[
                    "Tap center Add tab",
                    "Full-screen notes input opens, keyboard focuses",
                    "Type: \"Netflix 15.99 monthly, Spotify 9.99\"",
                    "Tap ⚡ Parse with AI → loading ~1s",
                    "Confirmation sheet slides up with parsed cards",
                    "Review / edit / remove per item",
                    "Confirm All → items animate into list",
                    "Budget gauge updates immediately",
                  ]},
                  { n:"02", t:"Voice Input", col:T.purple, steps:[
                    "Tap center Add tab",
                    "Tap mic icon in header",
                    "Speak subscriptions naturally",
                    "Live transcript + waveform shown",
                    "Tap Done → transcript becomes input text",
                    "Same AI parse pipeline runs",
                    "Confirmation sheet → Confirm → added",
                  ]},
                  { n:"03", t:"Edit Subscription", col:T.blue, steps:[
                    "Tap any subscription row",
                    "Detail bottom sheet slides up",
                    "All fields pre-filled and editable",
                    "Adjust amount, cycle, category, date",
                    "Tap Save → row updates instantly",
                    "Budget gauge and analytics recalculate",
                  ]},
                  { n:"04", t:"Set Budget", col:T.amber, steps:[
                    "Tap Budget tab",
                    "Tap monthly goal — adjust with +/−",
                    "Set per-category limits by tapping amount",
                    "Tap Save",
                    "Hero card arc redraws on Home",
                    "Category bars update in Analytics",
                  ]},
                ].map(flow => (
                  <div key={flow.n} style={{ background:T.surface, border:`1px solid ${T.border}`,
                    borderRadius:10, padding:12 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
                      <div style={{ width:20, height:20, borderRadius:5, background:flow.col,
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:9, color:"#fff", fontWeight:700, fontFamily:"monospace" }}>{flow.n}</div>
                      <span style={{ fontSize:12, color:T.white, fontWeight:600 }}>{flow.t}</span>
                    </div>
                    {flow.steps.map((s,i) => (
                      <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:6, marginBottom:4 }}>
                        <span style={{ fontSize:9, color:flow.col, fontFamily:"monospace",
                          minWidth:14, marginTop:1 }}>{i+1}.</span>
                        <span style={{ fontSize:11, color:T.gray2, lineHeight:1.4 }}>{s}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── CALENDAR & GROUPED LIST ── */}
        {tab === 1 && (
          <div>
            <SectionHdr num="02" title="Calendar & Grouped List"
              sub="Due date calendar with bill-type color coding + grouped list view by Type or Category." />

            {/* visual legend */}
            <div style={{ display:"flex", gap:16, flexWrap:"wrap", marginBottom:32 }}>
              <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:10,
                padding:"14px 18px" }}>
                <div style={{ fontSize:10, color:T.accent, fontFamily:"monospace", fontWeight:700,
                  letterSpacing:1.5, textTransform:"uppercase", marginBottom:12 }}>Bill Type Visual Language</div>
                <div style={{ display:"flex", gap:24, flexWrap:"wrap" }}>
                  {Object.entries(BILL_TYPES).map(([key,t]) => (
                    <div key={key} style={{ display:"flex", alignItems:"center", gap:10 }}>
                      {/* shape indicator */}
                      <div style={{ width:18, height:18, flexShrink:0,
                        background: t.color,
                        borderRadius: key==="subscription"?"50%":key==="utility"?"3px":key==="loan"?"2px":"4px",
                        transform: key==="utility"?"rotate(45deg)":"none",
                        display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <span style={{ fontSize:8, color:"#fff",
                          transform:key==="utility"?"rotate(-45deg)":"none",
                          fontWeight:700 }}>{t.icon}</span>
                      </div>
                      <div>
                        <div style={{ fontSize:11, color:T.white, fontWeight:600 }}>{t.label}</div>
                        <div style={{ fontSize:9, color:T.gray3, fontFamily:"monospace" }}>
                          {key==="subscription"?"● circle dot":key==="utility"?"◆ diamond dot":key==="loan"?"■ square dot":"▲ shape"}
                        </div>
                      </div>
                      <div style={{ padding:"3px 8px", background:t.color+"22",
                        border:`1px solid ${t.color}55`, borderRadius:4,
                        fontSize:9, color:t.color, fontFamily:"monospace", fontWeight:700 }}>
                        {t.icon} {t.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* screens row 1 */}
            <div style={{ display:"flex", gap:28, flexWrap:"wrap", marginBottom:48 }}>
              <ScreenCalendar />
              <ScreenCalendarDay />
              {/* calendar annotations */}
              <div style={{ display:"flex", flexDirection:"column", gap:12, maxWidth:280 }}>
                <div style={{ fontSize:11, color:T.accent, fontFamily:"monospace",
                  letterSpacing:2, textTransform:"uppercase", marginBottom:4 }}>Calendar Design Decisions</div>
                {[
                  { title:"Dot shapes per type", col:T.accent, desc:"Subscriptions = circle ●, Utilities = rotated diamond ◆, Loans = square ■. Shapes work even for colorblind users since shape + color both carry meaning." },
                  { title:"Left border color", col:T.purple, desc:"In day-detail view, each bill card has a 3px left border in its bill-type color. Instantly scannable at a glance without reading labels." },
                  { title:"Urgency color on days-left", col:T.red, desc:"Days-left number turns amber when ≤10 days, red when ≤5. Renewal urgency visible without opening the item." },
                  { title:"Month total in header", col:T.amber, desc:"Top-right of day-detail shows total due that day in red. Helps user understand cash-flow impact before tapping into bills." },
                  { title:"Past dates dimmed", col:T.gray3, desc:"Calendar days before today render at 45% opacity — clear visual split between past and upcoming without removing data." },
                  { title:"Tap day → detail", col:T.blue, desc:"Tapping any day with dots opens the day-detail sheet with all bills due, Mark Paid action, and rest-of-month preview." },
                ].map((d,i) => (
                  <div key={i} style={{ background:T.surface, border:`1px solid ${T.border}`,
                    borderRadius:10, padding:12, borderLeft:`3px solid ${d.col}` }}>
                    <div style={{ fontSize:11, color:d.col, fontWeight:700, marginBottom:4 }}>{d.title}</div>
                    <div style={{ fontSize:11, color:T.gray2, lineHeight:1.5 }}>{d.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* screens row 2 */}
            <div style={{ display:"flex", gap:28, flexWrap:"wrap" }}>
              <ScreenGroupedList />
              <ScreenCategoryDetail />
              {/* grouped list annotations */}
              <div style={{ display:"flex", flexDirection:"column", gap:12, maxWidth:280 }}>
                <div style={{ fontSize:11, color:T.accent, fontFamily:"monospace",
                  letterSpacing:2, textTransform:"uppercase", marginBottom:4 }}>Grouped List Design Decisions</div>
                {[
                  { title:"Two group modes", col:T.accent, desc:"Toggle between 'By Bill Type' (Subscriptions / Utilities / Loans) and 'By Category' (Entertainment / Dev Tools / Utilities). Same data, two mental models." },
                  { title:"Colored group headers", col:T.purple, desc:"Each group header band uses the bill-type or category color at 11% opacity background + full-opacity left border. Groups visually pop apart without heavy borders." },
                  { title:"Shape icons in group header", col:T.blue, desc:"Group header icons match the calendar dot shapes — circle for subscriptions, rotated diamond for utilities, square for loans. Consistent visual language across all screens." },
                  { title:"Group total always visible", col:T.amber, desc:"Right side of every group header shows $X.XX/mo total for that group. Users instantly see which group costs most without scrolling." },
                  { title:"Left border per item", col:T.green, desc:"Each row in a group has a 3px left border at the group color (44% opacity). Subtle visual grouping cue that reinforces membership even when scrolling fast." },
                  { title:"Category detail drill-down", col:T.red, desc:"Tapping a group header or 'View All' navigates to a category detail screen showing just that group's bills with a hero card, limit progress, and urgency indicators." },
                ].map((d,i) => (
                  <div key={i} style={{ background:T.surface, border:`1px solid ${T.border}`,
                    borderRadius:10, padding:12, borderLeft:`3px solid ${d.col}` }}>
                    <div style={{ fontSize:11, color:d.col, fontWeight:700, marginBottom:4 }}>{d.title}</div>
                    <div style={{ fontSize:11, color:T.gray2, lineHeight:1.5 }}>{d.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── DESKTOP ── */}
        {tab === 2 && (
          <div>
            <SectionHdr num="03" title="Desktop Layout"
              sub="3-column layout: Sidebar (200px) · Main content (flex-1) · Analytics panel (220px)" />
            <div style={{ marginBottom:40 }}><ScreenDesktop /></div>
            <div style={{ fontSize:11, color:T.accent, fontFamily:"monospace",
              letterSpacing:2, textTransform:"uppercase", marginBottom:16 }}>Responsive Breakpoints</div>
            <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
              {[
                { l:"Mobile < 640px",    layout:"Single column",  nav:"Bottom tab bar (4 tabs)",    note:"Center tab = Add (prominent)" },
                { l:"Tablet 640–1024px", layout:"2-column",       nav:"240px sidebar + content",   note:"Sidebar always visible" },
                { l:"Desktop > 1024px",  layout:"3-column",       nav:"200px + 220px analytics",   note:"Right analytics panel optional" },
              ].map((bp,i) => (
                <div key={i} style={{ flex:1, minWidth:200, background:T.surface,
                  border:`1px solid ${T.border}`, borderRadius:10, padding:14 }}>
                  <div style={{ fontSize:11, color:T.accent, fontFamily:"monospace",
                    marginBottom:10, fontWeight:700 }}>{bp.l}</div>
                  <Spec label="Layout" value={bp.layout} />
                  <Spec label="Navigation" value={bp.nav} />
                  <Spec label="Note" value={bp.note} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── COMPONENTS ── */}
        {tab === 3 && (
          <div>
            <SectionHdr num="04" title="Component Reference"
              sub="Pixel specs, states, and interaction patterns for all reusable UI components." />
            <div style={{ display:"flex", gap:24, flexWrap:"wrap" }}>

              {/* Subscription Row */}
              <div style={{ flex:1, minWidth:300 }}>
                <div style={{ fontSize:13, color:T.white, fontWeight:700, marginBottom:12 }}>Subscription Row</div>
                <div style={{ background:T.surface, border:`1px solid ${T.border}`,
                  borderRadius:10, overflow:"hidden", marginBottom:12 }}>
                  <SubRow name="Netflix" amount="15.99" cycle="monthly" category="entertainment" daysLeft={12} ann="58px height" />
                  <SubRow name="Claude Pro" amount="20.00" cycle="monthly" category="productivity" daysLeft={3} />
                  <SubRow name="1Password" amount="2.99" cycle="annual" category="devtools" daysLeft={120} paused />
                  <SubRow name="Gym" amount="45.00" cycle="monthly" category="health" daysLeft={5} />
                </div>
                <SpecPanel title="Sub Row Specs" specs={[
                  ["Height","58px"],
                  ["Padding H","14px"],
                  ["Service badge","34px, radius 10px"],
                  ["Badge color","category color / 22% opacity"],
                  ["Name font","14px / 500"],
                  ["Amount","15px / 700 JetBrains Mono"],
                  ["Renewal","10px / amber if ≤5 days"],
                  ["Paused","0.5 opacity"],
                  ["Swipe L","red delete zone"],
                  ["Long press","context menu"],
                ]} />
              </div>

              {/* Budget Hero Card */}
              <div style={{ flex:1, minWidth:260 }}>
                <div style={{ fontSize:13, color:T.white, fontWeight:700, marginBottom:12 }}>Budget Hero Card</div>
                <div style={{ background:T.surface, border:`1px solid ${T.border}`,
                  borderRadius:12, padding:16, marginBottom:12 }}>
                  <div style={{ fontSize:9, color:T.gray3, fontFamily:"monospace", marginBottom:8 }}>MONTHLY BUDGET</div>
                  <div style={{ display:"flex", justifyContent:"center" }}>
                    <ArcGauge spent={127.97} budget={200} size={180} />
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-around", marginTop:8 }}>
                    {[{l:"Spent",v:"$127.97",c:T.white},{l:"Budget",v:"$200.00",c:T.accent},{l:"Left",v:"$72.03",c:T.green}].map((m,i)=>(
                      <div key={i} style={{ textAlign:"center" }}>
                        <div style={{ fontSize:12, color:m.c, fontFamily:"monospace", fontWeight:700 }}>{m.v}</div>
                        <div style={{ fontSize:9, color:T.gray3, fontFamily:"monospace" }}>{m.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <SpecPanel title="Hero Card Specs" specs={[
                  ["Height","~180px"],
                  ["Arc type","SVG stroke-dasharray"],
                  ["Arc < 70%","teal (safe)"],
                  ["Arc 70–90%","amber (warning)"],
                  ["Arc > 90%","red (danger)"],
                  ["Amount font","JetBrains Mono 22px"],
                  ["Animation","Stroke draws in 800ms ease-out"],
                  ["Tap","Opens budget edit sheet"],
                ]} />
              </div>

              {/* Confirmation Card */}
              <div style={{ flex:1, minWidth:280 }}>
                <div style={{ fontSize:13, color:T.white, fontWeight:700, marginBottom:12 }}>Parsed Subscription Card</div>
                <div style={{ background:T.surface, border:`1px solid ${T.border}`,
                  borderRadius:12, padding:12, marginBottom:8 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                    <div style={{ width:32, height:32, borderRadius:8, background:T.cat.entertainment+"22",
                      border:`1px solid ${T.cat.entertainment}44`, display:"flex", alignItems:"center",
                      justifyContent:"center", fontSize:14, fontWeight:700, color:T.cat.entertainment }}>N</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, color:T.white, fontWeight:600 }}>Netflix</div>
                      <div style={{ fontSize:10, color:T.gray3, fontFamily:"monospace" }}>renews Apr 2</div>
                    </div>
                    <RiPencilLine size={14} color={T.gray3} />
                    <RiCloseLine size={16} color={T.red} style={{ marginLeft:4 }} />
                  </div>
                  <div style={{ display:"flex", gap:6 }}>
                    <Chip color={T.accent}>$15.99</Chip>
                    <Chip color={T.cat.entertainment}>entertainment</Chip>
                    <Chip color={T.gray3}>monthly</Chip>
                  </div>
                </div>
                <SpecPanel title="Parsed Card Specs" specs={[
                  ["Background","surface #141414"],
                  ["Border radius","12px"],
                  ["Padding","12px"],
                  ["Edit icon","✎ tap → inline edit"],
                  ["Remove icon","✕ red, removes from batch"],
                  ["Amount chip","teal"],
                  ["Category chip","category color"],
                  ["Cycle chip","gray"],
                  ["Animation","fly into list on confirm"],
                ]} />
              </div>

              {/* Tab Bar */}
              <div style={{ flex:1, minWidth:260 }}>
                <div style={{ fontSize:13, color:T.white, fontWeight:700, marginBottom:12 }}>Tab Bar</div>
                <div style={{ background:T.surface, border:`1px solid ${T.border}`,
                  borderRadius:10, overflow:"hidden", marginBottom:12, position:"relative", height:70 }}>
                  <div style={{ position:"absolute", bottom:0, left:0, right:0 }}><TabBar active={1} /></div>
                </div>
                <SpecPanel title="Tab Bar Specs" specs={[
                  ["Height","56px + safe-area"],
                  ["Tabs","4: Home, Add, Analytics, Budget"],
                  ["Center Add tab","40px circle, elevated"],
                  ["Active Add","teal circle + glow"],
                  ["Active others","teal icon + dot"],
                  ["Background","#141414 surface"],
                  ["Border","1px top"],
                ]} />
              </div>

              {/* Category Badge */}
              <div style={{ flex:1, minWidth:260 }}>
                <div style={{ fontSize:13, color:T.white, fontWeight:700, marginBottom:12 }}>Category Badges</div>
                <div style={{ background:T.surface, border:`1px solid ${T.border}`,
                  borderRadius:10, padding:14, marginBottom:12 }}>
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                    {Object.entries(T.cat).map(([name, color]) => (
                      <Chip key={name} color={color} size={10}>{name}</Chip>
                    ))}
                  </div>
                  <div style={{ marginTop:12, display:"flex", gap:6, flexWrap:"wrap" }}>
                    <Chip color={T.accent}>$15.99</Chip>
                    <Chip color={T.gray3}>monthly</Chip>
                    <span style={{ display:"inline-flex", alignItems:"center", gap:3, padding:"2px 7px",
                      background:T.amber+"22", color:T.amber, fontSize:9, borderRadius:4,
                      fontFamily:"monospace", fontWeight:700, border:`1px solid ${T.amber}44` }}>
                      <RiAlertLine size={10} /> limit
                    </span>
                    <Chip color={T.gray3}>paused</Chip>
                    <Chip color={T.green}>active</Chip>
                  </div>
                </div>
                <SpecPanel title="Badge Specs" specs={[
                  ["Padding","2px 7px"],
                  ["Border radius","4px"],
                  ["Background","color / 22% opacity"],
                  ["Border","1px color / 44% opacity"],
                  ["Font","9px monospace 700"],
                  ["Usage","categories, amounts, cycles"],
                ]} />
              </div>
            </div>
          </div>
        )}

        {/* ── DESIGN TOKENS ── */}
        {tab === 4 && (
          <div>
            <SectionHdr num="05" title="Design Token Reference"
              sub="Color system, typography scale, spacing, category palette, and lucide_react icon map." />
            <div style={{ display:"flex", gap:24, flexWrap:"wrap" }}>

              {/* Colors */}
              <div style={{ flex:2, minWidth:320 }}>
                <div style={{ fontSize:13, color:T.white, fontWeight:700, marginBottom:12 }}>Color Tokens — Dark Mode</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:20 }}>
                  {[
                    { token:"--bg-base",       hex:"#000000", desc:"App background" },
                    { token:"--bg-surface",    hex:"#141414", desc:"Card / panel" },
                    { token:"--bg-elevated",   hex:"#1C1C1C", desc:"Modal / sheet" },
                    { token:"--bg-hover",      hex:"#252525", desc:"Row hover" },
                    { token:"--accent",        hex:"#0D9488", desc:"Teal — CTA / active" },
                    { token:"--accent-dim",    hex:"#042F2E", desc:"Teal tinted bg" },
                    { token:"--accent-light",  hex:"#99F6E4", desc:"Light teal text" },
                    { token:"--text-primary",  hex:"#FFFFFF", desc:"Names, amounts" },
                    { token:"--text-secondary",hex:"#A1A1AA", desc:"Dates, cycles" },
                    { token:"--text-muted",    hex:"#52525B", desc:"Placeholder" },
                    { token:"--border",        hex:"#27272A", desc:"Dividers, outlines" },
                    { token:"--budget-ok",     hex:"#34D399", desc:"< 70% safe" },
                    { token:"--budget-warn",   hex:"#FBBF24", desc:"70–90% warning" },
                    { token:"--budget-over",   hex:"#EF4444", desc:"> 90% danger" },
                  ].map(tok => (
                    <div key={tok.token} style={{ display:"flex", alignItems:"center", gap:8,
                      background:T.surface, border:`1px solid ${T.border}`, borderRadius:6, padding:"7px 10px" }}>
                      <div style={{ width:20, height:20, borderRadius:4, background:tok.hex, flexShrink:0,
                        border:tok.hex==="#FFFFFF"?`1px solid ${T.border}`:undefined }} />
                      <div style={{ overflow:"hidden" }}>
                        <div style={{ fontSize:9, color:T.accent, fontFamily:"monospace",
                          whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{tok.token}</div>
                        <div style={{ fontSize:9, color:T.gray3, fontFamily:"monospace" }}>{tok.hex} · {tok.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ fontSize:13, color:T.white, fontWeight:700, marginBottom:12 }}>Category Color Palette</div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:20 }}>
                  {[
                    { name:"Entertainment", color:T.cat.entertainment, hex:"#F87171", ex:"Netflix, Spotify" },
                    { name:"Dev Tools",     color:T.cat.devtools,      hex:"#60A5FA", ex:"GitHub, Figma" },
                    { name:"Health",        color:T.cat.health,        hex:"#34D399", ex:"Gym, Headspace" },
                    { name:"Productivity",  color:T.cat.productivity,  hex:"#0D9488", ex:"Notion, Claude" },
                    { name:"News & Media",  color:T.cat.news,          hex:"#FBBF24", ex:"NYT, Substack" },
                    { name:"Cloud",         color:T.cat.cloud,         hex:"#A78BFA", ex:"iCloud, Drive" },
                    { name:"Other",         color:T.cat.other,         hex:"#6B7280", ex:"Catch-all" },
                  ].map(cat => (
                    <div key={cat.name} style={{ background:T.surface, border:`1px solid ${T.border}`,
                      borderRadius:8, padding:"8px 10px", display:"flex", alignItems:"center", gap:8 }}>
                      <div style={{ width:24, height:24, borderRadius:6, background:cat.color, flexShrink:0 }} />
                      <div>
                        <div style={{ fontSize:10, color:T.white, fontWeight:600 }}>{cat.name}</div>
                        <div style={{ fontSize:9, color:T.gray3, fontFamily:"monospace" }}>{cat.hex} · {cat.ex}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Typography + spacing */}
              <div style={{ flex:1, minWidth:260 }}>
                <div style={{ fontSize:13, color:T.white, fontWeight:700, marginBottom:12 }}>Typography Scale</div>
                <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:10,
                  padding:14, marginBottom:16 }}>
                  {[
                    { role:"Display",    size:32, w:700, s:"$127.97",          mono:true },
                    { role:"H1",         size:24, w:700, s:"SubTrackr" },
                    { role:"H2",         size:18, w:600, s:"All Subscriptions" },
                    { role:"Body Large", size:15, w:400, s:"Netflix" },
                    { role:"Body",       size:13, w:400, s:"Entertainment · monthly" },
                    { role:"Caption",    size:11, w:400, s:"12 days until renewal" },
                    { role:"Amount",     size:20, w:700, s:"$15.99",            mono:true },
                    { role:"Budget",     size:36, w:700, s:"$200",              mono:true },
                  ].map(t => (
                    <div key={t.role} style={{ borderBottom:`1px solid ${T.border}`, padding:"5px 0",
                      display:"flex", alignItems:"baseline", gap:8 }}>
                      <div style={{ width:60, fontSize:9, color:T.gray3, fontFamily:"monospace", flexShrink:0 }}>{t.role}</div>
                      <div style={{ fontSize:t.size*0.5, fontWeight:t.w, color:T.white,
                        fontFamily:t.mono?"monospace":"inherit", flex:1, overflow:"hidden",
                        textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.s}</div>
                      <div style={{ fontSize:9, color:T.gray4, fontFamily:"monospace", flexShrink:0 }}>{t.size}px</div>
                    </div>
                  ))}
                  <div style={{ marginTop:8, fontSize:10, color:T.gray3, fontFamily:"monospace" }}>
                    Amounts / numbers: JetBrains Mono · UI: Inter
                  </div>
                </div>

                <div style={{ fontSize:13, color:T.white, fontWeight:700, marginBottom:12 }}>Spacing (base 4px)</div>
                <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:14 }}>
                  {[1,2,3,4,5,6,8,10].map(n => (
                    <div key={n} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                      <div style={{ width:28, fontSize:9, color:T.gray3, fontFamily:"monospace" }}>sp-{n}</div>
                      <div style={{ height:6, background:T.accent+"66", borderRadius:2, width:n*8 }} />
                      <div style={{ fontSize:9, color:T.gray2, fontFamily:"monospace" }}>{n*4}px</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Icons */}
              <div style={{ flex:1, minWidth:260 }}>
                <div style={{ fontSize:13, color:T.white, fontWeight:700, marginBottom:12 }}>lucide_react Icon Map</div>
                <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, overflow:"hidden", marginBottom:16 }}>
                  {([
                    ["Home tab",          RiHome4Line,       RiHome4Fill,      "Home"],
                    ["Add tab (center)",  RiAddCircleLine,   RiAddCircleFill,  "PlusCircle"],
                    ["Analytics tab",     RiPieChartLine,    RiPieChartFill,   "PieChart / BarChart2"],
                    ["Budget tab",        RiWallet3Line,     RiWallet3Fill,    "Wallet"],
                    ["Settings",          RiSettingsLine,    null,             "Settings"],
                    ["Voice input",       RiMicLine,         RiMicFill,        "Mic"],
                    ["AI parse",          RiSparklingLine,   null,             "Sparkles"],
                    ["Edit",              RiPencilLine,      null,             "Pencil"],
                    ["Delete",            RiDeleteBin6Line,  null,             "Trash2"],
                    ["Pause",             RiPauseCircleLine, null,             "PauseCircle"],
                    ["Search",            RiSearchLine,      null,             "Search"],
                    ["Entertainment",     RiFilmLine,        null,             "Film"],
                    ["Dev Tools",         RiCodeLine,        null,             "Code2"],
                    ["Health",            RiHeartPulseLine,  null,             "HeartPulse"],
                    ["Productivity",      RiLightbulbLine,   null,             "Lightbulb"],
                    ["News & Media",      RiNewspaperLine,   null,             "Newspaper"],
                    ["Cloud Storage",     RiCloudLine,       null,             "Cloud"],
                    ["Utility bills",     RiFlashlightLine,  null,             "Zap"],
                    ["Loans",             RiBankLine,        null,             "Landmark"],
                    ["Insurance",         RiShieldLine,      null,             "Shield"],
                    ["Calendar",          RiCalendarLine,    null,             "Calendar"],
                    ["Alert / warning",   RiAlertLine,       null,             "AlertTriangle"],
                    ["Export data",       RiDownloadLine,    null,             "Download"],
                    ["Check / paid",      RiCheckLine,       null,             "Check"],
                    ["Close / remove",    RiCloseLine,       null,             "X"],
                    ["Back arrow",        RiArrowLeftLine,   null,             "ArrowLeft"],
                    ["Chevron right",     RiArrowRightSLine, null,             "ChevronRight"],
                  ]).map(([el, Outline, Fill, name], i) => (
                    <div key={i} style={{ display:"flex", gap:8, padding:"6px 12px",
                      borderBottom:`1px solid ${T.border}`,
                      background: i%2===0 ? undefined : T.bg+"44",
                      alignItems:"center" }}>
                      <span style={{ flex:1, fontSize:10, color:T.gray2 }}>{el}</span>
                      <span style={{ fontSize:9, color:T.gray3, fontFamily:"monospace", marginRight:6 }}>{name}</span>
                      <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                        <Outline size={16} color={T.accent} />
                        {Fill && Fill !== Outline && <Fill size={16} color={T.accent} />}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ fontSize:13, color:T.white, fontWeight:700, marginBottom:12 }}>
                  Service Logo Strategy
                </div>
                <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, overflow:"hidden" }}>
                  {[
                    { step:"1", label:"Google Favicon API", desc:"No key · free · instant",
                      color:T.accent, url:"google.com/s2/favicons?domain=netflix.com&sz=64" },
                    { step:"2", label:"logo.dev fallback",  desc:"Higher quality · free tier",
                      color:T.blue,  url:"img.logo.dev/netflix.com?token=pk_&size=64" },
                    { step:"3", label:"Colored initial badge", desc:"onError → always works",
                      color:T.purple, url:"generated client-side — zero network requests" },
                  ].map((s,i) => (
                    <div key={i} style={{ padding:"10px 12px", borderBottom:`1px solid ${T.border}` }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                        <div style={{ width:20, height:20, borderRadius:5, background:s.color,
                          display:"flex", alignItems:"center", justifyContent:"center",
                          fontSize:10, color:"#fff", fontWeight:700, flexShrink:0 }}>{s.step}</div>
                        <span style={{ fontSize:11, color:T.white, fontWeight:600 }}>{s.label}</span>
                        <Chip color={s.color} size={8}>{s.desc}</Chip>
                      </div>
                      <div style={{ fontSize:9, color:T.gray3, fontFamily:"monospace",
                        marginLeft:28, wordBreak:"break-all", lineHeight:1.5 }}>{s.url}</div>
                    </div>
                  ))}
                  <div style={{ padding:"10px 12px" }}>
                    <div style={{ fontSize:9, color:T.accent, fontFamily:"monospace", marginBottom:6, fontWeight:700 }}>
                      LIVE LOGOS IN THIS WIREFRAME
                    </div>
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                      {["Netflix","Spotify","Figma","GitHub","Claude Pro","Apple One"].map(name => (
                        <div key={name} style={{ display:"flex", alignItems:"center", gap:4 }}>
                          <ServiceLogo name={name} size={22} radius={5} />
                          <span style={{ fontSize:9, color:T.gray3, fontFamily:"monospace" }}>{name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ borderTop:`1px solid ${T.border}`, padding:"16px 24px",
        display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontSize:10, color:T.gray3, fontFamily:"monospace" }}>
          SubTrackr · UI/UX Wireframe Reference · v1.0 · March 2026
        </span>
        <div style={{ display:"flex", gap:8 }}>
          <Chip>React 18</Chip>
          <Chip color={T.blue}>Tailwind v4</Chip>
          <Chip color={T.purple}>Framer Motion</Chip>
          <Chip color={T.green}>lucide_react</Chip>
          <Chip color={T.amber}>Claude API</Chip>
        </div>
      </div>
    </div>
  );
}
