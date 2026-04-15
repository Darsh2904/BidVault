import { Link, useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { createAuctionListing } from "../utils/authApi";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --bg: #050512;
    --bg2: #121224;
    --bg3: #1d1d35;
    --bg4: #272745;
    --purple: #6c5ce7;
    --purple-light: #8b7cf8;
    --gold: #f0b429;
    --text: #ffffff;
    --text-muted: #8f90b2;
    --border: rgba(108, 92, 231, 0.24);
  }

  body {
    background: radial-gradient(circle at 10% 0%, rgba(108, 92, 231, 0.12), transparent 30%), var(--bg);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
    zoom: 1;
  }

  .nav {
    position: sticky;
    top: 0;
    z-index: 100;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 2rem;
    background: rgba(5, 5, 18, 0.86);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border);
  }

  .logo {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1.35rem;
    letter-spacing: 0.4px;
    background: linear-gradient(135deg, var(--purple-light), var(--gold));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .links {
    display: flex;
    gap: 2rem;
    align-items: center;
  }

  .links a {
    color: var(--text-muted);
    text-decoration: none;
    font-size: 0.95rem;
    font-weight: 600;
  }

  .links a:hover { color: var(--text); }

  .nav-right {
    display: flex;
    gap: 0.75rem;
    align-items: center;
  }

  .icon-btn {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    border: 1px solid var(--border);
    background: var(--bg3);
    color: var(--text);
    font-size: 1rem;
    cursor: pointer;
  }

  .btn {
    border-radius: 12px;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    height: 44px;
    padding: 0 1.2rem;
  }

  .btn.primary {
    background: linear-gradient(135deg, var(--purple), #5443da);
    border: none;
  }

  .page {
    width: min(860px, 100% - 2rem);
    margin: 1rem auto 2rem;
  }

  .top-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.9rem;
  }

  .back-btn {
    border: 1px solid var(--border);
    background: transparent;
    color: var(--text-muted);
    height: 38px;
    border-radius: 10px;
    padding: 0 1rem;
    font-size: 0.9rem;
    cursor: pointer;
  }

  .title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(1.5rem, 3.3vw, 2.2rem);
    letter-spacing: -0.4px;
  }

  .upload-box {
    background: rgba(13, 13, 28, 0.7);
    border: 2px dashed rgba(139, 124, 248, 0.6);
    border-radius: 16px;
    min-height: 180px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    text-align: center;
    margin-bottom: 0.9rem;
    padding: 0.85rem;
  }

  .upload-icon { font-size: 1.7rem; margin-bottom: 0.35rem; }

  .upload-title {
    font-size: 1rem;
    font-weight: 700;
    color: var(--purple-light);
    margin-bottom: 0.25rem;
  }

  .upload-sub {
    font-size: 0.82rem;
    color: var(--text-muted);
  }

  .upload-box.dragging {
    border-color: var(--gold);
    background: rgba(240, 180, 41, 0.08);
  }

  .upload-grid {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
    gap: 0.6rem;
    margin-top: 0.9rem;
  }

  .upload-thumb {
    position: relative;
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid rgba(139, 124, 248, 0.35);
    background: rgba(43, 43, 70, 0.55);
    aspect-ratio: 1 / 1;
  }

  .upload-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .remove-image {
    position: absolute;
    right: 6px;
    top: 6px;
    width: 22px;
    height: 22px;
    border-radius: 999px;
    border: none;
    background: rgba(0, 0, 0, 0.72);
    color: #fff;
    font-size: 0.72rem;
    cursor: pointer;
  }

  .msg {
    margin-bottom: 0.8rem;
    border-radius: 10px;
    padding: 0.55rem 0.75rem;
    font-size: 0.78rem;
    border: 1px solid transparent;
  }

  .msg.error {
    background: rgba(255, 68, 68, 0.12);
    border-color: rgba(255, 68, 68, 0.45);
    color: #ff9c9c;
  }

  .msg.success {
    background: rgba(0, 196, 140, 0.12);
    border-color: rgba(0, 196, 140, 0.45);
    color: #93f0d4;
  }

  .card {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 1.05rem;
  }

  .label {
    display: block;
    margin-bottom: 0.4rem;
    color: #a6a7ca;
    font-size: 0.68rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    font-weight: 700;
  }

  .input,
  .select,
  .textarea {
    width: 100%;
    height: 48px;
    border-radius: 10px;
    border: 1px solid rgba(139, 124, 248, 0.25);
    background: rgba(43, 43, 70, 0.55);
    color: var(--text);
    font-size: 0.86rem;
    padding: 0 0.85rem;
    margin-bottom: 0.9rem;
    outline: none;
  }

  .input.invalid,
  .select.invalid,
  .textarea.invalid,
  .upload-box.invalid {
    border-color: rgba(255, 68, 68, 0.65) !important;
    box-shadow: 0 0 0 1px rgba(255, 68, 68, 0.25);
  }

  .textarea {
    min-height: 106px;
    padding-top: 0.7rem;
    resize: vertical;
    font-size: 0.86rem;
  }

  .input::placeholder,
  .textarea::placeholder { color: #6f7198; }

  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.8rem;
  }

  .actions {
    margin-top: 0.15rem;
    display: grid;
    grid-template-columns: 1fr 1.8fr;
    gap: 0.8rem;
  }

  .btn-lg {
    height: 50px;
    border-radius: 10px;
    border: 1px solid rgba(139, 124, 248, 0.25);
    background: transparent;
    color: var(--text-muted);
    font-size: 0.82rem;
    font-weight: 700;
    cursor: pointer;
  }

  .btn-lg.publish {
    color: #fff;
    border: none;
    background: linear-gradient(90deg, #f0b429, #ff7c11);
  }

  .btn-lg:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .field-error {
    margin-top: -0.55rem;
    margin-bottom: 0.65rem;
    color: #ff9c9c;
    font-size: 0.72rem;
    line-height: 1.35;
  }

  @media (max-width: 1024px) {
    .nav { padding: 0 1rem; }
    .page { width: min(860px, 100% - 1.25rem); }
  }

  @media (max-width: 900px) {
    .links { display: none; }
    .grid, .actions { grid-template-columns: 1fr; }
    .input, .select, .textarea, .btn-lg { font-size: 0.82rem; }
    .upload-title { font-size: 0.95rem; }
    .upload-sub { font-size: 0.8rem; }
    .card { padding: 0.9rem; }
  }

  @media (max-width: 640px) {
    .nav { min-height: 64px; height: auto; padding: 0.55rem 0.8rem; gap: 0.55rem; }
    .nav-right { gap: 0.45rem; flex-wrap: wrap; justify-content: flex-end; }
    .nav-right .btn-outline,
    .nav-right .icon-btn:nth-of-type(2) { display: none; }
    .btn.primary { padding: 0 0.8rem; font-size: 0.82rem; }
    .top-row { flex-wrap: wrap; align-items: center; }
    .upload-box { min-height: 155px; }
    .upload-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  }

  @media (max-width: 480px) {
    .page { width: calc(100% - 0.9rem); margin: 0.75rem auto 1.5rem; }
    .title { font-size: 1.45rem; }
    .card { padding: 0.8rem; }
    .upload-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
`;

export default function CreateAuction() {
  const { token } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const fieldRefs = useRef({});
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    startingBid: "",
    reservePrice: "",
    duration: "",
    condition: "",
  });
  const [images, setImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [successText, setSuccessText] = useState("");
  const [inlineError, setInlineError] = useState({ key: "", text: "" });
  const isLightTheme = theme === "light";

  const onChange = (key) => (event) => {
    const nextValue = event.target.value;
    setForm((prev) => ({ ...prev, [key]: nextValue }));

    if (inlineError.key === key && nextValue.trim()) {
      setInlineError({ key: "", text: "" });
    }
  };

  const setFieldRef = (key) => (node) => {
    if (node) {
      fieldRefs.current[key] = node;
    }
  };

  const scrollToField = (key) => {
    const target = fieldRefs.current[key];
    if (!target) return;

    target.scrollIntoView({ behavior: "smooth", block: "center" });
    if (typeof target.focus === "function") {
      target.focus({ preventScroll: true });
    }
  };

  const showFieldError = (key, message = "Please fill out this field.") => {
    setErrorText(message);
    setInlineError({ key, text: message });
    scrollToField(key);
  };

  const toDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Failed to read image file"));
      reader.readAsDataURL(file);
    });

  const addFiles = async (fileList) => {
    const pickedFiles = Array.from(fileList || []);
    if (!pickedFiles.length) return;

    const validTypes = new Set(["image/png", "image/jpeg", "image/jpg", "image/webp"]);
    const maxPerFileBytes = 2 * 1024 * 1024;
    const availableSlots = Math.max(5 - images.length, 0);

    if (availableSlots === 0) {
      setErrorText("Maximum 5 images allowed per auction.");
      return;
    }

    const nextFiles = pickedFiles.slice(0, availableSlots);
    const rejected = nextFiles.find((file) => !validTypes.has(file.type) || file.size > maxPerFileBytes);

    if (rejected) {
      setErrorText("Only PNG/JPG/WEBP images up to 2MB are allowed.");
      return;
    }

    try {
      const encoded = await Promise.all(
        nextFiles.map(async (file) => ({
          name: file.name,
          dataUrl: await toDataUrl(file),
        }))
      );

      setImages((prev) => [...prev, ...encoded]);
      setErrorText("");
      setSuccessText("");
      if (inlineError.key === "images") {
        setInlineError({ key: "", text: "" });
      }
    } catch {
      setErrorText("Unable to process selected image files.");
    }
  };

  const onFileInputChange = async (event) => {
    await addFiles(event.target.files);
    event.target.value = "";
  };

  const removeImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const openPicker = () => {
    fileInputRef.current?.click();
  };

  const onDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const onDrop = async (event) => {
    event.preventDefault();
    setIsDragging(false);
    await addFiles(event.dataTransfer?.files);
  };

  const onPublish = async (event) => {
    event.preventDefault();

    if (!token) {
      setErrorText("Please login again to publish your auction.");
      setInlineError({ key: "", text: "" });
      return;
    }

    if (!form.title.trim()) {
      showFieldError("title");
      return;
    }

    if (!form.description.trim()) {
      showFieldError("description");
      return;
    }

    if (!form.category) {
      showFieldError("category");
      return;
    }

    if (!form.startingBid) {
      showFieldError("startingBid");
      return;
    }

    if (!form.reservePrice) {
      showFieldError("reservePrice");
      return;
    }

    if (!form.duration) {
      showFieldError("duration");
      return;
    }

    if (!form.condition) {
      showFieldError("condition");
      return;
    }

    const startingBidValue = Number(form.startingBid);
    const reservePriceValue = Number(form.reservePrice);

    if (!Number.isFinite(startingBidValue) || startingBidValue <= 0) {
      showFieldError("startingBid", "Starting bid must be greater than 0.");
      return;
    }

    if (!Number.isFinite(reservePriceValue) || reservePriceValue < startingBidValue) {
      showFieldError("reservePrice", "Reserve price must be greater than or equal to starting bid.");
      return;
    }

    if (!images.length) {
      showFieldError("images", "At least one image is required.");
      return;
    }

    setIsSubmitting(true);
    setErrorText("");
    setSuccessText("");
    setInlineError({ key: "", text: "" });

    try {
      const payload = {
        ...form,
        images: images.map((image) => image.dataUrl),
      };

      const data = await createAuctionListing(payload, token);
      setSuccessText(data.message || "Auction submitted successfully.");

      setForm({
        title: "",
        description: "",
        category: "",
        startingBid: "",
        reservePrice: "",
        duration: "",
        condition: "",
      });
      setImages([]);
      setTimeout(() => navigate("/browse"), 700);
    } catch (error) {
      setErrorText(error.message || "Failed to publish auction.");
      setInlineError({ key: "", text: "" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style>{styles}</style>

      <nav className="nav">
        <div className="logo">BidVault ⚡</div>
        <div className="links">
          <Link to="/">Home</Link>
          <Link to="/browse">Browse</Link>
          <Link to="/auctions">Auctions</Link>
          <Link to="/dashboard">Dashboard</Link>
        </div>
        <div className="nav-right">
          <button className="icon-btn" onClick={toggleTheme} title="Toggle theme">{isLightTheme ? "☀️" : "🌙"}</button>
          <button className="icon-btn">🔔</button>
          <button className="btn" onClick={() => navigate("/dashboard")}>Dashboard</button>
        </div>
      </nav>

      <section className="page">
        <div className="top-row">
          <button className="back-btn" onClick={() => navigate("/dashboard")}>← Back</button>
          <h1 className="title">Create New Auction</h1>
        </div>

        {errorText && <div className="msg error">{errorText}</div>}
        {successText && <div className="msg success">{successText}</div>}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          multiple
          onChange={onFileInputChange}
          style={{ display: "none" }}
        />

        <div
          ref={setFieldRef("images")}
          className={`upload-box ${isDragging ? "dragging" : ""} ${inlineError.key === "images" ? "invalid" : ""}`}
          onClick={openPicker}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              openPicker();
            }
          }}
        >
          <div className="upload-icon">📸</div>
          <div className="upload-title">Drag & drop images here</div>
          <div className="upload-sub">or click to browse · PNG, JPG, WEBP up to 2MB each</div>

          {images.length > 0 && (
            <div className="upload-grid">
              {images.map((image, index) => (
                <div className="upload-thumb" key={`${image.name}-${index}`}>
                  <img src={image.dataUrl} alt={image.name} />
                  <button
                    type="button"
                    className="remove-image"
                    onClick={(event) => {
                      event.stopPropagation();
                      removeImage(index);
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        {inlineError.key === "images" && <div className="field-error">{inlineError.text}</div>}

        <form className="card" onSubmit={onPublish} noValidate>
          <label className="label">Item Title</label>
          <input ref={setFieldRef("title")} className={`input ${inlineError.key === "title" ? "invalid" : ""}`} placeholder="e.g. 1959 Gibson Les Paul Standard — Sunburst" value={form.title} onChange={onChange("title")} required />
          {inlineError.key === "title" && <div className="field-error">{inlineError.text}</div>}

          <label className="label">Description</label>
          <textarea ref={setFieldRef("description")} className={`textarea ${inlineError.key === "description" ? "invalid" : ""}`} placeholder="Describe the item in detail — condition, provenance, certificates of authenticity..." value={form.description} onChange={onChange("description")} required />
          {inlineError.key === "description" && <div className="field-error">{inlineError.text}</div>}

          <label className="label">Category</label>
          <select ref={setFieldRef("category")} className={`select ${inlineError.key === "category" ? "invalid" : ""}`} value={form.category} onChange={onChange("category")} required>
            <option value="">Select category...</option>
            <option value="Watches">Watches</option>
            <option value="Collectibles">Collectibles</option>
            <option value="Art">Art</option>
            <option value="Vehicles">Vehicles</option>
            <option value="Electronics">Electronics</option>
          </select>
          {inlineError.key === "category" && <div className="field-error">{inlineError.text}</div>}

          <div className="grid">
            <div>
              <label className="label">Starting Bid (₹)</label>
              <input ref={setFieldRef("startingBid")} className={`input ${inlineError.key === "startingBid" ? "invalid" : ""}`} type="number" min="1" step="0.01" placeholder="e.g. 1000" value={form.startingBid} onChange={onChange("startingBid")} required />
              {inlineError.key === "startingBid" && <div className="field-error">{inlineError.text}</div>}
            </div>
            <div>
              <label className="label">Reserve Price (₹)</label>
              <input ref={setFieldRef("reservePrice")} className={`input ${inlineError.key === "reservePrice" ? "invalid" : ""}`} type="number" min="1" step="0.01" placeholder="e.g. 40000" value={form.reservePrice} onChange={onChange("reservePrice")} required />
              {inlineError.key === "reservePrice" && <div className="field-error">{inlineError.text}</div>}
            </div>
          </div>

          <div className="grid">
            <div>
              <label className="label">Auction Duration</label>
              <select ref={setFieldRef("duration")} className={`select ${inlineError.key === "duration" ? "invalid" : ""}`} value={form.duration} onChange={onChange("duration")} required>
                <option value="">Select duration...</option>
                <option>7 Days</option>
                <option>5 Days</option>
                <option>3 Days</option>
                <option>24 Hours</option>
              </select>
              {inlineError.key === "duration" && <div className="field-error">{inlineError.text}</div>}
            </div>
            <div>
              <label className="label">Condition</label>
              <select ref={setFieldRef("condition")} className={`select ${inlineError.key === "condition" ? "invalid" : ""}`} value={form.condition} onChange={onChange("condition")} required>
                <option value="">Select condition...</option>
                <option>Excellent</option>
                <option>Very Good</option>
                <option>Good</option>
                <option>Fair</option>
              </select>
              {inlineError.key === "condition" && <div className="field-error">{inlineError.text}</div>}
            </div>
          </div>

          <div className="actions">
            <button type="button" className="btn-lg">Save as Draft</button>
            <button type="submit" className="btn-lg publish" disabled={isSubmitting}>
              {isSubmitting ? "Publishing..." : "🚀 Publish Auction"}
            </button>
          </div>
        </form>
      </section>
    </>
  );
}
