import { useState } from "react";

const T = {
  bg:"#000000",surface:"#141414",elevated:"#1C1C1C",
  border:"#27272A",accent:"#0D9488",accentDim:"#042F2E",accentLt:"#99F6E4",
  white:"#FFFFFF",gray1:"#F4F4F5",gray2:"#A1A1AA",gray3:"#52525B",gray4:"#27272A",
  red:"#EF4444",amber:"#FBBF24",green:"#34D399",blue:"#60A5FA",purple:"#A78BFA",
};

// SVG icons
const I = ({ children, size=16, color="currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);
const Check  = ({s=14,c=T.green})   => <I size={s} color={c}><polyline points="20 6 9 17 4 12"/></I>;
const Spark  = ({s=14,c=T.accent})  => <I size={s} color={c}><path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z"/></I>;
const Wallet = ({s=14,c="#fff"})    => <I size={s} color={c}><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M16 12h.01"/><path d="M2 10h20"/></I>;
const Arrow  = ({s=14,c="#fff"})    => <I size={s} color={c}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></I>;
const Star   = ({s=12,c=T.amber,f=T.amber}) => <I size={s} color={c}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill={f}/></I>;
const Cal    = ({s=16,c=T.blue})    => <I size={s} color={c}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></I>;
const Zap    = ({s=16,c=T.amber})   => <I size={s} color={c}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></I>;
const Shield = ({s=16,c=T.green})   => <I size={s} color={c}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></I>;
const Mic    = ({s=16,c=T.purple})  => <I size={s} color={c}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></I>;
const Menu   = ({s=20,c=T.gray2})   => <I size={s} color={c}><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></I>;

// Helpers
const Chip = ({children,color=T.accent,size=9}) => (
  <span style={{display:"inline-flex",alignItems:"center",padding:"2px 8px",
    background:color+"22",color,fontSize:size,borderRadius:4,
    fontFamily:"monospace",fontWeight:700,border:`1px solid ${color}44`,whiteSpace:"nowrap"}}>
    {children}
  </span>
);
const Tag = ({children,color=T.accent}) => (
  <div style={{display:"inline-flex",alignItems:"center",gap:5,
    background:color+"22",border:`1px solid ${color}44`,
    borderRadius:20,padding:"4px 12px",marginBottom:12}}>
    <span style={{fontSize:9,color,fontFamily:"monospace",fontWeight:700,letterSpacing:1}}>{children}</span>
  </div>
);
const Ann = ({text,pos="right",color=T.accent}) => {
  const p = {
    right:{left:"calc(100% + 9px)",top:"50%",transform:"translateY(-50%)"},
    left:{right:"calc(100% + 9px)",top:"50%",transform:"translateY(-50%)"},
    top:{bottom:"calc(100% + 6px)",left:0},
    bottom:{top:"calc(100% + 6px)",left:0},
  };
  return (
    <div style={{position:"absolute",...p[pos],zIndex:99,whiteSpace:"nowrap",pointerEvents:"none",
      fontSize:9,color,fontFamily:"monospace",fontWeight:700,background:T.bg,
      padding:"2px 6px",borderRadius:3,border:`1px solid ${color}44`}}>{text}</div>
  );
};
const Box = ({children,ann,ap="right",ac,style={}}) => (
  <div style={{position:"relative",...style}}>
    {children}
    {ann && <Ann text={ann} pos={ap} color={ac||T.accent}/>}
  </div>
);

// Favicon logo
const DOMAINS = {
  Netflix:"netflix.com",Spotify:"spotify.com",GitHub:"github.com",
  Figma:"figma.com","Claude Pro":"claude.ai","Apple One":"apple.com",
};
const Logo = ({name,size=26,r=7}) => {
  const [err,setErr] = useState(false);
  const d = DOMAINS[name];
  const colors = [T.red,T.green,T.blue,T.accent,T.purple,T.amber];
  const col = colors[Object.keys(DOMAINS).indexOf(name)%6]||T.accent;
  if (err||!d) return (
    <div style={{width:size,height:size,borderRadius:r,background:col+"22",
      border:`1px solid ${col}44`,display:"flex",alignItems:"center",
      justifyContent:"center",fontSize:size*0.4,fontWeight:700,color:col,flexShrink:0}}>
      {name[0]}
    </div>
  );
  return (
    <div style={{width:size,height:size,borderRadius:r,background:T.elevated,
      border:`1px solid ${T.border}`,display:"flex",alignItems:"center",
      justifyContent:"center",overflow:"hidden",flexShrink:0,padding:3}}>
      <img src={`https://www.google.com/s2/favicons?domain=${d}&sz=64`}
        alt={name} onError={()=>setErr(true)}
        style={{width:"100%",height:"100%",objectFit:"contain"}}/>
    </div>
  );
};

// Phone mock
const Phone = () => (
  <div style={{width:190,background:T.bg,borderRadius:26,border:`2px solid ${T.border}`,
    overflow:"hidden",flexShrink:0,
    boxShadow:`0 0 0 5px ${T.surface},0 28px 56px rgba(0,0,0,0.8),0 0 40px ${T.accent}1A`}}>
    <div style={{height:24,background:T.surface,display:"flex",alignItems:"center",
      justifyContent:"space-between",padding:"0 12px"}}>
      <span style={{fontSize:8,color:T.gray2,fontFamily:"monospace"}}>9:41</span>
      <span style={{fontSize:8,color:T.gray2,fontFamily:"monospace"}}>12 subs</span>
    </div>
    <div style={{padding:"7px 11px 0",fontSize:13,color:T.white,fontWeight:700}}>SubTrackr</div>
    <div style={{display:"flex",justifyContent:"center",padding:"2px 0 0"}}>
      <svg width={136} height={78}>
        <path d="M 16 68 A 52 52 0 0 1 120 68" fill="none" stroke={T.gray4} strokeWidth={8} strokeLinecap="round"/>
        <path d="M 16 68 A 52 52 0 0 1 100 24" fill="none" stroke={T.accent} strokeWidth={8} strokeLinecap="round"/>
        <text x="68" y="58" textAnchor="middle" style={{fill:T.white,fontSize:12,fontFamily:"monospace",fontWeight:700}}>$127</text>
        <text x="68" y="68" textAnchor="middle" style={{fill:T.gray3,fontSize:7,fontFamily:"monospace"}}>of $200</text>
      </svg>
    </div>
    {[{n:"Netflix",a:"15.99"},{n:"Spotify",a:"9.99"},{n:"Claude Pro",a:"20.00"},{n:"Figma",a:"15.00"}].map((s,i)=>(
      <div key={i} style={{display:"flex",alignItems:"center",gap:7,padding:"5px 11px",
        borderTop:`1px solid ${T.border}`}}>
        <Logo name={s.n} size={20} r={5}/>
        <span style={{flex:1,fontSize:9,color:T.white,fontWeight:500}}>{s.n}</span>
        <span style={{fontSize:9,color:T.white,fontFamily:"monospace",fontWeight:700}}>${s.a}</span>
      </div>
    ))}
    <div style={{height:36,background:T.surface,borderTop:`1px solid ${T.border}`,
      display:"flex",alignItems:"center",justifyContent:"space-around",marginTop:2}}>
      {[T.accent,T.gray3,T.gray3,T.gray3].map((c,i)=>(
        <div key={i} style={{width:16,height:16,borderRadius:"50%",
          background:i===0?T.accentDim:undefined,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{width:4,height:4,borderRadius:i===0?"50%":"2px",background:c}}/>
        </div>
      ))}
    </div>
  </div>
);

// Section wrapper
const Sec = ({id,note,children}) => (
  <div style={{marginBottom:28}}>
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
      <div style={{fontSize:10,color:T.white,fontFamily:"monospace",fontWeight:700,
        background:T.surface,border:`1px solid ${T.border}`,borderRadius:5,padding:"2px 9px"}}>{id}</div>
      <span style={{fontSize:10,color:T.gray3,fontFamily:"monospace"}}>{note}</span>
    </div>
    <div style={{border:`1px solid ${T.border}`,borderRadius:10,background:T.bg,overflow:"hidden",
      boxShadow:`0 8px 32px rgba(0,0,0,0.6)`}}>
      <div style={{height:28,background:T.surface,borderBottom:`1px solid ${T.border}`,
        display:"flex",alignItems:"center",padding:"0 12px",gap:5}}>
        {["#FF5F57","#FEBC2E","#28C840"].map((c,i)=><div key={i} style={{width:8,height:8,borderRadius:"50%",background:c}}/>)}
        <div style={{flex:1,height:16,borderRadius:3,background:T.elevated,margin:"0 32px",
          display:"flex",alignItems:"center",justifyContent:"center"}}>
          <span style={{fontSize:8,color:T.gray3,fontFamily:"monospace"}}>subtrackr.app</span>
        </div>
      </div>
      {children}
    </div>
  </div>
);

// Spec bar
const Specs = ({items}) => (
  <div style={{padding:"8px 24px",background:T.surface,borderTop:`1px solid ${T.border}`,
    display:"flex",gap:16,flexWrap:"wrap"}}>
    {items.map(([l,v],i) => (
      <div key={i} style={{display:"flex",gap:5}}>
        <span style={{fontSize:9,color:T.gray3,fontFamily:"monospace"}}>{l}:</span>
        <span style={{fontSize:9,color:T.accent,fontFamily:"monospace",fontWeight:700}}>{v}</span>
      </div>
    ))}
  </div>
);

// Pricing card
const PCard = ({plan,price,per,features,cta,hot}) => (
  <div style={{flex:1,minWidth:180,background:hot?T.accentDim:T.surface,
    border:`1px solid ${hot?T.accent:T.border}`,borderRadius:14,padding:"20px 16px",
    position:"relative"}}>
    {hot && <div style={{position:"absolute",top:-9,left:"50%",transform:"translateX(-50%)",
      background:T.accent,color:"#fff",fontSize:8,fontFamily:"monospace",fontWeight:700,
      padding:"2px 10px",borderRadius:20,letterSpacing:1}}>MOST POPULAR</div>}
    <div style={{fontSize:9,color:hot?T.accentLt:T.gray2,fontFamily:"monospace",
      fontWeight:700,letterSpacing:2,marginBottom:6}}>{plan}</div>
    <div style={{display:"flex",alignItems:"baseline",gap:3,marginBottom:3}}>
      <span style={{fontSize:26,color:T.white,fontFamily:"monospace",fontWeight:700}}>{price}</span>
      <span style={{fontSize:10,color:T.gray3,fontFamily:"monospace"}}>{per}</span>
    </div>
    <div style={{height:1,background:T.border,margin:"10px 0"}}/>
    {features.map((f,i)=>(
      <div key={i} style={{display:"flex",gap:6,marginBottom:6,alignItems:"flex-start"}}>
        <div style={{marginTop:1,flexShrink:0}}><Check s={11} c={hot?T.accent:T.green}/></div>
        <span style={{fontSize:10,color:T.gray2}}>{f}</span>
      </div>
    ))}
    <button style={{width:"100%",marginTop:12,background:hot?T.accent:T.elevated,
      border:`1px solid ${hot?T.accent:T.border}`,borderRadius:7,padding:"8px",
      fontSize:10,color:hot?"#fff":T.white,fontWeight:700,cursor:"pointer",
      fontFamily:"monospace"}}>{cta}</button>
  </div>
);

// FAQ
const FAQ = ({q,a,open=false}) => {
  const [o,setO] = useState(open);
  return (
    <div style={{borderBottom:`1px solid ${T.border}`,padding:"10px 0"}}>
      <div onClick={()=>setO(!o)} style={{display:"flex",justifyContent:"space-between",
        alignItems:"center",cursor:"pointer",gap:8}}>
        <span style={{fontSize:12,color:T.white,fontWeight:500}}>{q}</span>
        <span style={{fontSize:16,color:T.gray3,transform:o?"rotate(45deg)":"none",
          transition:"transform 0.2s",flexShrink:0}}>+</span>
      </div>
      {o && <div style={{fontSize:11,color:T.gray2,lineHeight:1.7,marginTop:8,paddingRight:24}}>{a}</div>}
    </div>
  );
};

export default function App() {
  const [tab,setTab] = useState("desktop");

  return (
    <div style={{background:"#0A0A0A",minHeight:"100vh",padding:"16px 20px",
      fontFamily:"system-ui,-apple-system,sans-serif"}}>

      {/* Header */}
      <div style={{maxWidth:1040,margin:"0 auto 20px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
          flexWrap:"wrap",gap:10,marginBottom:10}}>
          <div>
            <div style={{fontSize:18,color:T.white,fontWeight:800,letterSpacing:-0.5}}>
              SubTrackr — Landing Page Wireframe
            </div>
            <div style={{fontSize:10,color:T.gray3,fontFamily:"monospace",marginTop:2}}>
              9 sections · annotated · Desktop + Mobile views
            </div>
          </div>
          <div style={{display:"flex",gap:5}}>
            {["desktop","mobile","specs"].map(t=>(
              <button key={t} onClick={()=>setTab(t)}
                style={{padding:"5px 11px",borderRadius:6,border:`1px solid ${T.border}`,
                  background:tab===t?T.accent:T.surface,
                  color:tab===t?"#fff":T.gray2,fontSize:10,
                  fontFamily:"monospace",fontWeight:700,cursor:"pointer"}}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── DESKTOP TAB ── */}
      {tab==="desktop" && (
        <div style={{maxWidth:1040,margin:"0 auto"}}>

          {/* NAVBAR */}
          <Sec id="S01 · Navbar" note="Sticky 64px · backdrop blur(12px)">
            <Box ann="sticky top:0 / z:100 / blur backdrop" ap="bottom"
              style={{display:"flex",alignItems:"center",justifyContent:"space-between",
                padding:"0 32px",height:60,borderBottom:`1px solid ${T.border}`}}>
              <Box ann="Logo: 26px icon + 15px bold" ap="bottom">
                <div style={{display:"flex",alignItems:"center",gap:7}}>
                  <div style={{width:24,height:24,borderRadius:6,background:T.accent,
                    display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <Wallet s={13}/>
                  </div>
                  <span style={{fontSize:14,color:T.white,fontWeight:700,letterSpacing:-0.5}}>SubTrackr</span>
                </div>
              </Box>
              <Box style={{display:"flex",gap:22}} ann="Nav links: 13px gray2 / hide mobile" ap="bottom">
                {["Features","Pricing","How it works","FAQ"].map(l=>(
                  <span key={l} style={{fontSize:12,color:T.gray2,cursor:"pointer"}}>{l}</span>
                ))}
              </Box>
              <Box style={{display:"flex",gap:8}} ann="Ghost + teal CTA" ap="bottom">
                <button style={{background:"none",border:`1px solid ${T.border}`,
                  borderRadius:6,padding:"6px 13px",fontSize:11,color:T.gray2,cursor:"pointer"}}>
                  Sign in
                </button>
                <button style={{background:T.accent,border:"none",borderRadius:6,
                  padding:"6px 13px",fontSize:11,color:"#fff",fontWeight:700,cursor:"pointer",
                  boxShadow:`0 0 12px ${T.accent}44`}}>
                  Get started free
                </button>
              </Box>
            </Box>
            <Specs items={[["height","60px"],["position","sticky top:0"],["backdrop","blur(12px) rgba(0,0,0,0.85)"],["mobile","hamburger only"]]}/>
          </Sec>

          {/* HERO */}
          <Sec id="S02 · Hero" note="100vh min · phone mockup · glow bg">
            <div style={{position:"relative",minHeight:440,display:"flex",
              alignItems:"center",justifyContent:"center",padding:"48px 32px",overflow:"hidden"}}>
              <div style={{position:"absolute",top:"50%",left:"50%",
                transform:"translate(-50%,-50%)",width:400,height:240,
                background:`radial-gradient(ellipse,${T.accent}16 0%,transparent 70%)`,pointerEvents:"none"}}/>
              <div style={{position:"absolute",inset:0,opacity:0.035,
                backgroundImage:`linear-gradient(${T.accent} 1px,transparent 1px),linear-gradient(90deg,${T.accent} 1px,transparent 1px)`,
                backgroundSize:"38px 38px",pointerEvents:"none"}}/>
              <div style={{display:"flex",alignItems:"center",gap:48,
                maxWidth:820,width:"100%",zIndex:1,flexWrap:"wrap",justifyContent:"center"}}>
                <Box style={{flex:1,minWidth:240}} ann="Copy block: max-w 440px" ap="left">
                  <Tag><Spark s={9}/> &nbsp;AI-POWERED SUBSCRIPTION TRACKER</Tag>
                  <Box ann="H1: 36px / 800 / -1.2 tracking" ap="left">
                    <div style={{fontSize:34,color:T.white,fontWeight:800,
                      lineHeight:1.1,letterSpacing:-1.2,marginBottom:12}}>
                      Stop leaking money on{" "}
                      <span style={{color:T.accent}}>forgotten subs</span>
                    </div>
                  </Box>
                  <div style={{fontSize:13,color:T.gray2,lineHeight:1.7,marginBottom:22,maxWidth:340}}>
                    Just type what you pay for. SubTrackr's AI parses your subscriptions
                    instantly — no forms, no spreadsheets.
                  </div>
                  <Box style={{display:"flex",gap:9,flexWrap:"wrap",marginBottom:18}} ann="Primary + ghost CTA" ap="left">
                    <button style={{background:T.accent,border:"none",borderRadius:9,
                      padding:"10px 20px",fontSize:13,color:"#fff",fontWeight:700,
                      cursor:"pointer",boxShadow:`0 0 20px ${T.accent}55`,
                      display:"flex",alignItems:"center",gap:6}}>
                      Start for free <Arrow s={13}/>
                    </button>
                    <button style={{background:"none",border:`1px solid ${T.border}`,
                      borderRadius:9,padding:"10px 16px",fontSize:12,color:T.gray2,cursor:"pointer"}}>
                      How it works →
                    </button>
                  </Box>
                  <Box ann="Avatar stack + 2400+ count" ap="left">
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{display:"flex"}}>
                        {["A","M","K","S","R"].map((l,i)=>(
                          <div key={i} style={{width:20,height:20,borderRadius:"50%",
                            background:[T.accent,T.blue,T.purple,T.amber,T.green][i]+"88",
                            border:`2px solid #0A0A0A`,marginLeft:i>0?-6:0,
                            display:"flex",alignItems:"center",justifyContent:"center",
                            fontSize:7,color:T.white,fontWeight:700}}>{l}</div>
                        ))}
                      </div>
                      <span style={{fontSize:10,color:T.gray2,fontFamily:"monospace"}}>
                        <span style={{color:T.white,fontWeight:700}}>2,400+</span> people saving money
                      </span>
                    </div>
                  </Box>
                </Box>
                <Box ann="Phone: teal glow ring" ap="right">
                  <Phone/>
                </Box>
              </div>
            </div>
            <Specs items={[["min-h","100vh/440px"],["H1","34px/800/-1.2"],["bg","radial teal glow + dot grid"],["phone","190px / glow shadow"],["CTA","box-shadow 0 0 20px accent"]]}/>
          </Sec>

          {/* SOCIAL PROOF */}
          <Sec id="S03 · Social Proof" note="Logo strip + 4 stat cards">
            <div style={{padding:"18px 32px",borderBottom:`1px solid ${T.border}`}}>
              <div style={{textAlign:"center",fontSize:9,color:T.gray3,
                fontFamily:"monospace",letterSpacing:2,marginBottom:12}}>
                TRACKS SUBSCRIPTIONS FROM ALL YOUR FAVOURITE SERVICES
              </div>
              <Box style={{display:"flex",gap:7,justifyContent:"center",flexWrap:"wrap"}}
                ann="Favicons: Google API / overflow-x scroll mobile" ap="bottom">
                {["Netflix","Spotify","GitHub","Figma","Claude Pro","Apple One"].map(n=>(
                  <div key={n} style={{display:"flex",flexDirection:"column",alignItems:"center",
                    gap:3,padding:"6px 9px",background:T.surface,borderRadius:7,
                    border:`1px solid ${T.border}`}}>
                    <Logo name={n} size={24} r={5}/>
                    <span style={{fontSize:8,color:T.gray3,fontFamily:"monospace"}}>{n}</span>
                  </div>
                ))}
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,
                  padding:"6px 9px",background:T.surface,borderRadius:7,border:`1px solid ${T.border}`}}>
                  <div style={{width:24,height:24,borderRadius:5,background:T.elevated,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:10,color:T.gray3}}>+∞</div>
                  <span style={{fontSize:8,color:T.gray3,fontFamily:"monospace"}}>any</span>
                </div>
              </Box>
            </div>
            <Box style={{display:"flex"}} ann="4 stat cards" ap="right">
              {[{v:"$2,847",l:"Avg. found/user",s:"in forgotten subs",c:T.green},
                {v:"90s",l:"To add all subs",s:"via AI text input",c:T.accent},
                {v:"12",l:"Avg. subscriptions",s:"per tracked user",c:T.blue},
                {v:"4.9★",l:"App Store rating",s:"2,400+ reviews",c:T.amber}].map((x,i)=>(
                <div key={i} style={{flex:1,textAlign:"center",padding:"18px 8px",
                  borderRight:i<3?`1px solid ${T.border}`:undefined}}>
                  <div style={{fontSize:24,color:x.c,fontFamily:"monospace",fontWeight:700,marginBottom:2}}>{x.v}</div>
                  <div style={{fontSize:11,color:T.white,fontWeight:600,marginBottom:1}}>{x.l}</div>
                  <div style={{fontSize:9,color:T.gray3,fontFamily:"monospace"}}>{x.s}</div>
                </div>
              ))}
            </Box>
          </Sec>

          {/* FEATURES */}
          <Sec id="S04 · Features" note="3-col CSS grid · hero card spans 2 cols">
            <div style={{padding:"36px 32px"}}>
              <div style={{textAlign:"center",marginBottom:28}}>
                <div style={{fontSize:9,color:T.accent,fontFamily:"monospace",fontWeight:700,
                  letterSpacing:3,textTransform:"uppercase",marginBottom:6}}>WHY SUBTRACKR</div>
                <div style={{fontSize:22,color:T.white,fontWeight:700,letterSpacing:-0.5,marginBottom:6}}>
                  The smartest way to track what you pay
                </div>
                <div style={{fontSize:13,color:T.gray2}}>Built for people who hate spreadsheets.</div>
              </div>
              <Box style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}
                ann="grid: 3-col / hero spans 2" ap="right">
                {/* Hero card */}
                <Box style={{gridColumn:"span 2",background:T.surface,border:`1px solid ${T.border}`,
                  borderRadius:14,padding:"22px",display:"flex",gap:20,alignItems:"center"}}
                  ann="col-span 2 / AI input demo" ap="top">
                  <div style={{flex:1}}>
                    <Tag><Spark s={10}/> &nbsp;KILLER FEATURE</Tag>
                    <div style={{fontSize:16,color:T.white,fontWeight:700,marginBottom:6}}>Just type. AI does the rest.</div>
                    <div style={{fontSize:12,color:T.gray2,lineHeight:1.7,marginBottom:12}}>
                      Dump all your subscriptions in plain English.
                      Claude-powered parsing extracts everything automatically.
                    </div>
                    <Chip color={T.accent}>Powered by Claude claude-sonnet-4-6</Chip>
                  </div>
                  {/* Mini AI demo */}
                  <div style={{background:T.elevated,borderRadius:10,border:`1px solid ${T.border}`,
                    padding:"12px",width:220,flexShrink:0}}>
                    <div style={{fontSize:9,color:T.gray3,fontFamily:"monospace",marginBottom:7}}>TYPE NATURALLY</div>
                    <div style={{fontSize:11,color:T.gray3,lineHeight:1.6,marginBottom:10}}>
                      Netflix 15.99 monthly,{" "}
                      <span style={{color:T.white}}>Claude Pro 20/mo productivity</span>
                      <span style={{display:"inline-block",width:1.5,height:11,
                        background:T.accent,marginLeft:2,verticalAlign:"middle"}}/>
                    </div>
                    <div style={{background:T.accentDim,border:`1px solid ${T.accent}44`,
                      borderRadius:7,padding:"8px 10px"}}>
                      <div style={{fontSize:8,color:T.accent,fontFamily:"monospace",
                        fontWeight:700,marginBottom:6}}>✦ AI PARSED 3 SUBS</div>
                      {[{n:"Netflix",a:"$15.99"},{n:"Claude Pro",a:"$20.00"}].map((s,i)=>(
                        <div key={i} style={{display:"flex",alignItems:"center",gap:5,marginBottom:4}}>
                          <Logo name={s.n} size={15} r={4}/>
                          <span style={{flex:1,fontSize:9,color:T.white}}>{s.n}</span>
                          <span style={{fontSize:9,color:T.accent,fontFamily:"monospace"}}>{s.a}</span>
                        </div>
                      ))}
                      <button style={{width:"100%",marginTop:6,background:T.accent,border:"none",
                        borderRadius:5,padding:"5px",fontSize:9,color:"#fff",fontWeight:700,cursor:"pointer"}}>
                        SAVE ALL
                      </button>
                    </div>
                  </div>
                </Box>
                {/* Small cards */}
                {[{Icon:Cal,c:T.blue,t:"Renewal Calendar",d:"Visual calendar with color-coded bill types. No more renewal surprises."},
                  {Icon:Zap,c:T.amber,t:"Instant Budget View",d:"Monthly/annual totals always visible. Set category limits."},
                  {Icon:Mic,c:T.purple,t:"Voice Input",d:"Tap mic and speak. Same AI parsing works hands-free."},
                  {Icon:Shield,c:T.green,t:"100% Local-First",d:"All data on your device. No account needed."}].map((f,i)=>(
                  <div key={i} style={{background:T.surface,border:`1px solid ${T.border}`,
                    borderRadius:12,padding:"16px"}}>
                    <div style={{width:33,height:33,borderRadius:8,background:f.c+"22",
                      border:`1px solid ${f.c}44`,display:"flex",alignItems:"center",
                      justifyContent:"center",marginBottom:9}}>
                      <f.Icon s={16} c={f.c}/>
                    </div>
                    <div style={{fontSize:12,color:T.white,fontWeight:600,marginBottom:4}}>{f.t}</div>
                    <div style={{fontSize:11,color:T.gray2,lineHeight:1.5}}>{f.d}</div>
                  </div>
                ))}
              </Box>
            </div>
          </Sec>

          {/* PRICING */}
          <Sec id="S05 · Pricing" note="Free · Pro (highlighted) · Lifetime">
            <div style={{padding:"36px 32px"}}>
              <div style={{textAlign:"center",marginBottom:28}}>
                <div style={{fontSize:9,color:T.accent,fontFamily:"monospace",fontWeight:700,
                  letterSpacing:3,marginBottom:6}}>PRICING</div>
                <div style={{fontSize:22,color:T.white,fontWeight:700,letterSpacing:-0.5,marginBottom:5}}>
                  Start free. Upgrade when ready.
                </div>
                <div style={{fontSize:13,color:T.gray2}}>No credit card required.</div>
              </div>
              <Box style={{display:"flex",gap:12,flexWrap:"wrap"}} ann="3 tiers / center highlighted" ap="top">
                <PCard plan="FREE" price="$0" per="/forever"
                  features={["Up to 10 subscriptions","AI parsing (5/day)","Monthly budget view","Local storage + PWA"]}
                  cta="Get started free"/>
                <PCard plan="PRO" price="$4" per="/month" hot
                  features={["Unlimited subscriptions","Unlimited AI parsing","Voice input","Calendar + grouped views","Export CSV / PDF"]}
                  cta="Start Pro free 14 days"/>
                <PCard plan="LIFETIME" price="$49" per="/once"
                  features={["Everything in Pro","Pay once forever","All future features","Priority support"]}
                  cta="Buy lifetime access"/>
              </Box>
              <div style={{maxWidth:460,margin:"24px auto 0"}}>
                <FAQ q="Is my data private?" open
                  a="All data stored locally via Dexie.js (IndexedDB). Nothing sent to servers except AI parsing calls, which don't include your financial data."/>
                <FAQ q="What AI model powers parsing?"
                  a="Anthropic's Claude claude-sonnet-4-6. Understands natural language for structured subscription extraction."/>
                <FAQ q="Can I cancel Pro anytime?"
                  a="Yes — cancel from settings anytime. You keep Pro until end of billing period."/>
              </div>
            </div>
          </Sec>

          {/* TESTIMONIALS */}
          <Sec id="S06 · Testimonials" note="3 cards with savings callout">
            <div style={{padding:"32px 32px"}}>
              <div style={{textAlign:"center",marginBottom:24}}>
                <div style={{fontSize:9,color:T.accent,fontFamily:"monospace",fontWeight:700,
                  letterSpacing:3,marginBottom:6}}>REAL USERS, REAL SAVINGS</div>
                <div style={{fontSize:20,color:T.white,fontWeight:700,letterSpacing:-0.5}}>
                  People are finding money they forgot about
                </div>
              </div>
              <Box style={{display:"flex",gap:12,flexWrap:"wrap"}} ann="3 cards / each has savings badge" ap="top">
                {[{q:"Found 4 subs I totally forgot. SubTrackr paid for itself in 10 minutes.",n:"Arjun M.",r:"Software Engineer",s:"$340"},
                  {q:"The AI input is magic. I typed a paragraph, all 11 subs parsed correctly.",n:"Sarah K.",r:"Designer",s:"$156"},
                  {q:"Finally a tracker that doesn't make me fill boring forms. Just type and go.",n:"Dev P.",r:"Indie Hacker",s:"$89"}].map((t,i)=>(
                  <div key={i} style={{flex:1,minWidth:180,background:T.surface,
                    border:`1px solid ${T.border}`,borderRadius:12,padding:"14px"}}>
                    <div style={{display:"flex",gap:2,marginBottom:8}}>
                      {[0,1,2,3,4].map(j=><Star key={j}/>)}
                    </div>
                    <div style={{fontSize:12,color:T.gray1,lineHeight:1.7,marginBottom:10,fontStyle:"italic"}}>"{t.q}"</div>
                    <div style={{display:"flex",alignItems:"center",gap:7}}>
                      <div style={{width:24,height:24,borderRadius:"50%",background:T.accent+"33",
                        display:"flex",alignItems:"center",justifyContent:"center",
                        fontSize:9,color:T.accent,fontWeight:700}}>{t.n[0]}</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:11,color:T.white,fontWeight:600}}>{t.n}</div>
                        <div style={{fontSize:9,color:T.gray3,fontFamily:"monospace"}}>{t.r}</div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:13,color:T.green,fontFamily:"monospace",fontWeight:700}}>{t.s}</div>
                        <div style={{fontSize:8,color:T.gray3,fontFamily:"monospace"}}>saved/yr</div>
                      </div>
                    </div>
                  </div>
                ))}
              </Box>
            </div>
          </Sec>

          {/* FINAL CTA */}
          <Sec id="S07 · Final CTA" note="Full-width section before footer">
            <Box style={{padding:"52px 32px",textAlign:"center",position:"relative",overflow:"hidden"}}
              ann="Radial teal glow / full width" ap="top">
              <div style={{position:"absolute",top:"50%",left:"50%",
                transform:"translate(-50%,-50%)",width:480,height:180,
                background:`radial-gradient(ellipse,${T.accent}1E 0%,transparent 70%)`,
                pointerEvents:"none"}}/>
              <div style={{position:"relative",zIndex:1}}>
                <div style={{fontSize:28,color:T.white,fontWeight:800,
                  letterSpacing:-0.8,marginBottom:8,lineHeight:1.1}}>
                  Find out what you're really paying for
                </div>
                <div style={{fontSize:13,color:T.gray2,maxWidth:360,margin:"0 auto 22px"}}>
                  Free forever. Add all your subscriptions in under 2 minutes.
                </div>
                <div style={{display:"flex",gap:9,justifyContent:"center",flexWrap:"wrap"}}>
                  <button style={{background:T.accent,border:"none",borderRadius:10,
                    padding:"12px 26px",fontSize:14,color:"#fff",fontWeight:700,
                    cursor:"pointer",boxShadow:`0 0 24px ${T.accent}55`,
                    display:"flex",alignItems:"center",gap:6}}>
                    Install the PWA — it's free <Arrow s={14}/>
                  </button>
                  <button style={{background:"none",border:`1px solid ${T.border}`,
                    borderRadius:10,padding:"12px 20px",fontSize:12,color:T.gray2,cursor:"pointer"}}>
                    View on GitHub →
                  </button>
                </div>
                <div style={{marginTop:14,fontSize:10,color:T.gray3,fontFamily:"monospace"}}>
                  No account required · Works offline · Local-first
                </div>
              </div>
            </Box>
          </Sec>

          {/* FOOTER */}
          <Sec id="S08 · Footer" note="4-column links + legal bar">
            <div style={{padding:"28px 32px 16px"}}>
              <div style={{display:"flex",gap:28,flexWrap:"wrap",marginBottom:20}}>
                <div style={{flex:2,minWidth:160}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
                    <div style={{width:20,height:20,borderRadius:5,background:T.accent,
                      display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <Wallet s={11}/>
                    </div>
                    <span style={{fontSize:12,color:T.white,fontWeight:700}}>SubTrackr</span>
                  </div>
                  <div style={{fontSize:11,color:T.gray3,lineHeight:1.6,maxWidth:180,marginBottom:12}}>
                    AI-powered subscription tracker that respects your privacy.
                  </div>
                  <div style={{display:"flex",gap:5}}>
                    {["𝕏","in","gh"].map(s=>(
                      <div key={s} style={{width:24,height:24,borderRadius:5,
                        background:T.elevated,border:`1px solid ${T.border}`,
                        display:"flex",alignItems:"center",justifyContent:"center",
                        fontSize:10,color:T.gray3}}>{s}</div>
                    ))}
                  </div>
                </div>
                {[{t:"Product",l:["Features","Pricing","Changelog","Roadmap"]},
                  {t:"Resources",l:["Docs","GitHub","Privacy","Terms"]},
                  {t:"Company",l:["About","Blog","Contact","Status"]}].map((col,i)=>(
                  <div key={i} style={{flex:1,minWidth:100}}>
                    <div style={{fontSize:9,color:T.white,fontFamily:"monospace",
                      fontWeight:700,letterSpacing:1.5,marginBottom:10}}>{col.t}</div>
                    {col.l.map(l=>(
                      <div key={l} style={{fontSize:11,color:T.gray3,marginBottom:6,cursor:"pointer"}}>{l}</div>
                    ))}
                  </div>
                ))}
              </div>
              <div style={{height:1,background:T.border,marginBottom:12}}/>
              <div style={{display:"flex",justifyContent:"space-between",
                alignItems:"center",flexWrap:"wrap",gap:6}}>
                <span style={{fontSize:9,color:T.gray4,fontFamily:"monospace"}}>
                  © 2026 SubTrackr. Built with React + Claude API.
                </span>
                <div style={{display:"flex",gap:12}}>
                  {["Privacy","Terms","Cookies"].map(l=>(
                    <span key={l} style={{fontSize:9,color:T.gray4,fontFamily:"monospace",cursor:"pointer"}}>{l}</span>
                  ))}
                </div>
              </div>
            </div>
          </Sec>

        </div>
      )}

      {/* ── MOBILE TAB ── */}
      {tab==="mobile" && (
        <div style={{maxWidth:1040,margin:"0 auto"}}>
          <div style={{display:"flex",gap:18,flexWrap:"wrap",justifyContent:"flex-start"}}>

            {/* Mobile Navbar */}
            <div>
              <div style={{fontSize:9,color:T.gray2,fontFamily:"monospace",marginBottom:6,letterSpacing:1}}>NAVBAR · 390px</div>
              <div style={{width:290,border:`1px solid ${T.border}`,borderRadius:9,overflow:"hidden"}}>
                <Box style={{display:"flex",alignItems:"center",justifyContent:"space-between",
                  padding:"0 14px",height:50,background:T.surface}}
                  ann="Logo + hamburger only" ap="right">
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <div style={{width:20,height:20,borderRadius:5,background:T.accent,
                      display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <Wallet s={11}/>
                    </div>
                    <span style={{fontSize:12,color:T.white,fontWeight:700}}>SubTrackr</span>
                  </div>
                  <Menu/>
                </Box>
              </div>
            </div>

            {/* Mobile Hero */}
            <div>
              <div style={{fontSize:9,color:T.gray2,fontFamily:"monospace",marginBottom:6,letterSpacing:1}}>HERO · 390px</div>
              <div style={{width:290,border:`1px solid ${T.border}`,borderRadius:9,overflow:"hidden",background:T.bg}}>
                <div style={{padding:"24px 16px",textAlign:"center"}}>
                  <Tag><Spark s={9}/> &nbsp;AI-POWERED</Tag>
                  <div style={{fontSize:22,color:T.white,fontWeight:800,
                    lineHeight:1.1,letterSpacing:-0.8,marginBottom:9}}>
                    Stop leaking money on{" "}
                    <span style={{color:T.accent}}>forgotten subs</span>
                  </div>
                  <div style={{fontSize:12,color:T.gray2,lineHeight:1.6,marginBottom:16}}>
                    Type what you pay for. AI tracks everything.
                  </div>
                  <button style={{width:"100%",background:T.accent,border:"none",
                    borderRadius:8,padding:"11px",fontSize:13,color:"#fff",
                    fontWeight:700,cursor:"pointer",marginBottom:7}}>Start for free</button>
                  <button style={{width:"100%",background:"none",border:`1px solid ${T.border}`,
                    borderRadius:8,padding:"9px",fontSize:11,color:T.gray2,cursor:"pointer"}}>
                    How it works →
                  </button>
                </div>
                <div style={{display:"flex",justifyContent:"center",padding:"0 16px 20px"}}>
                  <Phone/>
                </div>
              </div>
            </div>

            {/* Mobile Pricing */}
            <div>
              <div style={{fontSize:9,color:T.gray2,fontFamily:"monospace",marginBottom:6,letterSpacing:1}}>PRICING · 390px</div>
              <div style={{width:290,border:`1px solid ${T.border}`,borderRadius:9,
                overflow:"hidden",background:T.bg,padding:"20px 14px"}}>
                <div style={{textAlign:"center",marginBottom:14}}>
                  <div style={{fontSize:16,color:T.white,fontWeight:700,marginBottom:3}}>Simple pricing</div>
                  <div style={{fontSize:11,color:T.gray2}}>No credit card required</div>
                </div>
                <div style={{background:T.accentDim,border:`1px solid ${T.accent}`,
                  borderRadius:11,padding:"16px 14px",position:"relative"}}>
                  <div style={{position:"absolute",top:-9,left:"50%",transform:"translateX(-50%)",
                    background:T.accent,color:"#fff",fontSize:7,fontFamily:"monospace",
                    fontWeight:700,padding:"2px 10px",borderRadius:20}}>MOST POPULAR</div>
                  <div style={{fontSize:9,color:T.accentLt,fontFamily:"monospace",
                    fontWeight:700,letterSpacing:2,marginBottom:5}}>PRO</div>
                  <div style={{display:"flex",alignItems:"baseline",gap:3,marginBottom:9}}>
                    <span style={{fontSize:24,color:T.white,fontFamily:"monospace",fontWeight:700}}>$4</span>
                    <span style={{fontSize:9,color:T.gray3,fontFamily:"monospace"}}>/month</span>
                  </div>
                  {["Unlimited subscriptions","Unlimited AI parsing","Calendar + grouped views","Export CSV"].map((f,i)=>(
                    <div key={i} style={{display:"flex",gap:6,marginBottom:6,alignItems:"center"}}>
                      <Check s={11}/><span style={{fontSize:11,color:T.gray1}}>{f}</span>
                    </div>
                  ))}
                  <button style={{width:"100%",marginTop:10,background:T.accent,border:"none",
                    borderRadius:7,padding:"9px",fontSize:11,color:"#fff",fontWeight:700,cursor:"pointer"}}>
                    Try free for 14 days
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Responsive rules */}
          <div style={{marginTop:24,background:T.surface,border:`1px solid ${T.border}`,
            borderRadius:10,padding:"16px 20px"}}>
            <div style={{fontSize:12,color:T.white,fontWeight:700,marginBottom:12}}>Mobile Rules (breakpoint: 768px)</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
              {[["Navbar","Hide links → hamburger icon"],
                ["Hero","Stack text above phone, full-width CTAs"],
                ["Features","1-col stack, hero card full width"],
                ["How it works","Vertical steps with top dots"],
                ["Pricing","Cards stacked, Pro shown first"],
                ["Testimonials","Horizontal scroll overflow-x"],
                ["Logo bar","overflow-x: auto, no wrap"],
                ["Footer","Brand full width, 2-col links below"]].map(([s,n],i)=>(
                <div key={i} style={{padding:"6px 9px",background:T.elevated,
                  borderRadius:6,border:`1px solid ${T.border}`}}>
                  <div style={{fontSize:9,color:T.accent,fontFamily:"monospace",fontWeight:700,marginBottom:1}}>{s}</div>
                  <div style={{fontSize:10,color:T.gray2}}>{n}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── SPECS TAB ── */}
      {tab==="specs" && (
        <div style={{maxWidth:1040,margin:"0 auto"}}>
          <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
            {/* Section map */}
            <div style={{flex:1,minWidth:240,background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,padding:"16px"}}>
              <div style={{fontSize:12,color:T.white,fontWeight:700,marginBottom:12}}>Section Map</div>
              {[{id:"S01",n:"Navbar",h:"60px",note:"Sticky / blur"},
                {id:"S02",n:"Hero",h:"100vh",note:"Phone + glow"},
                {id:"S03",n:"Social Proof",h:"auto",note:"Logos + stats"},
                {id:"S04",n:"Features",h:"auto",note:"3-col grid"},
                {id:"S05",n:"Pricing",h:"auto",note:"3 tiers + FAQ"},
                {id:"S06",n:"Testimonials",h:"auto",note:"3 cards"},
                {id:"S07",n:"Final CTA",h:"~300px",note:"Glow bg"},
                {id:"S08",n:"Footer",h:"auto",note:"4-col + legal"}].map((s,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:8,
                  padding:"6px 0",borderBottom:`1px solid ${T.border}`}}>
                  <div style={{width:28,fontSize:9,color:T.accent,fontFamily:"monospace",fontWeight:700}}>{s.id}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:11,color:T.white}}>{s.n}</div>
                    <div style={{fontSize:9,color:T.gray3,fontFamily:"monospace"}}>{s.note}</div>
                  </div>
                  <Chip color={T.gray3} size={8}>{s.h}</Chip>
                </div>
              ))}
            </div>

            {/* Typography */}
            <div style={{flex:1,minWidth:240,background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,padding:"16px"}}>
              <div style={{fontSize:12,color:T.white,fontWeight:700,marginBottom:12}}>Typography Scale</div>
              {[{r:"Eyebrow",sz:10,w:700,c:T.accent,s:"AI-POWERED"},
                {r:"H1",sz:34,w:800,c:T.white,s:"Stop leaking"},
                {r:"H2",sz:22,w:700,c:T.white,s:"How it works"},
                {r:"Card title",sz:14,w:700,c:T.white,s:"Renewal Calendar"},
                {r:"Body",sz:13,w:400,c:T.gray2,s:"Track every renewal"},
                {r:"Small",sz:11,w:400,c:T.gray2,s:"No forms required"},
                {r:"Mono / data",sz:13,w:700,c:T.accent,s:"$127.97/mo"},
                {r:"Caption",sz:9,w:400,c:T.gray3,s:"Per user annually"}].map((t,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:9,
                  padding:"6px 0",borderBottom:`1px solid ${T.border}`}}>
                  <div style={{width:80,flexShrink:0}}>
                    <div style={{fontSize:9,color:T.gray3,fontFamily:"monospace"}}>{t.r}</div>
                    <div style={{fontSize:9,color:T.gray4,fontFamily:"monospace"}}>{t.sz}px/{t.w}</div>
                  </div>
                  <div style={{fontSize:Math.min(t.sz,14),color:t.c,fontWeight:t.w,
                    fontFamily:t.r==="Mono / data"?"monospace":"inherit",
                    overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.s}</div>
                </div>
              ))}
            </div>

            {/* Colors */}
            <div style={{flex:1,minWidth:240,background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,padding:"16px"}}>
              <div style={{fontSize:12,color:T.white,fontWeight:700,marginBottom:12}}>Color Palette</div>
              {[["Background","#000000","Page bg"],["Surface","#141414","Cards, nav"],
                ["Elevated","#1C1C1C","Inputs"],["Border","#27272A","Dividers"],
                ["Accent","#0D9488","Primary CTAs"],["Accent Dim","#042F2E","CTA bg"],
                ["Gray 2","#A1A1AA","Body text"],["Gray 3","#52525B","Captions"],
                ["Red","#EF4444","Destructive"],["Amber","#FBBF24","Stars/warning"],
                ["Green","#34D399","Success"],["Blue","#60A5FA","Info"]].map(([n,h,u],i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:8,
                  padding:"5px 0",borderBottom:`1px solid ${T.border}`}}>
                  <div style={{width:16,height:16,borderRadius:4,background:h,
                    border:`1px solid ${T.border}`,flexShrink:0}}/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:11,color:T.white}}>{n}</div>
                    <div style={{fontSize:9,color:T.gray3,fontFamily:"monospace"}}>{u}</div>
                  </div>
                  <div style={{fontSize:9,color:T.accent,fontFamily:"monospace"}}>{h}</div>
                </div>
              ))}
            </div>

            {/* Components */}
            <div style={{flex:1,minWidth:240,background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,padding:"16px"}}>
              <div style={{fontSize:12,color:T.white,fontWeight:700,marginBottom:12}}>Components Needed</div>
              {[{n:"Navbar",r:"New",note:"Sticky + blur"},
                {n:"ServiceLogo",r:"App ✓",note:"Already built"},
                {n:"MockPhone",r:"New",note:"Hero only"},
                {n:"PricingCard",r:"New",note:"3 variants"},
                {n:"TestiCard",r:"New",note:"Quote + savings"},
                {n:"FeatureCard",r:"New",note:"Icon + desc"},
                {n:"StepCard",r:"New",note:"Numbered flow"},
                {n:"StatCard",r:"New",note:"Big number"},
                {n:"FaqItem",r:"New",note:"Accordion"},
                {n:"Footer",r:"New",note:"4-col + legal"},
                {n:"Chip",r:"App ✓",note:"Shared system"},
                {n:"ArcGauge",r:"App ✓",note:"Phone mockup"}].map((c,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:7,
                  padding:"5px 0",borderBottom:`1px solid ${T.border}`}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:11,color:T.white}}>{c.n}</div>
                    <div style={{fontSize:9,color:T.gray3,fontFamily:"monospace"}}>{c.note}</div>
                  </div>
                  <Chip color={c.r.includes("✓")?T.green:T.blue} size={8}>{c.r}</Chip>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{maxWidth:1040,margin:"24px auto 0",borderTop:`1px solid ${T.border}`,
        paddingTop:12,display:"flex",justifyContent:"space-between",
        alignItems:"center",flexWrap:"wrap",gap:6}}>
        <span style={{fontSize:9,color:T.gray3,fontFamily:"monospace"}}>
          SubTrackr Landing Wireframe · 8 sections · 3 views
        </span>
        <div style={{display:"flex",gap:5}}>
          <Chip>React 18</Chip><Chip color={T.blue}>Tailwind v4</Chip>
          <Chip color={T.purple}>Framer Motion</Chip><Chip color={T.amber}>Claude API</Chip>
        </div>
      </div>
    </div>
  );
}
