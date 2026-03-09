import { useState } from "react";

const T = {
  bg:"#000000", surface:"#141414", elevated:"#1C1C1C", border:"#27272A",
  accent:"#0D9488", accentDim:"#042F2E", accentLt:"#99F6E4",
  white:"#FFFFFF", gray1:"#F4F4F5", gray2:"#A1A1AA", gray3:"#52525B", gray4:"#27272A",
  green:"#34D399", blue:"#60A5FA", amber:"#FBBF24", purple:"#A78BFA", red:"#EF4444",
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const Ic = ({ d, s = 16, c = "currentColor", sw = 2, ch }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none"
    stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {ch || <path d={d} />}
  </svg>
);
const EyeIc    = ({ s=16,c=T.gray3 }) => <Ic s={s} c={c} ch={<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}/>;
const EyeOffIc = ({ s=16,c=T.gray3 }) => <Ic s={s} c={c} ch={<><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>}/>;
const MailIc   = ({ s=16,c=T.gray3 }) => <Ic s={s} c={c} ch={<><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>}/>;
const LockIc   = ({ s=16,c=T.gray3 }) => <Ic s={s} c={c} ch={<><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>}/>;
const UserIc   = ({ s=16,c=T.gray3 }) => <Ic s={s} c={c} ch={<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>}/>;
const WalletIc = ({ s=16,c=T.white }) => <Ic s={s} c={c} ch={<><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M16 12h.01"/><path d="M2 10h20"/></>}/>;
const CheckIc  = ({ s=14,c=T.green }) => <Ic s={s} c={c} ch={<polyline points="20 6 9 17 4 12"/>}/>;
const SparkIc  = ({ s=12,c=T.accent }) => <Ic s={s} c={c} ch={<path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z"/>}/>;
const GoogleIc = ({ s=16 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);
const GithubIc = ({ s=16,c=T.white }) => <Ic s={s} c={c} ch={<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>}/>;
const ArrowIc  = ({ s=14,c=T.white }) => <Ic s={s} c={c} ch={<><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>}/>;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const Chip = ({ children, color = T.accent, size = 9 }) => (
  <span style={{ display:"inline-flex", alignItems:"center", padding:"2px 8px",
    background:color+"22", color, fontSize:size, borderRadius:4,
    fontFamily:"monospace", fontWeight:700, border:`1px solid ${color}44` }}>
    {children}
  </span>
);

// ─── Input Field ──────────────────────────────────────────────────────────────
const Field = ({ label, type="text", placeholder, icon: Icon, rightIcon, onRightClick, hint, error, required, ann }) => {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ marginBottom: 16, position:"relative" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
        <label style={{ fontSize:12, color:T.gray2, fontWeight:500 }}>
          {label}{required && <span style={{ color:T.accent, marginLeft:2 }}>*</span>}
        </label>
        {hint && <span style={{ fontSize:10, color:T.accent, fontFamily:"monospace", cursor:"pointer" }}>{hint}</span>}
      </div>
      <div style={{ position:"relative", display:"flex", alignItems:"center" }}>
        {Icon && (
          <div style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}>
            <Icon s={15} c={focus ? T.accent : T.gray3}/>
          </div>
        )}
        <input
          type={type}
          placeholder={placeholder}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={{
            width:"100%", height:44, background:T.elevated,
            border:`1px solid ${error ? T.red : focus ? T.accent : T.border}`,
            borderRadius:10, color:T.white, fontSize:13,
            paddingLeft: Icon ? 38 : 14, paddingRight: rightIcon ? 40 : 14,
            outline:"none", boxSizing:"border-box",
            boxShadow: focus ? `0 0 0 3px ${T.accent}22` : "none",
            transition:"border-color 0.15s, box-shadow 0.15s",
          }}
        />
        {rightIcon && (
          <div onClick={onRightClick}
            style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", cursor:"pointer" }}>
            {rightIcon}
          </div>
        )}
      </div>
      {error && <div style={{ fontSize:11, color:T.red, marginTop:4, display:"flex", alignItems:"center", gap:4 }}>{error}</div>}
      {ann && (
        <div style={{ position:"absolute", left:"calc(100% + 10px)", top:32, whiteSpace:"nowrap",
          fontSize:9, color:T.accent, fontFamily:"monospace", fontWeight:700,
          background:T.bg, padding:"2px 6px", borderRadius:3, border:`1px solid ${T.accent}44` }}>
          {ann}
        </div>
      )}
    </div>
  );
};

// ─── Password Strength ────────────────────────────────────────────────────────
const StrengthBar = ({ password }) => {
  const len = password.length;
  const strength = len === 0 ? 0 : len < 6 ? 1 : len < 10 ? 2 : 3;
  const colors = ["transparent", T.red, T.amber, T.green];
  const labels = ["", "Weak", "Fair", "Strong"];
  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ display:"flex", gap:4, marginBottom:4 }}>
        {[1,2,3].map(i => (
          <div key={i} style={{ flex:1, height:3, borderRadius:2,
            background: strength >= i ? colors[strength] : T.border,
            transition:"background 0.2s" }}/>
        ))}
      </div>
      {len > 0 && (
        <div style={{ fontSize:10, color:colors[strength], fontFamily:"monospace", fontWeight:700 }}>
          {labels[strength]}
        </div>
      )}
    </div>
  );
};

// ─── Social Button ────────────────────────────────────────────────────────────
const SocialBtn = ({ Icon, label }) => (
  <button style={{ flex:1, height:42, background:T.elevated,
    border:`1px solid ${T.border}`, borderRadius:10,
    display:"flex", alignItems:"center", justifyContent:"center", gap:8,
    cursor:"pointer", transition:"border-color 0.15s" }}
    onMouseEnter={e => e.currentTarget.style.borderColor = T.accent}
    onMouseLeave={e => e.currentTarget.style.borderColor = T.border}>
    <Icon s={16}/>
    <span style={{ fontSize:12, color:T.gray2, fontWeight:500 }}>{label}</span>
  </button>
);

// ─── Divider ──────────────────────────────────────────────────────────────────
const OrDivider = () => (
  <div style={{ display:"flex", alignItems:"center", gap:12, margin:"20px 0" }}>
    <div style={{ flex:1, height:1, background:T.border }}/>
    <span style={{ fontSize:11, color:T.gray3, fontFamily:"monospace" }}>OR</span>
    <div style={{ flex:1, height:1, background:T.border }}/>
  </div>
);

// ─── Preview Panel (right side) ───────────────────────────────────────────────
const PreviewPanel = ({ mode }) => {
  const subs = [
    { name:"Netflix",    amount:"15.99", due:"Today",    color:T.red    },
    { name:"Spotify",    amount:"9.99",  due:"Mar 15",   color:T.green  },
    { name:"Claude Pro", amount:"20.00", due:"Mar 20",   color:T.accent },
    { name:"GitHub",     amount:"4.00",  due:"Apr 1",    color:T.purple },
    { name:"Figma",      amount:"15.00", due:"Apr 5",    color:T.blue   },
  ];
  const DOMAINS = {Netflix:"netflix.com",Spotify:"spotify.com","Claude Pro":"claude.ai",GitHub:"github.com",Figma:"figma.com"};
  const Logo = ({ name, size=26 }) => {
    const [err,setErr] = useState(false);
    const d = DOMAINS[name];
    if (err||!d) return (
      <div style={{ width:size, height:size, borderRadius:8, background:subs.find(s=>s.name===name)?.color+"22",
        border:`1px solid ${subs.find(s=>s.name===name)?.color}44`,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:size*0.4, fontWeight:700, color:subs.find(s=>s.name===name)?.color }}>
        {name[0]}
      </div>
    );
    return (
      <div style={{ width:size, height:size, borderRadius:8, background:T.elevated,
        border:`1px solid ${T.border}`, display:"flex", alignItems:"center",
        justifyContent:"center", overflow:"hidden", padding:3, flexShrink:0 }}>
        <img src={`https://www.google.com/s2/favicons?domain=${d}&sz=64`}
          alt={name} onError={()=>setErr(true)}
          style={{ width:"100%", height:"100%", objectFit:"contain" }}/>
      </div>
    );
  };
  return (
    <div style={{ flex:1, background:`linear-gradient(135deg, ${T.surface} 0%, #0D0D0D 100%)`,
      borderLeft:`1px solid ${T.border}`, display:"flex", flexDirection:"column",
      justifyContent:"center", padding:"48px 40px", position:"relative", overflow:"hidden" }}>
      {/* BG glow */}
      <div style={{ position:"absolute", bottom:-80, right:-80, width:300, height:300,
        background:`radial-gradient(circle, ${T.accent}14 0%, transparent 70%)`,
        pointerEvents:"none" }}/>
      <div style={{ position:"absolute", top:40, left:40, width:200, height:200,
        background:`radial-gradient(circle, ${T.blue}0A 0%, transparent 70%)`,
        pointerEvents:"none" }}/>

      {/* Header */}
      <div style={{ marginBottom:28 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
          <SparkIc s={14}/>
          <span style={{ fontSize:11, color:T.accent, fontFamily:"monospace", fontWeight:700, letterSpacing:1.5 }}>
            {mode === "signup" ? "WHAT YOU'LL SEE AFTER SIGNUP" : "WELCOME BACK"}
          </span>
        </div>
        <div style={{ fontSize:22, color:T.white, fontWeight:700, lineHeight:1.2 }}>
          {mode === "signup" ? "All your subscriptions, finally in one place" : "Your subscriptions are waiting"}
        </div>
      </div>

      {/* Arc gauge */}
      <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:16,
        padding:"20px", marginBottom:16,
        boxShadow:`0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)` }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
          <span style={{ fontSize:11, color:T.gray3, fontFamily:"monospace" }}>MONTHLY SPEND</span>
          <Chip color={T.green}>↓ $340 saved</Chip>
        </div>
        <div style={{ display:"flex", justifyContent:"center", marginBottom:10 }}>
          <svg width={160} height={90}>
            <path d="M 20 80 A 60 60 0 0 1 140 80" fill="none" stroke={T.gray4} strokeWidth={10} strokeLinecap="round"/>
            <path d="M 20 80 A 60 60 0 0 1 116 28" fill="none" stroke={T.accent} strokeWidth={10} strokeLinecap="round"/>
            <text x="80" y="66" textAnchor="middle" style={{ fill:T.white, fontSize:18, fontFamily:"monospace", fontWeight:700 }}>$64.98</text>
            <text x="80" y="78" textAnchor="middle" style={{ fill:T.gray3, fontSize:8, fontFamily:"monospace" }}>of $100 budget · 65%</text>
          </svg>
        </div>
        <div style={{ display:"flex", gap:8, justifyContent:"center" }}>
          {[{l:"Monthly",v:"$64.98",c:T.accent},{l:"Annual",v:"$779.76",c:T.blue},{l:"Active",v:"5 subs",c:T.green}].map((s,i)=>(
            <div key={i} style={{ textAlign:"center", flex:1 }}>
              <div style={{ fontSize:13, color:s.c, fontFamily:"monospace", fontWeight:700 }}>{s.v}</div>
              <div style={{ fontSize:9, color:T.gray3, fontFamily:"monospace" }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Sub list */}
      <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:16,
        overflow:"hidden", boxShadow:`0 8px 32px rgba(0,0,0,0.4)` }}>
        <div style={{ padding:"12px 16px", borderBottom:`1px solid ${T.border}`,
          display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:11, color:T.gray3, fontFamily:"monospace" }}>YOUR SUBSCRIPTIONS</span>
          <span style={{ fontSize:10, color:T.accent, fontFamily:"monospace", cursor:"pointer" }}>+ Add new</span>
        </div>
        {subs.map((s, i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 16px",
            borderBottom: i < subs.length - 1 ? `1px solid ${T.border}` : undefined }}>
            <Logo name={s.name} size={28}/>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:12, color:T.white, fontWeight:500 }}>{s.name}</div>
              <div style={{ fontSize:10, color:T.gray3, fontFamily:"monospace" }}>Due {s.due}</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:13, color:T.white, fontFamily:"monospace", fontWeight:700 }}>${s.amount}</div>
              <div style={{ fontSize:9, color:T.gray3, fontFamily:"monospace" }}>/mo</div>
            </div>
            {s.due === "Today" && (
              <div style={{ width:6, height:6, borderRadius:"50%", background:T.amber, flexShrink:0 }}/>
            )}
          </div>
        ))}
      </div>

      {/* Feature pills */}
      {mode === "signup" && (
        <div style={{ marginTop:20, display:"flex", flexWrap:"wrap", gap:8 }}>
          {["AI text parsing","Voice input","Renewal calendar","Budget alerts","CSV export","Local-first"].map((f,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", gap:5,
              background:T.elevated, border:`1px solid ${T.border}`,
              borderRadius:20, padding:"4px 10px" }}>
              <CheckIc s={11}/>
              <span style={{ fontSize:10, color:T.gray2 }}>{f}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── SIGN UP PAGE ─────────────────────────────────────────────────────────────
const SignUpPage = ({ onSwitch }) => {
  const [showPass, setShowPass] = useState(false);
  const [password] = useState("password123");
  const [agreed, setAgreed] = useState(true);
  return (
    <div style={{ display:"flex", minHeight:"100vh", background:T.bg }}>
      {/* Left form panel */}
      <div style={{ width:480, flexShrink:0, display:"flex", flexDirection:"column",
        padding:"40px 48px", overflowY:"auto", borderRight:`1px solid ${T.border}` }}>
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:40 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:T.accent,
            display:"flex", alignItems:"center", justifyContent:"center" }}>
            <WalletIc s={15}/>
          </div>
          <span style={{ fontSize:16, color:T.white, fontWeight:700, letterSpacing:-0.5 }}>SubTrackr</span>
        </div>

        {/* Heading */}
        <div style={{ marginBottom:28 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6,
            background:T.accentDim, border:`1px solid ${T.accent}44`,
            borderRadius:20, padding:"3px 10px", marginBottom:10 }}>
            <SparkIc s={10}/>
            <span style={{ fontSize:9, color:T.accent, fontFamily:"monospace", fontWeight:700, letterSpacing:1 }}>
              FREE FOREVER · NO CREDIT CARD
            </span>
          </div>
          <div style={{ fontSize:26, color:T.white, fontWeight:800, letterSpacing:-0.8, lineHeight:1.2, marginBottom:6 }}>
            Create your account
          </div>
          <div style={{ fontSize:13, color:T.gray2, lineHeight:1.6 }}>
            Join 2,400+ people who stopped leaking money on forgotten subscriptions.
          </div>
        </div>

        {/* Social login */}
        <div style={{ display:"flex", gap:8, marginBottom:4 }}>
          <SocialBtn Icon={GoogleIc} label="Google"/>
          <SocialBtn Icon={GithubIc} label="GitHub"/>
        </div>

        <OrDivider/>

        {/* Form fields */}
        <Field label="Full name" placeholder="Krishna Sathvik" icon={UserIc} required
          ann="autofocus on mount"/>
        <Field label="Email address" type="email" placeholder="you@example.com" icon={MailIc} required
          ann="validate on blur"/>
        <div style={{ position:"relative" }}>
          <Field label="Password" type={showPass ? "text" : "password"} placeholder="Min. 8 characters"
            icon={LockIc} required hint="Password tips"
            rightIcon={showPass ? <EyeOffIc/> : <EyeIc/>}
            onRightClick={() => setShowPass(!showPass)}/>
        </div>
        <StrengthBar password={password}/>

        {/* Terms checkbox */}
        <div style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:20 }}>
          <div onClick={() => setAgreed(!agreed)}
            style={{ width:16, height:16, borderRadius:4, flexShrink:0, marginTop:2,
              background: agreed ? T.accent : T.elevated,
              border:`1px solid ${agreed ? T.accent : T.border}`,
              display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
            {agreed && <CheckIc s={10} c="#fff"/>}
          </div>
          <span style={{ fontSize:12, color:T.gray2, lineHeight:1.6 }}>
            I agree to the{" "}
            <span style={{ color:T.accent, cursor:"pointer" }}>Terms of Service</span>
            {" "}and{" "}
            <span style={{ color:T.accent, cursor:"pointer" }}>Privacy Policy</span>
          </span>
        </div>

        {/* Submit */}
        <button style={{ width:"100%", height:48, background:T.accent, border:"none",
          borderRadius:12, fontSize:14, color:"#fff", fontWeight:700, cursor:"pointer",
          boxShadow:`0 0 24px ${T.accent}44`,
          display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
          Create free account <ArrowIc s={14}/>
        </button>

        {/* Data note */}
        <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:14,
          padding:"10px 14px", background:T.accentDim, borderRadius:8, border:`1px solid ${T.accent}33` }}>
          <CheckIc s={12}/>
          <span style={{ fontSize:11, color:T.accent }}>
            Your data stays on your device — we never store your subscription info.
          </span>
        </div>

        {/* Sign in link */}
        <div style={{ marginTop:24, textAlign:"center" }}>
          <span style={{ fontSize:13, color:T.gray3 }}>Already have an account? </span>
          <span onClick={onSwitch}
            style={{ fontSize:13, color:T.accent, cursor:"pointer", fontWeight:600 }}>
            Sign in
          </span>
        </div>

        {/* Annotation layer */}
        <div style={{ marginTop:28, padding:"14px", background:T.surface,
          border:`1px solid ${T.border}`, borderRadius:10 }}>
          <div style={{ fontSize:10, color:T.accent, fontFamily:"monospace", fontWeight:700,
            letterSpacing:1, marginBottom:10 }}>WIREFRAME SPECS · SIGNUP</div>
          {[
            ["Layout","480px form left / flex-1 preview right"],
            ["Social login","Google + GitHub OAuth / equal width"],
            ["Fields","name → email → password / autofocus on name"],
            ["Password","toggle show/hide / strength meter"],
            ["Strength","3-segment bar: red→amber→green"],
            ["Terms","checkbox required before submit"],
            ["CTA","accent + glow / full width 48px"],
            ["Data note","accentDim card reassures privacy"],
            ["Mobile","single col / preview hidden / form full-width"],
          ].map(([l,v],i)=>(
            <div key={i} style={{ display:"flex", gap:8, padding:"4px 0",
              borderBottom:`1px solid ${T.border}` }}>
              <span style={{ fontSize:9, color:T.gray3, fontFamily:"monospace", minWidth:90 }}>{l}</span>
              <span style={{ fontSize:9, color:T.white, fontFamily:"monospace" }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right preview panel */}
      <PreviewPanel mode="signup"/>
    </div>
  );
};

// ─── LOG IN PAGE ──────────────────────────────────────────────────────────────
const LoginPage = ({ onSwitch }) => {
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState(false);

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:T.bg }}>
      {/* Left form panel */}
      <div style={{ width:480, flexShrink:0, display:"flex", flexDirection:"column",
        padding:"40px 48px", overflowY:"auto", borderRight:`1px solid ${T.border}` }}>

        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:44 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:T.accent,
            display:"flex", alignItems:"center", justifyContent:"center" }}>
            <WalletIc s={15}/>
          </div>
          <span style={{ fontSize:16, color:T.white, fontWeight:700, letterSpacing:-0.5 }}>SubTrackr</span>
        </div>

        {/* Heading */}
        <div style={{ marginBottom:28 }}>
          <div style={{ fontSize:26, color:T.white, fontWeight:800, letterSpacing:-0.8, marginBottom:6 }}>
            Welcome back
          </div>
          <div style={{ fontSize:13, color:T.gray2 }}>
            Sign in to your account to continue.
          </div>
        </div>

        {/* Social login */}
        <div style={{ display:"flex", gap:8, marginBottom:4 }}>
          <SocialBtn Icon={GoogleIc} label="Google"/>
          <SocialBtn Icon={GithubIc} label="GitHub"/>
        </div>

        <OrDivider/>

        {/* Error state demo */}
        {error && (
          <div style={{ background:"#EF444420", border:`1px solid ${T.red}44`,
            borderRadius:10, padding:"10px 14px", marginBottom:16,
            display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:T.red, flexShrink:0 }}/>
            <span style={{ fontSize:12, color:T.red }}>Incorrect email or password. Try again.</span>
          </div>
        )}

        {/* Fields */}
        <Field label="Email address" type="email" placeholder="you@example.com" icon={MailIc} required
          ann="autofocus on mount"/>
        <Field label="Password" type={showPass ? "text" : "password"} placeholder="Your password"
          icon={LockIc} required hint="Forgot password?"
          rightIcon={showPass ? <EyeOffIc/> : <EyeIc/>}
          onRightClick={() => setShowPass(!showPass)}
          error={error ? " " : undefined}/>

        {/* Remember me */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div onClick={() => setRemember(!remember)}
              style={{ width:16, height:16, borderRadius:4, flexShrink:0,
                background: remember ? T.accent : T.elevated,
                border:`1px solid ${remember ? T.accent : T.border}`,
                display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
              {remember && <CheckIc s={10} c="#fff"/>}
            </div>
            <span style={{ fontSize:12, color:T.gray2 }}>Remember me for 30 days</span>
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={() => setError(!error)}
          style={{ width:"100%", height:48, background:T.accent, border:"none",
            borderRadius:12, fontSize:14, color:"#fff", fontWeight:700, cursor:"pointer",
            boxShadow:`0 0 24px ${T.accent}44`,
            display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
          Sign in <ArrowIc s={14}/>
        </button>

        {/* Toggle error demo note */}
        <div style={{ marginTop:10, textAlign:"center" }}>
          <span onClick={() => setError(!error)}
            style={{ fontSize:10, color:T.gray3, fontFamily:"monospace", cursor:"pointer" }}>
            [click Sign in to toggle error state demo]
          </span>
        </div>

        {/* Sign up link */}
        <div style={{ marginTop:24, textAlign:"center" }}>
          <span style={{ fontSize:13, color:T.gray3 }}>Don't have an account? </span>
          <span onClick={onSwitch}
            style={{ fontSize:13, color:T.accent, cursor:"pointer", fontWeight:600 }}>
            Create one free
          </span>
        </div>

        {/* SSO note */}
        <div style={{ marginTop:16, textAlign:"center" }}>
          <span style={{ fontSize:11, color:T.gray3 }}>Enterprise? </span>
          <span style={{ fontSize:11, color:T.accent, cursor:"pointer" }}>Sign in with SSO →</span>
        </div>

        {/* Annotation layer */}
        <div style={{ marginTop:28, padding:"14px", background:T.surface,
          border:`1px solid ${T.border}`, borderRadius:10 }}>
          <div style={{ fontSize:10, color:T.accent, fontFamily:"monospace", fontWeight:700,
            letterSpacing:1, marginBottom:10 }}>WIREFRAME SPECS · LOGIN</div>
          {[
            ["Layout","480px form / preview right (same as signup)"],
            ["Error state","red banner / red border on fields / click CTA to demo"],
            ["Fields","email → password (fewer fields than signup)"],
            ["Remember me","checkbox / 30-day session token"],
            ["Forgot password","inline link on password label"],
            ["CTA","same height/style as signup for consistency"],
            ["SSO","bottom link for enterprise users"],
            ["Transition","shared layout with signup / smooth page swap"],
          ].map(([l,v],i)=>(
            <div key={i} style={{ display:"flex", gap:8, padding:"4px 0",
              borderBottom:`1px solid ${T.border}` }}>
              <span style={{ fontSize:9, color:T.gray3, fontFamily:"monospace", minWidth:90 }}>{l}</span>
              <span style={{ fontSize:9, color:T.white, fontFamily:"monospace" }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right preview panel */}
      <PreviewPanel mode="login"/>
    </div>
  );
};

// ─── FORGOT PASSWORD PAGE ─────────────────────────────────────────────────────
const ForgotPage = ({ onBack }) => {
  const [sent, setSent] = useState(false);
  return (
    <div style={{ display:"flex", minHeight:"100vh", background:T.bg,
      alignItems:"center", justifyContent:"center" }}>
      <div style={{ width:420, padding:"48px", background:T.surface,
        border:`1px solid ${T.border}`, borderRadius:20,
        boxShadow:`0 32px 64px rgba(0,0,0,0.6)` }}>

        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:36 }}>
          <div style={{ width:26, height:26, borderRadius:7, background:T.accent,
            display:"flex", alignItems:"center", justifyContent:"center" }}>
            <WalletIc s={14}/>
          </div>
          <span style={{ fontSize:15, color:T.white, fontWeight:700 }}>SubTrackr</span>
        </div>

        {!sent ? <>
          <div style={{ width:48, height:48, borderRadius:14, background:T.accentDim,
            border:`1px solid ${T.accent}44`, display:"flex", alignItems:"center",
            justifyContent:"center", marginBottom:20 }}>
            <MailIc s={22} c={T.accent}/>
          </div>
          <div style={{ fontSize:22, color:T.white, fontWeight:700, marginBottom:8 }}>
            Reset your password
          </div>
          <div style={{ fontSize:13, color:T.gray2, lineHeight:1.6, marginBottom:24 }}>
            Enter the email address linked to your account and we'll send you a reset link.
          </div>
          <Field label="Email address" type="email" placeholder="you@example.com" icon={MailIc} required/>
          <button onClick={() => setSent(true)}
            style={{ width:"100%", height:46, background:T.accent, border:"none",
              borderRadius:10, fontSize:13, color:"#fff", fontWeight:700, cursor:"pointer",
              boxShadow:`0 0 20px ${T.accent}44`, marginTop:4 }}>
            Send reset link
          </button>
          <div style={{ marginTop:20, textAlign:"center" }}>
            <span onClick={onBack}
              style={{ fontSize:13, color:T.gray3, cursor:"pointer" }}>
              ← Back to sign in
            </span>
          </div>
        </> : <>
          <div style={{ width:48, height:48, borderRadius:14, background:T.green+"22",
            border:`1px solid ${T.green}44`, display:"flex", alignItems:"center",
            justifyContent:"center", marginBottom:20 }}>
            <CheckIc s={22} c={T.green}/>
          </div>
          <div style={{ fontSize:22, color:T.white, fontWeight:700, marginBottom:8 }}>
            Check your email
          </div>
          <div style={{ fontSize:13, color:T.gray2, lineHeight:1.6, marginBottom:24 }}>
            We sent a password reset link to{" "}
            <span style={{ color:T.white, fontWeight:600 }}>you@example.com</span>.
            It expires in 15 minutes.
          </div>
          <button onClick={() => setSent(false)}
            style={{ width:"100%", height:46, background:T.elevated, border:`1px solid ${T.border}`,
              borderRadius:10, fontSize:13, color:T.white, fontWeight:600, cursor:"pointer" }}>
            Resend link
          </button>
          <div style={{ marginTop:14, textAlign:"center" }}>
            <span onClick={onBack}
              style={{ fontSize:13, color:T.accent, cursor:"pointer", fontWeight:600 }}>
              ← Back to sign in
            </span>
          </div>
        </>}

        {/* Annotations */}
        <div style={{ marginTop:28, padding:"12px", background:T.elevated,
          border:`1px solid ${T.border}`, borderRadius:8 }}>
          <div style={{ fontSize:10, color:T.accent, fontFamily:"monospace", fontWeight:700,
            letterSpacing:1, marginBottom:8 }}>WIREFRAME SPECS · FORGOT PASSWORD</div>
          {[
            ["Layout","Centered card / no preview panel / 420px max"],
            ["State 1","Email input + send button"],
            ["State 2","Success + 'check your email' + resend"],
            ["Expiry","Link expires in 15 min (shown in confirmation)"],
            ["Toggle","Click 'Send reset link' to see state 2"],
          ].map(([l,v],i)=>(
            <div key={i} style={{ display:"flex", gap:8, padding:"3px 0",
              borderBottom:`1px solid ${T.border}` }}>
              <span style={{ fontSize:9, color:T.gray3, fontFamily:"monospace", minWidth:70 }}>{l}</span>
              <span style={{ fontSize:9, color:T.white, fontFamily:"monospace" }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("signup");

  return (
    <div style={{ fontFamily:"system-ui,-apple-system,sans-serif" }}>
      {/* Page switcher */}
      <div style={{ position:"fixed", top:12, right:12, zIndex:1000,
        display:"flex", gap:5, background:T.surface, border:`1px solid ${T.border}`,
        borderRadius:10, padding:"5px" }}>
        {[
          { id:"signup",  label:"Sign Up"  },
          { id:"login",   label:"Log In"   },
          { id:"forgot",  label:"Forgot PW"},
        ].map(p => (
          <button key={p.id} onClick={() => setPage(p.id)}
            style={{ padding:"5px 12px", borderRadius:7, border:"none",
              background: page === p.id ? T.accent : "none",
              color: page === p.id ? "#fff" : T.gray2,
              fontSize:11, fontFamily:"monospace", fontWeight:700, cursor:"pointer" }}>
            {p.label}
          </button>
        ))}
      </div>

      {page === "signup" && <SignUpPage onSwitch={() => setPage("login")}/>}
      {page === "login"  && <LoginPage  onSwitch={() => setPage("signup")}/>}
      {page === "forgot" && <ForgotPage onBack={() => setPage("login")}/>}
    </div>
  );
}
