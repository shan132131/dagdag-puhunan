import { useState, useEffect, useCallback } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar } from "recharts";

// ─── VIEWPORT META (mobile scaling) ─────────────────────────────────────────
const metaVP = document.createElement("meta");
metaVP.name = "viewport";
metaVP.content = "width=device-width, initial-scale=1, maximum-scale=1";
if (!document.querySelector("meta[name='viewport']")) document.head.appendChild(metaVP);

// ─── FONT IMPORT ─────────────────────────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap";
document.head.appendChild(fontLink);

// ─── GLOBAL RESET ────────────────────────────────────────────────────────────
const styleEl = document.createElement("style");
styleEl.textContent = `
  *, *::before, *::after { box-sizing: border-box; }
  html { background:#F0FDF4; }
  body { margin:0; overflow-x:hidden; background:#F0FDF4; color:#111827; }
  /* Fixed background orbs — glass blurs over these, making the frosted effect visible */
  body::before {
    content:''; position:fixed; inset:0; z-index:0; pointer-events:none;
    background:
      radial-gradient(ellipse 90% 70% at 8%  -8%,  rgba(22,163,74,0.22)  0%, transparent 58%),
      radial-gradient(ellipse 65% 55% at 92% 12%,  rgba(250,204,21,0.16)  0%, transparent 55%),
      radial-gradient(ellipse 75% 65% at 50% 105%, rgba(22,163,74,0.14)  0%, transparent 58%),
      radial-gradient(ellipse 55% 45% at 88% 82%,  rgba(37,99,235,0.10)  0%, transparent 52%),
      radial-gradient(ellipse 45% 35% at 2%  85%,  rgba(250,204,21,0.10) 0%, transparent 50%),
      linear-gradient(160deg, #F0FDF4 0%, #FFFFFF 40%, #FAFAFA 70%, #FEFCE8 100%);
  }
  #root { position:relative; z-index:1; }
  input, select, textarea, button { font-family:'Inter',sans-serif; }
  input::placeholder, textarea::placeholder { color:#9CA3AF; }
  input:focus, select:focus, textarea:focus {
    border-color:#16A34A !important;
    box-shadow:0 0 0 3px rgba(22,163,74,0.12) !important;
    outline:none;
  }
  select { appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 12px center; padding-right:36px !important; }
  ::-webkit-scrollbar { width:5px; height:5px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:rgba(22,163,74,0.22); border-radius:99px; }
  ::-webkit-scrollbar-thumb:hover { background:#16A34A; }
  table { border-collapse:collapse; width:100%; }

  @keyframes fadeInUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
  @keyframes scaleIn  { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:scale(1)} }
  @keyframes slideInLeft { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }
  @keyframes shimmer  { 0%{background-position:-200% center} 100%{background-position:200% center} }
  @keyframes spin     { to{transform:rotate(360deg)} }
  @keyframes badgePop { 0%{transform:scale(1)} 45%{transform:scale(1.30)} 70%{transform:scale(0.90)} 100%{transform:scale(1)} }
  @keyframes greenPulse { 0%,100%{box-shadow:0 0 0 0 rgba(22,163,74,0.30)} 50%{box-shadow:0 0 0 6px rgba(22,163,74,0)} }
  @keyframes floatUp  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }

  .page-enter  { animation:fadeInUp 0.28s cubic-bezier(0.22,1,0.36,1) both; }
  .card-enter  { animation:scaleIn  0.22s cubic-bezier(0.22,1,0.36,1) both; }
  .modal-enter { animation:scaleIn  0.20s cubic-bezier(0.22,1,0.36,1) both; }
  .modal-backdrop { animation:fadeIn 0.18s ease both; }

  /* PRIMARY BUTTON — green gradient, lifts on hover */
  .btn-primary {
    position:relative; overflow:hidden;
    background:linear-gradient(135deg, #16A34A 0%, #22C55E 100%);
    color:#fff; border:none; border-radius:12px;
    padding:10px 24px; font-weight:600; font-size:13px;
    cursor:pointer; font-family:'Inter',sans-serif;
    transition:transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.18s ease;
    box-shadow:0 2px 8px rgba(22,163,74,0.35), 0 1px 2px rgba(22,163,74,0.20), inset 0 1px 0 rgba(255,255,255,0.25);
  }
  .btn-primary:hover {
    transform:translateY(-2px) scale(1.02);
    box-shadow:0 6px 20px rgba(22,163,74,0.45), 0 2px 6px rgba(22,163,74,0.25);
    background:linear-gradient(135deg, #15803D 0%, #16A34A 100%);
  }
  .btn-primary:active { transform:scale(0.98); box-shadow:0 1px 4px rgba(22,163,74,0.25); }
  .btn-primary::after {
    content:''; position:absolute; inset:0;
    background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.28) 50%,transparent 60%);
    background-size:200% auto; opacity:0; transition:opacity 0.2s;
  }
  .btn-primary:hover::after { opacity:1; animation:shimmer 0.55s ease; }

  /* DANGER BUTTON */
  .btn-danger {
    position:relative; overflow:hidden;
    background:linear-gradient(135deg, #DC2626 0%, #EF4444 100%);
    color:#fff; border:none; border-radius:12px;
    padding:10px 24px; font-weight:600; font-size:13px;
    cursor:pointer; font-family:'Inter',sans-serif;
    transition:transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.18s ease;
    box-shadow:0 2px 8px rgba(220,38,38,0.30), inset 0 1px 0 rgba(255,255,255,0.20);
  }
  .btn-danger:hover { transform:translateY(-2px) scale(1.02); box-shadow:0 6px 20px rgba(220,38,38,0.40); }
  .btn-danger:active { transform:scale(0.98); }
  .btn-danger::after {
    content:''; position:absolute; inset:0;
    background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.22) 50%,transparent 60%);
    background-size:200% auto; opacity:0; transition:opacity 0.2s;
  }
  .btn-danger:hover::after { opacity:1; animation:shimmer 0.55s ease; }

  /* SECONDARY — white bg, green border */
  .btn-secondary {
    background:#fff; color:#16A34A; border:1.5px solid #16A34A;
    border-radius:12px; padding:10px 24px; font-weight:600; font-size:13px;
    cursor:pointer; font-family:'Inter',sans-serif;
    transition:all 0.16s ease;
    box-shadow:0 1px 3px rgba(22,163,74,0.10);
  }
  .btn-secondary:hover {
    background:#F0FDF4; border-color:#15803D; color:#15803D;
    transform:translateY(-1px); box-shadow:0 4px 12px rgba(22,163,74,0.18);
  }
  .btn-secondary:active { transform:scale(0.98); }

  /* GHOST */
  .btn-ghost {
    background:transparent; color:#16A34A; border:none;
    border-radius:10px; padding:8px 16px; font-weight:500; font-size:13px;
    cursor:pointer; font-family:'Inter',sans-serif;
    transition:background 0.14s, transform 0.14s;
  }
  .btn-ghost:hover { background:rgba(22,163,74,0.08); color:#15803D; transform:translateY(-1px); }
  .btn-ghost:active { transform:scale(0.97); }

  /* ACCENT — yellow, dark text */
  .btn-accent {
    background:linear-gradient(135deg, #FACC15 0%, #FDE047 100%);
    color:#713F12; border:none; border-radius:12px;
    padding:10px 24px; font-weight:700; font-size:13px;
    cursor:pointer; font-family:'Inter',sans-serif;
    transition:transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.18s ease;
    box-shadow:0 2px 8px rgba(250,204,21,0.40), inset 0 1px 0 rgba(255,255,255,0.40);
  }
  .btn-accent:hover {
    transform:translateY(-2px) scale(1.02);
    box-shadow:0 6px 20px rgba(250,204,21,0.50);
    background:linear-gradient(135deg, #EAB308 0%, #FACC15 100%);
  }
  .btn-accent:active { transform:scale(0.98); }

  /* GLASS CARD HOVER */
  .glass-hover {
    transition:transform 0.20s cubic-bezier(0.22,1,0.36,1), box-shadow 0.20s ease;
    cursor:pointer;
  }
  .glass-hover:hover {
    transform:translateY(-4px);
    box-shadow:0 16px 48px rgba(22,163,74,0.18), 0 4px 16px rgba(17,24,39,0.08), inset 0 1.5px 0 rgba(255,255,255,0.95) !important;
  }

  /* KPI TILE */
  .kpi-tile {
    transition:transform 0.20s cubic-bezier(0.22,1,0.36,1), box-shadow 0.20s ease;
  }
  .kpi-tile:hover {
    transform:translateY(-4px) scale(1.015);
    box-shadow:0 12px 30px rgba(22,163,74,0.15), 0 2px 8px rgba(17,24,39,0.06) !important;
  }

  /* NAV ITEMS */
  .nav-item { transition:all 0.14s ease; }
  .nav-item:hover { background:rgba(22,163,74,0.06) !important; color:#15803D !important; }
  .nav-item.active { animation:slideInLeft 0.20s ease both; }

  /* TABLE ROW */
  .table-row { transition:background 0.10s ease; }
  .table-row:hover { background:rgba(22,163,74,0.03) !important; }

  /* MISC */
  .notif-badge { animation:badgePop 0.38s cubic-bezier(0.22,1,0.36,1) both; }
  .progress-bar {
    background:linear-gradient(90deg, #16A34A, #22C55E, #16A34A);
    background-size:200% auto;
    animation:shimmer 2.5s linear infinite;
  }
  .stage-active { animation:greenPulse 2s ease-in-out infinite; }
  .float { animation:floatUp 3s ease-in-out infinite; }
  .skeleton {
    background:linear-gradient(90deg, #F3F4F6 25%, #E5E7EB 50%, #F3F4F6 75%);
    background-size:200% auto; animation:shimmer 1.4s linear infinite; border-radius:8px;
  }

  @media (max-width:768px) {
    .hide-mobile { display:none !important; }
    .stack-mobile { flex-direction:column !important; }
    .full-mobile  { width:100% !important; min-width:0 !important; }
    .pad-mobile   { padding:16px !important; }
    .grid-1-mobile{ grid-template-columns:1fr !important; }
    .overflow-x-mobile { overflow-x:auto !important; }
    .btn-primary,.btn-danger,.btn-secondary,.btn-ghost,.btn-accent { padding:9px 16px; }
  }
`
document.head.appendChild(styleEl);

// ─── RESPONSIVE HOOK ─────────────────────────────────────────────────────────
function useResponsive() {
  const getBreakpoint = () => {
    const w = window.innerWidth;
    if (w < 480)  return "xs";
    if (w < 768)  return "sm";
    if (w < 1024) return "md";
    return "lg";
  };
  const [bp, setBp] = useState(getBreakpoint);
  useEffect(() => {
    const handler = () => setBp(getBreakpoint());
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return {
    bp,
    isMobile:  bp === "xs" || bp === "sm",
    isTablet:  bp === "md",
    isDesktop: bp === "lg",
    w: window.innerWidth,
  };
}

// Font constants
const F = {
  heading:  { fontFamily:"'Inter', sans-serif", fontWeight: 600 },
  body:     { fontFamily:"'Inter', sans-serif", fontWeight: 400 },
  medium:   { fontFamily:"'Inter', sans-serif", fontWeight: 500 },
  bold:     { fontFamily:"'Inter', sans-serif", fontWeight: 700 },
  heavy:    { fontFamily:"'Inter', sans-serif", fontWeight: 800 },
  // Tabular numbers for financial figures
  figure:   { fontFamily:"'Inter', sans-serif", fontWeight: 500, fontVariantNumeric:"tabular-nums", letterSpacing:"0.01em" },
  // Charts & tables
  chart:    { fontFamily:"'Inter', sans-serif", fontWeight: 500 },
};

// ─── SVG ICON LIBRARY ────────────────────────────────────────────────────────
const Icon = ({ name, size = 16, color = "currentColor", style = {} }) => {
  const s = { width: size, height: size, display: "inline-block", flexShrink: 0, ...style };
  const paths = {
    dashboard:    <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    applications: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></>,
    accounts:     <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6"  y1="20" x2="6"  y2="14"/></>,
    monitoring:   <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></>,
    reports:      <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>,
    logs:         <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>,
    settings:     <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
    verification: <><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></>,
    ci:           <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
    collections:  <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>,
    ocr:          <><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></>,
    myLoan:       <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></>,
    apply:        <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    upload:       <><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></>,
    fund:         <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>,
    building:     <><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="9" y1="22" x2="9" y2="12"/><line x1="15" y1="22" x2="15" y2="12"/><rect x="9" y="7" width="6" height="4"/></>,
    handshake:    <><path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"/></>,
    store:        <><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></>,
    councilor:    <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
    search:       <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
    bell:         <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>,
    check:        <><polyline points="20 6 9 17 4 12"/></>,
    x:            <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    alert:        <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
    file:         <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></>,
    camera:       <><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></>,
    users:        <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    logout:       <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
    money:        <><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></>,
    trendUp:      <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>,
    shield:       <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
    clock:        <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
    download:     <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
    refresh:      <><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></>,
    info:         <><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></>,
    user:         <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" style={s}>
      {paths[name] || <circle cx="12" cy="12" r="10"/>}
    </svg>
  );
};

// ─── DESIGN TOKENS — 70/20/5/5 Sampaguita Light ─────────────────────────────
// 70% White/Neutral · 20% Trust Green · 5% Yellow · 5% Gray/Semantic
const G = {
  // 70% ── White & Neutral ────────────────────────────────────────────────────
  white:       "#FFFFFF",
  pageBg:      "#FAFAFA",
  cardBg:      "#FFFFFF",
  elevated:    "#FFFFFF",
  surfaceAlt:  "#F9FAFB",

  // 20% ── Trust Green ────────────────────────────────────────────────────────
  primary:      "#16A34A",
  primaryHov:   "#15803D",
  primaryPrs:   "#166534",
  primaryMid:   "#22C55E",
  primaryLight: "#DCFCE7",
  primaryTint:  "#F0FDF4",
  primaryGlass: "rgba(22,163,74,0.07)",

  // 5% ── Optimistic Yellow ───────────────────────────────────────────────────
  accent:      "#FACC15",
  accentHov:   "#EAB308",
  accentLight: "#FEF9C3",
  accentTint:  "#FEFCE8",
  accentText:  "#713F12",  // dark amber — readable on yellow

  // 5% ── Gray & Semantic ─────────────────────────────────────────────────────
  textPrimary:   "#111827",
  textSecondary: "#374151",
  textMuted:     "#6B7280",
  textDisabled:  "#9CA3AF",
  border:        "#E5E7EB",
  borderFocus:   "#16A34A",
  divider:       "#F3F4F6",
  success:       "#16A34A",
  warning:       "#D97706",
  danger:        "#DC2626",
  dangerLight:   "#FEE2E2",
  info:          "#2563EB",
  infoLight:     "#DBEAFE",
  purple:        "#7C3AED",
  purpleLight:   "#EDE9FE",

  // Glass — frosted white with green refraction edge ─────────────────────────
  glass:        "rgba(255,255,255,0.75)",
  glassMed:     "rgba(255,255,255,0.88)",
  glassBorder:  "rgba(22,163,74,0.15)",
  glassShadow:  "0 4px 24px rgba(17,24,39,0.08), 0 1px 0 rgba(255,255,255,0.90) inset",

  // Status colors ─────────────────────────────────────────────────────────────
  statusColors: {
    "Pending":            "#6B7280",
    "Under Verification": "#2563EB",
    "Under CI":           "#7C3AED",
    "Approved":           "#16A34A",
    "Released":           "#16A34A",
    "Rejected":           "#DC2626",
    "Active":             "#16A34A",
    "Overdue":            "#D97706",
    "Closed":             "#9CA3AF",
  },

  // Aliases ───────────────────────────────────────────────────────────────────
  accentBlue:   "#2563EB",
  accentTeal:   "#16A34A",
  accentGold:   "#FACC15",
  accentMaroon: "#DC2626",
  accentPurple: "#7C3AED",
};

const css = {
  body: {
    margin: 0,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    fontWeight: 400,
    // Rich layered background — glass cards need color behind them to look frosted
    background: `
      radial-gradient(ellipse 80% 60% at 10% -10%, rgba(22,163,74,0.18) 0%, transparent 60%),
      radial-gradient(ellipse 60% 50% at 90% 20%,  rgba(250,204,21,0.12) 0%, transparent 55%),
      radial-gradient(ellipse 70% 60% at 50% 100%, rgba(22,163,74,0.10) 0%, transparent 60%),
      radial-gradient(ellipse 50% 40% at 80% 80%,  rgba(37,99,235,0.07)  0%, transparent 50%),
      linear-gradient(160deg, #F0FDF4 0%, #FFFFFF 40%, #FAFAFA 70%, #F0FDF4 100%)
    `,
    minHeight: "100vh",
    color: "#111827",
  },
  glass: (extra = {}) => ({
    // True Apple liquid glass — translucent so bg orbs bleed through
    background: "linear-gradient(135deg, rgba(255,255,255,0.52) 0%, rgba(240,253,244,0.38) 100%)",
    backdropFilter: "blur(28px) saturate(200%) brightness(1.02)",
    WebkitBackdropFilter: "blur(28px) saturate(200%) brightness(1.02)",
    border: "1px solid rgba(255,255,255,0.70)",
    boxShadow: [
      "0 8px 32px rgba(17,24,39,0.10)",
      "0 2px 8px rgba(17,24,39,0.06)",
      "0 1px 0 rgba(255,255,255,0.95) inset",
      "0 -1px 0 rgba(22,163,74,0.08) inset",
    ].join(", "),
    borderRadius: 20,
    ...extra,
  }),
  glassMed: (extra = {}) => ({
    background: "linear-gradient(135deg, rgba(255,255,255,0.58) 0%, rgba(240,253,244,0.42) 100%)",
    backdropFilter: "blur(22px) saturate(190%) brightness(1.02)",
    WebkitBackdropFilter: "blur(22px) saturate(190%) brightness(1.02)",
    border: "1px solid rgba(255,255,255,0.72)",
    boxShadow: [
      "0 4px 20px rgba(17,24,39,0.08)",
      "0 1px 4px rgba(17,24,39,0.04)",
      "0 1px 0 rgba(255,255,255,0.95) inset",
    ].join(", "),
    borderRadius: 16,
    ...extra,
  }),
  pill: (bg = "#16A34A", extra = {}) => ({
    background: bg,
    border: "none",
    borderRadius: 12,
    color: "#fff",
    padding: "8px 22px",
    fontWeight: 600,
    fontSize: 13,
    fontFamily: "'Inter', sans-serif",
    cursor: "pointer",
    transition: "all 0.18s ease",
    ...extra,
  }),
  input: (extra = {}) => ({
    background: "#FFFFFF",
    border: "1px solid #E5E7EB",
    borderRadius: 10,
    color: "#111827",
    padding: "9px 14px",
    fontSize: 13,
    fontFamily: "'Inter', sans-serif",
    fontWeight: 400,
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    ...extra,
  }),
};

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const BARANGAYS = ["Bagong Silang","Bambang","Cuyab","Estrella","Landayan","Laram","Magsaysay","New Tubigan","Poblacion","San Antonio","San Roque","Santo Niño","Siena","Southville I","Southville II","Southville III"];

const MOCK_USERS = {
  lgu:       { id:1, name:"Maria Santos",          role:"lgu_admin",       email:"maria@lgusanpedro.ph" },
  coop:      { id:2, name:"Jose Reyes",             role:"coop_officer",    email:"jose@coop.ph", cooperative:"San Pedro Central Coop" },
  msme:      { id:3, name:"Ana Cruz",               role:"msme_borrower",   email:"ana@gmail.com", business:"Cruz Sari-Sari Store", barangay:"Poblacion" },
  councilor: { id:4, name:"Hon. Ligaya Dela Cruz",  role:"city_councilor",  email:"councilor.ligaya@sanpedro.ph" },
};

const MOCK_APPLICATIONS = [
  { id:1, ref:"DP-2026-0001", name:"Ana Cruz",           business:"Cruz Sari-Sari Store",     category:"sari-sari",     barangay:"Poblacion", amount:25000, purpose:"Stock replenishment",    term:12, status:"Active",            officer:"Jose Reyes", submitted:"2026-01-10", fundSource:"City_Councilor" },
  { id:2, ref:"DP-2026-0002", name:"Roberto Dela Torre", business:"Dela Torre Lechon",         category:"food-business", barangay:"Bambang",   amount:50000, purpose:"Equipment purchase",     term:24, status:"Under CI",          officer:"Jose Reyes", submitted:"2026-02-05", fundSource:"LGU" },
  { id:3, ref:"DP-2026-0003", name:"Marilou Bautista",  business:"Bautista Ukay-Ukay",        category:"sari-sari",     barangay:"Landayan",  amount:15000, purpose:"Capital expansion",      term:6,  status:"Pending",           officer:"Jose Reyes", submitted:"2026-03-01", fundSource:"LGU" },
  { id:4, ref:"DP-2026-0004", name:"Fernando Ramos",    business:"Ramos Tricycle Services",   category:"tricycle",      barangay:"Estrella",  amount:30000, purpose:"Motor repair",           term:12, status:"Overdue",           officer:"Jose Reyes", submitted:"2025-10-15", fundSource:"City_Councilor" },
  { id:5, ref:"DP-2026-0005", name:"Elvira Mendoza",    business:"Mendoza Kakanin",           category:"food-business", barangay:"San Roque", amount:20000, purpose:"Kitchen expansion",      term:12, status:"Approved",          officer:"Jose Reyes", submitted:"2026-03-10", fundSource:"LGU" },
  { id:6, ref:"DP-2026-0006", name:"Andres Villanueva", business:"Villanueva Agri Farm",      category:"agri-processor",barangay:"Cuyab",     amount:45000, purpose:"Seedlings & fertilizer", term:18, status:"Under Verification",officer:"Jose Reyes", submitted:"2026-04-01", fundSource:"LGU" },
  { id:7, ref:"DP-2026-0007", name:"Teresita Lim",      business:"Lim's Home Bakery",         category:"food-business", barangay:"Magsaysay", amount:10000, purpose:"Oven purchase",          term:6,  status:"Closed",            officer:"Jose Reyes", submitted:"2025-06-01", fundSource:"City_Councilor" },
  { id:8, ref:"DP-2026-0008", name:"Domingo Santos",    business:"Santos Sari-Sari",          category:"sari-sari",     barangay:"Santo Niño",amount:20000, purpose:"Stock",                  term:12, status:"Released",          officer:"Jose Reyes", submitted:"2026-04-10", fundSource:"LGU" },
];

const MOCK_REPAYMENTS = [
  { id:1, ref:"DP-2026-0001", name:"Ana Cruz",       loaned:25000, paid:10000, balance:15000, due:2500, dueDate:"2026-07-01", status:"Active",  collector:"Jose Reyes" },
  { id:2, ref:"DP-2026-0004", name:"Fernando Ramos", loaned:30000, paid:5000,  balance:25000, due:2500, dueDate:"2026-05-01", status:"Overdue", collector:"Jose Reyes" },
  { id:3, ref:"DP-2026-0007", name:"Teresita Lim",   loaned:10000, paid:10000, balance:0,     due:0,    dueDate:"2025-12-01", status:"Closed",  collector:"Jose Reyes" },
  { id:4, ref:"DP-2026-0008", name:"Domingo Santos", loaned:20000, paid:2000,  balance:18000, due:2000, dueDate:"2026-07-05", status:"Active",  collector:"Jose Reyes" },
];

const MOCK_NOTIFICATIONS = [
  { id:1, title:"Loan Approved",                    message:"DP-2026-0005 — Elvira Mendoza's loan of P20,000 has been approved.",                          time:"2 hrs ago",  read:false },
  { id:2, title:"Payment Due Reminder",             message:"DP-2026-0001 — Ana Cruz payment of P2,500 due on July 1.",                                     time:"5 hrs ago",  read:false },
  { id:3, title:"Document Digitized",               message:"Handwritten form for DP-2026-0006 successfully digitized via OCR.",                            time:"1 day ago",  read:true  },
  { id:4, title:"Application Forwarded to CI",      message:"DP-2026-0002 — Roberto Dela Torre forwarded to Credit Investigation.",                         time:"2 days ago", read:true  },
  { id:5, title:"Repayment Posted – Councilor Fund",message:"Ana Cruz repayment of P2,500 posted — credited to Councilor's personal fund.",                 time:"3 days ago", read:true  },
];

const MOCK_AUDIT_LOGS = [
  { id:1, time:"2026-06-19 09:14:22", user:"Maria Santos", role:"LGU Admin",      action:"Approved loan application",       record:"DP-2026-0005", ip:"192.168.1.10" },
  { id:2, time:"2026-06-19 08:55:11", user:"Jose Reyes",   role:"Coop Officer",   action:"Submitted CI report",             record:"DP-2026-0002", ip:"192.168.1.15" },
  { id:3, time:"2026-06-18 16:30:45", user:"Jose Reyes",   role:"Coop Officer",   action:"Recorded repayment P2,500",       record:"DP-2026-0001", ip:"192.168.1.15" },
  { id:4, time:"2026-06-18 14:05:00", user:"Ana Cruz",     role:"MSME Borrower",  action:"Uploaded handwritten document",   record:"DP-2026-0006", ip:"192.168.1.22" },
  { id:5, time:"2026-06-17 11:20:33", user:"Maria Santos", role:"LGU Admin",      action:"Released loan disbursement",      record:"DP-2026-0008", ip:"192.168.1.10" },
  { id:6, time:"2026-06-17 09:00:00", user:"Jose Reyes",   role:"Coop Officer",   action:"Completed verification checklist",record:"DP-2026-0006", ip:"192.168.1.15" },
];

const COUNCILOR_CONTRIBUTIONS = [
  { id:1, date:"2026-01-10", amount:25000, ref:"DP-2026-0001", msme:"Ana Cruz — Cruz Sari-Sari Store",         repayStatus:"Active",  repaid:10000 },
  { id:2, date:"2025-06-01", amount:10000, ref:"DP-2026-0007", msme:"Teresita Lim — Lim's Home Bakery",        repayStatus:"Closed",  repaid:10000 },
  { id:3, date:"2025-10-15", amount:30000, ref:"DP-2026-0004", msme:"Fernando Ramos — Ramos Tricycle Services", repayStatus:"Overdue", repaid:5000  },
];

const DISBURSEMENT_TREND = [
  { month:"Jan", amount:75000 }, { month:"Feb", amount:120000 }, { month:"Mar", amount:90000 },
  { month:"Apr", amount:145000 }, { month:"May", amount:80000 }, { month:"Jun", amount:110000 },
];

const CATEGORY_DATA = [
  { name:"Sari-Sari", repayRate:88 }, { name:"Agri-Processor", repayRate:92 },
  { name:"Tricycle", repayRate:74 },  { name:"Food Business", repayRate:85 },
];

const BARANGAY_DATA = [
  { name:"Poblacion", count:12, pct:80 }, { name:"Bambang", count:8, pct:65 },
  { name:"Landayan", count:7,  pct:70 },  { name:"Estrella", count:5, pct:55 },
  { name:"Magsaysay", count:10, pct:75 }, { name:"San Roque", count:6, pct:60 },
  { name:"Cuyab", count:4, pct:50 },      { name:"Santo Niño", count:9, pct:72 },
];


// ─── SUPABASE CLIENT ──────────────────────────────────────────────────────────
// ─── SUPABASE CLIENT ──────────────────────────────────────────────────────────
// Env vars injected by Vite are exposed on window.__ENV__ at runtime
// In Claude preview: no env vars → falls back to localStorage automatically
const SUPABASE_URL = (typeof window !== "undefined" && window.__SUPABASE_URL__) || null;
const SUPABASE_KEY = (typeof window !== "undefined" && window.__SUPABASE_KEY__) || null;
const USE_BACKEND  = !!(SUPABASE_URL && SUPABASE_KEY);

// Minimal Supabase REST client (no npm package needed)
const sb = USE_BACKEND ? {
  url: SUPABASE_URL,
  key: SUPABASE_KEY,
  headers: () => ({
    "apikey":        SUPABASE_KEY,
    "Authorization": `Bearer ${SUPABASE_KEY}`,
    "Content-Type":  "application/json",
    "Prefer":        "return=representation",
  }),
  async from(table) {
    const base = `${SUPABASE_URL}/rest/v1/${table}`;
    return {
      async select(cols="*", filters="") {
        const r = await fetch(`${base}?select=${cols}${filters ? "&" + filters : ""}&order=id.asc`, { headers: sb.headers() });
        return r.ok ? r.json() : [];
      },
      async insert(data) {
        const r = await fetch(base, { method:"POST", headers: sb.headers(), body: JSON.stringify(data) });
        return r.ok ? r.json() : null;
      },
      async update(data, match) {
        const r = await fetch(`${base}?${match}`, { method:"PATCH", headers: sb.headers(), body: JSON.stringify(data) });
        return r.ok ? r.json() : null;
      },
      async delete(match) {
        await fetch(`${base}?${match}`, { method:"DELETE", headers: sb.headers() });
      },
    };
  }
} : null;

// ─── LOCALSTORAGE FALLBACK ────────────────────────────────────────────────────
const LS = {
  get:   (k, fb) => { try { const v=localStorage.getItem(k); return v?JSON.parse(v):fb; } catch { return fb; } },
  set:   (k, v)  => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  clear: ()      => { ["dp_apps","dp_repayments","dp_users","dp_notifications","dp_audit_logs"].forEach(k=>{ try{localStorage.removeItem(k);}catch{} }); },
};

const INIT_USERS = [
  { id:1, name:"Maria Santos",          role:"lgu_admin",      status:"Active",   email:"maria@lgusanpedro.ph",         cooperative:"" },
  { id:2, name:"Jose Reyes",            role:"coop_officer",   status:"Active",   email:"jose@coop.ph",                 cooperative:"San Pedro Central Coop" },
  { id:3, name:"Ana Cruz",              role:"msme_borrower",  status:"Active",   email:"ana@gmail.com",                cooperative:"" },
  { id:4, name:"Hon. Ligaya Dela Cruz", role:"city_councilor", status:"Active",   email:"councilor.ligaya@sanpedro.ph", cooperative:"" },
  { id:5, name:"Pedro Santos",          role:"msme_borrower",  status:"Inactive", email:"pedro@gmail.com",              cooperative:"" },
];

// ─── MAP SUPABASE ROW → FRONTEND SHAPE ────────────────────────────────────────
const mapApp = r => ({
  id: r.id, ref: r.ref, name: r.name, business: r.business,
  category: r.category, barangay: r.barangay, amount: Number(r.amount),
  purpose: r.purpose, term: r.term, status: r.status,
  officer: r.officer, fundSource: r.fund_source, submitted: r.submitted,
});
const mapRep = r => ({
  id: r.id, ref: r.ref, name: r.name,
  loaned: Number(r.loaned), paid: Number(r.paid),
  balance: Number(r.balance), due: Number(r.due),
  dueDate: r.due_date, status: r.status, collector: r.collector,
});
const mapUser = r => ({
  id: r.id, name: r.name, email: r.email,
  role: r.role, status: r.status, cooperative: r.cooperative || "",
});
const mapNotif = r => ({
  id: r.id, title: r.title, message: r.message,
  read: r.is_read, time: new Date(r.created_at).toLocaleString("en-PH", {month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}),
});
const mapLog = r => ({
  id: r.id, time: new Date(r.created_at).toLocaleString("en-PH"),
  user: r.username, role: r.role, action: r.action, record: r.record, ip: r.ip,
});

// ─── GLOBAL APP STORE ─────────────────────────────────────────────────────────
function useAppStore(currentUser) {
  const [apps,          setApps]          = useState(() => LS.get("dp_apps",          [...MOCK_APPLICATIONS]));
  const [repayments,    setRepayments]    = useState(() => LS.get("dp_repayments",    [...MOCK_REPAYMENTS]));
  const [users,         setUsers]         = useState(() => LS.get("dp_users",         INIT_USERS));
  const [notifications, setNotifications] = useState(() => LS.get("dp_notifications", [...MOCK_NOTIFICATIONS]));
  const [auditLogs,     setAuditLogs]     = useState(() => LS.get("dp_audit_logs",    [...MOCK_AUDIT_LOGS]));
  const [loading,       setLoading]       = useState(USE_BACKEND);
  const [backendOk,     setBackendOk]     = useState(false);

  // ── FETCH FROM SUPABASE ON MOUNT ──────────────────────────────────────────
  useEffect(() => {
    if (!USE_BACKEND) return;
    (async () => {
      try {
        const [rawApps, rawReps, rawUsers, rawNotifs, rawLogs] = await Promise.all([
          sb.from("loan_applications").then(t=>t.select()),
          sb.from("repayments").then(t=>t.select()),
          sb.from("users").then(t=>t.select()),
          sb.from("notifications").then(t=>t.select("*","order=id.desc")),
          sb.from("audit_logs").then(t=>t.select("*","order=id.desc")),
        ]);
        if (rawApps?.length)   setApps(rawApps.map(mapApp));
        if (rawReps?.length)   setRepayments(rawReps.map(mapRep));
        if (rawUsers?.length)  setUsers(rawUsers.map(mapUser));
        if (rawNotifs?.length) setNotifications(rawNotifs.map(mapNotif));
        if (rawLogs?.length)   setAuditLogs(rawLogs.map(mapLog));
        setBackendOk(true);
      } catch(e) {
        console.warn("Supabase fetch failed, using localStorage fallback:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── PERSIST: localStorage always, Supabase when available ─────────────────
  useEffect(() => { LS.set("dp_apps",          apps);          }, [apps]);
  useEffect(() => { LS.set("dp_repayments",    repayments);    }, [repayments]);
  useEffect(() => { LS.set("dp_users",         users);         }, [users]);
  useEffect(() => { LS.set("dp_notifications", notifications); }, [notifications]);
  useEffect(() => { LS.set("dp_audit_logs",    auditLogs);     }, [auditLogs]);

  const resetData = () => {
    LS.clear();
    setApps([...MOCK_APPLICATIONS]);
    setRepayments([...MOCK_REPAYMENTS]);
    setUsers(INIT_USERS);
    setNotifications([...MOCK_NOTIFICATIONS]);
    setAuditLogs([...MOCK_AUDIT_LOGS]);
  };

  // ── HELPERS ───────────────────────────────────────────────────────────────
  const roleLabel = () => currentUser
    ? currentUser.role==="lgu_admin"?"LGU Admin"
      :currentUser.role==="coop_officer"?"Coop Officer"
      :currentUser.role==="msme_borrower"?"MSME Borrower":"City Councilor"
    : "System";

  const addLog = async (action, record) => {
    const now = new Date();
    const ts = now.toISOString().replace("T"," ").slice(0,19);
    const entry = { id:Date.now(), time:ts, user:currentUser?.name||"System", role:roleLabel(), action, record, ip:"192.168.1."+Math.floor(Math.random()*20+10) };
    setAuditLogs(prev=>[entry,...prev].slice(0,100));
    if (USE_BACKEND && backendOk) {
      const t = await sb.from("audit_logs");
      await t.insert({ username:entry.user, role:entry.role, action, record, ip:entry.ip });
    }
  };

  const pushNotif = async (title, message) => {
    const entry = { id:Date.now(), title, message, time:"Just now", read:false };
    setNotifications(prev=>[entry,...prev].slice(0,30));
    if (USE_BACKEND && backendOk) {
      const t = await sb.from("notifications");
      await t.insert({ title, message });
    }
  };

  const markAllRead = async () => {
    setNotifications(prev=>prev.map(n=>({...n,read:true})));
    if (USE_BACKEND && backendOk) {
      const t = await sb.from("notifications");
      await t.update({ is_read:true }, "is_read=eq.false");
    }
  };
  const markNotifRead = (id) => setNotifications(prev=>prev.map(n=>n.id===id?{...n,read:true}:n));

  // ── APPLICATIONS ──────────────────────────────────────────────────────────
  const updateAppStatus = async (id, status) => {
    setApps(prev=>prev.map(a=>a.id===id?{...a,status}:a));
    const app = apps.find(a=>a.id===id);
    if (!app) return;
    addLog(`Changed status to "${status}"`, app.ref);
    pushNotif(`Status Updated: ${app.ref}`, `${app.name}'s application is now ${status}.`);
    if (USE_BACKEND && backendOk) {
      const t = await sb.from("loan_applications");
      await t.update({ status }, `id=eq.${id}`);
    }
    if (status==="Released"||status==="Active") {
      const exists = repayments.find(r=>r.ref===app.ref);
      if (!exists) {
        const due = Math.round(app.amount/app.term);
        const dueDate = new Date(); dueDate.setMonth(dueDate.getMonth()+1);
        const dueDateStr = dueDate.toISOString().slice(0,10);
        const newRep = { id:Date.now(), ref:app.ref, name:app.name, loaned:app.amount, paid:0, balance:app.amount, due, dueDate:dueDateStr, status:"Active", collector:"Jose Reyes" };
        setRepayments(prev=>[...prev, newRep]);
        if (USE_BACKEND && backendOk) {
          const t = await sb.from("repayments");
          await t.insert({ application_id:id, ref:app.ref, name:app.name, loaned:app.amount, paid:0, balance:app.amount, due, due_date:dueDateStr, status:"Active", collector:"Jose Reyes" });
        }
      }
    }
  };

  const addApp = async (app) => {
    setApps(prev=>[...prev, app]);
    addLog("Submitted new loan application", app.ref);
    pushNotif("New Application Received", `${app.name} submitted ${app.ref} for P${app.amount.toLocaleString()}.`);
    if (USE_BACKEND && backendOk) {
      const t = await sb.from("loan_applications");
      await t.insert({ ref:app.ref, name:app.name, business:app.business, category:app.category, barangay:app.barangay, amount:app.amount, purpose:app.purpose, term:app.term, status:"Pending", officer:"Jose Reyes", fund_source:"LGU", submitted:app.submitted });
    }
  };

  // ── VERIFICATION ──────────────────────────────────────────────────────────
  const forwardToCI = async (appId) => {
    setApps(prev=>prev.map(a=>a.id===appId?{...a,status:"Under CI"}:a));
    const app = apps.find(a=>a.id===appId);
    if (app) {
      addLog("Forwarded to Credit Investigation", app.ref);
      pushNotif("Forwarded to CI", `${app.ref} — ${app.name} forwarded to Credit Investigation.`);
      if (USE_BACKEND && backendOk) {
        const t = await sb.from("loan_applications");
        await t.update({ status:"Under CI" }, `id=eq.${appId}`);
      }
    }
  };

  // ── CI ────────────────────────────────────────────────────────────────────
  const submitCI = async (appId, rec) => {
    const finalStatus = rec.includes("Rejection") ? "Rejected" : "Approved";
    setApps(prev=>prev.map(a=>a.id===appId?{...a,status:finalStatus}:a));
    const app = apps.find(a=>a.id===appId);
    if (app) {
      addLog(`Submitted CI report — ${rec}`, app.ref);
      pushNotif("CI Report Submitted", `${app.ref} — Recommendation: ${rec}.`);
      if (USE_BACKEND && backendOk) {
        const t = await sb.from("loan_applications");
        await t.update({ status:finalStatus }, `id=eq.${appId}`);
        const t2 = await sb.from("ci_reports");
        await t2.insert({ application_id:appId, officer_name:currentUser?.name, recommendation:rec });
      }
    }
  };

  // ── REPAYMENTS ────────────────────────────────────────────────────────────
  const recordPayment = async (repayId) => {
    let updated;
    setRepayments(prev=>prev.map(r=>{
      if (r.id!==repayId) return r;
      const newPaid    = r.paid + r.due;
      const newBalance = Math.max(0, r.balance - r.due);
      const newStatus  = newBalance<=0 ? "Closed" : "Active";
      updated = { ...r, paid:newPaid, balance:newBalance, status:newStatus };
      addLog(`Recorded repayment P${r.due.toLocaleString()}`, r.ref);
      pushNotif("Payment Recorded", `${r.ref} — P${r.due.toLocaleString()} posted for ${r.name}.`);
      if (newBalance<=0) setApps(p=>p.map(a=>a.ref===r.ref?{...a,status:"Closed"}:a));
      return updated;
    }));
    if (USE_BACKEND && backendOk && updated) {
      const t = await sb.from("repayments");
      await t.update({ paid:updated.paid, balance:updated.balance, status:updated.status }, `id=eq.${repayId}`);
      if (updated.status==="Closed") {
        const t2 = await sb.from("loan_applications");
        await t2.update({ status:"Closed" }, `ref=eq.${updated.ref}`);
      }
    }
  };

  const applyPenalty = async (repayId, penaltyAmt) => {
    let updated;
    setRepayments(prev=>prev.map(r=>{
      if (r.id!==repayId) return r;
      updated = { ...r, balance:+(r.balance+penaltyAmt).toFixed(2), status:"Overdue" };
      addLog(`Applied penalty P${penaltyAmt.toFixed(2)}`, r.ref);
      return updated;
    }));
    const rep = repayments.find(r=>r.id===repayId);
    if (rep) {
      setApps(prev=>prev.map(a=>a.ref===rep.ref?{...a,status:"Overdue"}:a));
      if (USE_BACKEND && backendOk) {
        const t = await sb.from("repayments");
        await t.update({ balance:updated?.balance, status:"Overdue" }, `id=eq.${repayId}`);
        const t2 = await sb.from("loan_applications");
        await t2.update({ status:"Overdue" }, `ref=eq.${rep.ref}`);
      }
    }
  };

  // ── USERS ─────────────────────────────────────────────────────────────────
  const toggleUser = async (id) => {
    const u = users.find(u=>u.id===id);
    if (!u) return;
    const newStatus = u.status==="Active" ? "Inactive" : "Active";
    setUsers(prev=>prev.map(u=>u.id===id?{...u,status:newStatus}:u));
    addLog(`${u.status==="Active"?"Deactivated":"Activated"} user account`, u.name);
    if (USE_BACKEND && backendOk) {
      const t = await sb.from("users");
      await t.update({ status:newStatus }, `id=eq.${id}`);
    }
  };

  return {
    apps, repayments, users, notifications, auditLogs,
    loading, backendOk, USE_BACKEND,
    updateAppStatus, addApp, forwardToCI, submitCI,
    recordPayment, applyPenalty, toggleUser,
    markNotifRead, markAllRead, pushNotif, addLog, resetData,
  };
}


// ─── NAV ITEMS ────────────────────────────────────────────────────────────────
const NAV_ITEMS = {
  lgu_admin: [
    { group:"Main", items:[
      { id:"dashboard",    label:"Dashboard",       icon:"dashboard"    },
      { id:"applications", label:"Applications",    icon:"applications" },
      { id:"accounts",     label:"Accounts Tracker",icon:"accounts"     },
    ]},
    { group:"Oversight", items:[
      { id:"monitoring",   label:"Monitoring",      icon:"monitoring"   },
      { id:"reports",      label:"Reports",         icon:"reports"      },
      { id:"logs",         label:"Activity Logs",   icon:"logs"         },
      { id:"settings",     label:"User Management", icon:"settings"     },
    ]},
  ],
  coop_officer: [
    { group:"Main", items:[
      { id:"dashboard",    label:"Dashboard",          icon:"dashboard"    },
      { id:"applications", label:"Applications",       icon:"applications" },
      { id:"verification", label:"Verification",       icon:"verification" },
      { id:"ci",           label:"Credit Investigation",icon:"ci"          },
      { id:"collections",  label:"Collections",        icon:"collections"  },
      { id:"accounts",     label:"Accounts Tracker",   icon:"accounts"     },
      { id:"ocr",          label:"OCR Digitizer",      icon:"ocr"          },
    ]},
  ],
  msme_borrower: [
    { group:"My Loan", items:[
      { id:"dashboard",    label:"My Dashboard",   icon:"dashboard"    },
      { id:"my_loan",      label:"My Loan Status", icon:"myLoan"       },
      { id:"apply",        label:"Apply for Loan", icon:"apply"        },
      { id:"ocr",          label:"Upload Documents",icon:"upload"       },
    ]},
  ],
  city_councilor: [
    { group:"Personal Fund", items:[
      { id:"councilor_dashboard", label:"Personal Fund",       icon:"fund"         },
    ]},
    { group:"Loan Management", items:[
      { id:"dashboard",           label:"Dashboard",           icon:"dashboard"    },
      { id:"applications",        label:"Applications",        icon:"applications" },
      { id:"verification",        label:"Verification",        icon:"verification" },
      { id:"ci",                  label:"Credit Investigation",icon:"ci"           },
      { id:"collections",         label:"Collections",         icon:"collections"  },
      { id:"accounts",            label:"Accounts Tracker",    icon:"accounts"     },
      { id:"ocr",                 label:"OCR Digitizer",       icon:"ocr"          },
    ]},
    { group:"Oversight", items:[
      { id:"monitoring",          label:"Monitoring",          icon:"monitoring"   },
      { id:"reports",             label:"Reports",             icon:"reports"      },
      { id:"logs",                label:"Activity Logs",       icon:"logs"         },
      { id:"settings",            label:"User Management",     icon:"settings"     },
    ]},
  ],
};

// ─── STAGE TRACKER ────────────────────────────────────────────────────────────
const STAGES = ["Encoding","Verification","CI","Approval","Release","Active","Closed"];
const STATUS_STAGE = {
  "Pending":0, "Under Verification":1, "Under CI":2, "Approved":3,
  "Released":4, "Active":5, "Closed":6, "Rejected":-1, "Overdue":5,
};

function StageTracker({ status }) {
  const cur = STATUS_STAGE[status] ?? 0;
  const rejected = status === "Rejected";
  return (
    <div style={{ display:"flex", alignItems:"center", padding:"18px 0", flexWrap:"wrap" }}>
      {STAGES.map((s, i) => {
        const done   = !rejected && cur > i;
        const active = !rejected && cur === i;
        const color  = done ? "#16A34A" : active ? "#16A34A" : "rgba(22,163,74,0.12)";
        return (
          <div key={s} style={{ display:"flex", alignItems:"center" }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
              <div style={{
                width:32, height:32, borderRadius:"50%", background:color,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontWeight:700, fontSize:12,
                boxShadow: active ? `0 0 0 3px #007AFF44` : "none",
                border: active ? `2px solid #007AFF` : "2px solid transparent",
              }}>
                {done
                  ? <Icon name="check" size={14} color="#fff" />
                  : <span style={{ color:"#fff" }}>{i+1}</span>
                }
              </div>
              <span style={{ fontSize:10, color: active ? "#16A34A" : "#374151", whiteSpace:"nowrap" }}>{s}</span>
            </div>
            {i < STAGES.length - 1 && (
              <div style={{ width:26, height:2, background: done ? "#16A34A" : "rgba(22,163,74,0.05)", margin:"0 2px", marginBottom:18 }} />
            )}
          </div>
        );
      })}
      {rejected && (
        <span style={{ color:G.statusColors.Rejected, fontWeight:700, marginLeft:14, display:"flex", alignItems:"center", gap:6 }}>
          <Icon name="x" size={14} color={G.statusColors.Rejected} /> REJECTED
        </span>
      )}
    </div>
  );
}

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const color = G.statusColors[status] || "#888";
  return (
    <span style={{
      background: color + "15", color, border: `1px solid ${color}66`,
      borderRadius:50, padding:"3px 12px", fontSize:11, whiteSpace:"nowrap",
      ...F.medium,
    }}>{status}</span>
  );
}

// ─── KPI TILE ─────────────────────────────────────────────────────────────────
function KpiTile({ label, value, color = "#16A34A", iconName }) {
  const { isMobile } = useResponsive();
  return (
    <div className="kpi-tile" style={css.glass({ padding: isMobile ? "12px 14px" : "18px 20px", minWidth: isMobile ? "calc(50% - 5px)" : 130, flex:1 })}>
      <div style={{ marginBottom:8 }}>
        <Icon name={iconName || "info"} size={18} color={color} />
      </div>
      <div style={{ fontSize:24, color, ...F.figure }}>{value}</div>
      <div style={{ fontSize:12, color:"#374151", marginTop:3, ...F.medium }}>{label}</div>
    </div>
  );
}

// ─── SEARCH BAR ───────────────────────────────────────────────────────────────
function SearchBar({ value, onChange }) {
  const { isMobile } = useResponsive();
  return (
    <div style={{ position:"relative", flex:1, maxWidth: isMobile ? "100%" : 380 }}>
      <span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", opacity:0.45, display:"flex" }}>
        <Icon name="search" size={14} color="#6B7280" />
      </span>
      <input
        placeholder={isMobile ? "Search..." : "Search loans, borrowers, cooperatives..."}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={css.input({ paddingLeft:36, borderRadius:50, background:"rgba(22,163,74,0.05)", backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)", ...F.body })}
      />
    </div>
  );
}

// ─── NOTIFICATION BELL ────────────────────────────────────────────────────────
function NotifBell({ notifications, onToggle, open, onMarkAllRead }) {
  const { isMobile } = useResponsive();
  const unread = notifications.filter(n => !n.read).length;
  return (
    <div style={{ position:"relative" }}>
      <button onClick={onToggle} style={{ background:"none", border:"none", cursor:"pointer", padding:6, position:"relative", display:"flex" }}>
        <Icon name="bell" size={18} color="rgba(22,163,74,0.90)" />
        {unread > 0 && (
          <span style={{
            position:"absolute", top:2, right:2, background:"#DC2626",
            borderRadius:"50%", width:14, height:14, fontSize:9,
            display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700,
          }}>{unread}</span>
        )}
      </button>
      {open && (
        <div style={{
          position:"absolute", right:0, top:42,
          width: isMobile ? "calc(100vw - 24px)" : 340,
          maxHeight:420, overflowY:"auto",
          zIndex:1000,
          // Solid opaque background — no bleed-through
          background:"#FFFFFF",
          border:"1px solid rgba(22,163,74,0.15)",
          borderRadius:16,
          boxShadow:"0 16px 48px rgba(0,0,0,0.70), 0 2px 0 rgba(22,163,74,0.07) inset",
        }}>
          {/* Header */}
          <div style={{
            padding:"12px 16px 10px",
            borderBottom:"1px solid rgba(22,163,74,0.07)",
            display:"flex", alignItems:"center", justifyContent:"space-between",
            background:"#FFFFFF",
            position:"sticky", top:0, zIndex:1,
          }}>
            <span style={{ fontSize:13, color:"#111827", ...F.medium }}>
              Notifications {unread > 0 && <span style={{ background:"#DC2626", borderRadius:99, padding:"1px 7px", fontSize:10, marginLeft:6, color:"#fff", fontWeight:700 }}>{unread}</span>}
            </span>
            {unread > 0 && (
              <button onClick={onMarkAllRead} style={{
                background:"none", border:"none", cursor:"pointer",
                fontSize:11, color:"#16A34A", ...F.body, padding:"2px 4px",
              }}>Mark all read</button>
            )}
          </div>

          {/* Items */}
          {notifications.length === 0 ? (
            <div style={{ padding:"28px 16px", textAlign:"center", color:"#6B7280", fontSize:12, ...F.body }}>
              No notifications
            </div>
          ) : notifications.map((n, i) => (
            <div key={n.id} style={{
              padding:"11px 16px",
              borderBottom: i < notifications.length - 1 ? "1px solid rgba(125,211,252,0.07)" : "none",
              background: n.read ? "transparent" : "rgba(22,163,74,0.05)",
              transition:"background 0.15s",
            }}>
              <div style={{
                fontSize:12, ...F.medium,
                color: n.read ? "#6B7280" : "#111827",
                marginBottom:3,
              }}>{n.title}</div>
              <div style={{ fontSize:11, color:"#374151", lineHeight:1.45, ...F.body }}>{n.message}</div>
              <div style={{ fontSize:10, color:"#6B7280", marginTop:4, ...F.body }}>{n.time}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
function Sidebar({ user, activePage, onNav, onLogout, mobileOpen, onMobileClose, isMobile, onReset }) {
  const groups = NAV_ITEMS[user.role] || [];

  const content = (
    <div style={{
      ...css.glassMed({ borderRadius: isMobile ? "0 20px 20px 0" : 0, borderRight:"1px solid rgba(22,163,74,0.20)" }),
      width:224, height:"100%", display:"flex", flexDirection:"column", paddingTop:24, flexShrink:0,
    }}>
      <div style={{ padding:"0 20px 20px", borderBottom:"1px solid rgba(22,163,74,0.12)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <div style={{ fontSize:13, color:"#15803D", letterSpacing:0.5, ...F.heading, lineHeight:1.2 }}>DAGDAG PUHUNAN</div><div style={{ fontSize:9, color:"#16A34A", letterSpacing:1.0, fontWeight:700, marginTop:1 }}>ZERO INTEREST</div>
          <div style={{ fontSize:10, color:"rgba(125,211,252,0.5)", marginTop:3, ...F.body }}>LGU San Pedro, Laguna</div>
        </div>
        {isMobile && (
          <button onClick={onMobileClose} style={{ background:"none", border:"none", cursor:"pointer", padding:4, display:"flex" }}>
            <Icon name="x" size={18} color="#374151" />
          </button>
        )}
      </div>

      <div style={{ flex:1, padding:"12px 10px", overflowY:"auto" }}>
        {groups.map(g => (
          <div key={g.group} style={{ marginBottom:18 }}>
            <div style={{ fontSize:9, color:"#6B7280", padding:"0 10px 6px", letterSpacing:1.5, textTransform:"uppercase", ...F.bold }}>
              {g.group}
            </div>
            {g.items.map(item => {
              const active = activePage === item.id;
              return (
                <button key={item.id} className={`nav-item${active?" active":""}`} onClick={() => { onNav(item.id); if (isMobile) onMobileClose(); }} style={{
                  display:"flex", alignItems:"center", gap:9, width:"100%", padding:"10px 12px",
                  background: active ? "rgba(22,163,74,0.10)" : "transparent",
                  border: active ? `1px solid #007AFF55` : "1px solid transparent",
                  borderRadius:11, color: active ? "#16A34A" : "#374151",
                  cursor:"pointer", fontSize:13, textAlign:"left", transition:"all 0.15s",
                  ...F.body, ...(active ? F.medium : {}),
                }}>
                  <Icon name={item.icon} size={14} color={active ? "#16A34A" : "#374151"} />
                  {item.label}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div style={{ padding:"16px 14px", borderTop:"1px solid rgba(22,163,74,0.12)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
          <div style={{ width:32, height:32, borderRadius:"50%", background:"rgba(22,163,74,0.10)", border:"1px solid rgba(125,211,252,0.3)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <Icon name="user" size={14} color={"#16A34A"} />
          </div>
          <div style={{ minWidth:0 }}>
            <div style={{ fontSize:12, color:"#fff", ...F.medium, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user.name}</div>
            <div style={{ fontSize:10, color:"#374151", ...F.body }}>
              {user.role==="lgu_admin"?"LGU Admin":user.role==="coop_officer"?"Coop Officer":user.role==="msme_borrower"?"MSME Borrower":"City Councilor"}
            </div>
          </div>
        </div>
        <button onClick={onLogout} style={{
          display:"flex", alignItems:"center", justifyContent:"center", gap:7, background:"rgba(22,163,74,0.05)",
          border:"1px solid #E5E7EB", borderRadius:50, color:"#374151",
          padding:"7px 14px", fontSize:11, cursor:"pointer", width:"100%", ...F.body,
        }}>
          <Icon name="logout" size={12} color="#374151" />
          Sign Out
        </button>
        {onReset && (
          <button onClick={()=>{ if(window.confirm("Reset all demo data to original seed? This clears localStorage.")) onReset(); }} style={{
            display:"flex", alignItems:"center", justifyContent:"center", gap:6, background:"transparent",
            border:"none", borderRadius:50, color:"#9CA3AF",
            padding:"6px 14px", fontSize:10, cursor:"pointer", width:"100%", marginTop:4, ...F.body,
          }}>
            <Icon name="refresh" size={10} color="rgba(22,163,74,0.40)" />
            Reset Demo Data
          </button>
        )}
      </div>
    </div>
  );

  if (!isMobile) return content;

  return (
    <>
      {mobileOpen && (
        <div onClick={onMobileClose} style={{
          position:"fixed", inset:0, background:"rgba(5,15,40,0.65)",
          backdropFilter:"blur(4px)", zIndex:200,
        }} />
      )}
      <div style={{
        position:"fixed", top:0, left:0, bottom:0, zIndex:201,
        transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
        transition:"transform 0.28s cubic-bezier(0.4,0,0.2,1)",
        width:240,
      }}>
        {content}
      </div>
    </>
  );
}

// ─── TOP NAV ──────────────────────────────────────────────────────────────────
function TopNav({ user, search, onSearch, notifications, notifOpen, onToggleNotif, onMarkAllRead, isMobile, onMenuOpen, backendOk, useBackend }) {
  return (
    <div style={{
      ...css.glassMed({ borderRadius:0, borderBottom:"1px solid rgba(22,163,74,0.20)" }),
      display:"flex", alignItems:"center", gap:isMobile ? 8 : 14,
      padding: isMobile ? "10px 14px" : "11px 24px",
      position:"sticky", top:0, zIndex:100,
    }}>
      {isMobile && (
        <button onClick={onMenuOpen} style={{ background:"none", border:"none", cursor:"pointer", padding:6, display:"flex", flexShrink:0 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(22,163,74,0.90)" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6"  x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      )}
      <SearchBar value={search} onChange={onSearch} />
      <div style={{ flex:1 }} />
      {useBackend && !isMobile && (
        <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:10, color:"#6B7280", ...F.body }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:backendOk?"#16A34A":"#FACC15", flexShrink:0 }} />
          {backendOk ? "Supabase connected" : "Offline mode"}
        </div>
      )}
      <NotifBell notifications={notifications} onToggle={onToggleNotif} open={notifOpen} onMarkAllRead={onMarkAllRead} />
      {!isMobile && (user.cooperative || user.business) && (
        <div style={{ fontSize:12, color:"#374151", paddingLeft:8, borderLeft:"1px solid #E5E7EB", ...F.body }}>
          {user.cooperative || user.business}
        </div>
      )}
    </div>
  );
}

// ─── MOCK CREDENTIALS ─────────────────────────────────────────────────────────
const CREDENTIALS = [
  { email:"maria@lgusanpedro.ph",        password:"Admin@2026",    userKey:"lgu"       },
  { email:"jose@coop.ph",                password:"Coop@2026",     userKey:"coop"      },
  { email:"ana@gmail.com",               password:"Msme@2026",     userKey:"msme"      },
  { email:"councilor.ligaya@sanpedro.ph",password:"Council@2026",  userKey:"councilor" },
];

const GOOGLE_ACCOUNTS = [
  { gmail:"maria.santos.lgu@gmail.com",  userKey:"lgu"       },
  { gmail:"jose.reyes.coop@gmail.com",   userKey:"coop"      },
  { gmail:"anacruz.msme@gmail.com",      userKey:"msme"      },
  { gmail:"ligaya.delacruz@gmail.com",   userKey:"councilor" },
];

// Google G SVG icon
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink:0 }}>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

// ─── LOGIN SCREEN ──────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const { isMobile } = useResponsive();
  const [step, setStep]           = useState("credentials");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [authedKey, setAuthedKey] = useState(null);

  const roles = [
    { key:"lgu",       label:"LGU Admin",           sub:"Maria Santos",         icon:"building",  color:"#16A34A" },
    { key:"coop",      label:"Cooperative Officer",  sub:"Jose Reyes",           icon:"handshake", color:"#16A34A" },
    { key:"msme",      label:"MSME Borrower",        sub:"Ana Cruz",             icon:"store",     color:"#FACC15" },
    { key:"councilor", label:"City Councilor",       sub:"Full LGU + Coop Access",  icon:"councilor", color:"#7C3AED" },
  ];

  const handleEmailLogin = () => {
    setError("");
    if (!email.trim()) { setError("Please enter your email address."); return; }
    if (!password)     { setError("Please enter your password."); return; }
    setLoading(true);
    setTimeout(() => {
      const match = CREDENTIALS.find(
        c => c.email.toLowerCase() === email.trim().toLowerCase() && c.password === password
      );
      setLoading(false);
      if (match) {
        // Log in directly — role is determined by credentials, no selection needed
        onLogin(MOCK_USERS[match.userKey]);
      } else {
        setError("Incorrect email or password. Please try again.");
      }
    }, 900);
  };

  const handleGoogleLogin = (gmail) => {
    setError("");
    setLoading(true);
    setTimeout(() => {
      const match = GOOGLE_ACCOUNTS.find(g => g.gmail === gmail);
      setLoading(false);
      if (match) {
        // Google login goes directly to the app — no role selection needed
        onLogin(MOCK_USERS[match.userKey]);
      } else {
        setError("Google account not registered in this system.");
      }
    }, 700);
  };

  const inputStyle = css.input({
    textAlign:"left", marginBottom:0,
    background:"#FFFFFF",
    border:"1px solid #E5E7EB",
    color:"#111827",
  });

  return (
    <div className="page-enter" style={{ ...css.body, display:"flex", alignItems: isMobile ? "flex-start" : "center", justifyContent:"center", minHeight:"100dvh", padding: isMobile ? "0" : "20px" }}>
      <div style={css.glass({ padding: isMobile ? "32px 20px 40px" : "44px 40px", maxWidth:440, width:"100%", textAlign:"center", borderRadius: isMobile ? 0 : 20, minHeight: isMobile ? "100dvh" : "auto" })}>

        {/* Logo & title */}
        <div style={{ display:"flex", justifyContent:"center", marginBottom:14 }}>
          <div style={{ width:56, height:56, borderRadius:16, background:"#DCFCE7", border:"1px solid #BBF7D0", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Icon name="building" size={28} color="#16A34A" />
          </div>
        </div>
        <div style={{ fontSize:24, letterSpacing:1.0, color:"#111827", ...F.heading, textTransform:"uppercase" }}>DAGDAG PUHUNAN</div><div style={{ fontSize:12, fontWeight:700, color:"#16A34A", letterSpacing:2.5, textTransform:"uppercase", marginTop:2 }}>ZERO INTEREST</div>
        <div style={{ fontSize:12, color:"#6B7280", marginBottom:28, marginTop:4, ...F.body }}>
          Loan Management Information System · LGU San Pedro, Laguna
        </div>

        {step === "credentials" && (
          <>
            {/* Google accounts */}
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:11, color:"#6B7280", marginBottom:10, ...F.medium, textTransform:"uppercase", letterSpacing:1 }}>Continue with Google</div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {GOOGLE_ACCOUNTS.map(g => {
                  const u = MOCK_USERS[g.userKey];
                  const roleLabels = { lgu_admin:"LGU Admin", coop_officer:"Coop Officer", msme_borrower:"MSME Borrower", city_councilor:"City Councilor" };
                  return (
                    <button key={g.gmail} onClick={() => handleGoogleLogin(g.gmail)} style={{
                      display:"flex", alignItems:"center", gap:10, width:"100%",
                      background:"#FFFFFF", border:"1px solid #E5E7EB", borderRadius:12,
                      padding:"10px 14px", cursor:"pointer", textAlign:"left",
                      boxShadow:"0 1px 3px rgba(17,24,39,0.06)", transition:"all 0.18s",
                    }}
                      onMouseEnter={e=>{ e.currentTarget.style.background="#F0FDF4"; e.currentTarget.style.borderColor="#16A34A"; }}
                      onMouseLeave={e=>{ e.currentTarget.style.background="#FFFFFF"; e.currentTarget.style.borderColor="#E5E7EB"; }}
                    >
                      <GoogleIcon />
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:12, color:"#111827", ...F.medium }}>{g.gmail}</div>
                        <div style={{ fontSize:10, color:"#6B7280", marginTop:1 }}>{roleLabels[u?.role]}</div>
                      </div>
                      <span style={{ fontSize:10, fontWeight:600, color:"#16A34A", background:"#DCFCE7", borderRadius:99, padding:"2px 8px", flexShrink:0 }}>Sign in</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Divider */}
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
              <div style={{ flex:1, height:1, background:"#E5E7EB" }} />
              <span style={{ fontSize:11, color:"#6B7280", ...F.body }}>or sign in with email</span>
              <div style={{ flex:1, height:1, background:"#E5E7EB" }} />
            </div>

            {/* Email */}
            <div style={{ marginBottom:12, textAlign:"left" }}>
              <label style={{ fontSize:11, color:"#374151", display:"block", marginBottom:5, ...F.medium, textTransform:"uppercase", letterSpacing:0.8 }}>Email Address</label>
              <div style={{ position:"relative" }}>
                <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", display:"flex", opacity:0.5 }}>
                  <Icon name="user" size={14} color="#16A34A" />
                </span>
                <input type="email" placeholder="you@example.com" value={email}
                  onChange={e=>{ setEmail(e.target.value); setError(""); }}
                  onKeyDown={e=>e.key==="Enter"&&handleEmailLogin()}
                  style={{ ...inputStyle, paddingLeft:36 }} />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom:20, textAlign:"left" }}>
              <label style={{ fontSize:11, color:"#374151", display:"block", marginBottom:5, ...F.medium, textTransform:"uppercase", letterSpacing:0.8 }}>Password</label>
              <div style={{ position:"relative" }}>
                <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", display:"flex", opacity:0.5 }}>
                  <Icon name="logs" size={14} color="#16A34A" />
                </span>
                <input type={showPass?"text":"password"} placeholder="Enter your password" value={password}
                  onChange={e=>{ setPassword(e.target.value); setError(""); }}
                  onKeyDown={e=>e.key==="Enter"&&handleEmailLogin()}
                  style={{ ...inputStyle, paddingLeft:36, paddingRight:40 }} />
                <button onClick={()=>setShowPass(v=>!v)} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", padding:4, display:"flex", opacity:0.55 }}>
                  <Icon name={showPass?"x":"search"} size={14} color="#6B7280" />
                </button>
              </div>
              <div style={{ textAlign:"right", marginTop:6 }}>
                <span style={{ fontSize:11, color:"#16A34A", cursor:"pointer", ...F.medium }}>Forgot password?</span>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ background:"#FEE2E2", border:"1px solid #FECACA", borderRadius:10, padding:"10px 14px", marginBottom:14, fontSize:12, color:"#DC2626", textAlign:"left", display:"flex", alignItems:"center", gap:8, ...F.body }}>
                <Icon name="alert" size={13} color="#DC2626" />{error}
              </div>
            )}

            {/* Sign In */}
            <button onClick={handleEmailLogin} disabled={loading} className="btn-primary"
              style={{ width:"100%", padding:"13px", fontSize:14, opacity:loading?0.7:1, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              {loading?<><Icon name="refresh" size={15} color="#fff"/> Signing in...</>:<><Icon name="logs" size={15} color="#fff"/> Sign In</>}
            </button>

            {/* Demo credentials */}
            <div style={{ marginTop:20, padding:"14px", background:"#F9FAFB", border:"1px solid #E5E7EB", borderRadius:12 }}>
              <div style={{ fontSize:10, color:"#6B7280", ...F.medium, marginBottom:8, textTransform:"uppercase", letterSpacing:0.8 }}>Demo Credentials — click to auto-fill</div>
              <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                {CREDENTIALS.map(c => {
                  const u = MOCK_USERS[c.userKey];
                  const rc = { lgu_admin:"#16A34A", coop_officer:"#2563EB", msme_borrower:"#D97706", city_councilor:"#7C3AED" };
                  const rb = { lgu_admin:"#DCFCE7", coop_officer:"#DBEAFE", msme_borrower:"#FEF9C3", city_councilor:"#EDE9FE" };
                  const rl = { lgu_admin:"LGU Admin", coop_officer:"Coop Officer", msme_borrower:"MSME Borrower", city_councilor:"City Councilor" };
                  return (
                    <button key={c.email} onClick={()=>{ setEmail(c.email); setPassword(c.password); setError(""); }}
                      style={{ background:"#FFFFFF", border:"1px solid #E5E7EB", borderRadius:8, cursor:"pointer", padding:"7px 10px", textAlign:"left", display:"flex", alignItems:"center", gap:8, boxShadow:"0 1px 2px rgba(17,24,39,0.04)" }}>
                      <span style={{ fontSize:10, fontWeight:600, color:rc[u.role], background:rb[u.role], padding:"2px 8px", borderRadius:99, whiteSpace:"nowrap", flexShrink:0 }}>{rl[u.role]}</span>
                      <span style={{ fontSize:10, color:"#374151", ...F.body, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.email}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ fontSize:10, color:"#9CA3AF", marginTop:16, ...F.body }}>Capstone thesis prototype · San Pedro, Laguna 2026</div>
          </>
        )}

        {step === "role" && (
          <>
            <div style={{ background:"#DCFCE7", border:"1px solid #BBF7D0", borderRadius:12, padding:"16px 14px", marginBottom:22, display:"flex", alignItems:"center", gap:10, ...F.body, fontSize:13, color:"#15803D" }}>
              <Icon name="check" size={16} color="#16A34A" />
              Identity verified. Redirecting...
            </div>
            <button onClick={()=>{ setStep("credentials"); setError(""); setPassword(""); }} className="btn-secondary" style={{ width:"100%", fontSize:13 }}>
              Back to Sign In
            </button>
          </>
        )}
      </div>
    </div>
  );
}


// ─── CONFIRM DIALOG ───────────────────────────────────────────────────────────
function ConfirmDialog({ title, message, confirmLabel = "Confirm", confirmColor = "#DC2626", onConfirm, onCancel }) {
  return (
    <div style={{
      position:"fixed", inset:0, background:"#374151", backdropFilter:"blur(8px)",
      zIndex:2000, display:"flex", alignItems:"center", justifyContent:"center", padding:24,
    }}>
      <div style={{
        background:"#FFFFFF", border:"1px solid rgba(22,163,74,0.15)",
        borderRadius:18, padding:28, maxWidth:420, width:"100%",
        boxShadow:"0 20px 60px rgba(0,0,0,0.70)",
      }}>
        <div style={{ fontSize:17, ...F.heading, marginBottom:10 }}>{title}</div>
        <div style={{ fontSize:13, color:"#374151", ...F.body, lineHeight:1.6, marginBottom:24 }}>{message}</div>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={onCancel} style={{
            flex:1, padding:"11px", background:"rgba(22,163,74,0.03)",
            border:"1px solid rgba(22,163,74,0.12)", borderRadius:50,
            color:"rgba(22,163,74,0.90)", cursor:"pointer", fontSize:13, ...F.medium,
          }}>Cancel</button>
          <button onClick={onConfirm} style={{
            flex:1, padding:"11px", background:confirmColor,
            border:"none", borderRadius:50, color:"#fff",
            cursor:"pointer", fontSize:13, ...F.medium,
          }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
function EmptyState({ icon = "file", message = "No records found.", sub = "" }) {
  return (
    <div style={{ textAlign:"center", padding:"48px 24px", color:"#6B7280" }}>
      <Icon name={icon} size={36} color="rgba(22,163,74,0.07)" style={{ display:"block", margin:"0 auto 14px" }} />
      <div style={{ fontSize:14, ...F.medium, color:"#374151" }}>{message}</div>
      {sub && <div style={{ fontSize:12, marginTop:6, ...F.body }}>{sub}</div>}
    </div>
  );
}

// ─── MODAL ────────────────────────────────────────────────────────────────────
function Modal({ onClose, title, children }) {
  const { isMobile } = useResponsive();
  return (
    <div style={{
      position:"fixed", inset:0, background:"#374151", backdropFilter:"blur(6px)",
      zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center",
      padding: isMobile ? 0 : 24,
    }}>
      <div style={css.glassMed({
        padding: isMobile ? "20px 16px" : 28,
        maxWidth: isMobile ? "100%" : 680,
        width:"100%",
        maxHeight: isMobile ? "100dvh" : "90dvh",
        borderRadius: isMobile ? "20px 20px 0 0" : 16,
        overflowY:"auto",
        ...(isMobile ? { position:"fixed", bottom:0, left:0, right:0 } : {}),
      })}>
        <div style={{ display:"flex", alignItems:"center", marginBottom:20 }}>
          <div style={{ fontSize: isMobile ? 15 : 17, flex:1, ...F.heading }}>{title}</div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#374151", cursor:"pointer", padding:4, display:"flex" }}>
            <Icon name="x" size={18} color="#374151" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── DASHBOARDS ───────────────────────────────────────────────────────────────
function LguDashboard({ store = {} }) {
  const { isMobile } = useResponsive();
  const apps = store.apps || [];
  const repayments = store.repayments || [];
  const overdue     = apps.filter(a=>a.status==="Overdue");
  const pendingVerif= apps.filter(a=>a.status==="Under Verification"||a.status==="Pending");
  const underCI     = apps.filter(a=>a.status==="Under CI");
  const active      = apps.filter(a=>a.status==="Active");
  const totalDisbursed = repayments.reduce((s,r)=>s+r.loaned,0);
  const totalPaid      = repayments.reduce((s,r)=>s+r.paid,0);
  const totalBalance   = repayments.reduce((s,r)=>s+r.balance,0);
  const overdueBalance = repayments.filter(r=>r.status==="Overdue").reduce((s,r)=>s+r.balance,0);
  const repayRate   = totalDisbursed>0?Math.round(totalPaid/totalDisbursed*100):0;
  const statusCounts= apps.reduce((acc,a)=>{ acc[a.status]=(acc[a.status]||0)+1; return acc; },{});
  const pieData     = Object.entries(statusCounts).map(([name,value])=>({ name, value }));
  const COLORS      = Object.values(G.statusColors);
  const today       = new Date().toISOString().slice(0,10);
  const dueToday    = repayments.filter(r=>r.dueDate===today&&r.status!=="Closed");

  // upcoming due in next 7 days
  const in7 = new Date(); in7.setDate(in7.getDate()+7);
  const upcomingDue = repayments.filter(r=>r.status==="Active"&&r.dueDate&&new Date(r.dueDate)<=in7&&new Date(r.dueDate)>new Date());

  const AlertRow = ({icon,color,bg,label,count,sub}) => count===0?null:(
    <div style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:bg,border:`1px solid ${color}33`,borderRadius:10,marginBottom:8 }}>
      <Icon name={icon} size={16} color={color} />
      <div style={{ flex:1 }}>
        <span style={{ fontSize:13,...F.medium,color:"#111827" }}>{label}</span>
        {sub&&<span style={{ fontSize:11,color:"#6B7280",...F.body,marginLeft:6 }}>{sub}</span>}
      </div>
      <span style={{ fontSize:13,fontWeight:700,color,fontVariantNumeric:"tabular-nums" }}>{count}</span>
    </div>
  );

  return (
    <div style={{ padding: isMobile?16:28 }}>
      {/* Header */}
      <div style={{ marginBottom:20 }}>
        <h2 style={{ fontSize: isMobile?18:22, margin:"0 0 3px", ...F.heading }}>LGU Admin Overview</h2>
        <p style={{ color:"#6B7280", margin:0, fontSize:12, ...F.body }}>DAGDAG PUHUNAN, ZERO INTEREST · San Pedro, Laguna · {new Date().toLocaleDateString("en-PH",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</p>
      </div>

      {/* ── PRIORITY ALERTS (shown first) ─────────────────────────────────── */}
      {(overdue.length>0||pendingVerif.length>0||dueToday.length>0||upcomingDue.length>0) && (
        <div style={{ ...css.glass({ padding:"14px 16px", marginBottom:20, border:"1px solid rgba(220,38,38,0.20)" }) }}>
          <div style={{ fontSize:11,...F.medium,color:"#6B7280",textTransform:"uppercase",letterSpacing:0.9,marginBottom:10 }}>⚡ Priority Alerts</div>
          <AlertRow icon="alert"        color="#DC2626" bg="rgba(220,38,38,0.06)"   label="Overdue Accounts"      count={overdue.length}       sub={`P${overdueBalance.toLocaleString()} total unpaid balance`} />
          <AlertRow icon="clock"        color="#D97706" bg="rgba(217,119,6,0.06)"   label="Due Today"             count={dueToday.length}       sub="payments due for collection" />
          <AlertRow icon="clock"        color="#D97706" bg="rgba(217,119,6,0.04)"   label="Due in 7 Days"         count={upcomingDue.length}    sub="upcoming collections" />
          <AlertRow icon="verification" color="#7C3AED" bg="rgba(124,58,237,0.06)"  label="Pending Verification"  count={pendingVerif.length}   sub="awaiting checklist review" />
          <AlertRow icon="ci"           color="#2563EB" bg="rgba(37,99,235,0.06)"   label="Under Credit Investigation" count={underCI.length}  sub="pending CI assessment" />
        </div>
      )}

      {/* ── KPI TILES ──────────────────────────────────────────────────────── */}
      <div style={{ display:"grid", gridTemplateColumns: isMobile?"1fr 1fr":"repeat(6,1fr)", gap:10, marginBottom:20 }}>
        {[
          { icon:"applications", label:"Total Apps",     value:apps.length,                     color:"#16A34A", sub:"all time" },
          { icon:"verification", label:"Active Loans",   value:active.length,                   color:"#16A34A", sub:"ongoing" },
          { icon:"alert",        label:"Overdue",        value:overdue.length,                  color:"#DC2626", sub:"action needed" },
          { icon:"money",        label:"Disbursed",      value:"P"+totalDisbursed.toLocaleString(), color:"#16A34A", sub:"total released" },
          { icon:"trendUp",      label:"Collected",      value:"P"+totalPaid.toLocaleString(),  color:"#16A34A", sub:"payments received" },
          { icon:"clock",        label:"Repay Rate",     value:repayRate+"%",                   color:repayRate>=80?"#16A34A":repayRate>=50?"#D97706":"#DC2626", sub:"collection efficiency" },
        ].map(k=>(
          <div key={k.label} className="kpi-tile" style={css.glass({ padding:"14px 16px" })}>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6 }}>
              <Icon name={k.icon} size={16} color={k.color} />
              <span style={{ fontSize:9,color:"#9CA3AF",...F.medium,textTransform:"uppercase",letterSpacing:0.7 }}>{k.sub}</span>
            </div>
            <div style={{ fontSize: isMobile?18:22, fontWeight:800, color:k.color, fontVariantNumeric:"tabular-nums", lineHeight:1 }}>{k.value}</div>
            <div style={{ fontSize:11,color:"#6B7280",marginTop:3,...F.medium }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* ── CHARTS ROW ─────────────────────────────────────────────────────── */}
      <div style={{ display:"grid", gridTemplateColumns: isMobile?"1fr":"1.1fr 0.9fr", gap:16, marginBottom:20 }}>

        {/* Pie with numerical legend */}
        <div style={css.glass({ padding:20 })}>
          <div style={{ fontSize:14,...F.medium,marginBottom:14 }}>Loan Status Distribution</div>
          <div style={{ display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
            <ResponsiveContainer width={isMobile?120:150} height={isMobile?120:150}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={isMobile?32:40} outerRadius={isMobile?55:65} dataKey="value" strokeWidth={2} stroke="rgba(255,255,255,0.6)">
                  {pieData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background:"#FFFFFF",border:"1px solid #E5E7EB",borderRadius:8,fontSize:11,boxShadow:"0 4px 12px rgba(0,0,0,0.10)" }} />
              </PieChart>
            </ResponsiveContainer>
            {/* Numerical legend */}
            <div style={{ flex:1, display:"flex", flexDirection:"column", gap:5 }}>
              {pieData.sort((a,b)=>b.value-a.value).map((d,i)=>{
                const col = COLORS[Object.keys(statusCounts).indexOf(d.name) % COLORS.length];
                const pct = Math.round(d.value/apps.length*100);
                return (
                  <div key={d.name} style={{ display:"flex",alignItems:"center",gap:7 }}>
                    <span style={{ width:8,height:8,borderRadius:2,background:col,flexShrink:0 }} />
                    <span style={{ fontSize:11,color:"#374151",flex:1,...F.body }}>{d.name}</span>
                    <span style={{ fontSize:12,fontWeight:700,color:"#111827",fontVariantNumeric:"tabular-nums" }}>{d.value}</span>
                    <span style={{ fontSize:10,color:"#9CA3AF",width:28,textAlign:"right",fontVariantNumeric:"tabular-nums" }}>{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Collection summary with bar */}
        <div style={css.glass({ padding:20 })}>
          <div style={{ fontSize:14,...F.medium,marginBottom:14 }}>Collection Summary</div>
          <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
            {[
              { label:"Total Disbursed", value:totalDisbursed, color:"#E5E7EB", pct:100 },
              { label:"Amount Collected",value:totalPaid,      color:"#16A34A", pct:totalDisbursed>0?Math.round(totalPaid/totalDisbursed*100):0 },
              { label:"Outstanding",     value:totalBalance,   color:"#D97706", pct:totalDisbursed>0?Math.round(totalBalance/totalDisbursed*100):0 },
              { label:"Overdue Balance", value:overdueBalance, color:"#DC2626", pct:totalDisbursed>0?Math.round(overdueBalance/totalDisbursed*100):0 },
            ].map(row=>(
              <div key={row.label}>
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4 }}>
                  <span style={{ fontSize:11,color:"#6B7280",...F.body }}>{row.label}</span>
                  <span style={{ fontSize:12,fontWeight:700,color:"#111827",fontVariantNumeric:"tabular-nums" }}>P{row.value.toLocaleString()} <span style={{ fontSize:10,color:"#9CA3AF",fontWeight:400 }}>({row.pct}%)</span></span>
                </div>
                <div style={{ height:5,background:"#F3F4F6",borderRadius:99,overflow:"hidden" }}>
                  <div style={{ height:"100%",width:`${row.pct}%`,background:row.color,borderRadius:99,transition:"width 0.6s ease" }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:14,padding:"10px 12px",background:"rgba(22,163,74,0.06)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"space-between" }}>
            <span style={{ fontSize:12,color:"#374151",...F.medium }}>Repayment Rate</span>
            <span style={{ fontSize:20,fontWeight:800,color:repayRate>=80?"#16A34A":repayRate>=50?"#D97706":"#DC2626",fontVariantNumeric:"tabular-nums" }}>{repayRate}%</span>
          </div>
        </div>
      </div>

      {/* ── DISBURSEMENT TREND ─────────────────────────────────────────────── */}
      <div style={css.glass({ padding:20 })}>
        <div style={{ fontSize:14,...F.medium,marginBottom:14 }}>Disbursement Trend (PHP)</div>
        <ResponsiveContainer width="100%" height={isMobile?140:180}>
          <BarChart data={DISBURSEMENT_TREND} barSize={isMobile?14:20}>
            <XAxis dataKey="month" tick={{ fill:"#6B7280",fontSize:10,...F.chart }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill:"#6B7280",fontSize:10,...F.chart }} axisLine={false} tickLine={false} width={45} tickFormatter={v=>"P"+Math.round(v/1000)+"k"} />
            <CartesianGrid stroke="#F3F4F6" vertical={false} />
            <Tooltip contentStyle={{ background:"#FFFFFF",border:"1px solid #E5E7EB",borderRadius:8,fontSize:11,boxShadow:"0 4px 12px rgba(0,0,0,0.10)" }} formatter={v=>["P"+v.toLocaleString(),"Amount"]} />
            <Bar dataKey="amount" fill="#16A34A" radius={[6,6,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function CoopDashboard({ store = {} }) {
  const { isMobile } = useResponsive();
  const user = store.user || {};
  const apps = store.apps || [];
  const repayments = store.repayments || [];
  const overdue    = repayments.filter(r=>r.status==="Overdue");
  const today      = new Date().toISOString().slice(0,10);
  const dueToday   = repayments.filter(r=>r.dueDate===today&&r.status!=="Closed");
  const pendingV   = apps.filter(a=>a.status==="Under Verification"||a.status==="Pending");
  const totalBalance = repayments.reduce((s,r)=>s+r.balance,0);
  const in7 = new Date(); in7.setDate(in7.getDate()+7);
  const upcoming = repayments.filter(r=>r.status==="Active"&&r.dueDate&&new Date(r.dueDate)<=in7&&new Date(r.dueDate)>new Date());

  return (
    <div style={{ padding: isMobile?16:28 }}>
      <h2 style={{ fontSize: isMobile?18:22, margin:"0 0 3px", ...F.heading }}>Cooperative Officer</h2>
      <p style={{ color:"#6B7280",margin:"0 0 18px",fontSize:12,...F.body }}>{user.cooperative||"San Pedro Central Coop"} · {user.name}</p>

      {/* Priority alerts */}
      {(overdue.length>0||dueToday.length>0||pendingV.length>0) && (
        <div style={{ ...css.glass({ padding:"12px 14px",marginBottom:18,border:"1px solid rgba(220,38,38,0.15)" }) }}>
          <div style={{ fontSize:10,...F.medium,color:"#6B7280",textTransform:"uppercase",letterSpacing:0.9,marginBottom:8 }}>⚡ Needs Attention</div>
          {overdue.length>0&&<div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 10px",background:"rgba(220,38,38,0.06)",borderRadius:8,marginBottom:5 }}>
            <span style={{ fontSize:12,color:"#111827",...F.medium }}>🔴 Overdue Accounts — P{repayments.filter(r=>r.status==="Overdue").reduce((s,r)=>s+r.balance,0).toLocaleString()} unpaid</span>
            <span style={{ fontSize:13,fontWeight:700,color:"#DC2626" }}>{overdue.length}</span>
          </div>}
          {dueToday.length>0&&<div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 10px",background:"rgba(217,119,6,0.06)",borderRadius:8,marginBottom:5 }}>
            <span style={{ fontSize:12,color:"#111827",...F.medium }}>🟡 Due Today</span>
            <span style={{ fontSize:13,fontWeight:700,color:"#D97706" }}>{dueToday.length}</span>
          </div>}
          {upcoming.length>0&&<div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 10px",background:"rgba(217,119,6,0.04)",borderRadius:8,marginBottom:5 }}>
            <span style={{ fontSize:12,color:"#111827",...F.medium }}>📅 Due in 7 Days</span>
            <span style={{ fontSize:13,fontWeight:700,color:"#D97706" }}>{upcoming.length}</span>
          </div>}
          {pendingV.length>0&&<div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 10px",background:"rgba(124,58,237,0.06)",borderRadius:8 }}>
            <span style={{ fontSize:12,color:"#111827",...F.medium }}>🔵 Pending Verification</span>
            <span style={{ fontSize:13,fontWeight:700,color:"#7C3AED" }}>{pendingV.length}</span>
          </div>}
        </div>
      )}

      {/* KPIs */}
      <div style={{ display:"grid",gridTemplateColumns: isMobile?"1fr 1fr":"repeat(5,1fr)",gap:10,marginBottom:18 }}>
        {[
          { icon:"applications",label:"Total Apps",   value:apps.length,              color:"#16A34A" },
          { icon:"verification", label:"For Verif.",  value:pendingV.length,          color:"#7C3AED" },
          { icon:"ci",           label:"Under CI",    value:apps.filter(a=>a.status==="Under CI").length, color:"#2563EB" },
          { icon:"alert",        label:"Overdue",     value:overdue.length,           color:"#DC2626" },
          { icon:"money",        label:"Outstanding", value:"P"+totalBalance.toLocaleString(), color:"#D97706" },
        ].map(k=>(
          <div key={k.label} className="kpi-tile" style={css.glass({ padding:"14px 16px" })}>
            <Icon name={k.icon} size={16} color={k.color} style={{ marginBottom:6 }} />
            <div style={{ fontSize: isMobile?18:20,fontWeight:800,color:k.color,fontVariantNumeric:"tabular-nums",marginTop:6 }}>{k.value}</div>
            <div style={{ fontSize:10,color:"#6B7280",marginTop:2,...F.medium }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Collections list with balances */}
      <div style={css.glass({ padding:20 })}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14 }}>
          <div style={{ fontSize:14,...F.medium }}>Collection Tracker</div>
          <span style={{ fontSize:11,color:"#6B7280",...F.body }}>P{totalBalance.toLocaleString()} total outstanding</span>
        </div>
        {repayments.length===0&&<div style={{ textAlign:"center",padding:24,color:"#9CA3AF",fontSize:13 }}>No active repayments</div>}
        {repayments.filter(r=>r.status!=="Closed").sort((a,b)=>a.status==="Overdue"?-1:1).map(r=>(
          <div key={r.id} style={{ display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:"1px solid #F3F4F6" }}>
            <div style={{ width:8,height:8,borderRadius:"50%",background:r.status==="Overdue"?"#DC2626":"#16A34A",flexShrink:0 }} />
            <div style={{ flex:1,minWidth:0 }}>
              <div style={{ fontSize:12,...F.medium,color:"#111827" }}>{r.name}</div>
              <div style={{ fontSize:10,color:"#6B7280",...F.body }}>{r.ref} · Due {r.dueDate}</div>
            </div>
            <div style={{ textAlign:"right",flexShrink:0 }}>
              <div style={{ fontSize:12,fontWeight:700,color:r.status==="Overdue"?"#DC2626":"#111827",fontVariantNumeric:"tabular-nums" }}>P{r.balance.toLocaleString()}</div>
              <div style={{ fontSize:10,color:"#9CA3AF" }}>balance</div>
            </div>
            <StatusBadge status={r.status} />
          </div>
        ))}
      </div>
    </div>
  );
}

function MsmeDashboard({ store = {} }) {
  const { isMobile } = useResponsive();
  const user = store.user || {};
  const apps = store.apps || [];
  const repayments = store.repayments || [];
  const myApp   = apps.find(a=>a.name===user.name) || apps[0] || {};
  const myRepay = repayments.find(r=>r.ref===myApp.ref);
  const paidPct = myRepay&&myRepay.loaned>0 ? Math.round(myRepay.paid/myRepay.loaned*100) : 0;
  const isOverdue = myRepay?.status==="Overdue";
  const isDueSoon = myRepay?.dueDate && (() => { const d=new Date(myRepay.dueDate),n=new Date(); return (d-n)<=(7*86400000)&&d>n; })();

  return (
    <div style={{ padding: isMobile?16:28 }}>
      <h2 style={{ fontSize: isMobile?18:22, margin:"0 0 3px", ...F.heading }}>Welcome, {user.name?.split(" ")[0]}</h2>
      <p style={{ color:"#6B7280",margin:"0 0 18px",fontSize:12,...F.body }}>{user.business||"MSME Borrower"} · {user.barangay||"San Pedro"}</p>

      {/* Priority alert for borrower */}
      {(isOverdue||isDueSoon) && (
        <div style={{ ...css.glass({ padding:"12px 14px",marginBottom:18,border:`1px solid ${isOverdue?"rgba(220,38,38,0.30)":"rgba(217,119,6,0.25)"}` }) }}>
          {isOverdue
            ? <div style={{ display:"flex",alignItems:"center",gap:8,color:"#DC2626",...F.medium,fontSize:13 }}><Icon name="alert" size={16} color="#DC2626" /> Your payment is overdue! Please contact your cooperative officer immediately.</div>
            : <div style={{ display:"flex",alignItems:"center",gap:8,color:"#D97706",...F.medium,fontSize:13 }}><Icon name="clock" size={16} color="#D97706" /> Payment due on {myRepay?.dueDate} — please prepare P{myRepay?.due?.toLocaleString()}.</div>
          }
        </div>
      )}

      {/* Loan summary tiles */}
      <div style={{ display:"grid",gridTemplateColumns: isMobile?"1fr 1fr":"repeat(4,1fr)",gap:10,marginBottom:18 }}>
        {[
          { icon:"applications",label:"Reference",     value:myApp.ref||"—",              color:"#16A34A" },
          { icon:"money",       label:"Loan Amount",   value:myApp.amount?"P"+myApp.amount.toLocaleString():"—", color:"#16A34A" },
          { icon:"verification",label:"Amount Paid",   value:myRepay?"P"+myRepay.paid.toLocaleString():"P0",     color:"#16A34A" },
          { icon:"clock",       label:"Balance Left",  value:myRepay?"P"+myRepay.balance.toLocaleString():`P${myApp.amount?.toLocaleString()||0}`, color:isOverdue?"#DC2626":"#D97706" },
        ].map(k=>(
          <div key={k.label} className="kpi-tile" style={css.glass({ padding:"14px 16px" })}>
            <Icon name={k.icon} size={16} color={k.color} />
            <div style={{ fontSize: isMobile?14:16,fontWeight:800,color:k.color,fontVariantNumeric:"tabular-nums",marginTop:6,wordBreak:"break-all" }}>{k.value}</div>
            <div style={{ fontSize:10,color:"#6B7280",marginTop:2,...F.medium }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Repayment progress */}
      {myRepay && (
        <div style={css.glass({ padding:20,marginBottom:16 })}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
            <div style={{ fontSize:14,...F.medium }}>Repayment Progress</div>
            <div style={{ fontSize:22,fontWeight:800,color:paidPct>=80?"#16A34A":paidPct>=50?"#D97706":"#DC2626",fontVariantNumeric:"tabular-nums" }}>{paidPct}%</div>
          </div>
          <div style={{ height:10,background:"#F3F4F6",borderRadius:99,overflow:"hidden",marginBottom:10 }}>
            <div style={{ height:"100%",width:`${paidPct}%`,background:paidPct>=80?"#16A34A":paidPct>=50?"#D97706":"#DC2626",borderRadius:99,transition:"width 0.8s ease" }} />
          </div>
          <div style={{ display:"flex",justifyContent:"space-between",fontSize:11,color:"#6B7280",...F.body }}>
            <span>P{myRepay.paid.toLocaleString()} paid</span>
            <span>P{myRepay.balance.toLocaleString()} remaining of P{myRepay.loaned.toLocaleString()}</span>
          </div>
          {myRepay.dueDate&&<div style={{ marginTop:10,padding:"8px 12px",background:"rgba(22,163,74,0.06)",borderRadius:8,fontSize:12,color:"#374151",...F.body }}>
            📅 Next payment: <strong>P{myRepay.due.toLocaleString()}</strong> due on <strong>{myRepay.dueDate}</strong>
          </div>}
        </div>
      )}

      {/* Loan stage */}
      <div style={css.glass({ padding:20 })}>
        <div style={{ fontSize:14,...F.medium,marginBottom:12 }}>Loan Application Stage</div>
        <StageTracker status={myApp.status} />
        <div style={{ marginTop:10,display:"flex",alignItems:"center",gap:10 }}>
          <StatusBadge status={myApp.status} />
          <span style={{ fontSize:12,color:"#6B7280" }}>Officer: {myApp.officer||"Assigned officer will contact you"}</span>
        </div>
      </div>
    </div>
  );
}

// ─── APPLICATIONS ─────────────────────────────────────────────────────────────
function ApplicationsPage({ store = {} }) {
  const { isMobile } = useResponsive();
  const { user = {}, search = "", apps = [], updateAppStatus, addApp } = store;
  const [filter, setFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [confirm, setConfirm] = useState(null); // { action, label, color }

  const isMsme = user.role === "msme_borrower";
  const filtered = apps.filter(a => {
    const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.ref.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filter==="All" || a.status===filter;
    const matchRole   = isMsme ? a.name===user.name : true;
    return matchSearch && matchStatus && matchRole;
  });

  return (
    <div style={{ padding: isMobile ? 16 : 28 }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
        <h2 style={{ fontSize:20, margin:0, flex:1, ...F.heading }}>Loan Applications</h2>
        {(user.role==="msme_borrower" || user.role==="lgu_admin") && (
          <button onClick={()=>setShowModal("new")} className="btn-primary" style={{ display:"flex", alignItems:"center", gap:6 }}>
            <Icon name="apply" size={13} color="#fff" /> New Application
          </button>
        )}
      </div>

      <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginBottom:18 }}>
        {["All","Pending","Under Verification","Under CI","Approved","Active","Overdue","Closed","Rejected"].map(s => (
          <button key={s} onClick={()=>setFilter(s)} style={css.pill(filter===s ? "#16A34A" : "rgba(22,163,74,0.03)", { fontSize:11, padding:"5px 13px" })}>{s}</button>
        ))}
      </div>

      <div style={{ overflowX:"auto", WebkitOverflowScrolling:"touch", borderRadius:20, paddingBottom:2 }}>
      <div style={{ ...css.glass({ overflow:"visible", padding:0 }), minWidth:600 }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead>
            <tr style={{ borderBottom:"1px solid rgba(22,163,74,0.12)" }}>
              {["Ref #","Borrower","Business","Barangay","Amount","Status","Officer","Action"].map(h => (
                <th key={h} style={{ padding:"12px 14px", textAlign:"left", color:"#374151", fontSize:10, textTransform:"uppercase", letterSpacing:0.8, ...F.medium }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={8} style={{ padding:0 }}>
                <EmptyState icon="applications" message="No applications match your filter." sub="Try changing the status filter or search term." />
              </td></tr>
            )}
            {filtered.map(a => (
              <tr key={a.id} style={{ borderBottom:"1px solid rgba(22,163,74,0.05)", transition:"background 0.15s" }}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(22,163,74,0.02)"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}
              >
                <td style={{ padding:"11px 14px", color:"#16A34A", ...F.figure }}>{a.ref}</td>
                <td style={{ padding:"11px 14px", ...F.body }}>{a.name}</td>
                <td style={{ padding:"11px 14px", color:"#374151", ...F.body }}>{a.business}</td>
                <td style={{ padding:"11px 14px", color:"#374151", ...F.body }}>{a.barangay}</td>
                <td style={{ padding:"11px 14px", ...F.figure }}>P{a.amount.toLocaleString()}</td>
                <td style={{ padding:"11px 14px" }}><StatusBadge status={a.status} /></td>
                <td style={{ padding:"11px 14px", color:"#374151", ...F.body }}>{a.officer}</td>
                <td style={{ padding:"11px 14px" }}>
                  <button onClick={()=>setSelected(a)} style={css.pill(`rgba(22,163,74,0.15)`, { fontSize:11, padding:"4px 12px" })}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>

      {selected && (
        <Modal onClose={()=>setSelected(null)} title={`Application ${selected.ref}`}>
          <StageTracker status={selected.status} />
          <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 10 : 12, marginTop:14 }}>
            {[["Borrower",selected.name],["Business",selected.business],["Category",selected.category],["Barangay",selected.barangay],
              ["Amount",`P${selected.amount.toLocaleString()}`],["Term",`${selected.term} months`],
              ["Purpose",selected.purpose],["Fund Source",selected.fundSource],
              ["Status",selected.status],["Submitted",selected.submitted]].map(([k,v]) => (
              <div key={k} style={{ background:"rgba(22,163,74,0.03)", borderRadius:10, padding:"10px 14px" }}>
                <div style={{ fontSize:10, color:"#6B7280", textTransform:"uppercase", letterSpacing:0.9, ...F.medium }}>{k}</div>
                <div style={{ fontSize:14, marginTop:3, ...F.body }}>{v}</div>
              </div>
            ))}
          </div>
          {(user.role==="lgu_admin"||user.role==="city_councilor") && selected.status==="Approved" && (
            <button onClick={()=>setConfirm({ action:"Released", label:"Release Loan", color:"#16A34A", msg:`Release P${selected.amount.toLocaleString()} to ${selected.name}? This cannot be undone.` })}
              className="btn-primary" style={{ marginTop:18, width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
              <Icon name="check" size={14} color="#fff" /> Release Loan / Disburse Funds
            </button>
          )}
          {(user.role==="lgu_admin"||user.role==="city_councilor") && selected.status==="Under CI" && (
            <div style={{ display:"flex", gap:10, marginTop:18 }}>
              <button onClick={()=>setConfirm({ action:"Approved", label:"Approve Loan", color:"#16A34A", msg:`Approve ${selected.ref} — ${selected.name} for P${selected.amount.toLocaleString()}?` })}
                className="btn-primary" style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                <Icon name="check" size={13} color="#fff" /> Approve
              </button>
              <button onClick={()=>setConfirm({ action:"Rejected", label:"Reject Application", color:"#DC2626", msg:`Reject ${selected.ref} — ${selected.name}? This will notify the borrower.` })}
                className="btn-danger" style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                <Icon name="x" size={13} color="#fff" /> Reject
              </button>
            </div>
          )}
        </Modal>
      )}
      {showModal==="new" && <NewApplicationModal onClose={()=>setShowModal(false)} onSave={app=>{ addApp(app); setShowModal(false); }} totalApps={apps.length} />}
      {confirm && selected && (
        <ConfirmDialog
          title={confirm.label}
          message={confirm.msg}
          confirmLabel={confirm.label}
          confirmColor={confirm.color}
          onConfirm={()=>{ updateAppStatus(selected.id, confirm.action); setSelected(null); setConfirm(null); }}
          onCancel={()=>setConfirm(null)}
        />
      )}
    </div>
  );
}

function NewApplicationModal({ onClose, onSave, totalApps = 8 }) {
  const { isMobile } = useResponsive();
  const [form, setForm] = useState({ name:"", business:"", category:"sari-sari", barangay:"Poblacion", amount:"", purpose:"", term:"12" });
  const nextRef = `DP-2026-${String(totalApps+1).padStart(4,"0")}`;
  const f = (k,v) => setForm(p=>({...p,[k]:v}));
  return (
    <Modal onClose={onClose} title="New Loan Application">
      <div style={{ fontSize:12, color:"#16A34A", marginBottom:16, ...F.medium }}>Auto-generated Reference: {nextRef}</div>
      <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 10 : 12 }}>
        {[["Borrower Name","name"],["Business Name","business"]].map(([l,k]) => (
          <div key={k}>
            <label style={{ fontSize:11, color:"#374151", display:"block", marginBottom:4 }}>{l}</label>
            <input type="text" value={form[k]} onChange={e=>f(k,e.target.value)} style={css.input()} />
          </div>
        ))}
        <div>
          <label style={{ fontSize:11, color:"#374151", display:"block", marginBottom:4 }}>Category</label>
          <select value={form.category} onChange={e=>f("category",e.target.value)} style={css.input()}>
            {["sari-sari","agri-processor","tricycle","food-business"].map(c=><option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize:11, color:"#374151", display:"block", marginBottom:4 }}>Barangay</label>
          <select value={form.barangay} onChange={e=>f("barangay",e.target.value)} style={css.input()}>
            {BARANGAYS.map(b=><option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize:11, color:"#374151", display:"block", marginBottom:4 }}>Loan Amount (PHP)</label>
          <input type="number" min={10000} max={50000} value={form.amount} onChange={e=>f("amount",e.target.value)} style={css.input()} placeholder="10,000 – 50,000" />
        </div>
        <div>
          <label style={{ fontSize:11, color:"#374151", display:"block", marginBottom:4 }}>Term (months)</label>
          <select value={form.term} onChange={e=>f("term",e.target.value)} style={css.input()}>
            {["6","12","18","24"].map(t=><option key={t} value={t}>{t} months</option>)}
          </select>
        </div>
        <div style={{ gridColumn:"1/-1" }}>
          <label style={{ fontSize:11, color:"#374151", display:"block", marginBottom:4 }}>Loan Purpose</label>
          <input type="text" value={form.purpose} onChange={e=>f("purpose",e.target.value)} style={css.input()} />
        </div>
      </div>
      <button onClick={()=>onSave({ id:Date.now(), ref:nextRef, ...form, amount:parseInt(form.amount)||0, term:parseInt(form.term), status:"Pending", officer:"Jose Reyes", submitted:new Date().toISOString().slice(0,10), fundSource:"LGU" })}
        className="btn-primary" style={{ marginTop:20, width:"100%" }}>
        Submit Application
      </button>
    </Modal>
  );
}

// ─── VERIFICATION ─────────────────────────────────────────────────────────────
function VerificationPage({ store = {} }) {
  const { isMobile } = useResponsive();
  const { apps = [], forwardToCI } = store;
  const [saved, setSaved] = useState({});
  const [checklists, setChecklists] = useState(
    apps.filter(a=>a.status==="Under Verification"||a.status==="Pending")
      .map(a=>({ appId:a.id, ref:a.ref, name:a.name, valid_id:false, proof_income:false, residence:false, barangay_clearance:false, references:false }))
  );
  const progress = cl => { const c=[cl.valid_id,cl.proof_income,cl.residence,cl.barangay_clearance,cl.references]; return Math.round(c.filter(Boolean).length/c.length*100); };
  const toggle   = (idx,field) => setChecklists(prev=>prev.map((c,i)=>i===idx?{...c,[field]:!c[field]}:c));

  return (
    <div style={{ padding: isMobile ? 16 : 28 }}>
      <h2 style={{ fontSize: isMobile ? 17 : 20, margin:"0 0 20px", ...F.heading }}>Verification Queue</h2>
      <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "280px 1fr", gap: isMobile ? 12 : 20 }}>
        <div style={css.glass({ padding:0, overflow:"hidden" })}>
          {checklists.map(cl => (
            <div key={cl.appId} style={{ padding:"14px 16px", borderBottom:"1px solid rgba(22,163,74,0.06)" }}>
              <div style={{ fontSize:13, ...F.medium }}>{cl.name}</div>
              <div style={{ fontSize:11, color:"#374151", ...F.body }}>{cl.ref}</div>
              <div style={{ marginTop:8, background:"rgba(22,163,74,0.03)", borderRadius:20, height:5, overflow:"hidden" }}>
                <div className="progress-bar" style={{ width:`${progress(cl)}%`, height:"100%", transition:"width 0.4s cubic-bezier(0.22,1,0.36,1)" }} />
              </div>
              <div style={{ fontSize:10, color:"#16A34A", marginTop:4 }}>{progress(cl)}% complete</div>
            </div>
          ))}
        </div>
        <div style={css.glass({ padding:24 })}>
          <div style={{ fontSize:15, marginBottom:18, ...F.medium }}>Document Checklist</div>
          {checklists.map((cl,i) => (
            <div key={cl.appId} style={{ marginBottom:24 }}>
              <div style={{ color:"#16A34A", marginBottom:12, fontSize:13, ...F.medium }}>{cl.ref} — {cl.name}</div>
              {[["valid_id","Valid ID Submitted"],["proof_income","Proof of Income"],["residence","Residence Verified"],["barangay_clearance","Barangay Clearance"],["references","References Verified"]].map(([k,label]) => (
                <div key={k} onClick={()=>toggle(i,k)} style={{
                  display:"flex", alignItems:"center", gap:12, padding:"10px 14px", borderRadius:10, cursor:"pointer",
                  background: cl[k]?"rgba(0,122,255,0.15)":"rgba(22,163,74,0.02)", marginBottom:6, transition:"all 0.15s",
                }}>
                  <div style={{ width:18, height:18, borderRadius:4, border:`2px solid ${cl[k]?"#16A34A":"rgba(22,163,74,0.12)"}`, background:cl[k]?"#16A34A":"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    {cl[k] && <Icon name="check" size={10} color="#6B7280" />}
                  </div>
                  <span style={{ fontSize:13, fontWeight:cl[k]?600:400 }}>{label}</span>
                  {cl[k] && <span style={{ marginLeft:"auto", fontSize:10, color:"#6B7280" }}>Verified {new Date().toLocaleDateString()}</span>}
                </div>
              ))}
              <div style={{ display:"flex", gap:10, marginTop:12 }}>
                <button onClick={()=>{ setSaved(prev=>({...prev,[cl.appId]:true})); setTimeout(()=>setSaved(prev=>({...prev,[cl.appId]:false})),2000); }}
                  style={css.pill("rgba(22,163,74,0.05)", { fontSize:12, display:"flex", alignItems:"center", gap:6 })}>
                  <Icon name="file" size={12} color="#374151" /> {saved[cl.appId] ? "Saved!" : "Save Progress"}
                </button>
                {progress(cl)===100 && (
                  <button onClick={()=>forwardToCI(cl.appId)} className="btn-primary" style={{ fontSize:12, display:"flex", alignItems:"center", gap:6 }}>
                    <Icon name="ci" size={12} color="#fff" /> Forward to CI
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── CREDIT INVESTIGATION ─────────────────────────────────────────────────────
function CIPage({ store = {} }) {
  const { isMobile } = useResponsive();
  const { apps = [], submitCI } = store;
  const [scores, setScores] = useState({ financial:7, character:8, collateral:5 });
  const [rec, setRec] = useState("Recommend Approval");
  const [notes, setNotes] = useState({ visit:"", character:"" });
  const [submitted, setSubmitted] = useState(false);
  const scoreColor = v => v>=7?"#16A34A":v>=4?"#FACC15":"#DC2626";
  const ciApps = apps.filter(a=>a.status==="Under CI");
  const [selectedAppIdx, setSelectedAppIdx] = useState(0);
  const app = ciApps[selectedAppIdx] || apps[1] || {};

  return (
    <div style={{ padding: isMobile ? 16 : 28 }}>
      <h2 style={{ fontSize: isMobile ? 17 : 20, margin:"0 0 4px", ...F.heading }}>Credit Investigation</h2>
      <p style={{ color:"#374151", margin:"0 0 20px", fontSize:13, ...F.body }}>Home visit assessment and risk scoring</p>
      <div style={{ display:"flex", gap: isMobile ? 8 : 13, flexWrap:"wrap", marginBottom: isMobile ? 14 : 24 }}>
        <KpiTile iconName="ci"           label="Pending CI"  value={apps.filter(a=>a.status==="Under CI").length}      color="#7C3AED" />
        <KpiTile iconName="verification" label="Approved"    value={apps.filter(a=>a.status==="Approved").length}       color={"#16A34A"} />
        <KpiTile iconName="x"            label="Rejected"    value={apps.filter(a=>a.status==="Rejected").length}       color={"#DC2626"} />
      </div>
      <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 12 : 20 }}>
        <div style={css.glass({ padding:22 })}>
          {ciApps.length > 1 && (
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:11, color:"#374151", display:"block", marginBottom:4, ...F.medium }}>Select Application</label>
              <select value={selectedAppIdx} onChange={e=>{ setSelectedAppIdx(+e.target.value); setSubmitted(false); }} style={css.input()}>
                {ciApps.map((a,i)=><option key={a.id} value={i}>{a.ref} — {a.name} (P{a.amount.toLocaleString()})</option>)}
              </select>
            </div>
          )}
          <div style={{ color:"#16A34A", marginBottom:16, fontSize:13, ...F.medium }}>{app.ref || "No application"} — {app.name || "Select above"}</div>
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:11, color:"#374151", display:"block", marginBottom:5 }}>Home Visit Date</label>
            <input type="date" style={css.input()} defaultValue="2026-06-20" />
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:11, color:"#374151", display:"block", marginBottom:5 }}>Employment Status</label>
            <select style={css.input()}>
              <option>Self-employed / MSME Owner</option>
              <option>Employed</option>
              <option>Informal sector</option>
            </select>
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:11, color:"#374151", display:"block", marginBottom:5 }}>Home Visit Notes</label>
            <textarea rows={3} value={notes.visit} onChange={e=>setNotes(p=>({...p,visit:e.target.value}))} style={css.input({ resize:"vertical" })} placeholder="Describe the home visit findings..." />
          </div>
          <div>
            <label style={{ fontSize:11, color:"#374151", display:"block", marginBottom:5 }}>Character Assessment</label>
            <textarea rows={3} value={notes.character} onChange={e=>setNotes(p=>({...p,character:e.target.value}))} style={css.input({ resize:"vertical" })} placeholder="Community reputation, bayanihan participation..." />
          </div>
        </div>

        <div style={css.glass({ padding:22 })}>
          <div style={{ marginBottom:18, ...F.medium }}>Risk Rating (0–10)</div>
          {[["financial","Financial Capacity"],["character","Character Rating"],["collateral","Collateral Value"]].map(([k,label]) => (
            <div key={k} style={{ marginBottom:20 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                <span style={{ fontSize:13, ...F.body }}>{label}</span>
                <span style={{ color:scoreColor(scores[k]), ...F.figure }}>{scores[k]}/10</span>
              </div>
              <input type="range" min={0} max={10} value={scores[k]} onChange={e=>setScores(p=>({...p,[k]:+e.target.value}))} style={{ width:"100%", accentColor:scoreColor(scores[k]) }} />
              <div style={{ width:`${scores[k]*10}%`, height:5, background:scoreColor(scores[k]), borderRadius:4, marginTop:4, transition:"all 0.2s" }} />
            </div>
          ))}
          <div style={{ fontSize:20, color:"#FACC15", textAlign:"center", padding:"14px 0", borderTop:"1px solid rgba(22,163,74,0.12)", marginBottom:16, ...F.figure }}>
            Overall Score: {((scores.financial+scores.character+scores.collateral)/3).toFixed(1)}/10
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:11, color:"#374151", display:"block", marginBottom:5 }}>Recommendation</label>
            <select value={rec} onChange={e=>setRec(e.target.value)} style={css.input()}>
              <option>Recommend Approval</option>
              <option>Recommend Rejection</option>
              <option>Recommend with Conditions</option>
            </select>
          </div>
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:13, marginBottom:10, ...F.medium }}>Document Evidence</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {["Valid ID","Income Proof","Business Proof","Visit Photos"].map(doc => (
                <div key={doc} style={{ background:"rgba(22,163,74,0.05)", border:"1px solid rgba(52,170,220,0.30)", borderRadius:10, padding:"10px 12px" }}>
                  <Icon name="file" size={16} color={"#16A34A"} />
                  <div style={{ fontSize:11, marginTop:5, ...F.medium }}>{doc}</div>
                  <div style={{ fontSize:10, color:"#16A34A", ...F.body }}>Uploaded</div>
                </div>
              ))}
            </div>
          </div>
          {submitted ? (
            <div style={{ textAlign:"center", color:"#16A34A", fontSize:13, padding:"12px 0", ...F.medium }}>✓ CI Report submitted successfully.</div>
          ) : (
            <button onClick={()=>{ if(app.id){ submitCI(app.id, rec); setSubmitted(true); } }} style={css.pill(`linear-gradient(90deg, #16A34A, #22C55E)`, { width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:7 })}>
              <Icon name="upload" size={13} color="#fff" /> Submit CI Report — {rec}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── COLLECTIONS ──────────────────────────────────────────────────────────────
function CollectionsPage({ store = {} }) {
  const { isMobile } = useResponsive();
  const { repayments: payments = [], recordPayment, applyPenalty } = store;
  const [penCalc, setPenCalc] = useState({ repayId:null, borrower:"", balance:0, days:5, rate:0.1 });
  const [penApplied, setPenApplied] = useState(false);
  const penalty = penCalc.balance * (penCalc.rate/100) * penCalc.days;
  const total   = penCalc.balance + penalty;
  const pc = (k,v) => setPenCalc(p=>({...p,[k]:v}));

  return (
    <div style={{ padding: isMobile ? 16 : 28 }}>
      <h2 style={{ fontSize: isMobile ? 17 : 20, margin:"0 0 20px", ...F.heading }}>Collections Module</h2>
      <div style={{ display:"flex", gap: isMobile ? 8 : 13, flexWrap:"wrap", marginBottom: isMobile ? 14 : 24 }}>
        <KpiTile iconName="money"       label="Daily Collections"  value="P7,500"                                          color={"#16A34A"} />
        <KpiTile iconName="accounts"    label="Monthly Collections" value="P62,000"                                         color={"#16A34A"} />
        <KpiTile iconName="alert"       label="Delayed Accounts"   value={payments.filter(r=>r.status==="Overdue").length}  color="#FACC15"      />
        <KpiTile iconName="users"       label="Active Borrowers"   value={payments.filter(r=>r.status==="Active").length}   color={"#FACC15"} />
      </div>
      <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 12 : 20 }}>
        <div style={css.glass({ padding:22 })}>
          <div style={{ fontSize:14, marginBottom:14, ...F.medium }}>Due Today</div>
          {payments.filter(r=>r.status!=="Closed").map(r => (
            <div key={r.id} onClick={()=>r.status==="Overdue"&&setPenCalc({repayId:r.id,borrower:r.name,balance:r.balance,days:Math.max(1,Math.round((new Date()-new Date(r.dueDate))/86400000)),rate:0.1})}
              style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 0", borderBottom:"1px solid rgba(22,163,74,0.06)", cursor:r.status==="Overdue"?"pointer":"default",
                background:penCalc.repayId===r.id?"rgba(255,159,10,0.06)":"transparent", borderRadius:8, transition:"background 0.15s" }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, ...F.medium }}>{r.name}</div>
                <div style={{ fontSize:11, color:"#6B7280", ...F.body }}>{r.ref} · Due {r.dueDate}</div>
                {r.status==="Overdue" && (
                  <div style={{ fontSize:10, color:"#FACC15", marginTop:2, display:"flex", alignItems:"center", gap:4, ...F.body }}>
                    <Icon name="alert" size={10} color="#FACC15" /> Click to open penalty calculator
                  </div>
                )}
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ color:r.status==="Overdue"?"#FACC15":"#16A34A", ...F.figure }}>P{r.due.toLocaleString()}</div>
                <StatusBadge status={r.status} />
              </div>
              <button onClick={e=>{ e.stopPropagation(); recordPayment(r.id); }} style={css.pill(r.status==="Closed"?"rgba(22,163,74,0.04)":"#16A34A", { fontSize:11, padding:"5px 14px" })} disabled={r.status==="Closed"}>{r.status==="Closed"?"Closed":"Pay"}</button>
            </div>
          ))}
        </div>

        <div style={css.glass({ padding:22 })}>
          <div style={{ display:"flex", alignItems:"center", gap:7, fontSize:14, marginBottom:16, ...F.medium }}>
            <Icon name="collections" size={15} color={"#FACC15"} />
            Penalty Calculator
          </div>
          {[["Borrower","borrower","text"],["Outstanding Balance (PHP)","balance","number"],["Days Overdue","days","number"],["Penalty Rate (%/day)","rate","number"]].map(([l,k,t]) => (
            <div key={k} style={{ marginBottom:12 }}>
              <label style={{ fontSize:11, color:"#374151", display:"block", marginBottom:4, ...F.body }}>{l}</label>
              <input type={t} value={penCalc[k]} onChange={e=>pc(k,t==="number"?+e.target.value:e.target.value)} style={css.input()} />
            </div>
          ))}
          <div style={{ background:"rgba(255,59,48,0.10)", border:"1px solid rgba(255,59,48,0.30)", borderRadius:12, padding:"14px 16px", marginTop:10 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
              <span style={{ fontSize:12, color:"#374151", ...F.body }}>Days Overdue</span>
              <span style={{ ...F.figure }}>{penCalc.days} days</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
              <span style={{ fontSize:12, color:"#374151", ...F.body }}>Penalty Amount</span>
              <span style={{ color:"#FACC15", ...F.figure }}>P{penalty.toFixed(2)}</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", borderTop:"1px solid rgba(22,163,74,0.12)", paddingTop:8 }}>
              <span style={{ fontSize:13, ...F.medium }}>Total Outstanding</span>
              <span style={{ fontSize:15, color:"#DC2626", ...F.figure }}>P{total.toFixed(2)}</span>
            </div>
          </div>
          <button onClick={()=>{ if(penCalc.repayId){ applyPenalty(penCalc.repayId, penalty); setPenApplied(true); setTimeout(()=>setPenApplied(false),3000); } }} style={css.pill("#DC2626", { marginTop:14, width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:7 })}>
            <Icon name="alert" size={13} color="#fff" /> {penApplied?"Penalty Applied!":"Apply Penalty"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ACCOUNTS TRACKER ─────────────────────────────────────────────────────────
function AccountsPage({ store = {} }) {
  const { isMobile } = useResponsive();
  const { user = {}, search = "", repayments = [] } = store;
  const filtered = repayments.filter(r => {
    const matchSearch = !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.ref.toLowerCase().includes(search.toLowerCase());
    const matchRole   = user.role==="msme_borrower" ? r.name===user.name : true;
    return matchSearch && matchRole;
  });
  return (
    <div style={{ padding: isMobile ? 16 : 28 }}>
      <h2 style={{ fontSize: isMobile ? 17 : 20, margin:"0 0 20px", ...F.heading }}>Accounts Tracker</h2>
      <div style={{ overflowX:"auto", WebkitOverflowScrolling:"touch", borderRadius:20, paddingBottom:2 }}>
      <div style={{ ...css.glass({ overflow:"visible", padding:0 }), minWidth:600 }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead>
            <tr style={{ borderBottom:"1px solid rgba(22,163,74,0.12)" }}>
              {["Ref #","Borrower","Loan Amount","Amount Paid","Balance","Due Amount","Status","Collector"].map(h=>(
                <th key={h} style={{ padding:"12px 14px", textAlign:"left", color:"#374151", fontSize:10, textTransform:"uppercase", letterSpacing:0.8, ...F.medium }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length===0 && <tr><td colSpan={8} style={{padding:0}}><EmptyState icon="accounts" message="No repayment records found." /></td></tr>}
            {filtered.map(r=>(
              <tr key={r.id} style={{ borderBottom:"1px solid rgba(22,163,74,0.05)" }}>
                <td style={{ padding:"12px 14px", color:"#16A34A", ...F.figure }}>{r.ref}</td>
                <td style={{ padding:"12px 14px", ...F.body }}>{r.name}</td>
                <td style={{ padding:"12px 14px", ...F.figure }}>P{r.loaned.toLocaleString()}</td>
                <td style={{ padding:"12px 14px", color:"#16A34A", ...F.figure }}>P{r.paid.toLocaleString()}</td>
                <td style={{ padding:"12px 14px", color:r.balance>0?"#FACC15":"#16A34A", ...F.figure }}>P{r.balance.toLocaleString()}</td>
                <td style={{ padding:"12px 14px", ...F.figure }}>P{r.due.toLocaleString()}</td>
                <td style={{ padding:"12px 14px" }}><StatusBadge status={r.status} /></td>
                <td style={{ padding:"12px 14px", color:"#374151", ...F.body }}>{r.collector}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
}

// ─── COUNCILOR DASHBOARD ──────────────────────────────────────────────────────
function CouncilorDashboard({ store = {} }) {
  const { isMobile } = useResponsive();
  const { repayments = [] } = store;
  const totalContrib = COUNCILOR_CONTRIBUTIONS.reduce((s,c)=>s+c.amount,0);
  const totalRepaid  = COUNCILOR_CONTRIBUTIONS.reduce((s,c)=>{
    const r = repayments.find(rep=>rep.ref===c.ref);
    return s+(r?r.paid:c.repaid);
  },0);
  const outstanding  = totalContrib - totalRepaid;
  const repayRate    = Math.round(totalRepaid/totalContrib*100);
  const repayTrend   = [
    { month:"Jan",repaid:0 },{ month:"Feb",repaid:0 },{ month:"Mar",repaid:0 },
    { month:"Apr",repaid:5000 },{ month:"May",repaid:8000 },{ month:"Jun",repaid:10000 },
  ];
  return (
    <div style={{ padding: isMobile ? 16 : 28 }}>
      <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:6 }}>
        <div style={{ width:44, height:44, borderRadius:14, background:"rgba(124,58,237,0.08)", border:"1px solid rgba(191,90,242,0.40)", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Icon name="shield" size={22} color="#7C3AED" />
        </div>
        <div>
          <h2 style={{ fontSize:22, margin:0, ...F.heading }}>Personal Fund Dashboard</h2>
          <p style={{ color:"#374151", margin:0, fontSize:13, ...F.body }}>Hon. Ligaya Dela Cruz · Full LGU & Cooperative Access · DAGDAG PUHUNAN</p>
        </div>
      </div>

      <div style={{
        background:"linear-gradient(135deg,rgba(124,58,237,0.10),rgba(250,204,21,0.10))",
        border:"1px solid rgba(191,90,242,0.35)", borderRadius:14, padding:"12px 18px", marginBottom:24, marginTop:18,
        fontSize:12, color:"#374151", display:"flex", alignItems:"flex-start", gap:8,
      }}>
        <Icon name="logs" size={13} color="#7C3AED" style={{ marginTop:1, flexShrink:0 }} />
        This dashboard tracks funds contributed personally by the Councilor, kept separate from LGU public funds. As City Councilor, you also have full access to all LGU Admin and Cooperative Officer features via the sidebar.
      </div>

      <div style={{ display:"flex", gap: isMobile ? 8 : 13, flexWrap:"wrap", marginBottom: isMobile ? 16 : 28 }}>
        <KpiTile iconName="money"    label="Total Personal Capital"  value={`P${totalContrib.toLocaleString()}`}   color="#7C3AED"      />
        <KpiTile iconName="upload"   label="Currently on Loan"       value={`P${outstanding.toLocaleString()}`}    color={"#FACC15"} />
        <KpiTile iconName="download" label="Repaid to Fund"          value={`P${totalRepaid.toLocaleString()}`}    color={"#16A34A"} />
        <KpiTile iconName="trendUp"  label="Repayment Rate"          value={`${repayRate}%`}                       color="#7C3AED"      />
        <KpiTile iconName="store"    label="MSMEs Funded"            value={COUNCILOR_CONTRIBUTIONS.length}        color={"#FACC15"} />
      </div>

      <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 12 : 20 }}>
        <div style={css.glass({ padding:22 })}>
          <div style={{ fontSize:14, marginBottom:16, ...F.medium }}>Contribution Ledger</div>
          {COUNCILOR_CONTRIBUTIONS.map(c=>(
            <div key={c.id} style={{ padding:"12px 14px", borderRadius:12, marginBottom:10, background:"rgba(124,58,237,0.06)", border:"1px solid rgba(124,58,237,0.15)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div>
                  <div style={{ fontSize:13, ...F.medium }}>{c.ref}</div>
                  <div style={{ fontSize:11, color:"#374151", ...F.body }}>{c.msme}</div>
                  <div style={{ fontSize:10, color:"#6B7280", marginTop:2, ...F.body }}>{c.date}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ color:"#7C3AED", ...F.figure }}>P{c.amount.toLocaleString()}</div>
                  <div style={{ fontSize:11, color:"#16A34A", ...F.figure }}>Repaid: P{c.repaid.toLocaleString()}</div>
                  <div style={{ marginTop:4 }}><StatusBadge status={c.repayStatus} /></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={css.glass({ padding:22 })}>
          <div style={{ fontSize:14, marginBottom:16, ...F.medium }}>Personal Fund Repayment Trend</div>
          <ResponsiveContainer width="100%" height={isMobile ? 160 : 200}>
            <LineChart data={repayTrend}>
              <XAxis dataKey="month" tick={{ fill:"#374151", fontSize:11, fontFamily:"'Inter',sans-serif", fontWeight:500 }} />
              <YAxis tick={{ fill:"#374151", fontSize:11, fontFamily:"'Inter',sans-serif", fontWeight:500 }} />
              <CartesianGrid stroke="rgba(22,163,74,0.03)" />
              <Tooltip contentStyle={{ background:"#FFFFFF", border:"1px solid #E5E7EB", borderRadius:8, fontSize:12, fontFamily:"\'Inter\',sans-serif", color:"#111827", color:"#9CA3AF" }} />
              <Line type="monotone" dataKey="repaid" stroke="#7C3AED" strokeWidth={2} dot={{ fill:"#7C3AED", r:3 }} />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ marginTop:16, padding:"12px 14px", background:"rgba(250,204,21,0.12)", border:"1px solid rgba(250,204,21,0.30)", borderRadius:12 }}>
            <div style={{ fontSize:12, color:"#FACC15", marginBottom:4, ...F.medium }}>Impact Summary</div>
            <div style={{ fontSize:12, color:"#374151", ...F.body }}>
              {COUNCILOR_CONTRIBUTIONS.length} MSMEs personally funded · {repayRate}% fund repayment rate · P{outstanding.toLocaleString()} currently active in the community
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MONITORING ───────────────────────────────────────────────────────────────
function MonitoringPage({ store = {} }) {
  const { isMobile } = useResponsive();
  const { apps = [] } = store;
  const statusCounts = apps.reduce((acc,a) => { acc[a.status]=(acc[a.status]||0)+1; return acc; }, {});
  const pieData = Object.entries(statusCounts).map(([name,value]) => ({ name, value }));
  const COLORS = Object.values(G.statusColors);
  return (
    <div style={{ padding: isMobile ? 16 : 28 }}>
      <h2 style={{ fontSize: isMobile ? 17 : 20, margin:"0 0 20px", ...F.heading }}>Monitoring & Oversight</h2>
      <div style={{ display:"flex", gap: isMobile ? 8 : 13, flexWrap:"wrap", marginBottom: isMobile ? 14 : 24 }}>
        <KpiTile iconName="applications" label="Total Applications"   value={apps.length}                                          color={"#16A34A"}  />
        <KpiTile iconName="verification" label="Active Loans"         value={apps.filter(a=>a.status==="Active").length}            color={"#16A34A"}  />
        <KpiTile iconName="alert"        label="Overdue Accounts"     value={apps.filter(a=>a.status==="Overdue").length}           color="#FACC15"       />
        <KpiTile iconName="ci"           label="Pending Verification" value={apps.filter(a=>a.status==="Under Verification").length} color="#7C3AED"       />
        <KpiTile iconName="search"       label="Active Investigations" value={apps.filter(a=>a.status==="Under CI").length}          color={"#FACC15"}  />
        <KpiTile iconName="refresh"      label="Pending Renewals"     value={1}                                                                  color={"#16A34A"}  />
      </div>
      <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 12 : 20, marginBottom:20 }}>
        <div style={css.glass({ padding:22 })}>
          <div style={{ fontSize:14, marginBottom:16, ...F.medium }}>Loan Status Distribution</div>
          <ResponsiveContainer width="100%" height={isMobile ? 160 : 220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value">
                {pieData.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background:"#FFFFFF", border:"1px solid #E5E7EB", borderRadius:8, fontSize:12, fontFamily:"\'Inter\',sans-serif", color:"#111827", color:"#9CA3AF" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={css.glass({ padding:22 })}>
          <div style={{ fontSize:14, marginBottom:16, ...F.medium }}>Repayment Rate by MSME Category</div>
          <ResponsiveContainer width="100%" height={isMobile ? 160 : 220}>
            <BarChart data={CATEGORY_DATA}>
              <XAxis dataKey="name" tick={{ fill:"#374151", fontSize:11, fontFamily:"'Inter',sans-serif", fontWeight:500 }} />
              <YAxis tick={{ fill:"#374151", fontSize:11, fontFamily:"'Inter',sans-serif", fontWeight:500 }} domain={[0,100]} />
              <CartesianGrid stroke="rgba(22,163,74,0.03)" />
              <Tooltip contentStyle={{ background:"#FFFFFF", border:"1px solid #E5E7EB", borderRadius:8, fontSize:12, fontFamily:"\'Inter\',sans-serif", color:"#111827", color:"#9CA3AF" }} />
              <Bar dataKey="repayRate" fill={"#16A34A"} radius={[5,5,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div style={css.glass({ padding:22 })}>
        <div style={{ fontSize:14, marginBottom:16, ...F.medium }}>Barangay Coverage — San Pedro, Laguna</div>
        {BARANGAY_DATA.map(b => (
          <div key={b.name} style={{ display:"flex", alignItems:"center", gap:14, marginBottom:11 }}>
            <div style={{ width:100, fontSize:12, color:"#374151", ...F.body }}>{b.name}</div>
            <div style={{ flex:1, background:"rgba(22,163,74,0.03)", borderRadius:20, height:7, overflow:"hidden" }}>
              <div style={{ width:`${b.pct}%`, height:"100%", background:`linear-gradient(90deg, #16A34A, #22C55E)`, transition:"width 0.3s" }} />
            </div>
            <div style={{ fontSize:12, width:80, textAlign:"right", ...F.figure }}>{b.count} borrowers</div>
            <div style={{ fontSize:11, color:"#16A34A", width:36, ...F.figure }}>{b.pct}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── REPORTS ──────────────────────────────────────────────────────────────────
function ReportsPage({ store = {} }) {
  const { isMobile } = useResponsive();
  const { apps = [], repayments = [] } = store;

  const downloadCSV = (type) => {
    let csv = "";
    let filename = "";
    if (type === "applications") {
      filename = "Loan_Applications_Report.csv";
      csv = "Ref#,Borrower,Business,Category,Barangay,Amount,Term,Purpose,Status,Officer,Submitted,Fund Source\n";
      csv += apps.map(a=>`${a.ref},"${a.name}","${a.business}",${a.category},${a.barangay},${a.amount},${a.term} months,"${a.purpose}",${a.status},${a.officer},${a.submitted},${a.fundSource}`).join("\n");
    } else if (type === "collections") {
      filename = "Collection_Report.csv";
      csv = "Ref#,Borrower,Loan Amount,Amount Paid,Balance,Due Amount,Status,Collector\n";
      csv += repayments.map(r=>`${r.ref},"${r.name}",${r.loaned},${r.paid},${r.balance},${r.due},${r.status},${r.collector}`).join("\n");
    } else if (type === "delinquency") {
      filename = "Delinquency_Report.csv";
      csv = "Ref#,Borrower,Balance,Due Amount,Due Date,Status\n";
      csv += repayments.filter(r=>r.status==="Overdue").map(r=>`${r.ref},"${r.name}",${r.balance},${r.due},${r.dueDate},${r.status}`).join("\n");
    } else if (type === "renewal") {
      filename = "Renewal_Eligible_Report.csv";
      csv = "Ref#,Borrower,Business,Amount,Status\n";
      csv += apps.filter(a=>a.status==="Closed").map(a=>`${a.ref},"${a.name}","${a.business}",${a.amount},${a.status}`).join("\n");
    }
    if (!csv) return;
    const blob = new Blob([csv], {type:"text/csv"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download=filename; a.click();
    URL.revokeObjectURL(url);
  };

  const reports = [
    { iconName:"applications", title:"Loan Applications Report",    desc:"Full list of all applications by status, barangay, and MSME category",     tags:["Excel","PDF"], csvType:"applications" },
    { iconName:"collections",  title:"Collection Report",           desc:"Repayments received vs. expected by period and collector",                  tags:["Excel","PDF"], csvType:"collections" },
    { iconName:"alert",        title:"Delinquency Report",          desc:"Overdue accounts, days delayed, penalty amounts, and contact details",      tags:["Excel","PDF"], csvType:"delinquency" },
    { iconName:"ci",           title:"CI Investigation Summary",    desc:"Completed credit investigations, risk scores, and recommendations",         tags:["PDF"],         csvType:"applications" },
    { iconName:"users",        title:"Collector Performance",       desc:"Per-officer collection efficiency and on-time payment rates",               tags:["Excel"],       csvType:"collections" },
    { iconName:"refresh",      title:"Renewal Report",              desc:"Borrowers eligible for loan renewal based on repayment history",            tags:["Excel","PDF"], csvType:"renewal" },
  ];
  return (
    <div style={{ padding: isMobile ? 16 : 28 }}>
      <h2 style={{ fontSize: isMobile ? 17 : 20, margin:"0 0 20px", ...F.heading }}>Reports & Analytics</h2>
      <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill,minmax(260px,1fr))", gap: isMobile ? 10 : 16, marginBottom:28 }}>
        {reports.map(r => (
          <div key={r.title} className="glass-hover" style={{ ...css.glassMed({ padding:20 }) }}
          >
            <div style={{ marginBottom:10 }}>
              <Icon name={r.iconName} size={20} color={"#16A34A"} />
            </div>
            <div style={{ fontSize:14, marginBottom:6, ...F.medium }}>{r.title}</div>
            <div style={{ fontSize:12, color:"#374151", marginBottom:14, lineHeight:1.5, ...F.body }}>{r.desc}</div>
            <div style={{ display:"flex", gap:6 }}>
              {r.tags.map(t => (
                <button key={t} onClick={()=>downloadCSV(r.csvType)} style={{
                  fontSize:10, fontWeight:700, padding:"3px 10px", borderRadius:50,
                  background: t==="Excel"?"rgba(48,209,88,0.18)":"rgba(255,59,48,0.18)",
                  color: t==="Excel"?"#16A34A":"#DC2626",
                  border:`1px solid ${t==="Excel"?"rgba(48,209,88,0.35)":"rgba(255,59,48,0.35)"}`,
                  display:"inline-flex", alignItems:"center", gap:4, cursor:"pointer",
                }}>
                  <Icon name="download" size={9} color={t==="Excel"?"#16A34A":"#DC2626"} />
                  {t}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={css.glass({ padding:22 })}>
        <div style={{ fontSize:14, marginBottom:16, ...F.medium }}>Loan Disbursement Trend (PHP)</div>
        <ResponsiveContainer width="100%" height={isMobile ? 160 : 220}>
          <BarChart data={DISBURSEMENT_TREND}>
            <XAxis dataKey="month" tick={{ fill:"#374151", fontSize:11, fontFamily:"'Inter',sans-serif", fontWeight:500 }} />
            <YAxis tick={{ fill:"#374151", fontSize:11, fontFamily:"'Inter',sans-serif", fontWeight:500 }} />
            <CartesianGrid stroke="rgba(22,163,74,0.03)" />
            <Tooltip contentStyle={{ background:"#FFFFFF", border:"1px solid #E5E7EB", borderRadius:8, fontSize:12, fontFamily:"\'Inter\',sans-serif", color:"#111827", color:"#9CA3AF" }} />
            <Bar dataKey="amount" fill={"#16A34A"} radius={[5,5,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── ACTIVITY LOGS ────────────────────────────────────────────────────────────
function ActivityLogsPage({ store = {} }) {
  const { isMobile } = useResponsive();
  const auditLogs = store.auditLogs || auditLogs;
  return (
    <div style={{ padding: isMobile ? 16 : 28 }}>
      <h2 style={{ fontSize: isMobile ? 17 : 20, margin:"0 0 4px", ...F.heading }}>Activity Logs</h2>
      <p style={{ color:"#374151", margin:"0 0 20px", fontSize:13, display:"flex", alignItems:"center", gap:6, ...F.body }}>
        <Icon name="logs" size={13} color="#374151" />
        Admin-only · Immutable audit trail of all system actions
      </p>
      <div style={{ overflowX:"auto", WebkitOverflowScrolling:"touch", borderRadius:20, paddingBottom:2 }}>
      <div style={{ ...css.glass({ overflow:"visible", padding:0 }), minWidth:600 }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
          <thead>
            <tr style={{ borderBottom:"1px solid rgba(22,163,74,0.12)" }}>
              {["Timestamp","User","Role","Action","Record Affected","IP Address"].map(h => (
                <th key={h} style={{ padding:"12px 14px", textAlign:"left", color:"#374151", fontSize:10, textTransform:"uppercase", letterSpacing:0.8, ...F.medium }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {auditLogs.map(l => (
              <tr key={l.id} style={{ borderBottom:"1px solid rgba(22,163,74,0.05)" }}>
                <td style={{ padding:"11px 14px", color:"#374151", whiteSpace:"nowrap", display:"flex", alignItems:"center", gap:6, ...F.figure }}>
                  <Icon name="clock" size={11} color="rgba(22,163,74,0.40)" />{l.time}
                </td>
                <td style={{ padding:"11px 14px", ...F.medium }}>{l.user}</td>
                <td style={{ padding:"11px 14px" }}>
                  <span style={{ fontSize:10, background:"rgba(22,163,74,0.12)", color:"#16A34A", padding:"2px 9px", borderRadius:50, ...F.medium }}>{l.role}</span>
                </td>
                <td style={{ padding:"11px 14px", color:"#111827", ...F.body }}>{l.action}</td>
                <td style={{ padding:"11px 14px", color:"#16A34A", ...F.medium }}>{l.record}</td>
                <td style={{ padding:"11px 14px", color:"#6B7280", fontFamily:"'Inter',monospace", fontSize:11 }}>{l.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
}

// ─── OCR DIGITIZER ────────────────────────────────────────────────────────────
function OCRPage({ store = {} }) {
  const { isMobile } = useResponsive();
  const { addApp, apps = [], addLog } = store;
  const [stage, setStage] = useState("idle");
  const [saved, setSaved] = useState(false);
  const [docType, setDocType] = useState("loan_application_form");
  const [editedData, setEditedData] = useState({
    applicant_name: "Andres Villanueva",
    loan_amount: "45000",
    date_submitted: "2026-04-01",
    purpose: "Seedlings & fertilizer purchase",
    barangay: "Cuyab",
    signature: "Confirmed (handwritten)",
  });
  const extracted = editedData;
  const handleSaveOCR = () => {
    if (docType === "loan_application_form" && addApp) {
      const nextRef = `DP-2026-${String(apps.length+1).padStart(4,"0")}`;
      addApp({ id:Date.now(), ref:nextRef, name:editedData.applicant_name, business:"(OCR — unconfirmed)", category:"sari-sari", barangay:editedData.barangay, amount:parseInt(editedData.loan_amount)||0, purpose:editedData.purpose, term:12, status:"Pending", officer:"Jose Reyes", submitted:editedData.date_submitted, fundSource:"LGU" });
    }
    setSaved(true);
    setTimeout(()=>{ setSaved(false); setStage("idle"); },2500);
  };
  return (
    <div style={{ padding: isMobile ? 16 : 28 }}>
      <h2 style={{ fontSize: isMobile ? 17 : 20, margin:"0 0 4px", ...F.heading }}>AI-Powered Handwriting Digitizer</h2>
      <p style={{ color:"#374151", margin:"0 0 4px", fontSize:13, ...F.body }}>
        Upload a photo of a handwritten loan application or repayment ledger — the system extracts structured data via OCR and handwriting recognition.
      </p>
      <p style={{ color:"#9CA3AF", margin:"0 0 22px", fontSize:11, display:"flex", alignItems:"center", gap:5, ...F.body }}>
        <Icon name="info" size={11} color="rgba(22,163,74,0.40)" />
        In production, this feature calls a vision-language AI API. This prototype simulates the output for demonstration.
      </p>

      <div style={{ display:"flex", gap:10, marginBottom:20 }}>
        {[["loan_application_form","Loan Application Form","applications"],["repayment_ledger","Repayment Ledger","accounts"]].map(([v,l,ic]) => (
          <button key={v} onClick={()=>setDocType(v)} style={{
            ...css.pill(docType===v ? "#16A34A" : "rgba(22,163,74,0.03)", { fontSize:13, display:"flex", alignItems:"center", gap:7 }),
            border: docType===v ? `1px solid #007AFF` : "1px solid rgba(22,163,74,0.08)",
          }}>
            <Icon name={ic} size={13} color={docType===v?"#fff":"#374151"} /> {l}
          </button>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 12 : 20 }}>
        <div style={css.glass({ padding:22 })}>
          <div style={{ fontSize:14, marginBottom:16, ...F.medium }}>Upload Handwritten Document</div>
          {stage==="idle" && (
            <div onClick={()=>setStage("uploaded")} style={{
              border:"2px dashed rgba(22,163,74,0.12)", borderRadius:16, padding:"48px 24px",
              textAlign:"center", cursor:"pointer", transition:"all 0.2s",
            }}>
              <div style={{ display:"flex", justifyContent:"center", marginBottom:12 }}>
                <Icon name="camera" size={36} color="#6B7280" />
              </div>
              <div style={{ fontSize:14, ...F.medium }}>Click to simulate upload</div>
              <div style={{ fontSize:12, color:"#6B7280", marginTop:6, ...F.body }}>Accepts JPG, PNG, PDF scans</div>
            </div>
          )}
          {stage!=="idle" && (
            <div>
              <div style={{ background:"rgba(22,163,74,0.02)", borderRadius:12, padding:22, textAlign:"center", border:"1px solid rgba(22,163,74,0.08)", marginBottom:16 }}>
                <Icon name="file" size={44} color="rgba(22,163,74,0.07)" />
                <div style={{ fontSize:14, ...F.medium, marginTop:10 }}>Handwritten Form — Image Received</div>
                <div style={{ fontSize:11, color:"#6B7280", marginTop:4, ...F.body }}>
                  {docType==="loan_application_form" ? "DP Application Form — Andres Villanueva" : "Repayment Ledger — Cuyab Coop"}
                </div>
                <div style={{ marginTop:10, fontSize:11, color:"#FACC15", ...F.medium }}>45 KB · Uploaded</div>
              </div>
              {stage==="uploaded" && (
                <button onClick={()=>{ setStage("processing"); setTimeout(()=>setStage("done"),1500); }}
                  style={css.pill(`linear-gradient(90deg, #007AFF, #BF5AF2)`, { width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:7 })}>
                  <Icon name="ocr" size={14} color="#fff" /> Run OCR & Handwriting Recognition
                </button>
              )}
              {stage==="processing" && (
                <div style={{ textAlign:"center", padding:12, color:"#16A34A" }}>
                  <Icon name="refresh" size={20} color={"#16A34A"} />
                  <div style={{ fontSize:13, marginTop:8, ...F.body }}>AI processing — extracting text...</div>
                </div>
              )}
            </div>
          )}
        </div>

        <div style={css.glass({ padding:22 })}>
          <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:14, marginBottom:16, ...F.medium }}>
            Extracted Data
            {stage==="done" && <span style={{ color:"#16A34A", fontSize:12, ...F.body }}>— Ready for review</span>}
          </div>
          {stage!=="done" ? (
            <div style={{ textAlign:"center", padding:"44px 0", color:"#9CA3AF", fontSize:13, ...F.body }}>
              <Icon name="file" size={32} color="rgba(22,163,74,0.05)" style={{ display:"block", margin:"0 auto 12px" }} />
              Awaiting OCR output. Upload and run recognition to populate fields.
            </div>
          ) : (
            <div>
              <div style={{ background:"rgba(22,163,74,0.03)", border:"1px solid rgba(52,170,220,0.30)", borderRadius:10, padding:"10px 14px", marginBottom:16, fontSize:12, color:"#16A34A", display:"flex", alignItems:"center", gap:7, ...F.body }}>
                <Icon name="check" size={13} color={"#16A34A"} />
                Recognized with 94.2% confidence. Review and correct before saving.
              </div>
              {Object.entries(extracted).map(([k,v]) => (
                <div key={k} style={{ marginBottom:12 }}>
                  <label style={{ fontSize:10, color:"#6B7280", textTransform:"uppercase", letterSpacing:0.9, display:"block", marginBottom:4, ...F.medium }}>
                    {k.replace(/_/g," ")}
                  </label>
                  <input value={v} onChange={e=>setEditedData(p=>({...p,[k]:e.target.value}))} style={css.input({ fontSize:13, ...F.body })} />
                </div>
              ))}
              <div style={{ display:"flex", gap:10, marginTop:16 }}>
                {saved
                  ? <div style={{ flex:1, textAlign:"center", color:"#16A34A", fontSize:13, ...F.medium, padding:"10px 0" }}>✓ Saved to system as {`DP-2026-${String(apps.length).padStart(4,"0")}`}</div>
                  : <button onClick={handleSaveOCR} className="btn-primary" style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                      <Icon name="check" size={13} color="#fff" /> Verify & Save to System
                    </button>
                }
                <button onClick={()=>{ setStage("idle"); setSaved(false); }} style={css.pill("rgba(22,163,74,0.03)")}>Reset</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── USER MANAGEMENT ──────────────────────────────────────────────────────────
function SettingsPage({ store = {} }) {
  const { isMobile } = useResponsive();
  const { users: mockUsers = [], toggleUser } = store;
  return (
    <div style={{ padding: isMobile ? 16 : 28 }}>
      <h2 style={{ fontSize: isMobile ? 17 : 20, margin:"0 0 16px", ...F.heading }}>User Management</h2>
      <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:20 }}>
        <KpiTile iconName="users"        label="Total Users"    value={mockUsers.length}                               color={"#16A34A"} />
        <KpiTile iconName="verification" label="Active"         value={mockUsers.filter(u=>u.status==="Active").length} color={"#16A34A"} />
        <KpiTile iconName="x"            label="Inactive"       value={mockUsers.filter(u=>u.status==="Inactive").length} color={"#DC2626"} />
      </div>
      <div style={{ overflowX:"auto", WebkitOverflowScrolling:"touch", borderRadius:20, paddingBottom:2 }}>
      <div style={{ ...css.glass({ overflow:"visible", padding:0 }), minWidth:600 }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead>
            <tr style={{ borderBottom:"1px solid rgba(22,163,74,0.12)" }}>
              {["Name","Role","Email","Status","Actions"].map(h=>(
                <th key={h} style={{ padding:"12px 16px", textAlign:"left", color:"#374151", fontSize:10, textTransform:"uppercase", letterSpacing:0.8, ...F.medium }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockUsers.map(u=>(
              <tr key={u.id} style={{ borderBottom:"1px solid rgba(22,163,74,0.05)" }}>
                <td style={{ padding:"12px 16px", ...F.medium }}>{u.name}</td>
                <td style={{ padding:"12px 16px" }}>
                  <span style={{ fontSize:10, background:"rgba(22,163,74,0.12)", color:"#16A34A", padding:"2px 10px", borderRadius:50, ...F.medium }}>{u.role}</span>
                </td>
                <td style={{ padding:"12px 16px", color:"#374151", ...F.body }}>{u.email}</td>
                <td style={{ padding:"12px 16px" }}>
                  <span style={{ color:u.status==="Active"?"#16A34A":"rgba(22,163,74,0.10)", fontSize:12, ...F.medium }}>
                    {u.status==="Active" ? "Active" : "Inactive"}
                  </span>
                </td>
                <td style={{ padding:"12px 16px" }}>
                  <button onClick={()=>toggleUser(u.id)} style={css.pill(u.status==="Active"?"rgba(255,59,48,0.18)":"rgba(48,209,88,0.18)", { fontSize:11, padding:"4px 12px", color:u.status==="Active"?"#DC2626":"#16A34A" })}>
                    {u.status==="Active" ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
}

// ─── MSME MY LOAN ─────────────────────────────────────────────────────────────
function MyLoanPage({ store = {} }) {
  const { isMobile } = useResponsive();
  const user = store.user || {};
  const apps = store.apps || [];
  const repayments = store.repayments || [];
  const myApp   = apps.find(a=>a.name===user.name) || apps[0] || {};
  const myRepay = repayments.find(r=>r.ref===myApp.ref);
  return (
    <div style={{ padding: isMobile ? 16 : 28 }}>
      <h2 style={{ fontSize: isMobile ? 17 : 20, margin:"0 0 20px", ...F.heading }}>My Loan Status</h2>
      <div style={css.glass({ padding:24, marginBottom:20 })}>
        <div style={{ color:"#16A34A", marginBottom:4, fontSize:16, ...F.figure }}>{myApp.ref}</div>
        <div style={{ color:"#374151", fontSize:12, marginBottom:16, ...F.body }}>{myApp.business} · {myApp.barangay}</div>
        <StageTracker status={myApp.status} />
      </div>
      {myRepay && (
        <div style={css.glass({ padding:22 })}>
          <div style={{ marginBottom:16, ...F.medium }}>Repayment Summary</div>
          <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: isMobile ? 10 : 12, marginBottom:20 }}>
            <div style={{ background:"rgba(22,163,74,0.03)", borderRadius:12, padding:"14px 16px" }}>
              <div style={{ fontSize:10, color:"#6B7280", textTransform:"uppercase", letterSpacing:0.8, ...F.medium }}>Loan Amount</div>
              <div style={{ fontSize:22, marginTop:4, ...F.figure }}>P{myRepay.loaned.toLocaleString()}</div>
            </div>
            <div style={{ background:"rgba(22,163,74,0.03)", borderRadius:12, padding:"14px 16px" }}>
              <div style={{ fontSize:10, color:"#6B7280", textTransform:"uppercase", letterSpacing:0.8, ...F.medium }}>Amount Paid</div>
              <div style={{ fontSize:22, color:"#16A34A", marginTop:4, ...F.figure }}>P{myRepay.paid.toLocaleString()}</div>
            </div>
            <div style={{ background:myRepay.balance>0?"rgba(255,159,10,0.09)":"rgba(22,163,74,0.12)", borderRadius:12, padding:"14px 16px" }}>
              <div style={{ fontSize:10, color:"#6B7280", textTransform:"uppercase", letterSpacing:0.8, ...F.medium }}>Remaining Balance</div>
              <div style={{ fontSize:22, color:myRepay.balance>0?"#FACC15":"#16A34A", marginTop:4, ...F.figure }}>P{myRepay.balance.toLocaleString()}</div>
            </div>
          </div>

          {/* Monthly amortization table */}
          {myApp.term && (
            <>
              <div style={{ fontSize:13, ...F.medium, marginBottom:10 }}>Monthly Payment Schedule</div>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", fontSize:12, minWidth:400 }}>
                  <thead>
                    <tr style={{ borderBottom:"1px solid rgba(22,163,74,0.12)" }}>
                      {["Month","Due Date","Amount Due","Status"].map(h=>(
                        <th key={h} style={{ padding:"8px 12px", textAlign:"left", fontSize:10, color:"#374151", ...F.medium, textTransform:"uppercase", letterSpacing:0.8 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({length: myApp.term}, (_,i) => {
                      const monthly = Math.round(myRepay.loaned / myApp.term);
                      const paidMonths = Math.floor(myRepay.paid / monthly);
                      const dueDate = new Date(myApp.submitted || "2026-01-10");
                      dueDate.setMonth(dueDate.getMonth() + i + 1);
                      const dueDateStr = dueDate.toLocaleDateString("en-PH", { month:"short", day:"numeric", year:"numeric" });
                      const isPaid = i < paidMonths;
                      const isCurrent = i === paidMonths;
                      return (
                        <tr key={i} style={{ borderBottom:"1px solid rgba(22,163,74,0.04)", background:isCurrent?"rgba(22,163,74,0.03)":"transparent" }}>
                          <td style={{ padding:"8px 12px", ...F.figure }}>{i+1}</td>
                          <td style={{ padding:"8px 12px", ...F.body, color:"#374151" }}>{dueDateStr}</td>
                          <td style={{ padding:"8px 12px", ...F.figure }}>P{monthly.toLocaleString()}</td>
                          <td style={{ padding:"8px 12px" }}>
                            {isPaid
                              ? <span style={{ color:"#16A34A", fontSize:11, ...F.medium }}>✓ Paid</span>
                              : isCurrent
                                ? <span style={{ color:"#FACC15", fontSize:11, ...F.medium }}>● Due</span>
                                : <span style={{ color:"#6B7280", fontSize:11 }}>Upcoming</span>
                            }
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
      {!myRepay && myApp.status && !["Active","Overdue","Closed","Released"].includes(myApp.status) && (
        <div style={css.glass({ padding:22 })}>
          <EmptyState icon="clock" message="Repayment schedule not yet active." sub={`Your loan is currently ${myApp.status}. Schedule will appear once the loan is released.`} />
        </div>
      )}
    </div>
  );
}

// ─── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser]                     = useState(null);
  const [page, setPage]                     = useState("dashboard");
  const [search, setSearch]                 = useState("");
  const [notifOpen, setNotifOpen]           = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isMobile }                        = useResponsive();

  const store = useAppStore(user);

  const handleLogin  = u => { setUser(u); setPage(u.role==="city_councilor" ? "councilor_dashboard" : "dashboard"); };
  const handleLogout = () => { setUser(null); setPage("dashboard"); setSearch(""); setMobileMenuOpen(false); };
  const handleNav    = p => { setPage(p); setNotifOpen(false); setMobileMenuOpen(false); };

  if (!user) return <LoginScreen onLogin={handleLogin} />;

  // Show loading screen while fetching from Supabase
  if (store.loading) return (
    <div className="page-enter" style={{ ...css.body, display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100dvh", flexDirection:"column", gap:16 }}>
      <div style={{ width:48, height:48, border:"3px solid rgba(0,122,255,0.2)", borderTopColor:"#16A34A", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ fontSize:14, color:"#16A34A", ...F.body }}>Loading DAGDAG PUHUNAN...</div>
      <div style={{ fontSize:11, color:"#6B7280", ...F.body }}>Connecting to database</div>
    </div>
  );

  const S = { ...store, user, search }; // convenience bundle

  const renderPage = () => {
    switch(page) {
      case "dashboard":
        if (user.role==="lgu_admin")      return <LguDashboard      store={S} />;
        if (user.role==="coop_officer")   return <CoopDashboard     store={S} />;
        if (user.role==="msme_borrower")  return <MsmeDashboard     store={S} />;
        if (user.role==="city_councilor") return <LguDashboard      store={S} />;
        return <LguDashboard store={S} />;
      case "applications":        return <ApplicationsPage   store={S} />;
      case "verification":        return <VerificationPage   store={S} />;
      case "ci":                  return <CIPage             store={S} />;
      case "collections":         return <CollectionsPage    store={S} />;
      case "accounts":            return <AccountsPage       store={S} />;
      case "councilor_dashboard": return <CouncilorDashboard store={S} />;
      case "monitoring":          return <MonitoringPage     store={S} />;
      case "reports":             return <ReportsPage        store={S} />;
      case "logs":                return <ActivityLogsPage   store={S} />;
      case "settings":            return <SettingsPage       store={S} />;
      case "ocr":                 return <OCRPage            store={S} />;
      case "my_loan":             return <MyLoanPage         store={S} />;
      case "apply":               return <ApplicationsPage   store={S} />;
      default:                    return <LguDashboard       store={S} />;
    }
  };

  return (
    <div style={{ ...css.body, display:"flex", height:"100dvh", overflow:"hidden" }}>
      {!isMobile && (
        <div style={{ flexShrink:0, height:"100dvh", overflowY:"auto" }}>
          <Sidebar user={user} activePage={page} onNav={handleNav} onLogout={handleLogout} isMobile={false} onReset={store.resetData} />
        </div>
      )}
      {isMobile && (
        <Sidebar user={user} activePage={page} onNav={handleNav} onLogout={handleLogout}
          isMobile={true} mobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} onReset={store.resetData} />
      )}
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0, height:"100dvh", overflow:"hidden" }}>
        <TopNav
          user={user} search={search} onSearch={setSearch}
          notifications={store.notifications} notifOpen={notifOpen}
          onToggleNotif={() => setNotifOpen(o=>!o)}
          onMarkAllRead={store.markAllRead}
          isMobile={isMobile} onMenuOpen={() => setMobileMenuOpen(true)}
          backendOk={store.backendOk} useBackend={store.USE_BACKEND}
        />
        <div style={{ flex:1, overflowY:"auto", overflowX:"hidden" }}
          onClick={() => { if (notifOpen) setNotifOpen(false); }}>
          {renderPage()}
        </div>
      </div>
    </div>
  );
}
