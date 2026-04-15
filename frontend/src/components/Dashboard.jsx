import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthNavActions from "./AuthNavActions";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  approveAdminRequest,
  approveAuctionListing,
  deleteAndBlockUser,
  getAdminUsers,
  getMyAuctionListings,
  getMyEscrowTransactions,
  getMyNotifications,
  getPendingAdminRequests,
  getPendingAuctionListings,
  raiseEscrowDispute,
  rejectAuctionListing,
  releaseEscrowFunds,
  requestEscrowRelease,
  updateAdminUserStatus,
} from "../utils/authApi";

const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
:root{
  --bg:#0a0a0f;--bg2:#12121a;--bg3:#1a1a28;--bg4:#252538;
  --purple:#6c5ce7;--purple-light:#8b7cf8;--gold:#f0b429;
  --green:#00c48c;--red:#ff4444;--orange:#ff8c00;
  --text:#fff;--muted:#8888aa;--border:rgba(108,92,231,.2);
}
body{background:var(--bg);color:var(--text);font-family:'DM Sans',sans-serif;min-height:100vh;zoom:1;}

/* NAV */
.nav{position:sticky;top:0;z-index:200;display:flex;align-items:center;justify-content:space-between;padding:0 2rem;height:64px;background:rgba(10,10,15,.88);backdrop-filter:blur(20px);border-bottom:1px solid var(--border);}
.logo{
  font-family:'Syne',sans-serif;font-weight:800;font-size:1.35rem;
  display:flex;align-items:center;gap:6px;
  background:linear-gradient(135deg,var(--purple-light),var(--gold));
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
}
.logo span{color:var(--gold);-webkit-text-fill-color:var(--gold);}
.nav-links{display:flex;gap:1.5rem;}
.nav-links a{color:var(--muted);text-decoration:none;font-size:.88rem;font-weight:500;cursor:pointer;transition:color .2s;}
.nav-links a:hover{color:var(--text);}
.nav-r{display:flex;align-items:center;gap:.75rem;}
.ib{width:40px;height:40px;border-radius:8px;background:var(--bg3);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:1rem;}
.ib.notif{background:#2a1f5e;border-color:var(--purple);}
.btn-o{padding:.35rem .85rem;border-radius:8px;border:1px solid rgba(255,255,255,.2);background:transparent;color:var(--text);font-family:'DM Sans',sans-serif;font-size:.8rem;font-weight:600;cursor:pointer;}
.btn-p{padding:.35rem .85rem;border-radius:8px;background:var(--purple);border:none;color:#fff;font-family:'DM Sans',sans-serif;font-size:.8rem;font-weight:600;cursor:pointer;}

/* ROLE TABS */
.role-bar{display:flex;gap:.75rem;padding:.75rem 2rem;background:var(--bg2);border-bottom:1px solid var(--border);}
.role-btn{padding:.4rem 1.1rem;border-radius:999px;border:1px solid rgba(255,255,255,.15);background:transparent;color:var(--muted);font-family:'DM Sans',sans-serif;font-size:.88rem;font-weight:500;cursor:pointer;display:flex;align-items:center;gap:6px;transition:all .2s;}
.role-btn.buyer.active{background:rgba(108,92,231,.2);border-color:var(--purple);color:var(--purple-light);}
.role-btn.seller.active{background:rgba(240,180,41,.15);border-color:var(--gold);color:var(--gold);}
.role-btn.admin.active{background:rgba(255,68,68,.15);border-color:var(--red);color:var(--red);}

/* SHELL */
.shell{display:flex;height:calc(100vh - 105px);overflow:hidden;}

/* SIDEBAR */
.sidebar{width:260px;flex-shrink:0;background:var(--bg2);border-right:1px solid var(--border);padding:1.5rem 1rem;position:sticky;top:0;height:calc(100vh - 105px);overflow:auto;}
.side-title{font-family:'Syne',sans-serif;font-weight:700;font-size:1rem;margin-bottom:1.5rem;padding-left:.5rem;}
.side-title.buyer{color:var(--purple-light);}
.side-title.seller{color:var(--gold);}
.side-title.admin{color:var(--red);}
.side-item{display:flex;align-items:center;gap:.65rem;padding:.6rem .75rem;border-radius:10px;font-size:.9rem;cursor:pointer;transition:all .2s;margin-bottom:.25rem;color:var(--muted);position:relative;}
.side-item:hover{background:var(--bg3);color:var(--text);}
.side-item.active{background:var(--bg4);color:var(--text);font-weight:600;}
.side-badge{margin-left:auto;background:var(--red);color:#fff;font-size:.65rem;font-weight:700;padding:2px 7px;border-radius:999px;}

/* MAIN */
.main{flex:1;padding:2rem;overflow-y:auto;overflow-x:auto;background:var(--bg2);scroll-behavior:smooth;}

/* HEADER ROW */
.dash-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:1.75rem;}
.dash-title{font-family:'Syne',sans-serif;font-weight:800;font-size:1.75rem;}
.dash-sub{color:var(--muted);font-size:.9rem;margin-top:.2rem;}
.avatar{width:52px;height:52px;border-radius:50%;background:var(--purple);display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-weight:800;font-size:1rem;}

/* STAT CARDS */
.stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin-bottom:1.75rem;}
@media(max-width:900px){body{zoom:1;}.stat-grid{grid-template-columns:repeat(2,1fr);}}
.stat-card{background:var(--bg3);border:1px solid var(--border);border-radius:14px;padding:1.25rem 1.5rem;position:relative;overflow:hidden;}
.stat-card::after{content:'';position:absolute;top:-20px;right:-20px;width:80px;height:80px;border-radius:50%;opacity:.15;}
.stat-card.purple::after{background:var(--purple);}
.stat-card.gold::after{background:var(--gold);}
.stat-card.green::after{background:var(--green);}
.stat-card.red::after{background:var(--red);}
.stat-card.blue::after{background:#4facfe;}
.stat-ico{font-size:1.5rem;margin-bottom:.75rem;}
.stat-val{font-family:'Syne',sans-serif;font-weight:800;font-size:2rem;line-height:1;}
.stat-val.gold{color:var(--gold);}
.stat-val.green{color:var(--green);}
.stat-val.red{color:var(--red);}
.stat-val.white{color:#fff;}
.stat-label{color:var(--muted);font-size:.82rem;margin:.4rem 0 .3rem;}
.stat-trend{font-size:.78rem;}
.stat-trend.up{color:var(--green);}
.stat-trend.warn{color:var(--red);}

/* SECTION LABEL */
.sec-label{font-size:.68rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-bottom:.75rem;}

/* TABLE */
.tbl-wrap{background:var(--bg3);border:1px solid var(--border);border-radius:14px;overflow-x:auto;overflow-y:hidden;margin-bottom:1.75rem;}
table{width:100%;min-width:900px;border-collapse:collapse;}
th{font-size:.68rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);text-align:left;padding:.85rem 1.25rem;background:var(--bg4);border-bottom:1px solid var(--border);}
td{padding:.9rem 1.25rem;font-size:.9rem;border-bottom:1px solid rgba(108,92,231,.08);}
tr:last-child td{border-bottom:none;}
tr:hover td{background:rgba(108,92,231,.04);}
.td-gold{color:var(--gold);font-weight:700;}
.td-muted{color:var(--muted);}
.td-urgent{color:var(--red);font-weight:600;}

/* STATUS PILLS */
.pill{display:inline-flex;align-items:center;padding:3px 10px;border-radius:6px;font-size:.72rem;font-weight:700;letter-spacing:.06em;}
.pill.outbid{background:rgba(255,68,68,.15);color:var(--red);}
.pill.winning{background:rgba(0,196,140,.15);color:var(--green);}
.pill.live{background:rgba(0,196,140,.15);color:var(--green);}
.pill.ended{background:rgba(136,136,170,.12);color:var(--muted);}
.pill.buyer{background:rgba(108,92,231,.2);color:var(--purple-light);}
.pill.seller{background:rgba(240,180,41,.15);color:var(--gold);}
.pill.active-s{background:rgba(0,196,140,.15);color:var(--green);}
.pill.flagged{background:rgba(255,68,68,.15);color:var(--red);}

/* ACTION BTNS */
.act-btn{padding:.35rem .85rem;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:.8rem;font-weight:600;cursor:pointer;border:none;transition:all .2s;white-space:nowrap;}
.act-btn.rebid{background:var(--purple);color:#fff;}
.act-btn.rebid:hover{background:var(--purple-light);}
.act-btn.watch{background:transparent;border:1px solid rgba(255,255,255,.2);color:var(--text);}
.act-btn.watch:hover{border-color:var(--purple-light);color:var(--purple-light);}
.act-btn.view{background:transparent;border:1px solid rgba(255,255,255,.2);color:var(--text);}
.act-btn.suspend{background:var(--red);color:#fff;}
.act-btn.delete{background:#8b0000;color:#fff;}
.act-btn.approve{background:var(--green);color:#fff;}
.act-btn.reject{background:var(--red);color:#fff;}
.act-btn.create{background:var(--gold);color:#000;font-weight:700;}

/* 2-COL GRID */
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.75rem;}
@media(max-width:800px){.two-col{grid-template-columns:1fr;}}
.chart-card{background:var(--bg3);border:1px solid var(--border);border-radius:14px;padding:1.25rem 1.5rem;}
.chart-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem;}
.chart-title{font-weight:700;font-size:1rem;}
.chart-sub{font-size:.78rem;color:var(--purple-light);}

/* SVG CHARTS */
.chart-svg{width:100%;overflow:visible;}

/* SPEND BARS */
.spend-row{display:flex;flex-direction:column;gap:.9rem;}
.spend-item{}
.spend-top{display:flex;justify-content:space-between;font-size:.88rem;margin-bottom:.4rem;}
.spend-bar-bg{height:6px;background:var(--bg4);border-radius:3px;overflow:hidden;}
.spend-bar{height:100%;border-radius:3px;transition:width .6s ease;}

/* ACTIVITY MINI BARS */
.mini-bars{display:inline-flex;align-items:flex-end;gap:2px;}
.mini-bar{width:5px;border-radius:2px 2px 0 0;background:var(--purple);}
.mini-bar.gold{background:var(--gold);}

/* FRAUD ALERT */
.fraud-alert{background:rgba(255,68,68,.1);border:1px solid rgba(255,68,68,.3);border-radius:12px;padding:1rem 1.25rem;display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-bottom:1.25rem;flex-wrap:wrap;}
.fraud-alert p{font-size:.9rem;}
.fraud-alert b{color:var(--text);}
.fraud-btn{padding:.4rem 1rem;border-radius:8px;background:var(--red);border:none;color:#fff;font-family:'DM Sans',sans-serif;font-size:.82rem;font-weight:600;cursor:pointer;white-space:nowrap;}

/* STATUS DOT */
.status-dot{width:8px;height:8px;border-radius:50%;background:var(--green);display:inline-block;margin-right:6px;animation:pulse 2s infinite;}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}

/* SEARCH */
.search-input{background:var(--bg3);border:1px solid var(--border);border-radius:9px;padding:.45rem 1rem;color:var(--text);font-family:'DM Sans',sans-serif;font-size:.85rem;outline:none;width:200px;}
.search-input::placeholder{color:var(--muted);}
.search-input:focus{border-color:var(--purple);}

/* STAT5 for admin */
.stat-grid5{display:grid;grid-template-columns:repeat(5,1fr);gap:.85rem;margin-bottom:1.75rem;}
@media(max-width:1100px){.stat-grid5{grid-template-columns:repeat(3,1fr);}}
`;

/* ─── tiny SVG line chart ─── */
function LineChart({ data, color = "#8b7cf8", fill = "rgba(108,92,231,.15)", labels, showHoverValue = false }) {
  const W = 400, H = 100, pad = 8;
  const [hoverIndex, setHoverIndex] = useState(null);
  const denominator = Math.max(data.length - 1, 1);
  const min = Math.min(...data), max = Math.max(...data);
  const chartPoints = data.map((v, i) => {
    const x = pad + (i / denominator) * (W - pad * 2);
    const y = pad + ((max - v) / (max - min || 1)) * (H - pad * 2);
    return { x, y, value: v };
  });

  const pts = chartPoints.map((point) => `${point.x},${point.y}`);
  const d = `M${pts.join("L")}`;
  const fillPath = `${d}L${W - pad},${H - pad}L${pad},${H - pad}Z`;

  const activePoint = hoverIndex !== null ? chartPoints[hoverIndex] : null;
  const activeLabel =
    hoverIndex !== null
      ? labels?.[hoverIndex] || `Point ${hoverIndex + 1}`
      : "";

  const handleMouseMove = (event) => {
    if (!showHoverValue || chartPoints.length === 0) return;

    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width) return;

    const mouseXInViewBox = ((event.clientX - rect.left) / rect.width) * W;

    let nearestIndex = 0;
    let nearestDistance = Infinity;

    chartPoints.forEach((point, index) => {
      const distance = Math.abs(point.x - mouseXInViewBox);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    setHoverIndex(nearestIndex);
  };

  const handleMouseLeave = () => {
    if (!showHoverValue) return;
    setHoverIndex(null);
  };

  return (
    <div style={{ position: "relative" }}>
      <svg
        viewBox={`0 0 ${W} ${H + 20}`}
        className="chart-svg"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          <linearGradient id={`g${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.4"/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </linearGradient>
        </defs>
        <path d={fillPath} fill={`url(#g${color.replace("#","")})`}/>
        <path d={d} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>

        {showHoverValue && activePoint && (
          <>
            <line
              x1={activePoint.x}
              y1={pad}
              x2={activePoint.x}
              y2={H - pad}
              stroke={color}
              strokeDasharray="4 4"
              strokeOpacity="0.6"
            />
            <circle
              cx={activePoint.x}
              cy={activePoint.y}
              r="4"
              fill={color}
              stroke="#fff"
              strokeWidth="1.2"
            />
          </>
        )}

        {labels && labels.map((l, i) => (
          <text key={i}
            x={pad + (i / Math.max(labels.length - 1, 1)) * (W - pad * 2)}
            y={H + 16} textAnchor="middle"
            style={{ fill: "#5555778", fontSize: 11, fontFamily: "DM Sans" }}
          >{l}</text>
        ))}
      </svg>

      {showHoverValue && activePoint && (
        <div style={{
          position: "absolute",
          top: "8px",
          right: "10px",
          padding: "0.22rem 0.5rem",
          borderRadius: "8px",
          border: "1px solid rgba(255,255,255,0.2)",
          background: "rgba(10,10,15,0.8)",
          fontSize: "0.74rem",
          color: "#ffffff",
          fontWeight: 600
        }}>
          {activeLabel}: {activePoint.value.toLocaleString()}
        </div>
      )}
    </div>
  );
}

function MiniActivityBars({ highlight }) {
  const vals = [3, 5, 4, 7, 6, 8, highlight ? 9 : 5];
  const mx = Math.max(...vals);
  return (
    <div className="mini-bars">
      {vals.map((v, i) => (
        <div key={i} className={`mini-bar ${i === vals.length - 1 && highlight ? "gold" : ""}`}
          style={{ height: `${(v / mx) * 24}px` }} />
      ))}
    </div>
  );
}

function getDisplayName(user) {
  return user?.name?.trim() || "User";
}

function getInitials(name) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("") || "U"
  );
}

function formatEscrowDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
}

function formatEscrowAmount(amount, currency = "INR") {
  if (!Number.isFinite(Number(amount))) return "-";

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(Number(amount));
  } catch {
    return `${currency} ${Number(amount).toFixed(2)}`;
  }
}

function EscrowTransactionsSection({ token, user, view = "buyer", title = "My Escrow Transactions" }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyActionKey, setBusyActionKey] = useState("");
  const [notice, setNotice] = useState({ type: "", text: "" });

  const pushNotice = (type, text) => {
    setNotice({ type, text });
    setTimeout(() => {
      setNotice((current) => (current.text === text ? { type: "", text: "" } : current));
    }, 3000);
  };

  const loadTransactions = async () => {
    if (!token) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await getMyEscrowTransactions(token);
      setTransactions(Array.isArray(data?.transactions) ? data.transactions : []);
    } catch (error) {
      setTransactions([]);
      pushNotice("error", error.message || "Failed to load escrow transactions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [token, user?.id, user?.email, view]);

  const filteredTransactions = transactions.filter((entry) => {
    if (view === "buyer") {
      return String(entry.buyerUserId) === String(user?.id || "");
    }

    if (view === "seller") {
      return String(entry.sellerEmail || "").toLowerCase() === String(user?.email || "").toLowerCase();
    }

    return true;
  });

  const runAction = async (action, transactionId) => {
    const actionKey = `${action}-${transactionId}`;
    setBusyActionKey(actionKey);

    try {
      if (action === "request-release") {
        await requestEscrowRelease(transactionId, token);
        pushNotice("success", "Escrow release request sent.");
      }

      if (action === "release") {
        await releaseEscrowFunds(transactionId, token);
        pushNotice("success", "Escrow released successfully.");
      }

      if (action === "dispute") {
        const reason = window.prompt("Enter dispute reason", "Item not delivered");
        if (reason === null) {
          setBusyActionKey("");
          return;
        }

        await raiseEscrowDispute(transactionId, reason, token);
        pushNotice("success", "Dispute submitted for review.");
      }

      await loadTransactions();
    } catch (error) {
      pushNotice("error", error.message || "Escrow action failed.");
    } finally {
      setBusyActionKey("");
    }
  };

  const statusStyleMap = {
    created: { background: "rgba(108,92,231,.2)", color: "var(--purple-light)" },
    escrow_held: { background: "rgba(0,196,140,.15)", color: "var(--green)" },
    release_requested: { background: "rgba(240,180,41,.15)", color: "var(--gold)" },
    released: { background: "rgba(0,196,140,.15)", color: "var(--green)" },
    disputed: { background: "rgba(255,68,68,.15)", color: "var(--red)" },
    refunded: { background: "rgba(136,136,170,.12)", color: "var(--muted)" },
    failed: { background: "rgba(255,68,68,.15)", color: "var(--red)" },
  };

  return (
    <>
      <div className="sec-label">{title}</div>

      {notice.text && (
        <div
          style={{
            marginBottom: "0.85rem",
            borderRadius: "10px",
            padding: "0.6rem 0.85rem",
            fontSize: "0.82rem",
            border:
              notice.type === "success"
                ? "1px solid rgba(0,196,140,.45)"
                : "1px solid rgba(255,68,68,.45)",
            background:
              notice.type === "success"
                ? "rgba(0,196,140,.12)"
                : "rgba(255,68,68,.12)",
            color: notice.type === "success" ? "#8ff0cc" : "#ff9c9c",
          }}
        >
          {notice.text}
        </div>
      )}

      <div className="tbl-wrap" style={{ marginBottom: "1.75rem" }}>
        <table>
          <thead>
            <tr>
              <th>Auction</th>
              <th>Amount</th>
              <th>Fee</th>
              <th>Seller Receivable</th>
              <th>Status</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="td-muted" style={{ textAlign: "center", padding: "1rem" }}>
                  Loading escrow transactions...
                </td>
              </tr>
            )}

            {!loading && filteredTransactions.map((entry) => {
              const canRequestRelease =
                (view === "seller" || view === "admin") && entry.status === "escrow_held";

              const canRelease =
                (view === "buyer" || view === "admin") &&
                ["escrow_held", "release_requested"].includes(entry.status);

              const canDispute = ["escrow_held", "release_requested"].includes(entry.status);
              const statusStyle = statusStyleMap[entry.status] || { background: "rgba(136,136,170,.12)", color: "var(--muted)" };

              return (
                <tr key={entry.id}>
                  <td>{entry.auctionTitle || `Auction ${entry.auctionId}`}</td>
                  <td className="td-gold">{formatEscrowAmount(entry.amount, entry.currency)}</td>
                  <td className="td-muted">{formatEscrowAmount(entry.platformFeeAmount, entry.currency)}</td>
                  <td>{formatEscrowAmount(entry.sellerReceivable, entry.currency)}</td>
                  <td>
                    <span className="pill" style={statusStyle}>
                      {String(entry.status || "").replace(/_/g, " ").toUpperCase()}
                    </span>
                  </td>
                  <td className="td-muted">
                    {formatEscrowDate(entry.releasedAt || entry.disputedAt || entry.releaseRequestedAt || entry.paidAt || entry.createdAt)}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: ".4rem", flexWrap: "wrap" }}>
                      {canRequestRelease && (
                        <button
                          className="act-btn"
                          style={{ background: "var(--gold)", color: "#111", fontWeight: 700 }}
                          disabled={busyActionKey === `request-release-${entry.id}`}
                          onClick={() => runAction("request-release", entry.id)}
                        >
                          Request Release
                        </button>
                      )}

                      {canRelease && (
                        <button
                          className="act-btn approve"
                          disabled={busyActionKey === `release-${entry.id}`}
                          onClick={() => runAction("release", entry.id)}
                        >
                          Release
                        </button>
                      )}

                      {canDispute && (
                        <button
                          className="act-btn reject"
                          disabled={busyActionKey === `dispute-${entry.id}`}
                          onClick={() => runAction("dispute", entry.id)}
                        >
                          Dispute
                        </button>
                      )}

                      {!canRequestRelease && !canRelease && !canDispute && (
                        <span className="td-muted">No action</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {!loading && filteredTransactions.length === 0 && (
              <tr>
                <td colSpan={7} className="td-muted" style={{ textAlign: "center", padding: "1rem" }}>
                  No escrow transactions available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ─── BUYER DASHBOARD ─── */
function BuyerDash({ user, token }) {
  const [activeSide, setActiveSide] = useState("Overview");
  const buyerMainRef = useRef(null);
  const buyerSectionRefs = useRef({});
  const sideItems = [
    { icon: "🎯", label: "Overview" },
    { icon: "🔨", label: "My Bids" },
    { icon: "🏆", label: "Won Auctions" },
    { icon: "💳", label: "Payment History" },
    { icon: "🔔", label: "Notifications", badge: 3 },
    { icon: "👤", label: "Profile" },
    { icon: "⚙️", label: "Settings" },
  ];
  const bids = [
    { item: "1959 Gibson Les Paul", myBid: "₹46,000", highest: "₹48,500", status: "outbid", ends: "47m", urgent: true },
    { item: "Patek Philippe Nautilus", myBid: "₹32,000", highest: "₹32,000", status: "winning", ends: "2h 14m", urgent: false },
    { item: "Banksy Original Print", myBid: "₹8,500", highest: "₹9,200", status: "outbid", ends: "1d 3h", urgent: false },
    { item: "1967 Ford Mustang GT", myBid: "₹28,000", highest: "₹28,000", status: "winning", ends: "3d", urgent: false },
  ];
  const bidData = [2, 3, 2, 5, 4, 3, 6, 5, 7, 8, 6, 9, 8, 10, 9, 11, 10, 12, 11, 14, 13, 15, 14, 16, 15, 17, 16, 18, 17, 19];
  const spend = [
    { cat: "Collectibles", val: "₹12.4K", pct: 80, color: "linear-gradient(90deg,#f0b429,#ff8c00)" },
    { cat: "Watches", val: "₹8.2K", pct: 55, color: "linear-gradient(90deg,#f0b429,#ffd700)" },
    { cat: "Fine Art", val: "₹4.2K", pct: 28, color: "linear-gradient(90deg,#00c48c,#00e5a0)" },
  ];

  const displayName = getDisplayName(user);
  const initials = getInitials(displayName);

  const istHour = Number(
    new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "numeric",
      hour12: false,
    }).format(new Date())
  );

  let greeting = "Good evening";
  if (istHour < 12) greeting = "Good morning";
  else if (istHour < 17) greeting = "Good afternoon";

  const dateParts = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).formatToParts(new Date());

  const getPart = (type) => dateParts.find((part) => part.type === type)?.value || "";
  const todayLabel = `${getPart("weekday")}, ${getPart("day")} ${getPart("month")} ${getPart("year")}`;

  const buyerSectionMap = {
    Overview: "overview",
    "My Bids": "bids",
    "Won Auctions": "insights",
    "Payment History": "escrow",
    Notifications: "insights",
    Profile: "overview",
    Settings: "insights",
  };

  const setBuyerSectionRef = (sectionKey) => (node) => {
    if (node) {
      buyerSectionRefs.current[sectionKey] = node;
    }
  };

  const handleBuyerSideClick = (label) => {
    setActiveSide(label);
    const sectionKey = buyerSectionMap[label] || "overview";
    const target = buyerSectionRefs.current[sectionKey];

    if (target && buyerMainRef.current) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="side-title buyer">👤 Buyer Dashboard</div>
        {sideItems.map(s => (
          <div key={s.label} className={`side-item ${activeSide === s.label ? "active" : ""}`} onClick={() => handleBuyerSideClick(s.label)}>
            <span>{s.icon}</span> {s.label}
            {s.badge && <span className="side-badge">{s.badge}</span>}
          </div>
        ))}
      </aside>
      <main className="main" ref={buyerMainRef}>
        <div ref={setBuyerSectionRef("overview")} />
        <div className="dash-header">
          <div>
            <div className="dash-title">{greeting}, {displayName} 👋</div>
            <div className="dash-sub">{todayLabel}</div>
          </div>
          <div className="avatar">{initials}</div>
        </div>

        <div className="stat-grid">
          {[
            { ico:"🔨", val:"12", label:"Active Bids", trend:"↑ 4 new today", cls:"purple", tcls:"up" },
            { ico:"🏆", val:"7", label:"Auctions Won", trend:"↑ 2 this week", cls:"gold", tcls:"up", vcls:"gold" },
            { ico:"💰", val:"₹24.8K", label:"Total Spent", trend:"↑ 12% vs last month", cls:"green", tcls:"up", vcls:"green" },
            { ico:"🚨", val:"3", label:"Outbid Alerts", trend:"Act now!", cls:"red", tcls:"warn", vcls:"red" },
          ].map(s => (
            <div key={s.label} className={`stat-card ${s.cls}`}>
              <div className="stat-ico">{s.ico}</div>
              <div className={`stat-val ${s.vcls || "white"}`}>{s.val}</div>
              <div className="stat-label">{s.label}</div>
              <div className={`stat-trend ${s.tcls}`}>{s.trend}</div>
            </div>
          ))}
        </div>

        <div ref={setBuyerSectionRef("bids")} />
        <div className="sec-label">Active Bids</div>
        <div className="tbl-wrap">
          <table>
            <thead><tr>
              <th>Item</th><th>Your Bid</th><th>Highest Bid</th><th>Status</th><th>Ends In</th><th>Action</th>
            </tr></thead>
            <tbody>
              {bids.map(b => (
                <tr key={b.item}>
                  <td>{b.item}</td>
                  <td>{b.myBid}</td>
                  <td className={b.status === "outbid" ? "td-gold" : ""}
                    style={{ color: b.status === "winning" ? "var(--green)" : b.status === "outbid" ? "var(--gold)" : "" }}>
                    {b.highest}
                  </td>
                  <td><span className={`pill ${b.status}`}>{b.status.toUpperCase()}</span></td>
                  <td className={b.urgent ? "td-urgent" : "td-muted"}>{b.ends}</td>
                  <td>
                    {b.status === "outbid"
                      ? <button className="act-btn rebid">Re-bid</button>
                      : <button className="act-btn watch">Watch</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div ref={setBuyerSectionRef("escrow")} />
        <EscrowTransactionsSection
          token={token}
          user={user}
          view="buyer"
          title="My Escrow Transactions"
        />

        <div ref={setBuyerSectionRef("insights")} />
        <div className="two-col">
          <div className="chart-card">
            <div className="chart-header">
              <span className="chart-title">Bid Activity (30 days)</span>
              <span className="chart-sub">30 days</span>
            </div>
            <LineChart data={bidData} />
          </div>
          <div className="chart-card">
            <div className="chart-header">
              <span className="chart-title">Spending by Category</span>
            </div>
            <div className="spend-row">
              {spend.map(s => (
                <div key={s.cat} className="spend-item">
                  <div className="spend-top">
                    <span>{s.cat}</span>
                    <span style={{ color: "var(--purple-light)", fontWeight: 600 }}>{s.val}</span>
                  </div>
                  <div className="spend-bar-bg">
                    <div className="spend-bar" style={{ width: `${s.pct}%`, background: s.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ─── SELLER DASHBOARD ─── */
function SellerDash({ user, token }) {
  const [activeSide, setActiveSide] = useState("Overview");
  const sellerMainRef = useRef(null);
  const sellerSectionRefs = useRef({});
  const [notifications, setNotifications] = useState([]);
  const [sellerListings, setSellerListings] = useState([]);
  const [sellerListingsLoading, setSellerListingsLoading] = useState(false);
  const [sellerListingsError, setSellerListingsError] = useState("");
  const navigate = useNavigate();
  const displayName = getDisplayName(user);
  const sideItems = [
    { icon: "🎯", label: "Overview" },
    { icon: "➕", label: "Create Auction" },
    { icon: "📋", label: "My Listings" },
    { icon: "🔴", label: "Active Auctions" },
    { icon: "📊", label: "Sales History" },
    { icon: "💰", label: "Earnings" },
    { icon: "💳", label: "Escrow" },
    { icon: "⭐", label: "Reviews" },
  ];
  const earningsData = [18000, 22000, 19000, 28000, 24000, 35000, 42000];

  const activeAuctions = sellerListings.filter((entry) => entry.status === "approved" && entry.live !== false);

  const loadSellerListings = async () => {
    if (!token) return;
    setSellerListingsLoading(true);
    setSellerListingsError("");

    try {
      const data = await getMyAuctionListings(token);
      setSellerListings(data.listings || []);
    } catch (error) {
      setSellerListings([]);
      setSellerListingsError(error.message || "Failed to load seller listings.");
    } finally {
      setSellerListingsLoading(false);
    }
  };

  useEffect(() => {
    const loadNotifications = async () => {
      if (!token) return;
      try {
        const data = await getMyNotifications(token);
        setNotifications(data.notifications || []);
      } catch {
        setNotifications([]);
      }
    };

    loadNotifications();
  }, [token]);

  useEffect(() => {
    loadSellerListings();
  }, [token]);

  const sellerSectionMap = {
    Overview: "overview",
    "Create Auction": "overview",
    "My Listings": "listings",
    "Active Auctions": "auctions",
    "Sales History": "earnings",
    Earnings: "earnings",
    Escrow: "escrow",
    Reviews: "notifications",
  };

  const setSellerSectionRef = (sectionKey) => (node) => {
    if (node) {
      sellerSectionRefs.current[sectionKey] = node;
    }
  };

  const handleSellerSideClick = (label) => {
    setActiveSide(label);

    if (label === "Create Auction") {
      navigate("/create-auction");
      return;
    }

    const sectionKey = sellerSectionMap[label] || "overview";
    const target = sellerSectionRefs.current[sectionKey];

    if (target && sellerMainRef.current) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="side-title seller">🖥 Seller Dashboard</div>
        {sideItems.map(s => (
          <div key={s.label} className={`side-item ${activeSide === s.label ? "active" : ""}`} onClick={() => handleSellerSideClick(s.label)}>
            <span>{s.icon}</span> {s.label}
          </div>
        ))}
      </aside>
      <main className="main" ref={sellerMainRef}>
        <div ref={setSellerSectionRef("overview")} />
        <div className="dash-header">
          <div>
            <div className="dash-title">Seller Dashboard 🖥</div>
            <div className="dash-sub" style={{ color: "var(--gold)" }}>{displayName} · Pro Seller ⭐</div>
          </div>
          <button className="act-btn create" style={{ padding: ".6rem 1.4rem", fontSize: ".95rem", borderRadius: "10px" }} onClick={() => navigate("/create-auction")}>
            + Create Auction
          </button>
        </div>

        <div className="stat-grid">
          {[
            { ico:"💰", val:"₹142K", label:"Total Earnings", trend:"↑ 23% this month", cls:"gold", vcls:"gold", tcls:"up" },
            { ico:"🔴", val:String(activeAuctions.length), label:"Active Listings", trend:"Live updates", cls:"purple", tcls:"up" },
            { ico:"✅", val:"47", label:"Items Sold", trend:"↑ 5 this week", cls:"green", vcls:"green", tcls:"up" },
            { ico:"⭐", val:"4.9", label:"Seller Rating", trend:"312 reviews", cls:"gold", vcls:"white", tcls:"up" },
          ].map(s => (
            <div key={s.label} className={`stat-card ${s.cls}`}>
              <div className="stat-ico">{s.ico}</div>
              <div className={`stat-val ${s.vcls || "white"}`}>{s.val}</div>
              <div className="stat-label">{s.label}</div>
              <div className={`stat-trend ${s.tcls}`}>{s.trend}</div>
            </div>
          ))}
        </div>

        <div ref={setSellerSectionRef("listings")} />
        <div className="sec-label">My Listings</div>
        {sellerListingsError && (
          <div style={{ marginBottom: "0.8rem", color: "#ff9c9c", fontSize: "0.82rem" }}>{sellerListingsError}</div>
        )}
        <div className="tbl-wrap" style={{ marginBottom: "1.75rem" }}>
          <table>
            <thead><tr>
              <th>Item</th><th>Category</th><th>Current Bid</th><th>Status</th><th>Updated</th>
            </tr></thead>
            <tbody>
              {sellerListingsLoading && (
                <tr>
                  <td colSpan={5} className="td-muted" style={{ textAlign: "center", padding: "1rem" }}>Loading listings...</td>
                </tr>
              )}
              {!sellerListingsLoading && sellerListings.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.item}</td>
                  <td className="td-muted">{entry.cat}</td>
                  <td className="td-gold">{entry.bid}</td>
                  <td>
                    {entry.status === "approved" ? (
                      <span className={`pill ${entry.live ? "live" : "ended"}`}>{entry.live ? "LIVE" : "APPROVED"}</span>
                    ) : entry.status === "pending" ? (
                      <span className="pill buyer">PENDING</span>
                    ) : (
                      <span className="pill flagged">REJECTED</span>
                    )}
                  </td>
                  <td className="td-muted">{new Date(entry.updatedAt || entry.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</td>
                </tr>
              ))}
              {!sellerListingsLoading && sellerListings.length === 0 && (
                <tr>
                  <td colSpan={5} className="td-muted" style={{ textAlign: "center", padding: "1rem" }}>No listings published yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div ref={setSellerSectionRef("auctions")} />
        <div className="sec-label">Active Auctions</div>
        <div className="tbl-wrap" style={{ marginBottom: "1.75rem" }}>
          <table>
            <thead><tr>
              <th>Item</th><th>Current Bid</th><th>Bids</th><th>Ends In</th><th>Status</th><th>Activity</th>
            </tr></thead>
            <tbody>
              {activeAuctions.map(a => (
                <tr key={a.item}>
                  <td>{a.item}</td>
                  <td className="td-gold">{a.bid}</td>
                  <td>-</td>
                  <td className={a.urgent ? "td-urgent" : "td-muted"}>{a.timer}</td>
                  <td><span className="pill live">LIVE</span></td>
                  <td><MiniActivityBars highlight={a.urgent} /></td>
                </tr>
              ))}
              {!sellerListingsLoading && activeAuctions.length === 0 && (
                <tr>
                  <td colSpan={6} className="td-muted" style={{ textAlign: "center", padding: "1rem" }}>No active auctions yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div ref={setSellerSectionRef("escrow")} />
        <EscrowTransactionsSection
          token={token}
          user={user}
          view="seller"
          title="Seller Escrow Transactions"
        />

        <div ref={setSellerSectionRef("earnings")} />
        <div className="chart-card">
          <div className="chart-header">
            <span className="chart-title">Monthly Earnings</span>
            <span className="chart-sub">Last 6 months</span>
          </div>
          <LineChart data={earningsData} color="#f0b429" fill="rgba(240,180,41,.12)"
            labels={["Aug","Sep","Oct","Nov","Dec","Jan"]} />
        </div>

          <div ref={setSellerSectionRef("notifications")} />
        <div className="sec-label" style={{ marginTop: "1.75rem" }}>Seller Notifications</div>
        <div className="tbl-wrap">
          <table>
            <thead><tr>
              <th>Message</th><th>Type</th><th>Time</th>
            </tr></thead>
            <tbody>
              {notifications.slice(0, 6).map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.message}</td>
                  <td className="td-muted">{entry.type.replace(/_/g, " ").toUpperCase()}</td>
                  <td className="td-muted">{new Date(entry.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</td>
                </tr>
              ))}
              {notifications.length === 0 && (
                <tr>
                  <td colSpan={3} className="td-muted" style={{ textAlign: "center", padding: "1rem" }}>No seller notifications yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

/* ─── ADMIN DASHBOARD ─── */
function AdminDash({ user, token }) {
  const [activeSide, setActiveSide] = useState("Overview");
  const adminMainRef = useRef(null);
  const adminSectionRefs = useRef({});
  const [fraudAlerts, setFraudAlerts] = useState(2);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [adminNotice, setAdminNotice] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const displayName = getDisplayName(user);
  const sideItems = [
    { icon: "🎯", label: "Overview" },
    { icon: "👥", label: "User Management" },
    { icon: "🔨", label: "Auction Monitor" },
    { icon: "📊", label: "Reports" },
    { icon: "🚨", label: "Fraud Monitor", badge: fraudAlerts > 0 ? fraudAlerts : null },
    { icon: "⚖️", label: "Disputes" },
    { icon: "⚙️", label: "System Config" },
  ];
  const [users, setUsers] = useState([]);
  const [pending, setPending] = useState([]);
  const revenueData = [12000, 18000, 15000, 22000, 19000, 28000, 35000];
  const regData = [120, 200, 160, 280, 240, 310, 180];

  const filteredUsers = users.filter((entry) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;
    return (
      entry.name.toLowerCase().includes(query) ||
      entry.email.toLowerCase().includes(query) ||
      entry.role.toLowerCase().includes(query) ||
      entry.status.toLowerCase().includes(query)
    );
  });

  const pushNotice = (message) => {
    setAdminNotice(message);
    setTimeout(() => setAdminNotice(""), 2500);
  };

  useEffect(() => {
    const loadAdminData = async () => {
      if (!token) return;

      setIsLoading(true);
      try {
        const [usersData, pendingData] = await Promise.all([
          getAdminUsers(token),
          getPendingAuctionListings(token),
        ]);

        setUsers(usersData.users || []);
        setPending(pendingData.pending || []);
        const flaggedCount = (usersData.users || []).filter((entry) => entry.status === "flagged").length;
        setFraudAlerts(flaggedCount);
      } catch (error) {
        pushNotice(error.message || "Failed to load admin data.");
      } finally {
        setIsLoading(false);
      }
    };

    loadAdminData();
  }, [token]);

  const handleExport = () => {
    const headingUsers = ["Name", "Email", "Role", "Status", "Joined"];
    const headingAuctions = ["Item", "Seller", "Starting Bid", "Category"];

    const toCsvRow = (arr) =>
      arr
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(",");

    const rows = [
      "Admin Dashboard Export",
      "",
      "User Management",
      toCsvRow(headingUsers),
      ...users.map((entry) => toCsvRow([entry.name, entry.email, entry.role, entry.status, entry.joined])),
      "",
      "Pending Auction Approvals",
      toCsvRow(headingAuctions),
      ...pending.map((entry) => toCsvRow([entry.item, entry.seller, entry.bid, entry.cat])),
    ];

    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `admin-report-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);

    pushNotice("Report exported successfully.");
  };

  const handleEmergencyToggle = () => {
    setEmergencyMode((prev) => {
      const next = !prev;
      pushNotice(next ? "Emergency mode enabled. Actions are paused." : "Emergency mode disabled. Actions resumed.");
      return next;
    });
  };

  const handleFraudReview = () => {
    setFraudAlerts(0);
    pushNotice("Fraud alerts marked as reviewed.");
  };

  const handleViewUser = (entry) => {
    setSelectedUser(entry);
  };

  const handleApproveAdminFromUsers = (entry) => {
    if (entry.role !== "admin" || entry.isAdminApproved) return;

    const isCurrentAdmin = String(entry.email || "").toLowerCase() === String(user?.email || "").toLowerCase();
    if (isCurrentAdmin) return;

    approveAdminRequest(entry.id, token)
      .then(() => {
        setUsers((prev) => prev.map((item) => (
          item.id === entry.id
            ? { ...item, isAdminApproved: true, status: "active" }
            : item
        )));
        pushNotice(`Admin request approved for ${entry.name}.`);
      })
      .catch((error) => pushNotice(error.message));
  };

  const handleSuspendToggle = (userId) => {
    const target = users.find((entry) => entry.id === userId);
    if (!target) return;

    const nextStatus = target.status === "suspended" ? "active" : "suspended";

    if (nextStatus === "suspended") {
      const confirmed = window.confirm(
        `Suspend ${target.name}? This will permanently delete the user account and related data.`
      );

      if (!confirmed) return;

      deleteAndBlockUser(userId, token)
        .then(() => {
          setUsers((prev) => prev.filter((entry) => entry.id !== userId));
          pushNotice("User suspended and deleted permanently.");
        })
        .catch((error) => pushNotice(error.message));

      return;
    }

    updateAdminUserStatus(userId, nextStatus, token)
      .then(({ user: updatedUser }) => {
        setUsers((prev) => prev.map((entry) => (entry.id === userId ? updatedUser : entry)));
        pushNotice("User status updated.");
      })
      .catch((error) => pushNotice(error.message));
  };

  const handleDeleteUser = (userId) => {
    deleteAndBlockUser(userId, token)
      .then(() => {
        setUsers((prev) => prev.filter((entry) => entry.id !== userId));
        setFraudAlerts((prev) => Math.max(prev - 1, 0));
        pushNotice("User deleted and email blocked.");
      })
      .catch((error) => pushNotice(error.message));
  };

  const handleApproveAuction = (auctionId) => {
    approveAuctionListing(auctionId, token)
      .then(() => {
        setPending((prev) => prev.filter((entry) => entry.id !== auctionId));
        pushNotice("Auction approved. Seller notified.");
      })
      .catch((error) => pushNotice(error.message));
  };

  const handleRejectAuction = (auctionId) => {
    rejectAuctionListing(auctionId, token)
      .then(() => {
        setPending((prev) => prev.filter((entry) => entry.id !== auctionId));
        pushNotice("Auction rejected. Seller notified.");
      })
      .catch((error) => pushNotice(error.message));
  };

  const blockedActionStyle = emergencyMode ? { opacity: 0.6, cursor: "not-allowed" } : undefined;

  const adminSectionMap = {
    Overview: "overview",
    "User Management": "users",
    "Auction Monitor": "auctions",
    Reports: "reports",
    "Fraud Monitor": "fraud",
    Disputes: "escrow",
    "System Config": "config",
  };

  const setAdminSectionRef = (sectionKey) => (node) => {
    if (node) {
      adminSectionRefs.current[sectionKey] = node;
    }
  };

  const handleAdminSideClick = (label) => {
    setActiveSide(label);
    const sectionKey = adminSectionMap[label] || "overview";
    const target = adminSectionRefs.current[sectionKey];

    if (target && adminMainRef.current) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="side-title admin">✴️ Admin Panel</div>
        {sideItems.map(s => (
          <div key={s.label} className={`side-item ${activeSide === s.label ? "active" : ""}`} onClick={() => handleAdminSideClick(s.label)}>
            <span>{s.icon}</span> {s.label}
            {s.badge && <span className="side-badge">{s.badge}</span>}
          </div>
        ))}
      </aside>
      <main className="main" ref={adminMainRef}>
        <div ref={setAdminSectionRef("overview")} />
        <div ref={setAdminSectionRef("config")} />
        <div className="dash-header">
          <div>
            <div className="dash-title">Admin Control Panel ✴️</div>
            <div className="dash-sub" style={{ color: "var(--green)" }}>
              <span className="status-dot" /> {displayName} · {emergencyMode ? "Emergency mode active" : "All systems operational"}
            </div>
          </div>
          <div style={{ display: "flex", gap: ".6rem" }}>
            <button className="act-btn view" style={{ padding: ".5rem 1rem" }} onClick={handleExport}>📊 Export</button>
            <button className="act-btn suspend" style={{ padding: ".5rem 1.1rem", borderRadius: "10px" }} onClick={handleEmergencyToggle}>
              {emergencyMode ? "Resume Operations" : "Emergency Stop"}
            </button>
          </div>
        </div>

        {adminNotice && (
          <div style={{ marginBottom: "1rem", background: "rgba(108,92,231,.15)", border: "1px solid var(--border)", borderRadius: "10px", padding: "0.65rem 0.9rem", fontSize: "0.85rem" }}>
            {adminNotice}
          </div>
        )}

        {isLoading && (
          <div style={{ marginBottom: "1rem", color: "var(--muted)", fontSize: "0.85rem" }}>Loading admin data...</div>
        )}

        <div ref={setAdminSectionRef("fraud")} />
        <div className="fraud-alert">
          <p>
            🚨 <b>Fraud Alert:</b> {fraudAlerts} suspicious bidding pattern{fraudAlerts === 1 ? "" : "s"} detected on high-value auctions.
          </p>
          <button className="fraud-btn" onClick={handleFraudReview} disabled={fraudAlerts === 0} style={fraudAlerts === 0 ? { opacity: 0.6, cursor: "not-allowed" } : undefined}>
            {fraudAlerts === 0 ? "Reviewed" : "Review Now"}
          </button>
        </div>

        <div ref={setAdminSectionRef("disputes")} />
        <div className="stat-grid5">
          {[
            { ico:"👥", val:String(users.length), label:"Total Users", trend:"Live moderation", cls:"purple" },
            { ico:"🔨", val:String(pending.length), label:"Pending Auctions", trend:"Needs approval", cls:"gold", vcls:"gold" },
            { ico:"💰", val:"₹8.4M", label:"Revenue MTD", trend:"↑ 18%", cls:"green", vcls:"green" },
            { ico:"🚨", val:String(fraudAlerts), label:"Fraud Alerts", trend: fraudAlerts > 0 ? "Review needed" : "All reviewed", cls:"red", vcls:"red", tcls: fraudAlerts > 0 ? "warn" : "up" },
            { ico:"⚖️", val:"7", label:"Open Disputes", trend:"↑ 3 new", cls:"blue", tcls:"warn" },
          ].map(s => (
            <div key={s.label} className={`stat-card ${s.cls}`}>
              <div className="stat-ico">{s.ico}</div>
              <div className={`stat-val ${s.vcls || "white"}`}>{s.val}</div>
              <div className="stat-label">{s.label}</div>
              <div className={`stat-trend ${s.tcls || "up"}`}>{s.trend}</div>
            </div>
          ))}
        </div>

        <div ref={setAdminSectionRef("escrow")} />
        <EscrowTransactionsSection
          token={token}
          user={user}
          view="admin"
          title="Escrow Disputes & Releases"
        />

        <div ref={setAdminSectionRef("reports")} />
        <div className="two-col" style={{ marginBottom: "1.75rem" }}>
          <div className="chart-card">
            <div className="chart-header">
              <span className="chart-title">Platform Revenue (7d)</span>
            </div>
            <LineChart data={revenueData} color="#8b7cf8" showHoverValue
              labels={["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]} />
          </div>
          <div className="chart-card">
            <div className="chart-header">
              <span className="chart-title">New Registrations (7d)</span>
            </div>
            <LineChart data={regData} color="#00c48c" fill="rgba(0,196,140,.12)" showHoverValue
              labels={["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]} />
          </div>
        </div>

        <div ref={setAdminSectionRef("users")} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: ".75rem" }}>
          <div className="sec-label" style={{ margin: 0 }}>User Management</div>
          <input className="search-input" placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="tbl-wrap" style={{ marginBottom: "1.75rem" }}>
          <table>
            <thead><tr>
              <th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td className="td-muted">{u.email}</td>
                  <td><span className={`pill ${u.role === "admin" ? "admin" : "buyer"}`}>{u.role.toUpperCase()}</span></td>
                  <td>
                    {u.role === "admin" && !u.isAdminApproved
                      ? <span className="pill buyer">PENDING APPROVAL</span>
                      : u.status === "flagged"
                      ? <span className="pill flagged">FLAGGED 🚨</span>
                      : u.status === "suspended"
                      ? <span className="pill ended">SUSPENDED</span>
                      : <span className="pill active-s">ACTIVE</span>}
                  </td>
                  <td className="td-muted">{u.joined}</td>
                  <td style={{ display: "flex", gap: ".4rem", flexWrap: "wrap", alignItems: "center" }}>
                    <button className="act-btn view" onClick={() => handleViewUser(u)}>View</button>
                    {u.role === "admin" ? (
                      !u.isAdminApproved && String(u.email || "").toLowerCase() !== String(user?.email || "").toLowerCase() ? (
                        <>
                          <button className="act-btn approve" disabled={emergencyMode} style={blockedActionStyle} onClick={() => handleApproveAdminFromUsers(u)}>Accept</button>
                          <button className="act-btn delete" disabled={emergencyMode} style={blockedActionStyle} onClick={() => handleDeleteUser(u.id)}>Delete</button>
                        </>
                      ) : (
                        <span className="td-muted" style={{ fontSize: ".8rem" }}>No action</span>
                      )
                    ) : u.status === "flagged" ? (
                      <button className="act-btn delete" disabled={emergencyMode} style={blockedActionStyle} onClick={() => handleDeleteUser(u.id)}>Delete</button>
                    ) : (
                      <button className={u.status === "suspended" ? "act-btn approve" : "act-btn suspend"} disabled={emergencyMode} style={blockedActionStyle} onClick={() => handleSuspendToggle(u.id)}>{u.status === "suspended" ? "Activate" : "Suspend & Delete"}</button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="td-muted" style={{ textAlign: "center", padding: "1.1rem" }}>No users match your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div ref={setAdminSectionRef("auctions")} />
        <div className="sec-label">Pending Auction Approvals</div>
        <div className="tbl-wrap">
          <table>
            <thead><tr>
              <th>Item</th><th>Seller</th><th>Starting Bid</th><th>Category</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {pending.map(p => (
                <tr key={p.id}>
                  <td>{p.item}</td>
                  <td className="td-muted">{p.seller}</td>
                  <td>{p.bid}</td>
                  <td className="td-muted">{p.cat}</td>
                  <td style={{ display: "flex", gap: ".4rem", flexWrap: "wrap", alignItems: "center" }}>
                    <button className="act-btn approve" disabled={emergencyMode} style={blockedActionStyle} onClick={() => handleApproveAuction(p.id)}>Approve</button>
                    <button className="act-btn reject" disabled={emergencyMode} style={blockedActionStyle} onClick={() => handleRejectAuction(p.id)}>Reject</button>
                  </td>
                </tr>
              ))}
              {pending.length === 0 && (
                <tr>
                  <td colSpan={5} className="td-muted" style={{ textAlign: "center", padding: "1.1rem" }}>No pending auction approvals.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {selectedUser && (
          <div
            onClick={() => setSelectedUser(null)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.55)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "1rem",
            }}
          >
            <div
              onClick={(event) => event.stopPropagation()}
              style={{
                width: "min(100%, 520px)",
                background: "var(--bg3)",
                border: "1px solid var(--border)",
                borderRadius: "14px",
                padding: "1.15rem 1.2rem",
                boxShadow: "0 16px 40px rgba(0,0,0,0.45)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.9rem" }}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "1.1rem" }}>User Details</div>
                <button className="act-btn view" onClick={() => setSelectedUser(null)}>Close</button>
              </div>

              <div style={{ display: "grid", gap: "0.65rem" }}>
                <div><span className="td-muted">Name:</span> {selectedUser.name}</div>
                <div><span className="td-muted">Email:</span> {selectedUser.email}</div>
                <div><span className="td-muted">Role:</span> {selectedUser.role.toUpperCase()}</div>
                <div><span className="td-muted">Status:</span> {selectedUser.status.toUpperCase()}</div>
                <div><span className="td-muted">Joined:</span> {selectedUser.joined}</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/* ─── ROOT ─── */
export default function Dashboard() {
  const { token, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [role, setRole] = useState("buyer");
  const [showBellToast, setShowBellToast] = useState(false);
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [adminMsg, setAdminMsg] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);
  const isAdminUser = user?.role === "admin";
  const isLightTheme = theme === "light";

  const roleTabs = isAdminUser
    ? [
        { key: "buyer", icon: "👤", label: "Buyer" },
        { key: "seller", icon: "🖥", label: "Seller" },
        { key: "admin", icon: "✴️", label: "Admin" },
      ]
    : [
        { key: "buyer", icon: "👤", label: "Buyer" },
        { key: "seller", icon: "🖥", label: "Seller" },
      ];

  useEffect(() => {
    setRole(isAdminUser ? "admin" : "buyer");
  }, [isAdminUser]);

  const triggerBellToast = () => {
    setShowBellToast(true);
    setTimeout(() => setShowBellToast(false), 4500);
  };

  const loadPendingAdmins = async () => {
    try {
      const data = await getPendingAdminRequests(token);
      setPendingAdmins(data.requests || []);
    } catch (error) {
      setAdminMsg(error.message);
    }
  };

  useEffect(() => {
    if (isAdminUser && role === "admin" && token) {
      loadPendingAdmins();
    }
  }, [isAdminUser, role, token]);

  const handleApproveAdmin = async (userId) => {
    setAdminLoading(true);
    setAdminMsg("");
    try {
      await approveAdminRequest(userId, token);
      setAdminMsg("Admin request approved successfully.");
      await loadPendingAdmins();
    } catch (error) {
      setAdminMsg(error.message);
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <>
      <style>{css}</style>
      <nav className="nav">
        <div className="logo">BidVault <span>⚡</span></div>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/browse">Browse</Link>
          <Link to="/auctions">Auctions</Link>
          <Link to="/dashboard">Dashboard</Link>
        </div>
        <div className="nav-r">
          <button className="ib" onClick={toggleTheme} title="Toggle theme">{isLightTheme ? "☀️" : "🌙"}</button>
          <button className="ib notif" onClick={triggerBellToast}>🔔</button>
          <AuthNavActions outlineClass="btn-o" primaryClass="btn-p" showDashboardButton={false} />
        </div>
      </nav>

      <div className="role-bar">
        {roleTabs.map(r => (
          <button key={r.key}
            className={`role-btn ${r.key} ${role === r.key ? "active" : ""}`}
            onClick={() => setRole(r.key)}>
            {r.icon} {r.label}
          </button>
        ))}
      </div>

      {isAdminUser && role === "admin" && (
        <div style={{ margin: "1rem 2rem", padding: "1rem", borderRadius: "12px", background: "var(--bg3)", border: "1px solid var(--border)" }}>
          <div style={{ fontWeight: 700, marginBottom: "0.65rem" }}>Pending Admin Signup Requests</div>
          {pendingAdmins.length === 0 ? (
            <div style={{ color: "var(--muted)", fontSize: "0.9rem" }}>No pending admin approvals.</div>
          ) : (
            pendingAdmins.map((request) => (
              <div key={request._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.55rem 0", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <div>
                  <div style={{ fontSize: "0.92rem", fontWeight: 600 }}>{request.name}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{request.email}</div>
                </div>
                <button className="btn-p" disabled={adminLoading} onClick={() => handleApproveAdmin(request._id)}>
                  {adminLoading ? "Approving..." : "Approve Admin"}
                </button>
              </div>
            ))
          )}
          {adminMsg && <div style={{ marginTop: "0.65rem", color: "#8ff0cc", fontSize: "0.82rem" }}>{adminMsg}</div>}
        </div>
      )}

      {role === "buyer" && <BuyerDash user={user} token={token} />}
      {role === "seller" && <SellerDash user={user} token={token} />}
      {isAdminUser && role === "admin" && <AdminDash user={user} token={token} />}

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
