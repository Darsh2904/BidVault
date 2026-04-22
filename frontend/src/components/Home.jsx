import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthNavActions from "./AuthNavActions";
import { getApprovedAuctions } from "../utils/authApi";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  html, body { height: 100%; }
  #root, .App { min-height: 100vh; }

  :root {
    --bg: #0a0a0f;
    --bg2: #12121a;
    --bg3: #1a1a28;
    --bg4: #252538;
    --purple: #6c63ff;
    --purple-light: #8b84ff;
    --gold: #f59e0b;
    --text: #ffffff;
    --text-muted: #a0a0c0;
    --text-dim: #6060a0;
    --border: #2a2a42;
    --border2: #3a3a58;
    --live-red: #ff4444;
  }

  [data-theme="light"] {
    --bg: #f4f4fc;
    --bg2: #ebebf8;
    --bg3: #e2e2f0;
    --bg4: #f0f0ff;
    --purple: #5b52ee;
    --purple-light: #7c75f5;
    --gold: #d97706;
    --text: #1a1a2e;
    --text-muted: #4a4a6a;
    --text-dim: #8888aa;
    --border: #d5d5ee;
    --border2: #c5c5e5;
    --live-red: #dc2626;
  }

  body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; width: 100%; overflow-x: hidden; zoom: 1; }

  @keyframes fadeUpIn {
    from { opacity: 0; transform: translate3d(0, 24px, 0); }
    to { opacity: 1; transform: translate3d(0, 0, 0); }
  }

  @keyframes heroGlowShift {
    0% { transform: translate3d(-1.5%, 0, 0) scale(1); opacity: 0.9; }
    100% { transform: translate3d(1.5%, 2%, 0) scale(1.03); opacity: 1; }
  }

  .hero-load { animation: fadeUpIn 0.68s cubic-bezier(0.22, 1, 0.36, 1) both; }
  .delay-1 { animation-delay: 0.08s; }
  .delay-2 { animation-delay: 0.2s; }
  .delay-3 { animation-delay: 0.34s; }
  .delay-4 { animation-delay: 0.48s; }

  .reveal { opacity: 1; transform: translate3d(0, 0, 0); }
  .motion-safe .reveal {
    opacity: 0;
    transform: translate3d(0, 34px, 0);
    transition: opacity 0.72s ease, transform 0.72s cubic-bezier(0.22, 1, 0.36, 1);
    will-change: opacity, transform;
  }
  .motion-safe .reveal.in-view {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }

  /* ── NAVBAR ── */
  .navbar {
    position: sticky; top: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 2rem; height: 64px;
    background: rgba(10,10,15,0.88); backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
  }
  [data-theme="light"] .navbar { background: rgba(255,255,255,0.88); }
  .nav-logo {
    font-family:'Syne',sans-serif; font-weight:800; font-size:1.35rem;
    display:flex; align-items:center; gap:6px;
    background:linear-gradient(135deg,var(--purple-light),var(--gold));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .nav-logo span { color: var(--gold); -webkit-text-fill-color: var(--gold); }
  .nav-links { display: flex; gap: 1.5rem; }
  .nav-links a {
    color: var(--text-muted); text-decoration: none; font-size: 0.88rem; font-weight: 500;
    transition: color 0.2s; cursor: pointer;
  }
  .nav-links a:hover, .nav-links a.active { color: var(--text); }
  .nav-right { display: flex; align-items: center; gap: 0.75rem; }
  .nav-menu-btn {
    display: none;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--bg3);
    cursor: pointer;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 4px;
  }
  .nav-menu-btn span {
    width: 16px;
    height: 2px;
    border-radius: 2px;
    background: var(--text);
    transition: transform 0.2s ease, opacity 0.2s ease;
  }
  .nav-menu-btn.open span:nth-child(1) { transform: translateY(6px) rotate(45deg); }
  .nav-menu-btn.open span:nth-child(2) { opacity: 0; }
  .nav-menu-btn.open span:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }
  .mobile-nav-menu { display: none; }
  .nav-icon-btn {
    width: 40px; height: 40px; border-radius: 8px;
    background: var(--bg3); border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 1rem;
  }
  .nav-icon-btn.notif { position: relative; }
  .nav-icon-btn.notif::after {
    content: "";
    position: absolute;
    top: 9px;
    right: 9px;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--live-red);
    border: 2px solid var(--bg);
  }
  .btn-outline {
    padding: 0.35rem 0.85rem; border-radius: 8px;
    border: 1px solid var(--border2); background: transparent;
    color: var(--text); font-family: 'DM Sans', sans-serif; font-size: 0.8rem; font-weight: 600;
    cursor: pointer; transition: all 0.2s;
  }
  .btn-outline:hover { border-color: var(--purple-light); color: var(--purple-light); }
  .btn-primary {
    padding: 0.35rem 0.85rem; border-radius: 8px;
    background: var(--purple); border: none;
    color: #fff; font-family: 'DM Sans', sans-serif; font-size: 0.8rem; font-weight: 600;
    cursor: pointer; transition: background 0.2s;
  }
  .btn-primary:hover { background: var(--purple-light); }

  /* ── HERO ── */
  .hero {
    min-height: 100vh; display: flex; flex-direction: column;
    align-items: center; justify-content: center; text-align: center;
    padding: 5.5rem 2rem 4.5rem;
    background: radial-gradient(ellipse 80% 55% at 50% -10%, rgba(108,99,255,0.22), transparent),
                radial-gradient(ellipse 50% 40% at 85% 85%, rgba(245,158,11,0.1), transparent),
                var(--bg);
    position: relative; overflow: hidden; width: 100%;
  }
  .hero::before {
    content: ''; position: absolute; inset: 0;
    background: radial-gradient(ellipse 80% 60% at 50% 100%, rgba(108,92,231,0.1), transparent);
    pointer-events: none;
    animation: heroGlowShift 6.5s ease-in-out infinite alternate;
  }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 0.25rem 0.875rem; border-radius: 20px;
    background: rgba(108,92,231,0.15); border: 1px solid var(--border);
    font-size: 0.75rem; font-weight: 600; letter-spacing: 0.05em;
    color: var(--purple-light); text-transform: uppercase; margin-bottom: 1.75rem;
  }
  .hero-title {
    font-family: 'Syne', sans-serif; font-weight: 800;
    font-size: clamp(2.4rem, 5.5vw, 4.5rem); line-height: 1.2;
    letter-spacing: -2px; margin-bottom: 1.5rem;
  }
  .hero-title .line1 { color: var(--text); display: block; }
  .hero-title .line2 {
    display: block;
    background: linear-gradient(135deg, var(--purple-light), var(--gold));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .hero-sub {
    color: var(--text-muted); font-size: 1.05rem; max-width: 540px;
    line-height: 1.7; margin-bottom: 2.5rem;
  }
  .hero-ctas { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
  .cta-start {
    padding: 0.75rem 2rem; border-radius: 12px;
    background: var(--purple); border: none;
    color: #fff; font-family: 'DM Sans', sans-serif; font-size: 1rem; font-weight: 600;
    cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 8px;
  }
  .cta-start:hover { background: var(--purple-light); transform: translateY(-1px); }
  .cta-sell {
    padding: 0.75rem 2rem; border-radius: 12px;
    background: transparent; border: 1px solid var(--border2);
    color: var(--text); font-family: 'DM Sans', sans-serif; font-size: 1rem; font-weight: 600;
    cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 8px;
  }
  .cta-sell:hover { border-color: var(--text); transform: translateY(-1px); }

  /* ── STATS ── */
  .stats {
    display: flex; justify-content: center; gap: 3rem; flex-wrap: wrap;
    padding: 3rem 2rem;
    background: linear-gradient(180deg, rgba(10,10,15,0) 0%, rgba(20,18,40,0.6) 50%, rgba(10,10,15,0) 100%);
    width: 100%;
  }
  [data-theme="light"] .stats {
    background: linear-gradient(180deg, rgba(91,82,238,0.02) 0%, rgba(91,82,238,0.08) 50%, rgba(91,82,238,0.02) 100%);
  }
  .stat { text-align: center; }
  .stat-val {
    font-family: 'Syne', sans-serif; font-weight: 800; font-size: 2rem;
    background: linear-gradient(135deg, var(--purple-light), var(--gold));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    letter-spacing: -1px;
  }
  .stat-label { font-size: 0.75rem; letter-spacing: 0.07em; text-transform: uppercase; color: var(--text-dim); margin-top: 0.2rem; }

  /* ── SECTION COMMON ── */
  .section { padding: 4rem 2rem; max-width: 1320px; margin: 0 auto; width: 100%; }
  .section-badge {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 0.25rem 0.875rem; border-radius: 20px;
    background: rgba(108,92,231,0.15); border: 1px solid var(--border);
    font-size: 0.75rem; font-weight: 600; letter-spacing: 0.05em;
    color: var(--purple-light); text-transform: uppercase; margin-bottom: 1rem;
  }
  .section-title {
    font-family: 'Syne', sans-serif; font-weight: 800;
    font-size: clamp(1.75rem, 3vw, 2.25rem); margin-bottom: 0.625rem; color: var(--text);
  }
  .section-sub { color: var(--text-muted); font-size: 0.9rem; max-width: 480px; margin: 0 auto 3rem; }
  .section-center { text-align: center; }
  .section-alt { background: var(--bg2); padding: 4rem 2rem; }
  .section-alt .section { padding: 0; }

  /* ── AUCTION CARDS ── */
  .auctions-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(270px, 1fr)); gap: 1.5rem;
  }
  .auction-card {
    background: var(--bg3); border: 1px solid var(--border);
    border-radius: 16px; overflow: hidden;
    transition: transform 0.2s, border-color 0.2s;
    cursor: pointer;
  }
  .auction-card:hover { transform: translateY(-4px); border-color: var(--purple); }
  .card-img {
    height: 195px; display: flex; align-items: center; justify-content: center;
    background: var(--bg4); font-size: 3.5rem; position: relative;
  }
  .card-live-badge {
    position: absolute; top: 12px; left: 12px;
    background: var(--live-red); color: #fff;
    font-size: 0.68rem; font-weight: 700; padding: 0.2rem 0.55rem; border-radius: 20px;
    display: flex; align-items: center; gap: 4px; letter-spacing: 0.06em;
  }
  .card-live-dot { width: 5px; height: 5px; border-radius: 50%; background: #fff; animation: pulse 1.2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
  .card-fav {
    position: absolute; top: 12px; right: 12px;
    width: 30px; height: 30px; border-radius: 50%;
    background: rgba(0,0,0,0.5); border: none; color: #fff;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 0.85rem;
  }
  .card-body { padding: 1.2rem; }
  .card-title { font-weight: 600; font-size: 0.93rem; margin-bottom: 0.4rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .card-seller { color: var(--text-dim); font-size: 0.75rem; margin-bottom: 0.9rem; }
  .card-bid-row { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 0.8rem; }
  .card-bid-label { font-size: 0.7rem; letter-spacing: 0.05em; text-transform: uppercase; color: var(--text-dim); }
  .card-bid-amount { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.2rem; color: var(--gold); }
  .card-timer { font-size: 0.75rem; color: var(--text-muted); display: flex; align-items: center; gap: 4px; }
  .timer-urgent { color: #ff6b6b; }
  .card-btn {
    width: 100%; padding: 0.58rem; border-radius: 8px;
    background: var(--purple); border: none;
    color: #fff; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 0.85rem;
    cursor: pointer; transition: background 0.2s;
  }
  .card-btn:hover { background: var(--purple-light); }

  /* ── CATEGORIES ── */
  .categories-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(135px, 1fr)); gap: 1rem;
  }
  .cat-card {
    background: var(--bg3); border: 1px solid var(--border);
    border-radius: 12px; padding: 1.5rem 1rem; text-align: center;
    cursor: pointer; transition: all 0.2s;
  }
  .cat-card:hover { background: var(--bg4); border-color: var(--purple); transform: translateY(-2px); }
  .cat-icon { font-size: 1.9rem; margin-bottom: 0.55rem; }
  .cat-name { font-weight: 600; font-size: 0.83rem; }
  .cat-count { color: var(--text-dim); font-size: 0.7rem; margin-top: 0.15rem; }

  /* ── HOW IT WORKS ── */
  .how-bg { background: var(--bg2); }
  .how-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 2rem; }
  .how-card {
    background: var(--bg3); border: 1px solid var(--border);
    border-radius: 16px; padding: 2rem 1.5rem; text-align: center;
    transition: all 0.3s;
  }
  .how-card:hover { border-color: var(--purple); box-shadow: 0 8px 32px rgba(108,92,231,0.25); }
  [data-theme="light"] .how-card:hover { box-shadow: 0 8px 22px rgba(91,82,238,0.12); }
  .how-num {
    width: 46px; height: 46px; border-radius: 50%;
    background: var(--purple); display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.1rem;
    margin: 0 auto 1rem;
  }
  .how-title { font-weight: 700; font-size: 0.95rem; margin-bottom: 0.45rem; }
  .how-desc { color: var(--text-muted); font-size: 0.85rem; line-height: 1.65; }

  /* ── FOOTER ── */
  .footer { background: var(--bg2); border-top: 1px solid var(--border); padding: 3rem 2rem; width: 100%; }
  .footer-inner { width: 100%; max-width: 1320px; margin: 0 auto; }
  .footer-top { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 2rem; margin-bottom: 2rem; }
  .footer-brand .nav-logo { margin-bottom: 1rem; }
  .footer-brand p { color: var(--text-muted); font-size: 0.83rem; line-height: 1.7; max-width: 260px; }
  .footer-socials { display: flex; gap: 0.6rem; margin-top: 1.4rem; }
  .social-btn {
    width: 42px; height: 42px; border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.16);
    color: #ffffff;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: transform 0.2s, filter 0.2s;
  }
  .social-btn svg { width: 20px; height: 20px; display: block; fill: currentColor; }
  .social-btn.facebook { background: #1877f2; }
  .social-btn.instagram { background: radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%); }
  .social-btn.linkedin { background: #0a66c2; }
  .social-btn.github { background: #171515; }
  .social-btn:hover { transform: translateY(-2px); filter: brightness(1.08); }
  .footer-col h4 {
    font-family: 'Syne', sans-serif; font-size: 0.8rem; font-weight: 700;
    letter-spacing: 0.07em; text-transform: uppercase; color: var(--text-muted);
    margin-bottom: 0.9rem;
  }
  .footer-col a {
    display: block; color: var(--text-muted); text-decoration: none;
    font-size: 0.83rem; margin-bottom: 0.45rem; transition: color 0.2s;
  }
  .footer-col a:hover { color: var(--purple-light); }
  .footer-bottom {
    border-top: 1px solid var(--border); padding-top: 1.25rem;
    display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;
  }
  .footer-bottom p { color: var(--text-muted); font-size: 0.78rem; }
  .footer-legal { display: flex; gap: 0.3rem; align-items: center; }
  .footer-legal a { color: var(--text-muted); text-decoration: none; font-size: 0.82rem; transition: color 0.2s; }
  .footer-legal a:hover { color: var(--purple-light); }
  .footer-legal span { color: var(--border); font-size: 0.8rem; }

  @media (max-width: 1024px) {
    body { zoom: 1; }
    .navbar { padding: 0 1rem; }
    .hero { padding: 5rem 1rem 3.5rem; }
    .section { padding: 3rem 1rem; }
    .section-alt { padding: 3rem 1rem; }
    .footer { padding: 2.25rem 1rem; }
  }

  @media (max-width: 768px) {
    .navbar { min-height: 64px; height: auto; padding: 0.55rem 0.8rem; gap: 0.55rem; }
    .nav-links { display: none; }
    .nav-menu-btn { display: inline-flex; }
    .nav-right { display: none; }
    .btn-outline,
    .btn-primary {
      flex: 0 0 auto;
      white-space: nowrap;
      padding: 0.35rem 0.62rem;
      font-size: 0.74rem;
    }
    .mobile-nav-menu {
      display: flex;
      position: absolute;
      top: calc(100% + 8px);
      left: 0.8rem;
      right: 0.8rem;
      flex-direction: column;
      gap: 0.15rem;
      padding: 0.45rem;
      border-radius: 12px;
      border: 1px solid var(--border);
      background: var(--bg3);
      box-shadow: 0 14px 28px rgba(0, 0, 0, 0.35);
      z-index: 150;
    }
    .mobile-nav-menu a {
      text-decoration: none;
      color: var(--text-muted);
      padding: 0.58rem 0.62rem;
      border-radius: 8px;
      font-size: 0.86rem;
      font-weight: 600;
    }
    .mobile-nav-menu a:hover,
    .mobile-nav-menu a.active {
      color: var(--text);
      background: var(--bg4);
    }
    .mobile-nav-actions {
      margin-top: 0.35rem;
      padding-top: 0.5rem;
      border-top: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }
    .mobile-nav-theme {
      width: 100%;
      height: 38px;
      border-radius: 8px;
      border: 1px solid var(--border);
      background: var(--bg4);
      color: var(--text);
      font-family: 'DM Sans', sans-serif;
      font-size: 0.82rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 0.45rem;
      padding: 0 0.7rem;
      cursor: pointer;
    }
    .mobile-nav-actions > * { width: 100%; }
    .mobile-nav-actions a { width: 100%; text-decoration: none; }
    .mobile-nav-actions .btn-outline,
    .mobile-nav-actions .btn-primary {
      width: 100%;
      text-align: left;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      padding: 0.55rem 0.7rem;
      font-size: 0.8rem;
    }
    .hero-ctas { width: 100%; }
    .cta-start,
    .cta-sell { width: 100%; justify-content: center; }
    .stats { gap: 1.25rem; padding: 2rem 1rem; }
    .section-sub { margin-bottom: 2rem; }
    .footer-top { grid-template-columns: 1fr 1fr; }
  }

  @media (max-width: 480px) {
    .hero { padding: 4.5rem 1rem 3rem; }
    .hero-title { letter-spacing: -1px; }
    .categories-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .auctions-grid { grid-template-columns: 1fr; }
    .footer-top { grid-template-columns: 1fr; }
    .footer-bottom { justify-content: center; text-align: center; }
  }
`;

const auctions = [
   { id: 1, emoji: "🎸", title: "1959 Gibson Les Paul Standard", seller: "VintageGuitarVault", bid: "₹48,500", timer: "0h 47m", urgent: true, live: true },
   { id: 2, emoji: "⌚", title: "Patek Philippe Nautilus Ref. 5711", seller: "SwissTimepieces", bid: "₹32,000", timer: "2h 14m", urgent: true, live: true },
   { id: 3, emoji: "🎨", title: "Banksy Original Signed Print", seller: "LondonArtHouse", bid: "₹9,200", timer: "1d 3h", urgent: false, live: false },
   { id: 4, emoji: "🚗", title: "1967 Ford Mustang GT500", seller: "ClassicMotors", bid: "₹28,000", timer: "3d", urgent: false, live: false },
];

const categories = [
  { emoji: "📱", name: "Electronics", count: "1,243 items" },
  { emoji: "🏺", name: "Antiques", count: "892 items" },
  { emoji: "💎", name: "Jewelry", count: "654 items" },
  { emoji: "🎨", name: "Fine Art", count: "438 items" },
  { emoji: "🏠", name: "Real Estate", count: "127 items" },
  { emoji: "🚗", name: "Vehicles", count: "312 items" },
  { emoji: "⌚", name: "Watches", count: "567 items" },
  { emoji: "🃏", name: "Collectibles", count: "2,108 items" },
];

const socialLinks = [
  { label: "Facebook", href: "https://www.facebook.com/share/19uwienjtt/" },
  { label: "Instagram", href: "https://www.instagram.com/darsh6608" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/darsh6608/" },
  { label: "GitHub", href: "https://github.com/Darsh2904" },
];

function getSocialIcon(label) {
  if (label === "Facebook") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.6 1.7-1.6h1.6V3.8c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.3H8v3h2.6v8h2.9z" />
      </svg>
    );
  }

  if (label === "Instagram") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M16.5 3h-9A4.5 4.5 0 0 0 3 7.5v9A4.5 4.5 0 0 0 7.5 21h9a4.5 4.5 0 0 0 4.5-4.5v-9A4.5 4.5 0 0 0 16.5 3zM19.3 16.5a2.8 2.8 0 0 1-2.8 2.8h-9a2.8 2.8 0 0 1-2.8-2.8v-9a2.8 2.8 0 0 1 2.8-2.8h9a2.8 2.8 0 0 1 2.8 2.8v9z" />
        <path d="M12 7.5A4.5 4.5 0 1 0 16.5 12 4.5 4.5 0 0 0 12 7.5zm0 7.3a2.8 2.8 0 1 1 2.8-2.8 2.8 2.8 0 0 1-2.8 2.8z" />
        <circle cx="17.2" cy="6.8" r="1" />
      </svg>
    );
  }

  if (label === "LinkedIn") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6.1 8.4a1.8 1.8 0 1 1 0-3.6 1.8 1.8 0 0 1 0 3.6zM4.7 9.8h2.8V19H4.7V9.8zm4.5 0h2.7v1.3h.1c.4-.7 1.3-1.5 2.7-1.5 2.8 0 3.3 1.8 3.3 4.2V19h-2.8v-4.6c0-1.1 0-2.5-1.5-2.5s-1.7 1.2-1.7 2.4V19H9.2V9.8z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 .5a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.4.7-4.1-1.4-4.1-1.4a3.2 3.2 0 0 0-1.3-1.8c-1.1-.7.1-.7.1-.7a2.5 2.5 0 0 1 1.8 1.2 2.5 2.5 0 0 0 3.4 1 2.5 2.5 0 0 1 .8-1.6c-2.7-.3-5.5-1.3-5.5-6a4.7 4.7 0 0 1 1.2-3.2 4.3 4.3 0 0 1 .1-3.1s1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2a4.3 4.3 0 0 1 .1 3.1 4.7 4.7 0 0 1 1.2 3.2c0 4.7-2.9 5.7-5.6 6 .4.3.9 1 .9 2.1v3.1c0 .3.2.7.8.6A12 12 0 0 0 12 .5z" />
      </svg>
  );
}

const footerSections = [
  {
    title: "Platform",
    links: [
      { label: "Browse Auctions", to: "/browse" },
      { label: "Sell an Item", to: "/create-auction" },
      { label: "Pricing", to: "/dashboard" },
      { label: "API Docs", href: "https://github.com/Darsh2904/BidVault#readme", external: true },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", to: "/about-us" },
      { label: "Careers", to: "/dashboard" },
      { label: "Blog", to: "/auctions" },
      { label: "Press", href: "https://github.com/Darsh2904/BidVault", external: true },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", to: "/help-center" },
      { label: "Contact Us", href: "mailto:darshnation@gmail.com" },
      { label: "Trust & Safety", to: "/trust-safety" },
      { label: "Disputes", to: "/dashboard" },
    ],
  },
];

export default function BidVault() {
  const [favs, setFavs] = useState({});
  const [showBellToast, setShowBellToast] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [liveAuctionsCount, setLiveAuctionsCount] = useState(null);
  const [liveCountError, setLiveCountError] = useState(false);
  const [actionError, setActionError] = useState("");
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const loadLiveAuctions = async () => {
      try {
        const data = await getApprovedAuctions();
        const auctionsList = Array.isArray(data?.auctions) ? data.auctions : [];
        const liveCount = auctionsList.filter((auction) => auction.live !== false).length;

        if (isMounted) {
          setLiveCountError(false);
          setLiveAuctionsCount(liveCount);
        }
      } catch {
        if (isMounted) {
          setLiveCountError(true);
        }
      }
    };

    loadLiveAuctions();
    const intervalId = setInterval(loadLiveAuctions, 30000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return undefined;

    const root = document.documentElement;
    root.classList.add("motion-safe");

    const revealTargets = Array.from(document.querySelectorAll(".reveal"));
    if (!revealTargets.length) return () => root.classList.remove("motion-safe");

    if (!("IntersectionObserver" in window)) {
      revealTargets.forEach((target) => target.classList.add("in-view"));
      return () => root.classList.remove("motion-safe");
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
    );

    revealTargets.forEach((target) => observer.observe(target));

    return () => {
      observer.disconnect();
      root.classList.remove("motion-safe");
    };
  }, []);

  const toggleFav = (id) => setFavs(p => ({ ...p, [id]: !p[id] }));
  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const triggerBellToast = () => {
    setShowBellToast(true);
    setTimeout(() => setShowBellToast(false), 4500);
  };

  const requireLogin = (message) => {
    if (isAuthenticated && token) return true;
    setActionError(message);
    setTimeout(() => setActionError(""), 3500);
    navigate("/auth");
    return false;
  };

  const handleStartBidding = () => {
    if (!requireLogin("Please login to start bidding.")) return;
    navigate("/browse");
  };

  const handleSellItem = () => {
    if (!requireLogin("Please login to sell an item.")) return;
    navigate("/create-auction");
  };
  const isLightTheme = theme === "light";

  return (
    <>
      <style>{styles}</style>

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-logo">BidVault <span>⚡</span></div>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/browse">Browse</Link>
          <Link to="/auctions">Auctions</Link>
          <Link to="/dashboard">Dashboard</Link>
        </div>
        <button
          className={`nav-menu-btn ${isMobileMenuOpen ? "open" : ""}`}
          type="button"
          aria-label="Toggle navigation menu"
          aria-expanded={isMobileMenuOpen}
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <div className="nav-right">
          <button className="nav-icon-btn" onClick={toggleTheme} title="Toggle theme">{theme === "light" ? "☀️" : "🌙"}</button>
          <button className="nav-icon-btn notif" onClick={triggerBellToast}>🔔</button>
          <AuthNavActions />
        </div>
        {isMobileMenuOpen && (
          <div className="mobile-nav-menu">
            <Link to="/" onClick={closeMobileMenu}>Home</Link>
            <Link to="/browse" onClick={closeMobileMenu}>Browse</Link>
            <Link to="/auctions" onClick={closeMobileMenu}>Auctions</Link>
            <Link to="/dashboard" onClick={closeMobileMenu}>Dashboard</Link>
            <div className="mobile-nav-actions">
              <button
                className="mobile-nav-theme"
                type="button"
                onClick={() => {
                  toggleTheme();
                  closeMobileMenu();
                }}
              >
                <span>{theme === "light" ? "☀️" : "🌙"}</span>
                <span>{theme === "light" ? "Light Mode" : "Dark Mode"}</span>
              </button>
              <AuthNavActions />
            </div>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-badge hero-load delay-1">
          ✨ {liveCountError ? "Live Count Unavailable" : liveAuctionsCount === null ? "Loading..." : liveAuctionsCount.toLocaleString("en-IN")} {liveCountError ? "" : "Live Auctions Happening Now"}
        </div>
        <h1 className="hero-title hero-load delay-2">
          <span className="line1">Bid Smart.</span>
          <span className="line2">Win Big.</span>
        </h1>
        <p className="hero-sub hero-load delay-3">
          Join the world's most trusted e-auction platform. Discover rare finds, sell your treasures, and bid with total confidence.
        </p>
        <div className="hero-ctas hero-load delay-4">
          <button className="cta-start" onClick={handleStartBidding}>🔥 Start Bidding</button>
          <button className="cta-sell" onClick={handleSellItem}>💎 Sell an Item</button>
        </div>
        {actionError && (
          <div
            style={{
              marginTop: "1rem",
              borderRadius: "10px",
              padding: "0.6rem 0.9rem",
              fontSize: "0.83rem",
              border: "1px solid rgba(255, 68, 68, 0.45)",
              background: "rgba(255, 68, 68, 0.12)",
              color: "#ff9c9c",
            }}
          >
            {actionError}
          </div>
        )}
      </section>

      {/* STATS */}
      <div className="stats reveal">
          {[ ["2.4M+","Active Users"],["₹840M","Total Sales"],["98.7%","Satisfaction"],["150+","Countries"]].map(([v,l]) => (
          <div className="stat" key={l}>
            <div className="stat-val">{v}</div>
            <div className="stat-label">{l}</div>
          </div>
        ))}
      </div>

      {/* FEATURED AUCTIONS */}
      <div className="reveal">
        <div className="section">
          <div className="section-center" style={{ marginBottom: "2rem" }}>
            <div className="section-badge">🔥 Hot Right Now</div>
            <h2 className="section-title">Featured Auctions</h2>
            <p className="section-sub">Don't miss out — these are ending soon</p>
          </div>
          <div className="auctions-grid">
            {auctions.map(a => (
              <div className="auction-card" key={a.id}>
                <div className="card-img">
                  {a.live && <span className="card-live-badge"><span className="card-live-dot"/>LIVE</span>}
                  <button className="card-fav" onClick={() => toggleFav(a.id)}>
                    {favs[a.id] ? "❤️" : "🤍"}
                  </button>
                  <span style={{ fontSize: "3.5rem" }}>{a.emoji}</span>
                </div>
                <div className="card-body">
                  <div className="card-title">{a.title}</div>
                  <div className="card-seller">by {a.seller}</div>
                  <div className="card-bid-row">
                    <div>
                      <div className="card-bid-label">Current Bid</div>
                      <div className="card-bid-amount">{a.bid}</div>
                    </div>
                    <div className={`card-timer ${a.urgent ? "timer-urgent" : ""}`}>
                      ⏱ {a.timer}
                    </div>
                  </div>
                  <button
                    className="card-btn"
                    onClick={() => {
                      if (!requireLogin("Please login to place a bid.")) return;
                      navigate(`/auctions/${a.id}`);
                    }}
                  >
                    🔨 Place Bid
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
            <button className="cta-sell" style={{ display: "inline-flex" }} onClick={() => navigate("/browse")}>View All Auctions →</button>
          </div>
        </div>
      </div>

      {/* CATEGORIES */}
      <div className="section-alt reveal">
        <div className="section">
          <div className="section-center" style={{ marginBottom: "2.5rem" }}>
            <div className="section-badge">Browse by Category</div>
            <h2 className="section-title">Explore Categories</h2>
          </div>
          <div className="categories-grid">
            {categories.map(c => (
              <div className="cat-card" key={c.name}>
                <div className="cat-icon">{c.emoji}</div>
                <div className="cat-name">{c.name}</div>
                <div className="cat-count">{c.count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="how-bg reveal">
        <div className="section">
          <div className="section-center" style={{ marginBottom: "2.5rem" }}>
            <div className="section-badge">Simple Process</div>
            <h2 className="section-title">How BidVault Works</h2>
            <p className="section-sub">Get started in minutes with our simple 3-step process</p>
          </div>
          <div className="how-grid">
            {[
              { n: "1", t: "Register & Verify", d: "Create your secure account with email verification and identity confirmation in minutes." },
              { n: "2", t: "Browse & Bid", d: "Discover thousands of items, track your bids in real-time, and get instant outbid notifications." },
              { n: "3", t: "Win & Receive", d: "Secure escrow-protected checkout and fast tracked shipping directly to your door." },
            ].map(s => (
              <div className="how-card" key={s.n}>
                <div className="how-num">{s.n}</div>
                <div className="how-title">{s.t}</div>
                <div className="how-desc">{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="footer reveal">
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="nav-logo">BidVault <span style={{ color: "var(--gold)" }}>⚡</span></div>
              <p>The world's most secure and transparent online auction platform connecting buyers and sellers globally.</p>
              <div className="footer-socials">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    className={`social-btn ${social.label.toLowerCase()}`}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.label}
                    title={social.label}
                  >
                    {getSocialIcon(social.label)}
                  </a>
                ))}
              </div>
            </div>
            {footerSections.map((section) => (
              <div className="footer-col" key={section.title}>
                <h4>{section.title}</h4>
                {section.links.map((link) => (
                  link.to ? (
                    <Link key={link.label} to={link.to}>{link.label}</Link>
                  ) : (
                    <a
                      key={link.label}
                      href={link.href}
                      target={link.external ? "_blank" : undefined}
                      rel={link.external ? "noreferrer" : undefined}
                    >
                      {link.label}
                    </a>
                  )
                ))}
              </div>
            ))}
          </div>
          <div className="footer-bottom">
            <p>© 2026 Darsh Patel. All rights reserved.</p>
            <div className="footer-legal">
              <Link to="/privacy-statement">Privacy</Link><span> · </span>
              <Link to="/terms-conditions">Terms</Link><span> · </span>
              <Link to="/privacy-statement#cookies">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>

      {showBellToast && (
        <div style={{
          position: "fixed",
          right: "1.5rem",
          bottom: "1.5rem",
          zIndex: 9999,
          background: isLightTheme ? "#e6e6f6" : "#2d2d48",
          border: isLightTheme ? "1px solid #c5c5e5" : "1px solid #3a3a58",
          borderRadius: "12px",
          padding: "0.9rem 1.1rem",
          minWidth: "270px",
          maxWidth: "340px",
          display: "flex",
          gap: "0.75rem",
          boxShadow: isLightTheme ? "0 4px 20px rgba(91,82,238,0.08)" : "0 8px 32px rgba(0,0,0,0.4)"
        }}>
          <span style={{ fontSize: "1.2rem", flexShrink: 0 }}>🔔</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: "0.85rem", marginBottom: "0.15rem" }}>New Bid Alert</div>
            <div style={{ fontSize: "0.78rem", color: isLightTheme ? "#4a4a6a" : "#a0a0c0" }}>Someone outbid you on Vintage Rolex Watch!</div>
          </div>
        </div>
      )}
    </>
  );
}
