import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthNavActions from "./AuthNavActions";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
  :root {
    --bg:#0a0a0f; --bg2:#12121a; --bg3:#1a1a28; --bg4:#252538;
    --purple:#6c5ce7; --purple-light:#8b7cf8; --gold:#f0b429;
    --text:#ffffff; --text-muted:#8888aa; --border:rgba(108,92,231,0.2);
    --live-red:#ff4444; --green:#00c48c;
  }
  body { background:var(--bg); color:var(--text); font-family:'DM Sans',sans-serif; min-height:100vh; zoom: 1; }

  /* ── NAVBAR ── */
  .navbar {
    position:sticky; top:0; z-index:200;
    display:flex; align-items:center; justify-content:space-between;
    padding:0 2rem; height:64px;
    background:rgba(10,10,15,0.88); backdrop-filter:blur(20px);
    border-bottom:1px solid var(--border);
  }
  .nav-logo {
    font-family:'Syne',sans-serif; font-weight:800; font-size:1.35rem;
    display:flex; align-items:center; gap:6px;
    background:linear-gradient(135deg,var(--purple-light),var(--gold));
    -webkit-background-clip:text;
    -webkit-text-fill-color:transparent;
  }
  .nav-logo span { color:var(--gold); -webkit-text-fill-color:var(--gold); }
  .nav-links { display:flex; gap:1.5rem; }
  .nav-links a { color:var(--text-muted); text-decoration:none; font-size:0.88rem; font-weight:500; cursor:pointer; transition:color .2s; }
  .nav-links a:hover { color:var(--text); }
  .nav-right { display:flex; align-items:center; gap:.75rem; }
  .nav-icon-btn { width:40px; height:40px; border-radius:8px; background:var(--bg3); border:1px solid var(--border); display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:1rem; }
  .nav-icon-btn.notif { background:#2a1f5e; border-color:var(--purple); }
  .btn-outline { padding:.35rem .85rem; border-radius:8px; border:1px solid rgba(255,255,255,.2); background:transparent; color:var(--text); font-family:'DM Sans',sans-serif; font-size:.8rem; font-weight:600; cursor:pointer; transition:all .2s; }
  .btn-outline:hover { border-color:var(--purple-light); color:var(--purple-light); }
  .btn-primary { padding:.35rem .85rem; border-radius:8px; background:var(--purple); border:none; color:#fff; font-family:'DM Sans',sans-serif; font-size:.8rem; font-weight:600; cursor:pointer; }

  /* ── PAGE LAYOUT ── */
  .page { max-width:1280px; margin:0 auto; padding:2.5rem 2rem; display:grid; grid-template-columns:1fr 1fr; gap:3rem; align-items:start; }
  @media(max-width:900px){ body { zoom: 1; } .page{ grid-template-columns:1fr; } }

  /* ── LEFT: GALLERY ── */
  .gallery {}
  .main-img {
    width:100%; aspect-ratio:4/3; border-radius:16px;
    background:var(--bg3); border:1px solid var(--border);
    display:flex; align-items:center; justify-content:center; font-size:8rem;
    margin-bottom:1rem; position:relative; overflow:hidden;
  }
  .live-pill {
    position:absolute; top:14px; left:14px;
    background:var(--live-red); color:#fff;
    font-size:.72rem; font-weight:700; padding:4px 10px; border-radius:7px;
    display:flex; align-items:center; gap:5px; letter-spacing:.06em;
  }
  .live-dot { width:7px; height:7px; border-radius:50%; background:#fff; animation:pulse 1.2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.35} }
  .thumbs { display:flex; gap:.75rem; }
  .thumb {
    width:80px; height:80px; border-radius:10px;
    background:var(--bg3); border:2px solid transparent;
    display:flex; align-items:center; justify-content:center; font-size:1.8rem;
    cursor:pointer; transition:all .2s; flex-shrink:0;
  }
  .thumb.active { border-color:var(--purple); background:var(--bg4); }
  .thumb:hover { border-color:var(--purple-light); }

  /* ── RIGHT: INFO ── */
  .info {}
  .cat-badge {
    display:inline-flex; align-items:center; gap:6px;
    padding:.3rem .9rem; border-radius:999px;
    background:rgba(108,92,231,.15); border:1px solid var(--border);
    font-size:.72rem; font-weight:700; letter-spacing:.1em;
    color:var(--purple-light); text-transform:uppercase; margin-bottom:1rem;
  }
  .item-title { font-family:'Syne',sans-serif; font-weight:800; font-size:clamp(1.6rem,3vw,2.2rem); line-height:1.15; margin-bottom:.75rem; }
  .seller-row { display:flex; align-items:center; gap:.5rem; font-size:.9rem; color:var(--text-muted); margin-bottom:1.5rem; }
  .seller-row a { color:var(--purple-light); font-weight:600; text-decoration:none; cursor:pointer; }
  .seller-row .star { color:var(--gold); }

  /* BID BOX */
  .bid-box { background:var(--bg3); border:1px solid var(--border); border-radius:14px; padding:1.25rem 1.5rem; margin-bottom:1rem; }
  .bid-label { font-size:.68rem; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:var(--text-muted); margin-bottom:.4rem; }
  .bid-amount { font-family:'Syne',sans-serif; font-weight:800; font-size:3rem; color:var(--gold); line-height:1; margin-bottom:.5rem; }
  .bid-meta { display:flex; justify-content:space-between; align-items:center; }
  .bids-placed { font-size:.85rem; color:var(--text-muted); }
  .reserve-met { color:var(--green); font-size:.85rem; font-weight:600; }

  /* COUNTDOWN */
  .countdown-box {
    background:var(--bg3); border:1px solid var(--border); border-radius:14px;
    padding:1.1rem 1.5rem; margin-bottom:1rem;
    display:flex; align-items:center; justify-content:center; gap:2rem;
  }
  .count-unit { text-align:center; }
  .count-num { font-family:'Syne',sans-serif; font-weight:800; font-size:2.5rem; color:var(--live-red); line-height:1; }
  .count-sep { font-family:'Syne',sans-serif; font-weight:800; font-size:2rem; color:var(--live-red); padding-bottom:.4rem; }
  .count-label { font-size:.65rem; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:var(--text-muted); margin-top:.3rem; }

  /* BID INPUT ROW */
  .bid-input-row { display:flex; gap:.75rem; margin-bottom:.75rem; }
  .bid-input {
    flex:1; padding:.85rem 1.1rem; border-radius:12px;
    background:var(--bg3); border:1px solid var(--border);
    color:var(--text); font-family:'DM Sans',sans-serif; font-size:1rem;
    outline:none; transition:border-color .2s;
  }
  .bid-input::placeholder { color:var(--text-muted); }
  .bid-input:focus { border-color:var(--purple); }
  .place-bid-btn {
    padding:.85rem 1.5rem; border-radius:12px; background:var(--purple); border:none;
    color:#fff; font-family:'DM Sans',sans-serif; font-weight:700; font-size:1rem;
    cursor:pointer; white-space:nowrap; display:flex; align-items:center; gap:6px;
    transition:background .2s;
  }
  .place-bid-btn:hover { background:var(--purple-light); }

  /* SECONDARY BTNS */
  .secondary-row { display:grid; grid-template-columns:1fr 1fr; gap:.75rem; margin-bottom:1.5rem; }
  .sec-btn {
    padding:.75rem; border-radius:12px; border:1px solid rgba(255,255,255,.15);
    background:transparent; color:var(--text); font-family:'DM Sans',sans-serif;
    font-size:.9rem; font-weight:500; cursor:pointer; transition:all .2s;
    display:flex; align-items:center; justify-content:center; gap:6px;
  }
  .sec-btn:hover { border-color:var(--purple-light); color:var(--purple-light); }

  /* TABS */
  .tabs { border-bottom:1px solid var(--border); display:flex; gap:0; margin-bottom:1.5rem; }
  .tab-btn {
    padding:.75rem 1.25rem; background:transparent; border:none; border-bottom:2px solid transparent;
    color:var(--text-muted); font-family:'DM Sans',sans-serif; font-size:.95rem; font-weight:500;
    cursor:pointer; transition:all .2s; margin-bottom:-1px;
  }
  .tab-btn:hover { color:var(--text); }
  .tab-btn.active { color:var(--purple-light); border-bottom-color:var(--purple); font-weight:600; }

  /* DESCRIPTION */
  .desc-text { color:var(--text); line-height:1.75; font-size:.95rem; margin-bottom:1.5rem; }
  .specs-grid { display:grid; grid-template-columns:1fr 1fr; gap:.75rem; }
  .spec-card { background:var(--bg3); border:1px solid var(--border); border-radius:12px; padding:1rem 1.25rem; }
  .spec-label { font-size:.7rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:var(--text-muted); margin-bottom:.35rem; }
  .spec-val { font-weight:600; font-size:.95rem; }

  /* BID HISTORY */
  .bid-table { width:100%; border-collapse:collapse; }
  .bid-table th { font-size:.68rem; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:var(--text-muted); text-align:left; padding:.6rem 0; border-bottom:1px solid var(--border); }
  .bid-table td { padding:.85rem 0; border-bottom:1px solid rgba(108,92,231,.1); font-size:.9rem; }
  .bid-table tr:last-child td { border-bottom:none; }
  .bid-top td { color:var(--gold); font-weight:700; }
  .bid-top td:last-child { color:var(--gold); }

  /* SHIPPING */
  .shipping-list { list-style:none; display:flex; flex-direction:column; gap:1rem; }
  .shipping-list li { display:flex; align-items:flex-start; gap:.75rem; font-size:.95rem; line-height:1.6; color:var(--text); }
  .shipping-list li span.ico { font-size:1.2rem; flex-shrink:0; margin-top:1px; }
  .shipping-list li b { color:var(--text); }

  /* MODAL */
  .modal-overlay {
    position:fixed; inset:0; z-index:500;
    background:rgba(0,0,0,.7); backdrop-filter:blur(6px);
    display:flex; align-items:center; justify-content:center; padding:1rem;
    animation:fadeIn .2s ease;
  }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  .modal {
    background:var(--bg3); border:1px solid var(--border);
    border-radius:20px; padding:2rem; width:100%; max-width:520px;
    animation:slideUp .25s ease;
  }
  @keyframes slideUp { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
  .modal-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:1.5rem; }
  .modal-title { font-family:'Syne',sans-serif; font-weight:700; font-size:1.35rem; display:flex; align-items:center; gap:8px; }
  .modal-close { width:32px; height:32px; border-radius:8px; background:var(--bg4); border:1px solid var(--border); color:var(--text-muted); font-size:1rem; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .2s; }
  .modal-close:hover { background:var(--bg); color:var(--text); }
  .modal-current { font-size:.95rem; color:var(--text-muted); margin-bottom:1.25rem; }
  .modal-current span { color:var(--gold); font-weight:700; font-size:1.05rem; }
  .modal-input-label { font-size:.68rem; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:var(--text-muted); margin-bottom:.5rem; display:block; }
  .modal-input {
    width:100%; padding:.9rem 1.1rem; border-radius:12px;
    background:var(--bg4); border:1px solid var(--border);
    color:var(--text); font-family:'DM Sans',sans-serif; font-size:1.05rem;
    outline:none; transition:border-color .2s; margin-bottom:.75rem;
  }
  .modal-input:focus { border-color:var(--purple); }
  .modal-terms { font-size:.82rem; color:var(--text-muted); margin-bottom:1.5rem; line-height:1.6; }
  .modal-terms a { color:var(--purple-light); text-decoration:none; }
  .modal-btns { display:grid; grid-template-columns:1fr 1fr; gap:.75rem; }
  .modal-cancel { padding:.85rem; border-radius:12px; border:1px solid rgba(255,255,255,.15); background:transparent; color:var(--text); font-family:'DM Sans',sans-serif; font-size:.95rem; font-weight:600; cursor:pointer; transition:all .2s; }
  .modal-cancel:hover { border-color:var(--text-muted); }
  .modal-confirm { padding:.85rem; border-radius:12px; background:var(--purple); border:none; color:#fff; font-family:'DM Sans',sans-serif; font-size:.95rem; font-weight:700; cursor:pointer; transition:background .2s; display:flex; align-items:center; justify-content:center; gap:6px; }
  .modal-confirm:hover { background:var(--purple-light); }

  /* SUCCESS TOAST */
  .toast {
    position:fixed; bottom:2rem; left:50%; transform:translateX(-50%);
    background:var(--green); color:#fff; padding:.75rem 1.5rem; border-radius:12px;
    font-weight:600; font-size:.95rem; z-index:600; display:flex; align-items:center; gap:8px;
    animation:toastIn .3s ease;
  }
  @keyframes toastIn { from{opacity:0;transform:translateX(-50%) translateY(20px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }

  @media (max-width: 1024px) {
    .navbar { padding: 0 1rem; }
    .nav-links { display: none; }
    .page { padding: 1.5rem 1rem 2rem; gap: 1.5rem; }
  }

  @media (max-width: 768px) {
    .nav-right { gap: 0.45rem; flex-wrap: wrap; justify-content: flex-end; }
    .nav-icon-btn.notif,
    .nav-right .btn-outline { display: none; }
    .btn-primary { padding: 0.35rem 0.65rem; font-size: 0.75rem; }
    .main-img { font-size: 6.2rem; }
    .thumbs { overflow-x: auto; padding-bottom: 0.35rem; }
    .thumb { width: 72px; height: 72px; font-size: 1.6rem; }
    .countdown-box { gap: 1rem; padding: 1rem; }
    .count-num { font-size: 2rem; }
    .count-sep { font-size: 1.6rem; }
    .bid-input-row { flex-direction: column; }
    .place-bid-btn { width: 100%; justify-content: center; }
    .secondary-row,
    .specs-grid,
    .modal-btns { grid-template-columns: 1fr; }
    .tabs { overflow-x: auto; white-space: nowrap; }
    .tab-btn { flex: 0 0 auto; }
    .modal { padding: 1.25rem; }
  }

  @media (max-width: 480px) {
    .item-title { font-size: 1.55rem; }
    .bid-amount { font-size: 2.4rem; }
    .seller-row { font-size: 0.82rem; }
    .toast { width: calc(100% - 1.5rem); left: 0.75rem; right: 0.75rem; transform: none; justify-content: center; }
  }
`;

const thumbs = ["🎸","📷","🎵","📦"];

const bidHistory = [
  { bidder:"G***2", amount:"₹48,500", time:"2 min ago", top:true },
  { bidder:"R***x", amount:"₹47,000", time:"15 min ago" },
  { bidder:"M***1", amount:"₹45,500", time:"1h ago" },
  { bidder:"V***n", amount:"₹44,000", time:"2h ago" },
  { bidder:"T***k", amount:"₹42,500", time:"3h ago" },
];

function useCountdown(h, m, s) {
  const total = h*3600 + m*60 + s;
  const [secs, setSecs] = useState(total);
  useEffect(() => {
    const id = setInterval(() => setSecs(p => p > 0 ? p-1 : 0), 1000);
    return () => clearInterval(id);
  }, []);
  const hh = String(Math.floor(secs/3600)).padStart(2,"0");
  const mm = String(Math.floor((secs%3600)/60)).padStart(2,"0");
  const ss = String(secs%60).padStart(2,"0");
  return [hh, mm, ss];
}

export default function AuctionPage() {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, token } = useAuth();
  const navigate = useNavigate();
  const [activeThumb, setActiveThumb] = useState(0);
  const [activeTab, setActiveTab] = useState("description");
  const [bidVal, setBidVal] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalBid, setModalBid] = useState("48650");
  const [watched, setWatched] = useState(false);
  const [toast, setToast] = useState(false);
  const [actionError, setActionError] = useState("");
  const [showBellToast, setShowBellToast] = useState(false);
  const [hh, mm, ss] = useCountdown(0, 25, 23);
  const isLightTheme = theme === "light";

  const requireLogin = () => {
    if (isAuthenticated && token) return true;
    setActionError("Please login to place a bid.");
    setTimeout(() => setActionError(""), 3500);
    navigate("/auth");
    return false;
  };

  const openModal = () => {
    if (!requireLogin()) return;
    setModalBid(bidVal || "48650");
    setShowModal(true);
  };

  const confirmBid = () => {
    if (!requireLogin()) return;
    setShowModal(false);
    setBidVal("");
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  const triggerBellToast = () => {
    setShowBellToast(true);
    setTimeout(() => setShowBellToast(false), 4500);
  };

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
        <div className="nav-right">
          <button className="nav-icon-btn" onClick={toggleTheme} title="Toggle theme">{isLightTheme ? "☀️" : "🌙"}</button>
          <button className="nav-icon-btn notif" onClick={triggerBellToast}>🔔</button>
          <AuthNavActions />
        </div>
      </nav>

      {/* PAGE */}
      <div className="page">

        {/* LEFT — GALLERY */}
        <div className="gallery">
          <div className="main-img">
            <span className="live-pill"><span className="live-dot"/>LIVE</span>
            <span style={{fontSize:"9rem"}}>{thumbs[activeThumb]}</span>
          </div>
          <div className="thumbs">
            {thumbs.map((t,i) => (
              <div key={i} className={`thumb ${activeThumb===i?"active":""}`} onClick={() => setActiveThumb(i)}>
                {t}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — INFO */}
        <div className="info">
          <div className="cat-badge">Collectibles · Music</div>
          <h1 className="item-title">1959 Gibson Les Paul Standard — Sunburst</h1>
          <div className="seller-row">
            Sold by <a>VintageGuitarVault</a> · <span className="star">⭐</span> 4.9 (312 reviews)
          </div>

          {/* Current Bid */}
          <div className="bid-box">
            <div className="bid-label">Current Highest Bid</div>
            <div className="bid-amount">₹48,500</div>
            <div className="bid-meta">
              <span className="bids-placed">47 bids placed</span>
              <span className="reserve-met">Reserve met ✓</span>
            </div>
          </div>

          {/* Countdown */}
          <div className="countdown-box">
            <div className="count-unit">
              <div className="count-num">{hh}</div>
              <div className="count-label">Hours</div>
            </div>
            <div className="count-sep">:</div>
            <div className="count-unit">
              <div className="count-num">{mm}</div>
              <div className="count-label">Min</div>
            </div>
            <div className="count-sep">:</div>
            <div className="count-unit">
              <div className="count-num">{ss}</div>
              <div className="count-label">Sec</div>
            </div>
          </div>

          {/* Bid Input */}
          <div className="bid-input-row">
            <input className="bid-input" placeholder="Enter bid — min ₹48,601"
              value={bidVal} onChange={e => setBidVal(e.target.value)} />
            <button className="place-bid-btn" onClick={openModal}>🔨 Place Bid</button>
          </div>
          {actionError && (
            <div
              style={{
                marginBottom: "0.8rem",
                borderRadius: "10px",
                padding: "0.55rem 0.75rem",
                fontSize: "0.78rem",
                border: "1px solid rgba(255, 68, 68, 0.45)",
                background: "rgba(255, 68, 68, 0.12)",
                color: "#ff9c9c",
              }}
            >
              {actionError}
            </div>
          )}

          {/* Watch / Share */}
          <div className="secondary-row">
            <button className="sec-btn" onClick={() => setWatched(w => !w)}>
              {watched ? "❤️" : "♡"} {watched ? "Watching" : "Watch Item"}
            </button>
            <button className="sec-btn">↗ Share</button>
          </div>

          {/* Tabs */}
          <div className="tabs">
            {[["description","Description"],["history","Bid History (47)"],["shipping","Shipping"]].map(([k,l]) => (
              <button key={k} className={`tab-btn ${activeTab===k?"active":""}`} onClick={() => setActiveTab(k)}>{l}</button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "description" && (
            <>
              <p className="desc-text">
                This is an exceptional example of the legendary 1959 Gibson Les Paul Standard in the iconic sunburst finish. One of the most sought-after electric guitars in history, meticulously maintained and authenticated by top experts. Original PAF humbuckers, original hardware, and the unmistakable neck profile that made 1959 the holy grail year for collectors worldwide.
              </p>
              <div className="specs-grid">
                {[["Year","1959"],["Condition","Excellent"],["Authenticity","Certified ✓"],["Origin","Kalamazoo, USA"]].map(([l,v]) => (
                  <div className="spec-card" key={l}>
                    <div className="spec-label">{l}</div>
                    <div className="spec-val">{v}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === "history" && (
            <table className="bid-table">
              <thead>
                <tr>
                  <th>Bidder</th><th>Amount</th><th>Time</th>
                </tr>
              </thead>
              <tbody>
                {bidHistory.map((b,i) => (
                  <tr key={i} className={b.top?"bid-top":""}>
                    <td>{b.bidder}</td>
                    <td>{b.amount}</td>
                    <td>{b.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === "shipping" && (
            <ul className="shipping-list">
              <li><span className="ico">🚚</span><span><b>Free insured shipping</b> worldwide via FedEx Priority</span></li>
              <li><span className="ico">📦</span><span>Packed in custom flight case included with purchase</span></li>
              <li><span className="ico">🔒</span><span><b>Escrow protected</b> — payment held until item received</span></li>
              <li><span className="ico">🔄</span><span>14-day return policy for authenticated items</span></li>
            </ul>
          )}
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">🔨 Place Your Bid</div>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <p className="modal-current">Current highest bid: <span>₹48,500</span></p>
            <label className="modal-input-label">Your Bid Amount (₹)</label>
            <input className="modal-input" value={modalBid}
              onChange={e => setModalBid(e.target.value)} placeholder="Enter amount" />
            <p className="modal-terms">
              By placing a bid you agree to our <a href="#">Terms &amp; Conditions</a>. Winning bids are binding.
            </p>
            <div className="modal-btns">
              <button className="modal-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="modal-confirm" onClick={confirmBid}>Confirm Bid 🔨</button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && <div className="toast">✅ Bid placed successfully!</div>}

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
