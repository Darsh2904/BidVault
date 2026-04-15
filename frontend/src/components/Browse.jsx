import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AuthNavActions from "./AuthNavActions";
import { confirmEscrowPayment, createEscrowOrder, getApprovedAuctions } from "../utils/authApi";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

  html, body { height: 100%; }
  #root, .App { min-height: 100vh; }

  :root {
    --bg: #0a0a0f;
    --bg2: #12121a;
    --bg3: #1a1a28;
    --bg4: #252538;
    --purple: #6c5ce7;
    --purple-light: #8b7cf8;
    --gold: #f0b429;
    --text: #ffffff;
    --text-muted: #8888aa;
    --text-dim: #6060a0;
    --border: rgba(108,92,231,0.2);
    --live-red: #ff4444;
    --radius: 16px;
  }

  body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; min-height: 100vh; width: 100%; overflow-x: hidden; zoom: 1; }

  /* NAVBAR */
  .navbar {
    position: sticky; top: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 2rem; height: 64px;
    background: rgba(10,10,15,0.88); backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
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
  .nav-links a { color:var(--text-muted); text-decoration:none; font-size:0.88rem; font-weight:500; transition:color 0.2s; cursor:pointer; }
  .nav-links a:hover, .nav-links a.active { color:var(--text); }
  .nav-right { display:flex; align-items:center; gap:0.75rem; }
  .nav-icon-btn {
    width:40px; height:40px; border-radius:8px;
    background:var(--bg3); border:1px solid var(--border);
    display:flex; align-items:center; justify-content:center;
    cursor:pointer; font-size:1rem;
  }
  .nav-icon-btn.notif { background:#2a1f5e; border-color:var(--purple); }
  .btn-outline {
    padding:0.35rem 0.85rem; border-radius:8px;
    border:1px solid rgba(255,255,255,0.2); background:transparent;
    color:var(--text); font-family:'DM Sans',sans-serif; font-size:0.8rem; font-weight:600;
    cursor:pointer; transition:all 0.2s;
  }
  .btn-outline:hover { border-color:var(--purple-light); color:var(--purple-light); }
  .btn-primary {
    padding:0.35rem 0.85rem; border-radius:8px;
    background:var(--purple); border:none;
    color:#fff; font-family:'DM Sans',sans-serif; font-size:0.8rem; font-weight:600;
    cursor:pointer; transition:background 0.2s;
  }
  .btn-primary:hover { background:var(--purple-light); }

  /* LAYOUT */
  .browse-layout {
    display:grid;
    grid-template-columns:265px 1fr;
    gap:2rem;
    min-height:calc(100vh - 64px);
    width:100%;
    max-width:1400px;
    margin:0 auto;
    padding:0 2rem 3rem;
  }

  /* SIDEBAR */
  .sidebar {
    width:100%;
    background:var(--bg3); border:1px solid var(--border);
    border-radius:16px;
    padding:1.5rem; position:sticky; top:80px; height:fit-content;
  }
  .sidebar::-webkit-scrollbar { width:4px; }
  .sidebar::-webkit-scrollbar-thumb { background:var(--bg4); border-radius:4px; }
  .sidebar h2 { font-family:'Syne',sans-serif; font-weight:700; font-size:1.1rem; margin-bottom:1.5rem; }
  .filter-section { margin-bottom:1.75rem; }
  .filter-label {
    font-size:0.68rem; font-weight:700; letter-spacing:0.12em;
    text-transform:uppercase; color:var(--text-muted); margin-bottom:0.9rem; display:block;
  }
  .check-item {
    display:flex; align-items:center; gap:0.6rem;
    margin-bottom:0.6rem; cursor:pointer;
    font-size:0.9rem; color:var(--text);
  }
  .check-item input[type=checkbox] {
    appearance:none; width:18px; height:18px; border-radius:5px;
    border:2px solid var(--purple); background:transparent; cursor:pointer;
    flex-shrink:0; position:relative; transition:background 0.15s;
  }
  .check-item input[type=checkbox]:checked {
    background:var(--purple);
  }
  .check-item input[type=checkbox]:checked::after {
    content:'✓'; position:absolute; top:50%; left:50%; transform:translate(-50%,-52%);
    color:#fff; font-size:11px; font-weight:700;
  }

  /* PRICE RANGE SLIDER */
  .price-vals { display:flex; justify-content:space-between; font-size:0.8rem; color:var(--text-muted); margin-top:0.5rem; }
  input[type=range] {
    width:100%; appearance:none; height:4px;
    background:linear-gradient(to right, var(--purple) 0%, var(--purple) 15%, var(--bg4) 15%);
    border-radius:4px; outline:none; cursor:pointer;
  }
  input[type=range]::-webkit-slider-thumb {
    appearance:none; width:18px; height:18px; border-radius:50%;
    background:var(--purple); border:3px solid #fff; cursor:pointer;
    box-shadow:0 2px 8px rgba(108,92,231,0.5);
  }

  .apply-btn {
    width:100%; padding:0.8rem; border-radius:12px;
    background:var(--purple); border:none;
    color:#fff; font-family:'DM Sans',sans-serif; font-weight:700; font-size:0.95rem;
    cursor:pointer; margin-top:0.5rem; transition:background 0.2s;
  }
  .apply-btn:hover { background:var(--purple-light); }

  /* MAIN CONTENT */
  .main-content { min-width:0; padding-top:1.5rem; }

  /* SEARCH */
  .search-wrap {
    position:relative; margin-bottom:1.75rem;
  }
  .search-icon { position:absolute; left:1.1rem; top:50%; transform:translateY(-50%); font-size:1rem; }
  .search-input {
    width:100%; padding:0.9rem 1rem 0.9rem 3rem;
    background:var(--bg3); border:1px solid var(--border); border-radius:12px;
    color:var(--text); font-family:'DM Sans',sans-serif; font-size:0.95rem;
    outline:none; transition:border-color 0.2s;
  }
  .search-input::placeholder { color:var(--text-muted); }
  .search-input:focus { border-color:var(--purple); }

  /* TOP BAR */
  .top-bar { display:flex; align-items:center; justify-content:space-between; margin-bottom:1.5rem; flex-wrap:wrap; gap:1rem; }
  .result-count { font-size:0.9rem; color:var(--text-muted); }
  .sort-btns { display:flex; gap:0.5rem; flex-wrap:wrap; }
  .sort-btn {
    padding:0.35rem 0.85rem; border-radius:20px; font-size:0.78rem; font-weight:500;
    background:transparent; border:1px solid rgba(255,255,255,0.2);
    color:var(--text-muted); cursor:pointer; transition:all 0.2s;
  }
  .sort-btn:hover { border-color:var(--purple-light); color:var(--text); }
  .sort-btn.active { background:var(--purple); border-color:var(--purple); color:#fff; }

  /* AUCTION GRID */
  .auctions-grid {
    display:grid; grid-template-columns:repeat(auto-fill,minmax(270px,1fr)); gap:1.5rem;
  }
  @media(max-width:1024px){ body { zoom: 1; } .browse-layout{ grid-template-columns:1fr; } .sidebar{ display:none; } }
  @media(max-width:700px){ .auctions-grid{ grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); } }

  .auction-card {
    background:var(--bg3); border:1px solid var(--border);
    border-radius:var(--radius); overflow:hidden;
    transition:transform 0.2s, border-color 0.2s; cursor:pointer;
  }
  .auction-card:hover { transform:translateY(-4px); border-color:var(--purple); }
  .card-img {
    height:195px; display:flex; align-items:center; justify-content:center;
    background:var(--bg4); position:relative; font-size:3.5rem;
  }
  .card-live {
    position:absolute; top:10px; left:10px;
    background:var(--live-red); color:#fff;
    font-size:0.68rem; font-weight:700; padding:3px 8px; border-radius:6px;
    display:flex; align-items:center; gap:4px; letter-spacing:0.06em;
  }
  .live-dot { width:6px; height:6px; border-radius:50%; background:#fff; animation:pulse 1.2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
  .card-fav {
    position:absolute; top:10px; right:10px;
    width:32px; height:32px; border-radius:50%;
    background:rgba(0,0,0,0.5); border:none; cursor:pointer;
    display:flex; align-items:center; justify-content:center; font-size:0.85rem;
    transition:background 0.2s;
  }
  .card-fav:hover { background:rgba(108,92,231,0.4); }
  .card-body { padding:1.2rem; }
  .card-title { font-weight:600; font-size:0.93rem; margin-bottom:0.4rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .card-seller { color:var(--text-dim); font-size:0.75rem; margin-bottom:0.9rem; }
  .card-bid-row { display:flex; align-items:flex-end; justify-content:space-between; margin-bottom:0.8rem; }
  .bid-label { font-size:0.7rem; letter-spacing:0.05em; text-transform:uppercase; color:var(--text-dim); margin-bottom:2px; }
  .bid-amount { font-family:'Syne',sans-serif; font-weight:800; font-size:1.2rem; color:var(--gold); }
  .card-timer { font-size:0.75rem; font-weight:600; display:flex; align-items:center; gap:4px; padding-bottom:2px; }
  .timer-urgent { color:#ff6b6b; }
  .timer-normal { color:var(--text-muted); }
  .place-bid-btn {
    width:100%; padding:0.58rem; border-radius:8px;
    background:var(--purple); border:none;
    color:#fff; font-family:'DM Sans',sans-serif; font-weight:600; font-size:0.85rem;
    cursor:pointer; transition:background 0.2s; display:flex; align-items:center; justify-content:center; gap:6px;
  }
  .place-bid-btn:hover { background:var(--purple-light); }

  /* MODAL & OVERLAY */
  .modal-overlay {
    position:fixed; inset:0; background:rgba(0,0,0,0.6); display:flex;
    align-items:center; justify-content:center; z-index:1000;
    backdrop-filter:blur(4px); animation:fadeIn 0.2s;
  }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  .modal {
    background:var(--bg3); border:1px solid var(--border);
    border-radius:16px; padding:2rem; max-width:500px; width:90%;
    box-shadow:0 20px 60px rgba(108,92,231,0.3); animation:slideUp 0.3s;
  }
  @keyframes slideUp { from { transform:translateY(20px); opacity:0; } to { transform:translateY(0); opacity:1; } }
  .modal-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:1.5rem; }
  .modal-title { font-family:'Syne',sans-serif; font-weight:800; font-size:1.3rem; color:#fff; display:flex; align-items:center; gap:8px; }
  .modal-close { background:none; border:none; color:var(--text-muted); font-size:1.5rem; cursor:pointer; }
  .modal-close:hover { color:#fff; }
  .bid-info { margin-bottom:1.5rem; }
  .bid-info-label { font-size:0.85rem; color:var(--text-muted); margin-bottom:0.35rem; }
  .bid-info-value { font-family:'Syne',sans-serif; font-weight:800; font-size:1.8rem; color:var(--gold); }
  .bid-input-group { margin-bottom:1.5rem; }
  .bid-input-label { display:block; font-size:0.75rem; font-weight:700; letter-spacing:0.1em;
    text-transform:uppercase; color:var(--text-muted); margin-bottom:0.6rem; }
  .bid-input { width:100%; padding:0.9rem 1rem; background:var(--bg4); border:1px solid var(--border);
    border-radius:10px; color:#fff; font-family:'DM Sans',sans-serif; font-size:1rem;
    transition:border-color 0.2s; }
  .bid-input:focus { outline:none; border-color:var(--purple); }
  .bid-terms { font-size:0.8rem; color:var(--text-muted); line-height:1.5; margin-bottom:1.5rem; }
  .bid-terms a { color:var(--purple-light); text-decoration:none; }
  .bid-terms a:hover { text-decoration:underline; }
  .modal-actions { display:flex; gap:1rem; }
  .btn-cancel { flex:1; padding:0.8rem; background:transparent; border:1px solid var(--border);
    color:#fff; border-radius:10px; font-weight:600; cursor:pointer; transition:all 0.2s; }
  .btn-cancel:hover { border-color:var(--text-muted); }
  .btn-confirm { flex:1; padding:0.8rem; background:var(--purple); border:none;
    color:#fff; border-radius:10px; font-weight:700; cursor:pointer; transition:background 0.2s;
    display:flex; align-items:center; justify-content:center; gap:6px; }
  .btn-confirm:hover { background:var(--purple-light); }
`;

const staticAuctions = [
  { id:1, emoji:"🎸", title:"1959 Gibson Les Paul Standard", seller:"VintageGuitarVault", bid:"₹48,500", timer:"0h 47m", urgent:true, live:true, cat:"Electronics" },
  { id:2, emoji:"⌚", title:"Patek Philippe Nautilus Ref. 5711", seller:"SwissTimepieces", bid:"₹32,000", timer:"2h 14m", urgent:true, live:true, cat:"Watches" },
  { id:3, emoji:"🎨", title:"Banksy Original Signed Print", seller:"LondonArtHouse", bid:"₹9,200", timer:"1d 3h", urgent:false, live:false, cat:"Fine Art" },
  { id:4, emoji:"🚗", title:"1967 Ford Mustang GT500", seller:"ClassicMotors", bid:"₹28,000", timer:"3d", urgent:false, live:false, cat:"Antiques" },
  { id:5, emoji:"💎", title:"D-Color VVS1 Diamond Ring 5ct", seller:"DiamondVault", bid:"₹15,800", timer:"4h 22m", urgent:true, live:true, cat:"Jewelry" },
  { id:6, emoji:"📱", title:"iPhone 15 Pro Max 1TB Gold", seller:"TechDeals", bid:"₹1,240", timer:"12h", urgent:false, live:false, cat:"Electronics" },
  { id:7, emoji:"🏺", title:"Ming Dynasty Porcelain Vase", seller:"AntiqueMasters", bid:"₹24,000", timer:"5d 2h", urgent:false, live:false, cat:"Antiques" },
  { id:8, emoji:"🎮", title:"Factory Sealed Nintendo NES 1985", seller:"RetroGaming", bid:"₹3,800", timer:"6h", urgent:true, live:true, cat:"Electronics" },
];

const categories = ["Electronics", "Antiques", "Jewelry", "Fine Art", "Art", "Collectibles", "Real Estate", "Watches", "Vehicles"];
const statusOptions = ["Ending Soon","Just Started","Reserve Not Met"];
const conditionOptions = ["New","Like New","Used"];
const sortOptions = ["Ending Soon","Highest Bid","Lowest Bid","Newest"];

function isMongoId(value) {
  return /^[a-f\d]{24}$/i.test(String(value || ""));
}

async function loadRazorpayScript() {
  if (typeof window === "undefined") return false;
  if (window.Razorpay) return true;

  return new Promise((resolve) => {
    const existing = document.getElementById("rzp-checkout-script");
    if (existing) {
      existing.addEventListener("load", () => resolve(true), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = "rzp-checkout-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function BrowsePage() {
  const { id } = useParams();
  const { token, user, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("Ending Soon");
  const [checkedCats, setCheckedCats] = useState(new Set(categories));
  const [checkedStatus, setCheckedStatus] = useState(new Set(["Ending Soon"]));
  const [checkedCond, setCheckedCond] = useState(new Set());
  const [priceMax, setPriceMax] = useState(50000);
  const [favs, setFavs] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [bidAmount, setBidAmount] = useState("");
  const [showBellToast, setShowBellToast] = useState(false);
  const [approvedAuctions, setApprovedAuctions] = useState([]);
  const [paymentNotice, setPaymentNotice] = useState({ type: "", text: "" });
  const [isPayingEscrow, setIsPayingEscrow] = useState(false);
  const navigate = useNavigate();
  const isLightTheme = theme === "light";

  useEffect(() => {
    const loadApprovedAuctions = async () => {
      try {
        const data = await getApprovedAuctions();
        setApprovedAuctions(data.auctions || []);
      } catch {
        setApprovedAuctions([]);
      }
    };

    loadApprovedAuctions();
  }, []);

  const allAuctions = useMemo(() => [...staticAuctions, ...approvedAuctions], [approvedAuctions]);
  const triggerBellToast = () => {
    setShowBellToast(true);
    setTimeout(() => setShowBellToast(false), 4500);
  };

  const showPaymentNotice = (type, text) => {
    setPaymentNotice({ type, text });
    setTimeout(() => {
      setPaymentNotice((current) => (current.text === text ? { type: "", text: "" } : current));
    }, 4500);
  };

  const removeAuctionFromBrowse = (auctionId) => {
    setApprovedAuctions((current) => current.filter((item) => String(item.id) !== String(auctionId)));
  };

  // If viewing a specific auction detail
  if (id) {
    const auction = allAuctions.find(a => String(a.id) === String(id));
    if (!auction) return <div>Auction not found</div>;
    
    const openBidModal = (auc) => {
      const currentBidNum = parseInt(auc.bid.replace(/[₹$,]/g, ""));
      setBidAmount(currentBidNum + 1000);
      setShowModal(true);
    };

    const closeBidModal = () => { setShowModal(false); setBidAmount(""); };
    const handleConfirmBid = () => { if (bidAmount && auction) { alert(`Bid confirmed for ₹${bidAmount} on ${auction.title}`); closeBidModal(); } };
    const canProcessEscrow = isMongoId(auction.id);

    const handleEscrowPayment = async () => {
      if (!isAuthenticated || !token) {
        showPaymentNotice("error", "Please login to complete payment.");
        navigate("/auth");
        return;
      }

      if (!canProcessEscrow) {
        showPaymentNotice("error", "Escrow payment is available for live backend auctions only.");
        return;
      }

      try {
        setIsPayingEscrow(true);
        const orderData = await createEscrowOrder(String(auction.id), token);
        const transactionId = orderData?.transaction?.id;
        const paymentOrder = orderData?.paymentOrder;
        const activeGateway = paymentOrder?.gateway || orderData?.transaction?.gateway;

        if (!transactionId || !activeGateway) {
          throw new Error("Unable to initialize payment. Please try again.");
        }

        if (activeGateway === "mock") {
          await confirmEscrowPayment({ transactionId }, token);
          removeAuctionFromBrowse(auction.id);
          showPaymentNotice("success", "Payment confirmed and escrow hold created.");
          navigate("/browse");
          setIsPayingEscrow(false);
          return;
        }

        if (!paymentOrder?.id || !paymentOrder?.keyId || !paymentOrder?.amount) {
          throw new Error("Payment order details are incomplete. Please try again.");
        }

        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded || !window.Razorpay) {
          throw new Error("Razorpay SDK failed to load. Check internet and retry.");
        }

        setIsPayingEscrow(false);

        const razorpay = new window.Razorpay({
          key: paymentOrder.keyId,
          amount: paymentOrder.amount,
          currency: paymentOrder.currency || "INR",
          order_id: paymentOrder.id,
          name: "BidVault",
          description: `Escrow payment for ${auction.title}`,
          prefill: {
            name: user?.name || "",
            email: user?.email || "",
          },
          theme: {
            color: "#6c5ce7",
          },
          handler: async (response) => {
            try {
              setIsPayingEscrow(true);
              await confirmEscrowPayment(
                {
                  transactionId,
                  gatewayOrderId: response.razorpay_order_id,
                  gatewayPaymentId: response.razorpay_payment_id,
                  gatewaySignature: response.razorpay_signature,
                },
                token
              );
              removeAuctionFromBrowse(auction.id);
              showPaymentNotice("success", "Payment successful. Funds are now held in escrow.");
              navigate("/browse");
            } catch (error) {
              showPaymentNotice("error", error.message || "Payment confirmation failed.");
            } finally {
              setIsPayingEscrow(false);
            }
          },
          modal: {
            ondismiss: () => {
              showPaymentNotice("error", "Payment cancelled.");
              setIsPayingEscrow(false);
            },
          },
        });

        razorpay.on("payment.failed", (event) => {
          const reason = event?.error?.description || "Payment failed. Please try again.";
          showPaymentNotice("error", reason);
          setIsPayingEscrow(false);
        });

        razorpay.open();
      } catch (error) {
        showPaymentNotice("error", error.message || "Payment initialization failed.");
        setIsPayingEscrow(false);
      }
    };

    return (
      <>
        <style>{styles}</style>
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

        <div style={{ minHeight: "calc(100vh - 64px)", padding: "3rem 2rem", background: "var(--bg)" }}>
          <a style={{ color: "var(--purple-light)", textDecoration: "none", display: "flex", alignItems: "center", gap: "8px", marginBottom: "2rem", fontWeight: "600", cursor: "pointer" }} onClick={() => navigate("/browse")}>← Back to Browse</a>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", maxWidth: "1400px" }}>
            <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "16px", padding: "3rem", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "400px", fontSize: "8rem" }}>{auction.emoji}</div>
            
            <div>
              <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: "800", fontSize: "2rem", marginBottom: "1rem" }}>{auction.title}</h1>
              <div style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginBottom: "2rem" }}>by {auction.seller}</div>
              
              <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "14px", padding: "2rem", marginBottom: "2rem" }}>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Current Highest Bid</div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: "800", fontSize: "2.5rem", color: "var(--gold)", marginBottom: "1.5rem" }}>{auction.bid}</div>
                <div style={{ fontSize: "1rem", color: "var(--text)", display: "flex", alignItems: "center", gap: "8px", paddingTop: "1.5rem", borderTop: "1px solid var(--border)" }}>⏱ {auction.timer}</div>
              </div>
              
              <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
                <button style={{ flex: "1", padding: "1rem", borderRadius: "12px", background: "var(--purple)", border: "none", color: "#fff", fontSize: "1rem", fontWeight: "700", cursor: "pointer" }} onClick={() => openBidModal(auction)}>🔨 Place Bid</button>
                <button style={{ flex: "1", padding: "1rem", borderRadius: "12px", background: "transparent", border: "1px solid var(--border)", color: "#fff", fontSize: "1rem", fontWeight: "700", cursor: "pointer" }}>❤️ Watchlist</button>
              </div>

              <div style={{ marginBottom: "2rem" }}>
                <button
                  style={{
                    width: "100%",
                    padding: "1rem",
                    borderRadius: "12px",
                    background: "linear-gradient(90deg, #6c5ce7, #8b7cf8)",
                    border: "none",
                    color: "#fff",
                    fontSize: "1rem",
                    fontWeight: "700",
                    cursor: isPayingEscrow ? "not-allowed" : "pointer",
                    opacity: isPayingEscrow ? 0.7 : 1,
                  }}
                  disabled={isPayingEscrow}
                  onClick={handleEscrowPayment}
                >
                  {isPayingEscrow ? "Processing Payment..." : "💳 Pay & Hold in Escrow"}
                </button>
                {!canProcessEscrow && (
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                    Escrow payment is enabled for approved backend listings.
                  </div>
                )}
                {paymentNotice.text && (
                  <div
                    style={{
                      marginTop: "0.75rem",
                      borderRadius: "10px",
                      padding: "0.7rem 0.85rem",
                      fontSize: "0.83rem",
                      border: paymentNotice.type === "success" ? "1px solid rgba(0, 196, 140, 0.45)" : "1px solid rgba(255, 68, 68, 0.45)",
                      background: paymentNotice.type === "success" ? "rgba(0, 196, 140, 0.12)" : "rgba(255, 68, 68, 0.12)",
                      color: paymentNotice.type === "success" ? "#90f0d3" : "#ff9c9c",
                    }}
                  >
                    {paymentNotice.text}
                  </div>
                )}
              </div>
              
              <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "14px", padding: "2rem" }}>
                <h3 style={{ marginBottom: "1rem" }}>About this item</h3>
                <p style={{ lineHeight: "1.7", color: "var(--text-muted)" }}>Premium quality authentic item. Certified and verified. Perfect condition.</p>
              </div>
            </div>
          </div>
        </div>

        {showModal && (
          <div style={{ position: "fixed", inset: "0", background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: "1000" }} onClick={closeBidModal}>
            <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "16px", padding: "2rem", maxWidth: "500px", width: "90%" }} onClick={e => e.stopPropagation()}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: "800", fontSize: "1.3rem" }}>🔨 Place Your Bid</div>
                <button style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "1.5rem", cursor: "pointer" }} onClick={closeBidModal}>✕</button>
              </div>
              <div style={{ marginBottom: "1.5rem" }}>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.35rem" }}>Current highest bid:</div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: "800", fontSize: "1.8rem", color: "var(--gold)" }}>{auction.bid}</div>
              </div>
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.6rem" }}>Your bid amount (₹)</label>
                <input type="number" style={{ width: "100%", padding: "0.9rem 1rem", background: "var(--bg4)", border: "1px solid var(--border)", borderRadius: "10px", color: "#fff", fontSize: "1rem" }} value={bidAmount} onChange={e => setBidAmount(parseInt(e.target.value) || 0)} />
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: "1.5", marginBottom: "1.5rem" }}>By placing a bid you agree to our Terms & Conditions. Winning bids are binding.</div>
              <div style={{ display: "flex", gap: "1rem" }}>
                <button style={{ flex: "1", padding: "0.8rem", background: "transparent", border: "1px solid var(--border)", color: "#fff", borderRadius: "10px", fontWeight: "600", cursor: "pointer" }} onClick={closeBidModal}>Cancel</button>
                <button style={{ flex: "1", padding: "0.8rem", background: "var(--purple)", border: "none", color: "#fff", borderRadius: "10px", fontWeight: "700", cursor: "pointer" }} onClick={handleConfirmBid}>Confirm Bid 🔨</button>
              </div>
            </div>
          </div>
        )}

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

  const toggleSet = (set, setFn, val) => {
    const next = new Set(set);
    next.has(val) ? next.delete(val) : next.add(val);
    setFn(next);
  };

  const toggleFav = id => setFavs(p => ({ ...p, [id]: !p[id] }));

  const openBidModal = (auction) => {
    setSelectedAuction(auction);
    const currentBidNum = parseInt(auction.bid.replace(/[₹$,]/g, ""));
    setBidAmount(currentBidNum + 1000);
    setShowModal(true);
  };

  const closeBidModal = () => {
    setShowModal(false);
    setBidAmount("");
    setSelectedAuction(null);
  };

  const handleConfirmBid = () => {
    if (bidAmount && selectedAuction) {
      alert(`Bid confirmed for ₹${bidAmount} on ${selectedAuction.title}`);
      closeBidModal();
    }
  };

  const filtered = allAuctions.filter(a => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
                        a.seller.toLowerCase().includes(search.toLowerCase());
    const matchCat = checkedCats.has(a.cat);
    const bidNum = parseInt(a.bid.replace(/[₹$,]/g,""));
    const matchPrice = bidNum <= priceMax;
    return matchSearch && matchCat && matchPrice;
  });

  const sorted = [...filtered].sort((a,b) => {
    if (sort === "Highest Bid") return parseInt(b.bid.replace(/[₹$,]/g,"")) - parseInt(a.bid.replace(/[₹$,]/g,""));
    if (sort === "Lowest Bid")  return parseInt(a.bid.replace(/[₹$,]/g,"")) - parseInt(b.bid.replace(/[₹$,]/g,""));
    if (sort === "Ending Soon") return a.urgent ? -1 : 1;
    return 0;
  });

  const pct = Math.round((priceMax / 50000) * 100);

  return (
    <>
      <style>{styles}</style>

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-logo">BidVault <span>⚡</span></div>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/browse" className="active">Browse</Link>
          <Link to="/auctions">Auctions</Link>
          <Link to="/dashboard">Dashboard</Link>
        </div>
        <div className="nav-right">
          <button className="nav-icon-btn" onClick={toggleTheme} title="Toggle theme">{isLightTheme ? "☀️" : "🌙"}</button>
          <button className="nav-icon-btn notif" onClick={triggerBellToast}>🔔</button>
          <AuthNavActions />
        </div>
      </nav>

      <div className="browse-layout">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <h2>Filters</h2>

          <div className="filter-section">
            <span className="filter-label">Category</span>
            {categories.map(c => (
              <label className="check-item" key={c}>
                <input type="checkbox" checked={checkedCats.has(c)}
                  onChange={() => toggleSet(checkedCats, setCheckedCats, c)} />
                {c}
              </label>
            ))}
          </div>

          <div className="filter-section">
            <span className="filter-label">Price Range</span>
            <input type="range" min={0} max={50000} value={priceMax}
              style={{ background: `linear-gradient(to right, var(--purple) 0%, var(--purple) ${pct}%, var(--bg4) ${pct}%)` }}
              onChange={e => setPriceMax(Number(e.target.value))} />
            <div className="price-vals">
              <span>₹0</span>
              <span>₹{priceMax.toLocaleString()}</span>
            </div>
          </div>

          <div className="filter-section">
            <span className="filter-label">Status</span>
            {statusOptions.map(s => (
              <label className="check-item" key={s}>
                <input type="checkbox" checked={checkedStatus.has(s)}
                  onChange={() => toggleSet(checkedStatus, setCheckedStatus, s)} />
                {s}
              </label>
            ))}
          </div>

          <div className="filter-section">
            <span className="filter-label">Condition</span>
            {conditionOptions.map(c => (
              <label className="check-item" key={c}>
                <input type="checkbox" checked={checkedCond.has(c)}
                  onChange={() => toggleSet(checkedCond, setCheckedCond, c)} />
                {c}
              </label>
            ))}
          </div>

          <button className="apply-btn">Apply Filters</button>
        </aside>

        {/* MAIN */}
        <main className="main-content">
          {/* Search */}
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input className="search-input" placeholder="Search auctions, items, sellers..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {/* Top bar */}
          <div className="top-bar">
            <span className="result-count">{sorted.length} auctions found</span>
            <div className="sort-btns">
              {sortOptions.map(s => (
                <button key={s} className={`sort-btn ${sort===s?"active":""}`}
                  onClick={() => setSort(s)}>{s}</button>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div className="auctions-grid">
            {sorted.map(a => (
              <div className="auction-card" key={a.id} onClick={() => navigate(`/auctions/${a.id}`)}>
                <div className="card-img">
                  {a.live && <span className="card-live"><span className="live-dot"/>LIVE</span>}
                  <button className="card-fav" onClick={(e) => { e.stopPropagation(); toggleFav(a.id); }}>
                    {favs[a.id] ? "❤️" : "🤍"}
                  </button>
                  <span>{a.emoji}</span>
                </div>
                <div className="card-body">
                  <div className="card-title">{a.title}</div>
                  <div className="card-seller">by {a.seller}</div>
                  <div className="card-bid-row">
                    <div>
                      <div className="bid-label">Current Bid</div>
                      <div className="bid-amount">{a.bid}</div>
                    </div>
                    <div className={`card-timer ${a.urgent ? "timer-urgent" : "timer-normal"}`}>
                      ⏱ {a.timer}
                    </div>
                  </div>
                  <button className="place-bid-btn" onClick={(e) => { e.stopPropagation(); openBidModal(a); }}>🔨 Place Bid</button>
                </div>
              </div>
            ))}
          </div>

          {sorted.length === 0 && (
            <div style={{ textAlign:"center", padding:"4rem", color:"var(--text-muted)" }}>
              <div style={{ fontSize:"3rem", marginBottom:"1rem" }}>🔍</div>
              <div style={{ fontSize:"1.1rem" }}>No auctions match your filters</div>
            </div>
          )}
        </main>
      </div>

      {/* BID MODAL */}
      {showModal && selectedAuction && (
        <div className="modal-overlay" onClick={closeBidModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">🔨 Place Your Bid</div>
              <button className="modal-close" onClick={closeBidModal}>✕</button>
            </div>

            <div className="bid-info">
              <div className="bid-info-label">Current highest bid:</div>
              <div className="bid-info-value">{selectedAuction.bid}</div>
            </div>

            <div className="bid-input-group">
              <label className="bid-input-label">Your bid amount (₹)</label>
              <input
                type="number"
                className="bid-input"
                value={bidAmount}
                onChange={e => setBidAmount(parseInt(e.target.value) || 0)}
                placeholder="Enter your bid"
              />
            </div>

            <div className="bid-terms">
              By placing a bid you agree to our <a href="#">Terms & Conditions</a>. Winning bids are binding.
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={closeBidModal}>Cancel</button>
              <button className="btn-confirm" onClick={handleConfirmBid}>Confirm Bid 🔨</button>
            </div>
          </div>
        </div>
      )}

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