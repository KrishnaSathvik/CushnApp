import { useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// SUBTRACKR — DUAL-TONE LIGHT MODE TOKEN SYSTEM
// Primary accent: Teal #0D9488 (trust, finance, calm)
// Warm accent:    Orange #EA580C (energy, urgency, FocusFlow-inspired)
// Orange is used for: hero gradients, renewal alerts, FAB glow, "due today"
// Teal is used for:   CTAs, active nav, AI badges, confirmation states
// ─────────────────────────────────────────────────────────────────────────────

const DARK = {
  bg:"#000000", surface:"#141414", elevated:"#1C1C1C", hover:"#252525", border:"#27272A",
  accent:"#0D9488", accentDim:"#042F2E", accentLt:"#99F6E4",
  warm:"#F97316", warmDim:"#431407", warmLt:"#FED7AA",
  white:"#FFFFFF", gray1:"#F4F4F5", gray2:"#A1A1AA", gray3:"#52525B", gray4:"#27272A",
  red:"#EF4444", amber:"#FBBF24", green:"#34D399", blue:"#60A5FA", purple:"#A78BFA",
  cat:{ entertainment:"#F87171", devtools:"#60A5FA", health:"#34D399", productivity:"#0D9488", news:"#FBBF24", cloud:"#A78BFA", other:"#6B7280" }
};

const LIGHT = {
  bg:"#FFFBF7",       // warm white — faint orange warmth vs cold #F8FAFC
  surface:"#FFFFFF",
  elevated:"#FEF3E2", // orange-50 tint — inputs and wells feel warm
  hover:"#FDE8C8",    // orange-100 — row hover
  border:"#E8D5B7",   // warm tan — not cold gray
  accent:"#0D9488",   // teal — UNCHANGED
  accentDim:"#CCFBF1",
  accentLt:"#0F766E",
  warm:"#EA580C",     // orange-600 — deep enough for AA on white
  warmDim:"#FFF7ED",  // orange-50
  warmLt:"#C2410C",   // orange-700 — text on warmDim
  white:"#1C0A00",    // deep warm brown-black (not cold slate)
  gray1:"#3D1A00",    // warm dark brown
  gray2:"#78350F",    // amber-900 — warm body text
  gray2b:"#92400E",   // slightly lighter body text option
  gray3:"#B45309",    // amber-700 — captions, placeholders
  gray3b:"#D97706",   // amber-600 — lighter captions
  gray4:"#FDE8C8",    // orange-100 — subtle borders
  red:"#DC2626", amber:"#D97706", green:"#059669", blue:"#2563EB", purple:"#7C3AED",
  cat:{ entertainment:"#DC2626", devtools:"#2563EB", health:"#059669", productivity:"#0D9488", news:"#D97706", cloud:"#7C3AED", other:"#78350F" }
};

// balanced option — warm tones only in accent layer, neutral text
const LIGHT_BALANCED = {
  bg:"#FFFBF7",
  surface:"#FFFFFF",
  elevated:"#FEF3E2",
  hover:"#FDE8C8",
  border:"#E8D5B7",
  accent:"#0D9488",
  accentDim:"#CCFBF1",
  accentLt:"#0F766E",
  warm:"#EA580C",
  warmDim:"#FFF7ED",
  warmLt:"#C2410C",
  white:"#0F172A",    // neutral near-black text (legibility priority)
  gray1:"#1E293B",
  gray2:"#475569",
  gray3:"#94A3B8",
  gray4:"#E2E8F0",
  red:"#DC2626", amber:"#D97706", green:"#059669", blue:"#2563EB", purple:"#7C3AED",
  cat:{ entertainment:"#DC2626", devtools:"#2563EB", health:"#059669", productivity:"#0D9488", news:"#D97706", cloud:"#7C3AED", other:"#475569" }
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const Ic = ({ ch, s=16, c="currentColor" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none"
    stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">{ch}</svg>
);
const SunIc    = ({s=16,c}) => <Ic s={s} c={c} ch={<><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></>}/>;
const MoonIc   = ({s=16,c}) => <Ic s={s} c={c} ch={<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>}/>;
const CheckIc  = ({s=13,c}) => <Ic s={s} c={c} ch={<polyline points="20 6 9 17 4 12"/>}/>;
const WalletIc = ({s=16,c}) => <Ic s={s} c={c} ch={<><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M16 12h.01"/><path d="M2 10h20"/></>}/>;
const SparkIc  = ({s=12,c}) => <Ic s={s} c={c} ch={<path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z"/>}/>;
const MicIc    = ({s=14,c}) => <Ic s={s} c={c} ch={<><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></>}/>;
const HomeIc   = ({s=16,c}) => <Ic s={s} c={c} ch={<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>}/>;
const PieIc    = ({s=16,c}) => <Ic s={s} c={c} ch={<><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></>}/>;
const AlertIc  = ({s=14,c}) => <Ic s={s} c={c} ch={<><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>}/>;
const ZapIc    = ({s=14,c}) => <Ic s={s} c={c} ch={<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>}/>;

// ─── Service logos ────────────────────────────────────────────────────────────
const DOMAINS = {Netflix:"netflix.com",Spotify:"spotify.com","Claude Pro":"claude.ai",GitHub:"github.com",Figma:"figma.com"};
const SvcLogo = ({ name, size=26, T }) => {
  const [err,setErr] = useState(false);
  const d = DOMAINS[name];
  const cols = Object.values(T.cat);
  const col = cols[Object.keys(DOMAINS).indexOf(name) % cols.length] || T.accent;
  if (err||!d) return <div style={{width:size,height:size,borderRadius:8,background:col+"22",border:`1px solid ${col}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.4,fontWeight:700,color:col,flexShrink:0}}>{name[0]}</div>;
  return <div style={{width:size,height:size,borderRadius:8,background:T.elevated,border:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",flexShrink:0,padding:3}}><img src={`https://www.google.com/s2/favicons?domain=${d}&sz=64`} alt={name} onError={()=>setErr(true)} style={{width:"100%",height:"100%",objectFit:"contain"}}/></div>;
};

// ─────────────────────────────────────────────────────────────────────────────
// MINI APP PREVIEW
// ─────────────────────────────────────────────────────────────────────────────
const MiniApp = ({ T: tok, isDark }) => {
  const subs = [
    { name:"Netflix",    amount:"15.99", cat:"entertainment", due:"Today",  urgent:true  },
    { name:"Spotify",    amount:"9.99",  cat:"entertainment", due:"Mar 15", urgent:false },
    { name:"Claude Pro", amount:"20.00", cat:"productivity",  due:"Mar 20", urgent:false },
    { name:"GitHub",     amount:"4.00",  cat:"devtools",      due:"Apr 1",  urgent:false },
  ];

  // FocusFlow-style hero gradient for light mode
  const heroGradient = isDark
    ? `linear-gradient(135deg, ${tok.accentDim} 0%, #0A0A0A 100%)`
    : `linear-gradient(135deg, ${tok.warm} 0%, #9A3412 55%, #431407 100%)`;

  return (
    <div style={{ background:tok.bg, borderRadius:16, overflow:"hidden",
      border:`1px solid ${tok.border}`,
      boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.7)" : "0 4px 20px rgba(234,88,12,0.15)",
      width:"100%", fontFamily:"system-ui,-apple-system,sans-serif" }}>

      {/* Status bar */}
      <div style={{ height:22, background:tok.surface, borderBottom:`1px solid ${tok.border}`,
        display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 12px" }}>
        <span style={{ fontSize:8, color:tok.gray3, fontFamily:"monospace" }}>9:41</span>
        <span style={{ fontSize:8, color:tok.gray3, fontFamily:"monospace" }}>⬡ 64pts</span>
      </div>

      {/* Header */}
      <div style={{ padding:"10px 14px 8px", background:tok.surface,
        borderBottom:`1px solid ${tok.border}`,
        display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:7 }}>
          <div style={{ width:22, height:22, borderRadius:6, background:tok.accent,
            display:"flex", alignItems:"center", justifyContent:"center" }}>
            <WalletIc s={12} c="#fff"/>
          </div>
          <span style={{ fontSize:13, color:tok.white, fontWeight:700, letterSpacing:-0.3 }}>SubTrackr</span>
        </div>
        <div style={{ fontSize:9, color:tok.gray3, fontFamily:"monospace" }}>March 2026</div>
      </div>

      {/* Hero gradient card — FocusFlow orange in light mode */}
      <div style={{ padding:"10px 12px 8px", background:tok.bg }}>
        <div style={{ height:100, borderRadius:14, overflow:"hidden", position:"relative",
          background: heroGradient }}>
          <div style={{ position:"absolute", inset:0, padding:"12px 16px",
            display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
            <div style={{ fontSize:9, color:"rgba(255,255,255,0.6)", fontFamily:"monospace", letterSpacing:1 }}>
              MONTHLY SPEND
            </div>
            <div>
              <div style={{ fontSize:22, color:"#fff", fontFamily:"monospace", fontWeight:700,
                lineHeight:1, marginBottom:4 }}>$49.98</div>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ flex:1, height:4, borderRadius:2, background:"rgba(255,255,255,0.2)" }}>
                  <div style={{ width:"50%", height:"100%", borderRadius:2,
                    background:"rgba(255,255,255,0.8)" }}/>
                </div>
                <span style={{ fontSize:8, color:"rgba(255,255,255,0.7)", fontFamily:"monospace" }}>50% of $100</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* "Due today" orange alert — warm accent in action */}
      {!isDark && (
        <div style={{ margin:"0 12px 8px", background:tok.warmDim,
          border:`1px solid ${tok.warm}44`, borderRadius:10,
          padding:"8px 12px", display:"flex", alignItems:"center", gap:8 }}>
          <AlertIc s={13} c={tok.warm}/>
          <span style={{ fontSize:11, color:tok.warmLt, fontWeight:600, flex:1 }}>
            Netflix renews <strong>today</strong> · $15.99
          </span>
          <ZapIc s={11} c={tok.warm}/>
        </div>
      )}
      {isDark && (
        <div style={{ margin:"0 12px 8px", background:tok.warmDim,
          border:`1px solid ${tok.warm}44`, borderRadius:10,
          padding:"8px 12px", display:"flex", alignItems:"center", gap:8 }}>
          <AlertIc s={13} c={tok.warm}/>
          <span style={{ fontSize:11, color:tok.warmLt, fontWeight:500, flex:1 }}>
            Netflix renews <strong style={{color:"#fff"}}>today</strong> · $15.99
          </span>
        </div>
      )}

      {/* Sub list */}
      <div style={{ padding:"0 12px 8px" }}>
        <div style={{ background:tok.surface, border:`1px solid ${tok.border}`,
          borderRadius:12, overflow:"hidden",
          boxShadow: isDark ? "none" : "0 1px 6px rgba(234,88,12,0.08)" }}>
          <div style={{ padding:"8px 12px", borderBottom:`1px solid ${tok.border}`,
            display:"flex", justifyContent:"space-between" }}>
            <span style={{ fontSize:9, color:tok.gray3, fontFamily:"monospace", fontWeight:700 }}>SUBSCRIPTIONS</span>
            <span style={{ fontSize:9, color:tok.accent, fontFamily:"monospace" }}>+ Add</span>
          </div>
          {subs.map((s, i) => {
            const catColor = tok.cat[s.cat];
            return (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:9, padding:"8px 12px",
                borderBottom: i < subs.length-1 ? `1px solid ${tok.border}` : undefined,
                background: s.urgent && !isDark ? `${tok.warm}08` : undefined }}>
                <SvcLogo name={s.name} size={24} T={tok}/>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:11, color:tok.white, fontWeight:600 }}>{s.name}</div>
                  <div style={{ fontSize:9, fontFamily:"monospace",
                    color: s.urgent ? tok.warm : tok.gray3 }}>
                    {s.urgent ? "⚡ Due today" : `Due ${s.due}`}
                  </div>
                </div>
                <span style={{ fontSize:12, color:tok.white, fontFamily:"monospace", fontWeight:700 }}>
                  ${s.amount}
                </span>
                <div style={{ width:6, height:6, borderRadius:2, background:catColor, flexShrink:0 }}/>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI input */}
      <div style={{ padding:"4px 12px 8px" }}>
        <div style={{ background: isDark ? tok.accentDim : tok.warmDim,
          border:`1px solid ${isDark ? tok.accent : tok.warm}44`,
          borderRadius:10, padding:"8px 12px",
          display:"flex", alignItems:"center", gap:8 }}>
          <SparkIc s={11} c={isDark ? tok.accent : tok.warm}/>
          <span style={{ fontSize:10, flex:1,
            color: isDark ? tok.accentLt : tok.warmLt,
            fontFamily:"monospace" }}>
            Type or speak to add subscriptions...
          </span>
          <MicIc s={13} c={isDark ? tok.accent : tok.warm}/>
        </div>
      </div>

      {/* Tab bar — FAB uses orange in light mode */}
      <div style={{ height:50, background:tok.surface, borderTop:`1px solid ${tok.border}`,
        display:"flex", alignItems:"center", justifyContent:"space-around", padding:"0 8px" }}>
        {[
          { Icon:HomeIc,   label:"Home",      active:true,  fab:false },
          { Icon:SparkIc,  label:"Add",       active:false, fab:true  },
          { Icon:PieIc,    label:"Analytics", active:false, fab:false },
          { Icon:WalletIc, label:"Budget",    active:false, fab:false },
        ].map((tab,i)=>(
          <div key={i} style={{ display:"flex", flexDirection:"column",
            alignItems:"center", gap:2, flex:1 }}>
            {tab.fab ? (
              <div style={{ width:32, height:32, borderRadius:"50%",
                background: isDark ? tok.accent : tok.warm,
                display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow: isDark
                  ? `0 0 12px ${tok.accent}55`
                  : `0 4px 12px ${tok.warm}55` }}>
                <tab.Icon s={14} c="#fff"/>
              </div>
            ) : (
              <tab.Icon s={16} c={tab.active ? tok.accent : tok.gray3}/>
            )}
            <span style={{ fontSize:8, fontFamily:"monospace", fontWeight: tab.active ? 700 : 400,
              color: tab.active ? tok.accent : tok.gray3 }}>
              {tab.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TOKEN COMPARISON ROW
// ─────────────────────────────────────────────────────────────────────────────
const swatch = (hex, size=20, r=4) => (
  <div style={{ width:size, height:size, borderRadius:r, background:hex,
    border:"1px solid rgba(0,0,0,0.1)", flexShrink:0 }}/>
);

const TRow = ({ name, dark, light, light2, role, note }) => (
  <div style={{ display:"grid", gridTemplateColumns:"130px 1fr 1fr 1fr",
    gap:10, padding:"7px 0", borderBottom:"1px solid #F1F5F9", alignItems:"center" }}>
    <div>
      <div style={{ fontSize:10, color:"#0F172A", fontFamily:"monospace", fontWeight:700 }}>{name}</div>
      <div style={{ fontSize:9, color:"#64748B", marginTop:1 }}>{role}</div>
    </div>
    <div style={{ display:"flex", alignItems:"center", gap:7 }}>
      {swatch(dark)}
      <span style={{ fontSize:10, fontFamily:"monospace", color:"#0F172A" }}>{dark}</span>
    </div>
    <div style={{ display:"flex", alignItems:"center", gap:7 }}>
      {swatch(light)}
      <div>
        <div style={{ fontSize:10, fontFamily:"monospace", color:"#0F172A" }}>{light}</div>
        {note && <div style={{ fontSize:8, color:"#EA580C", fontFamily:"monospace" }}>{note}</div>}
      </div>
    </div>
    <div style={{ display:"flex", alignItems:"center", gap:7 }}>
      {swatch(light2||light)}
      <div style={{ fontSize:9, color:"#64748B", lineHeight:1.4 }}>{note||"unchanged"}</div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("preview");
  const [lightVariant, setLightVariant] = useState("warm"); // warm | balanced
  const LT = lightVariant === "warm" ? LIGHT : LIGHT_BALANCED;

  return (
    <div style={{ background:"#FFFBF7", minHeight:"100vh", padding:"20px",
      fontFamily:"system-ui,-apple-system,sans-serif" }}>
      <div style={{ maxWidth:1060, margin:"0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom:22 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4, flexWrap:"wrap" }}>
            <div style={{ width:28, height:28, borderRadius:8,
              background:"linear-gradient(135deg,#EA580C,#0D9488)",
              display:"flex", alignItems:"center", justifyContent:"center" }}>
              <WalletIc s={15} c="#fff"/>
            </div>
            <span style={{ fontSize:19, color:"#1C0A00", fontWeight:800, letterSpacing:-0.5 }}>
              SubTrackr — Light Mode with Orange Warmth
            </span>
          </div>
          <div style={{ fontSize:11, color:"#78350F", fontFamily:"monospace" }}>
            Teal #0D9488 (CTAs, nav) + Orange #EA580C (alerts, hero, FAB) — inspired by FocusFlow
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:4, background:"#FDE8C8",
          borderRadius:10, padding:4, marginBottom:22,
          border:"1px solid #E8D5B7" }}>
          {[{id:"preview",label:"Live Preview"},{id:"tokens",label:"Token Table"},{id:"usage",label:"Orange Usage Rules"},{id:"css",label:"CSS Output"}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              style={{ flex:1, padding:"7px 8px", borderRadius:7, border:"none",
                background: tab===t.id ? "#FFFFFF" : "none",
                color: tab===t.id ? "#1C0A00" : "#92400E",
                fontSize:11, fontFamily:"monospace", fontWeight:700, cursor:"pointer",
                boxShadow: tab===t.id ? "0 1px 4px rgba(234,88,12,0.15)" : "none" }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── PREVIEW TAB ── */}
        {tab === "preview" && (
          <div>
            {/* Variant picker */}
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18,
              padding:"12px 16px", background:"#FFF7ED", border:"1px solid #FDE8C8",
              borderRadius:12 }}>
              <span style={{ fontSize:11, color:"#78350F", fontFamily:"monospace", fontWeight:700 }}>
                LIGHT VARIANT:
              </span>
              {[
                { id:"warm",     label:"🔥 Full Warm",     desc:"Orange text + warm grays (immersive)" },
                { id:"balanced", label:"⚖ Balanced",       desc:"Orange accents + neutral text (safer)" },
              ].map(v => (
                <div key={v.id} onClick={() => setLightVariant(v.id)}
                  style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 14px",
                    borderRadius:9, cursor:"pointer",
                    background: lightVariant===v.id ? "#EA580C" : "#FFFFFF",
                    border:`1px solid ${lightVariant===v.id ? "#EA580C" : "#E8D5B7"}`,
                    color: lightVariant===v.id ? "#fff" : "#78350F" }}>
                  <span style={{ fontSize:11, fontWeight:700 }}>{v.label}</span>
                  <span style={{ fontSize:10, opacity:0.8 }}>{v.desc}</span>
                </div>
              ))}
            </div>

            <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
              {/* Dark */}
              <div style={{ flex:1, minWidth:260 }}>
                <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:10 }}>
                  <MoonIc s={13} c="#94A3B8"/>
                  <span style={{ fontSize:11, color:"#64748B", fontFamily:"monospace", fontWeight:700 }}>
                    DARK MODE (original)
                  </span>
                </div>
                <div style={{ background:"#0A0A0A", borderRadius:16, padding:10,
                  border:"1px solid #1C1C1C" }}>
                  <MiniApp T={DARK} isDark={true}/>
                </div>
                <div style={{ marginTop:10, padding:"10px 14px", background:"#141414",
                  border:"1px solid #27272A", borderRadius:10 }}>
                  <div style={{ fontSize:9, color:"#52525B", fontFamily:"monospace",
                    fontWeight:700, marginBottom:6, letterSpacing:1 }}>DARK ORANGE USAGE</div>
                  {[
                    ["Renewal alerts","#F97316 banner — warning tone"],
                    ["FAB button","teal accent (Add screen priority)"],
                    ["Hero card","teal accentDim gradient"],
                    ["AI input bar","teal accentDim bg"],
                  ].map(([k,v],i)=>(
                    <div key={i} style={{ display:"flex", gap:8, fontSize:9, padding:"3px 0",
                      borderBottom:"1px solid #1C1C1C" }}>
                      <span style={{ color:"#F97316", fontFamily:"monospace", minWidth:100 }}>{k}</span>
                      <span style={{ color:"#52525B" }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Light */}
              <div style={{ flex:1, minWidth:260 }}>
                <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:10 }}>
                  <SunIc s={13} c="#EA580C"/>
                  <span style={{ fontSize:11, color:"#78350F", fontFamily:"monospace", fontWeight:700 }}>
                    LIGHT MODE ({lightVariant === "warm" ? "Full Warm" : "Balanced"})
                  </span>
                </div>
                <div style={{ background:"#E8D5B7", borderRadius:16, padding:10,
                  border:"1px solid #D4B896" }}>
                  <MiniApp T={LT} isDark={false}/>
                </div>
                <div style={{ marginTop:10, padding:"10px 14px", background:"#FFF7ED",
                  border:"1px solid #FDE8C8", borderRadius:10 }}>
                  <div style={{ fontSize:9, color:"#92400E", fontFamily:"monospace",
                    fontWeight:700, marginBottom:6, letterSpacing:1 }}>LIGHT ORANGE USAGE</div>
                  {[
                    ["Hero card","Orange→dark gradient (FocusFlow style)"],
                    ["FAB button","#EA580C + orange glow shadow"],
                    ["Renewal alert","warmDim bg + warmLt text"],
                    ["AI input bar","warmDim bg instead of accentDim"],
                    ["Due today row","subtle orange tint on row bg"],
                    ["Page bg","#FFFBF7 warm white (not cold slate)"],
                  ].map(([k,v],i)=>(
                    <div key={i} style={{ display:"flex", gap:8, fontSize:9, padding:"3px 0",
                      borderBottom:"1px solid #FDE8C8" }}>
                      <span style={{ color:"#EA580C", fontFamily:"monospace", minWidth:110 }}>{k}</span>
                      <span style={{ color:"#78350F" }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* What orange replaced from FocusFlow */}
              <div style={{ width:"100%", display:"flex", gap:10, flexWrap:"wrap" }}>
                <div style={{ flex:1, minWidth:220, padding:"14px 18px",
                  background:"#FFF7ED", border:"1px solid #FDE8C8", borderRadius:12 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                    <div style={{ width:8, height:8, borderRadius:2, background:"#F97316" }}/>
                    <span style={{ fontSize:11, color:"#78350F", fontWeight:700, fontFamily:"monospace" }}>
                      BORROWED FROM FOCUSFLOW
                    </span>
                  </div>
                  {[
                    ["Hero gradient","linear-gradient(135deg, warm 0%, dark brown 55%)"],
                    ["FAB glow","box-shadow: 0 4px 12px warm55"],
                    ["Page warmth","warm white bg #FFFBF7 not cold slate"],
                    ["Alert tone","orange for urgency, not generic red"],
                  ].map(([k,v],i)=>(
                    <div key={i} style={{ padding:"5px 0", borderBottom:"1px solid #FDE8C8" }}>
                      <div style={{ fontSize:10, color:"#EA580C", fontFamily:"monospace",
                        fontWeight:700 }}>{k}</div>
                      <div style={{ fontSize:11, color:"#78350F" }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ flex:1, minWidth:220, padding:"14px 18px",
                  background:"#CCFBF1", border:"1px solid #0D948844", borderRadius:12 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                    <div style={{ width:8, height:8, borderRadius:2, background:"#0D9488" }}/>
                    <span style={{ fontSize:11, color:"#0F766E", fontWeight:700, fontFamily:"monospace" }}>
                      STILL TEAL (SubTrackr identity)
                    </span>
                  </div>
                  {[
                    ["Primary CTA","Get started free, Save — teal only"],
                    ["Active nav tab","Home, Analytics — teal indicator"],
                    ["AI parse badge","✦ AI parsed — teal brand"],
                    ["Confirmed states","Saved, active sub — teal checkmark"],
                    ["Budget arc gauge","teal fill on spending meter"],
                  ].map(([k,v],i)=>(
                    <div key={i} style={{ padding:"5px 0", borderBottom:"1px solid #0D948822" }}>
                      <div style={{ fontSize:10, color:"#0D9488", fontFamily:"monospace",
                        fontWeight:700 }}>{k}</div>
                      <div style={{ fontSize:11, color:"#0F766E" }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TOKEN TABLE ── */}
        {tab === "tokens" && (
          <div style={{ background:"#FFFFFF", border:"1px solid #E8D5B7",
            borderRadius:14, padding:"20px 24px" }}>

            <div style={{ display:"grid", gridTemplateColumns:"130px 1fr 1fr 1fr",
              gap:10, padding:"0 0 8px", borderBottom:"2px solid #E8D5B7", marginBottom:8 }}>
              <span style={{ fontSize:9, color:"#92400E", fontFamily:"monospace", fontWeight:700 }}>TOKEN</span>
              <span style={{ fontSize:9, color:"#92400E", fontFamily:"monospace", fontWeight:700 }}>DARK</span>
              <span style={{ fontSize:9, color:"#92400E", fontFamily:"monospace", fontWeight:700 }}>LIGHT (VALUE)</span>
              <span style={{ fontSize:9, color:"#92400E", fontFamily:"monospace", fontWeight:700 }}>NOTE</span>
            </div>

            <div style={{ fontSize:10, color:"#EA580C", fontFamily:"monospace", fontWeight:700,
              letterSpacing:2, padding:"10px 0 4px" }}>NEW — ORANGE TOKENS</div>
            {[
              { name:"--warm",      dark:"#F97316", light:"#EA580C", role:"Orange accent",  note:"600-level for AA on white" },
              { name:"--warm-dim",  dark:"#431407", light:"#FFF7ED", role:"Orange bg tint", note:"orange-50 — hero, alerts" },
              { name:"--warm-lt",   dark:"#FED7AA", light:"#C2410C", role:"Orange text",    note:"orange-700 on warm-dim bg" },
            ].map(t=><TRow key={t.name} {...t} light2={t.light}/>)}

            <div style={{ fontSize:10, color:"#EA580C", fontFamily:"monospace", fontWeight:700,
              letterSpacing:2, padding:"14px 0 4px" }}>BACKGROUNDS (orange-warmed)</div>
            {[
              { name:"--bg",       dark:"#000000", light:"#FFFBF7", role:"Page bg",    note:"warm white (not cold)" },
              { name:"--surface",  dark:"#141414", light:"#FFFFFF", role:"Cards",      note:"pure white" },
              { name:"--elevated", dark:"#1C1C1C", light:"#FEF3E2", role:"Inputs",     note:"orange-50 tint" },
              { name:"--hover",    dark:"#252525", light:"#FDE8C8", role:"Row hover",  note:"orange-100" },
              { name:"--border",   dark:"#27272A", light:"#E8D5B7", role:"Dividers",   note:"warm tan, not gray" },
            ].map(t=><TRow key={t.name} {...t} light2={t.light}/>)}

            <div style={{ fontSize:10, color:"#0D9488", fontFamily:"monospace", fontWeight:700,
              letterSpacing:2, padding:"14px 0 4px" }}>TEAL BRAND (unchanged)</div>
            {[
              { name:"--accent",     dark:"#0D9488", light:"#0D9488", role:"Primary CTAs",   note:"same" },
              { name:"--accent-dim", dark:"#042F2E", light:"#CCFBF1", role:"Accent tint",    note:"teal-50" },
              { name:"--accent-lt",  dark:"#99F6E4", light:"#0F766E", role:"Accent text",    note:"teal-700" },
            ].map(t=><TRow key={t.name} {...t} light2={t.light}/>)}

            <div style={{ fontSize:10, color:"#64748B", fontFamily:"monospace", fontWeight:700,
              letterSpacing:2, padding:"14px 0 4px" }}>TEXT (balanced variant)</div>
            {[
              { name:"--white",  dark:"#FFFFFF", light:"#0F172A", role:"Primary text",   note:"neutral (balanced)" },
              { name:"--gray2",  dark:"#A1A1AA", light:"#475569", role:"Body text",      note:"slate-600" },
              { name:"--gray3",  dark:"#52525B", light:"#94A3B8", role:"Captions",       note:"slate-400" },
            ].map(t=><TRow key={t.name} {...t} light2={t.light}/>)}
          </div>
        )}

        {/* ── ORANGE USAGE RULES ── */}
        {tab === "usage" && (
          <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
            <div style={{ flex:2, minWidth:300, background:"#FFFFFF",
              border:"1px solid #E8D5B7", borderRadius:14, padding:"20px 24px" }}>
              <div style={{ fontSize:13, color:"#1C0A00", fontWeight:700, marginBottom:16 }}>
                When to use Orange vs Teal
              </div>
              {[
                { color:"#EA580C", label:"USE ORANGE FOR",
                  items:[
                    ["Hero card gradient","linear-gradient(135deg, warm, dark-brown) — FocusFlow pattern"],
                    ["Renewal due today","Row tint + alert banner — urgency signal"],
                    ["FAB Add button","Orange circle + glow in light mode only"],
                    ["AI input bar","warmDim background — inviting, warm feel"],
                    ["Upcoming renewal chip","'Due in 2 days' badge — amber-orange"],
                    ["Page background","#FFFBF7 warm white sets the whole tone"],
                  ]
                },
                { color:"#0D9488", label:"USE TEAL FOR",
                  items:[
                    ["Primary CTAs","Save, Get started, Confirm — trust signal"],
                    ["Active tab indicator","Home/Analytics tab bar dot + label"],
                    ["AI parsed badge","✦ AI PARSED — Claude brand association"],
                    ["Budget arc gauge","Spending meter fill color"],
                    ["Success states","Saved ✓, Active subscription badge"],
                    ["Form focus ring","Input border on focus — 3px glow"],
                  ]
                },
              ].map(section => (
                <div key={section.label} style={{ marginBottom:24 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                    <div style={{ width:10, height:10, borderRadius:2, background:section.color }}/>
                    <span style={{ fontSize:10, color:section.color, fontFamily:"monospace",
                      fontWeight:700, letterSpacing:1 }}>{section.label}</span>
                  </div>
                  {section.items.map(([k,v],i)=>(
                    <div key={i} style={{ display:"flex", gap:10, padding:"7px 0",
                      borderBottom:"1px solid #FEF3E2", alignItems:"flex-start" }}>
                      <div style={{ width:6, height:6, borderRadius:"50%", background:section.color,
                        flexShrink:0, marginTop:4 }}/>
                      <div>
                        <span style={{ fontSize:12, color:"#1C0A00", fontWeight:600 }}>{k} — </span>
                        <span style={{ fontSize:12, color:"#78350F" }}>{v}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              {/* Never use orange for */}
              <div style={{ background:"#FFF1F2", border:"1px solid #FECDD3",
                borderRadius:10, padding:"14px 16px" }}>
                <div style={{ fontSize:10, color:"#DC2626", fontFamily:"monospace",
                  fontWeight:700, letterSpacing:1, marginBottom:8 }}>NEVER USE ORANGE FOR</div>
                {[
                  "Primary CTA buttons (that's teal's job — trust matters in finance)",
                  "Active navigation state (stick to teal for consistency)",
                  "Error states (that's red's job — orange is urgency, not failure)",
                  "Body text in Balanced variant (too hard to read at small sizes)",
                  "Success confirmations (teal = confirmed, orange = warning)",
                ].map((r,i)=>(
                  <div key={i} style={{ fontSize:12, color:"#9F1239", padding:"4px 0",
                    borderBottom:"1px solid #FECDD3", display:"flex", gap:8 }}>
                    <span style={{ color:"#DC2626", flexShrink:0 }}>✗</span>
                    {r}
                  </div>
                ))}
              </div>
            </div>

            {/* Side panel */}
            <div style={{ flex:1, minWidth:240, display:"flex", flexDirection:"column", gap:12 }}>
              <div style={{ background:"#FFFFFF", border:"1px solid #E8D5B7",
                borderRadius:14, padding:"16px 18px" }}>
                <div style={{ fontSize:11, color:"#1C0A00", fontWeight:700, marginBottom:10 }}>
                  Which variant to ship?
                </div>
                {[
                  { v:"Full Warm", rec:"Indie / personal brand", desc:"Bold, memorable, distinctive. Orange text + warm grays. High personality.", go:true },
                  { v:"Balanced", rec:"Broader audience", desc:"Orange accents only. Neutral text. Easier to read. Safer for finance data.", go:false },
                ].map(x=>(
                  <div key={x.v} style={{ marginBottom:12, padding:"12px",
                    background: x.go ? "#FFF7ED" : "#F8FAFC",
                    border:`1px solid ${x.go ? "#EA580C44" : "#E2E8F0"}`,
                    borderRadius:10 }}>
                    <div style={{ display:"flex", gap:6, alignItems:"center", marginBottom:4 }}>
                      <span style={{ fontSize:11, color: x.go?"#EA580C":"#475569",
                        fontWeight:700 }}>{x.v}</span>
                      {x.go && <span style={{ fontSize:8, background:"#EA580C", color:"#fff",
                        padding:"1px 6px", borderRadius:3, fontFamily:"monospace",
                        fontWeight:700 }}>RECOMMENDED</span>}
                    </div>
                    <div style={{ fontSize:10, color: x.go?"#78350F":"#64748B",
                      fontFamily:"monospace", marginBottom:3 }}>{x.rec}</div>
                    <div style={{ fontSize:11, color: x.go?"#92400E":"#475569",
                      lineHeight:1.5 }}>{x.desc}</div>
                  </div>
                ))}
              </div>

              <div style={{ background:"#FFF7ED", border:"1px solid #FDE8C8",
                borderRadius:14, padding:"16px 18px" }}>
                <div style={{ fontSize:11, color:"#78350F", fontWeight:700, marginBottom:10 }}>
                  Add to CLAUDE.md
                </div>
                <div style={{ background:"#1C0A00", borderRadius:8, padding:"12px",
                  fontFamily:"monospace", fontSize:10, lineHeight:1.8, color:"#FED7AA" }}>
                  {"## Light Mode Tokens\n"}
                  <span style={{ color:"#EA580C" }}>{"--warm: #EA580C\n"}</span>
                  <span style={{ color:"#EA580C" }}>{"--warm-dim: #FFF7ED\n"}</span>
                  <span style={{ color:"#EA580C" }}>{"--warm-lt: #C2410C\n"}</span>
                  <span style={{ color:"#FED7AA" }}>{"--bg: #FFFBF7\n"}</span>
                  <span style={{ color:"#FED7AA" }}>{"--border: #E8D5B7\n"}</span>
                  <span style={{ color:"#34D399" }}>{"--accent: #0D9488 (same)\n"}</span>
                  {"Orange: hero, FAB, alerts\n"}
                  {"Teal: CTAs, nav, AI badge\n"}
                  {"Never: orange for CTAs/errors"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── CSS OUTPUT ── */}
        {tab === "css" && (
          <div style={{ background:"#1C0A00", borderRadius:14, padding:"24px",
            fontFamily:"'JetBrains Mono',monospace", fontSize:11, lineHeight:1.9,
            border:"1px solid #3D1A00", overflowX:"auto" }}>
            <div style={{ color:"#92400E", marginBottom:4 }}>{"/* SubTrackr — Light Mode + Orange Warmth */"}</div>
            <div style={{ color:"#92400E", marginBottom:12 }}>{"/* Add to src/index.css after :root {} */"}</div>

            <div style={{ color:"#F97316" }}>{"@media (prefers-color-scheme: light) {"}</div>
            <div style={{ color:"#F97316", paddingLeft:16 }}>{"  :root {"}</div>

            <div style={{ color:"#52525B", paddingLeft:32, marginTop:4 }}>{"/* Backgrounds — warm, not cold */"}</div>
            {[["--bg","#FFFBF7","/* warm white */"],["--surface","#FFFFFF",""],["--elevated","#FEF3E2","/* orange-50 */"],["--hover","#FDE8C8","/* orange-100 */"],["--border","#E8D5B7","/* warm tan */"]].map(([k,v,c])=>(
              <div key={k} style={{ paddingLeft:32 }}>
                <span style={{ color:"#60A5FA" }}>{k}</span>
                <span style={{ color:"#94A3B8" }}>: </span>
                <span style={{ color:"#FBBF24" }}>{v}</span>
                <span style={{ color:"#94A3B8" }}>; </span>
                {c && <span style={{ color:"#52525B" }}>{c}</span>}
              </div>
            ))}

            <div style={{ color:"#52525B", paddingLeft:32, marginTop:8 }}>{"/* Orange warm accent — NEW */"}</div>
            {[["--warm","#EA580C","/* orange-600 */"],["--warm-dim","#FFF7ED","/* orange-50 */"],["--warm-lt","#C2410C","/* orange-700 */"]].map(([k,v,c])=>(
              <div key={k} style={{ paddingLeft:32 }}>
                <span style={{ color:"#F97316" }}>{k}</span>
                <span style={{ color:"#94A3B8" }}>: </span>
                <span style={{ color:"#FBBF24" }}>{v}</span>
                <span style={{ color:"#94A3B8" }}>; </span>
                <span style={{ color:"#52525B" }}>{c}</span>
              </div>
            ))}

            <div style={{ color:"#52525B", paddingLeft:32, marginTop:8 }}>{"/* Teal brand — unchanged */"}</div>
            {[["--accent","#0D9488","/* same */"],["--accent-dim","#CCFBF1","/* teal-50 */"],["--accent-lt","#0F766E","/* teal-700 */"]].map(([k,v,c])=>(
              <div key={k} style={{ paddingLeft:32 }}>
                <span style={{ color:"#34D399" }}>{k}</span>
                <span style={{ color:"#94A3B8" }}>: </span>
                <span style={{ color:"#FBBF24" }}>{v}</span>
                <span style={{ color:"#94A3B8" }}>; </span>
                <span style={{ color:"#52525B" }}>{c}</span>
              </div>
            ))}

            <div style={{ color:"#52525B", paddingLeft:32, marginTop:8 }}>{"/* Text — balanced variant */"}</div>
            {[["--white","#0F172A","/* primary text */"],["--gray1","#1E293B",""],["--gray2","#475569",""],["--gray3","#94A3B8",""],["--gray4","#E2E8F0",""]].map(([k,v,c])=>(
              <div key={k} style={{ paddingLeft:32 }}>
                <span style={{ color:"#60A5FA" }}>{k}</span>
                <span style={{ color:"#94A3B8" }}>: </span>
                <span style={{ color:"#FBBF24" }}>{v}</span>
                <span style={{ color:"#94A3B8" }}>; </span>
                {c && <span style={{ color:"#52525B" }}>{c}</span>}
              </div>
            ))}

            <div style={{ color:"#52525B", paddingLeft:32, marginTop:8 }}>{"/* Semantic — deepened for white bg */"}</div>
            {[["--red","#DC2626"],["--amber","#D97706"],["--green","#059669"],["--blue","#2563EB"],["--purple","#7C3AED"]].map(([k,v])=>(
              <div key={k} style={{ paddingLeft:32 }}>
                <span style={{ color:"#60A5FA" }}>{k}</span>
                <span style={{ color:"#94A3B8" }}>: </span>
                <span style={{ color:"#FBBF24" }}>{v}</span>
                <span style={{ color:"#94A3B8" }}>;</span>
              </div>
            ))}

            <div style={{ color:"#52525B", paddingLeft:32, marginTop:8 }}>{"/* Categories — 600-level for AA */"}</div>
            {[["--cat-entertainment","#DC2626"],["--cat-devtools","#2563EB"],["--cat-health","#059669"],["--cat-productivity","#0D9488"],["--cat-news","#D97706"],["--cat-cloud","#7C3AED"]].map(([k,v])=>(
              <div key={k} style={{ paddingLeft:32 }}>
                <span style={{ color:"#A78BFA" }}>{k}</span>
                <span style={{ color:"#94A3B8" }}>: </span>
                <span style={{ color:"#FBBF24" }}>{v}</span>
                <span style={{ color:"#94A3B8" }}>;</span>
              </div>
            ))}

            <div style={{ color:"#F97316", paddingLeft:16 }}>{"  }"}</div>
            <div style={{ color:"#F97316" }}>{"}"}</div>

            <div style={{ color:"#92400E", marginTop:16 }}>{"/* Manual toggle via JS: */"}</div>
            <div style={{ color:"#92400E" }}>{"/* document.documentElement.setAttribute('data-theme','light') */"}</div>
            <div style={{ color:"#F97316", marginTop:4 }}>{"[data-theme='light'] {"}</div>
            <div style={{ color:"#94A3B8", paddingLeft:16 }}>{"/* same vars as above */"}</div>
            <div style={{ color:"#F97316" }}>{"}"}</div>
          </div>
        )}

      </div>
    </div>
  );
}
