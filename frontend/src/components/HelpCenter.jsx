import { useState } from "react";
import { Link } from "react-router-dom";
import { submitHelpCenterRequest } from "../utils/authApi";
import { useAuth } from "../context/AuthContext";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;700;800&family=DM+Sans:wght@400;500;700&display=swap');

  .hc-wrap {
    min-height: 100vh;
    background: radial-gradient(circle at 12% 15%, rgba(245, 158, 11, 0.12), transparent 34%),
                radial-gradient(circle at 90% 82%, rgba(108, 99, 255, 0.18), transparent 36%),
                #0a0a0f;
    color: #ffffff;
    padding: 2rem 1.25rem 3rem;
    font-family: 'DM Sans', sans-serif;
  }

  .hc-shell {
    max-width: 1060px;
    margin: 0 auto;
  }

  .hc-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .hc-brand {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1.4rem;
    letter-spacing: 0.02em;
    background: linear-gradient(130deg, #9d98ff, #f59e0b);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .hc-home {
    border: 1px solid #353556;
    border-radius: 10px;
    color: #d0d0ef;
    text-decoration: none;
    padding: 0.55rem 0.95rem;
    font-size: 0.86rem;
    transition: all 0.2s ease;
  }

  .hc-home:hover {
    border-color: #7f7aff;
    color: #ffffff;
  }

  .hc-grid {
    display: grid;
    grid-template-columns: 1.1fr 1fr;
    gap: 1.25rem;
  }

  .hc-panel {
    border: 1px solid #2b2b45;
    border-radius: 18px;
    background: linear-gradient(160deg, rgba(20, 20, 34, 0.9), rgba(12, 12, 24, 0.95));
    padding: 1.45rem;
  }

  .hc-badge {
    display: inline-flex;
    align-items: center;
    border: 1px solid #3c3c60;
    border-radius: 999px;
    font-size: 0.72rem;
    color: #9d98ff;
    padding: 0.25rem 0.7rem;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    margin-bottom: 1rem;
  }

  .hc-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(1.6rem, 3.5vw, 2rem);
    line-height: 1.2;
    margin-bottom: 0.65rem;
  }

  .hc-sub {
    color: #aeaecb;
    font-size: 0.93rem;
    line-height: 1.7;
    margin-bottom: 1.2rem;
  }

  .hc-points {
    display: grid;
    gap: 0.8rem;
  }

  .hc-point {
    border: 1px solid #303052;
    border-radius: 12px;
    padding: 0.85rem 0.9rem;
    font-size: 0.85rem;
    color: #d1d1ef;
    background: rgba(12, 12, 22, 0.55);
  }

  .hc-point b {
    color: #ffffff;
  }

  .hc-form {
    display: grid;
    gap: 0.85rem;
  }

  .hc-label {
    display: block;
    font-size: 0.77rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #9d9dbe;
    margin-bottom: 0.35rem;
  }

  .hc-input,
  .hc-select,
  .hc-textarea {
    width: 100%;
    border: 1px solid #3a3a5d;
    border-radius: 10px;
    background: #141426;
    color: #ffffff;
    padding: 0.68rem 0.75rem;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem;
    outline: none;
    transition: border-color 0.18s ease;
  }

  .hc-input:focus,
  .hc-select:focus,
  .hc-textarea:focus {
    border-color: #8d88ff;
  }

  .hc-textarea {
    resize: vertical;
    min-height: 118px;
    line-height: 1.5;
  }

  .hc-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }

  .hc-char {
    text-align: right;
    color: #8f8fb2;
    font-size: 0.75rem;
  }

  .hc-submit {
    margin-top: 0.3rem;
    border: none;
    border-radius: 10px;
    padding: 0.72rem 1rem;
    background: linear-gradient(135deg, #6c63ff, #8d88ff);
    color: #ffffff;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem;
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.2s ease, opacity 0.2s ease;
  }

  .hc-submit:hover {
    transform: translateY(-1px);
  }

  .hc-submit:disabled {
    opacity: 0.75;
    cursor: not-allowed;
    transform: none;
  }

  .hc-msg {
    border-radius: 10px;
    font-size: 0.82rem;
    padding: 0.62rem 0.75rem;
    margin-top: 0.2rem;
  }

  .hc-msg.ok {
    border: 1px solid rgba(74, 222, 128, 0.35);
    background: rgba(74, 222, 128, 0.12);
    color: #bdf8cb;
  }

  .hc-msg.err {
    border: 1px solid rgba(248, 113, 113, 0.35);
    background: rgba(248, 113, 113, 0.12);
    color: #ffc0c0;
  }

  .hc-faq {
    margin-top: 1.2rem;
    border-top: 1px solid #2b2b45;
    padding-top: 1rem;
  }

  .hc-faq h3 {
    font-size: 0.9rem;
    margin-bottom: 0.6rem;
    color: #ddd9ff;
  }

  .hc-faq li {
    color: #a8a8c9;
    font-size: 0.83rem;
    margin-bottom: 0.45rem;
    line-height: 1.5;
  }

  @media (max-width: 900px) {
    .hc-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 520px) {
    .hc-row {
      grid-template-columns: 1fr;
    }

    .hc-wrap {
      padding: 1.3rem 0.9rem 2.4rem;
    }
  }
`;

const initialState = {
  fullName: "",
  email: "",
  topic: "account",
  orderId: "",
  message: "",
};

export default function HelpCenter() {
  const [formData, setFormData] = useState(initialState);
  const [feedback, setFeedback] = useState({ type: "", text: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.message.trim()) {
      setFeedback({ type: "err", text: "Please fill name, email, and message before submitting." });
      return;
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setFeedback({ type: "err", text: "Please enter a valid email address." });
      return;
    }

    setIsSubmitting(true);
    setFeedback({ type: "", text: "" });

    try {
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        topic: formData.topic,
        orderId: formData.orderId.trim(),
        message: formData.message.trim(),
      };

      const data = await submitHelpCenterRequest(payload, token);
      const ticketId = data?.ticket?.id ? ` Ticket ID: ${data.ticket.id}` : "";

      setFormData(initialState);
      setFeedback({
        type: "ok",
        text: `Your request has been submitted. Our team will contact you within 24 hours.${ticketId}`,
      });
    } catch (error) {
      setFeedback({ type: "err", text: error.message || "Failed to submit request. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="hc-wrap">
      <style>{styles}</style>
      <div className="hc-shell">
        <div className="hc-topbar">
          <div className="hc-brand">BidVault Help Center</div>
          <Link className="hc-home" to="/">Back to Home</Link>
        </div>

        <div className="hc-grid">
          <section className="hc-panel">
            <div className="hc-badge">Support Team</div>
            <h1 className="hc-title">Tell us what you need help with</h1>
            <p className="hc-sub">
              Share details about your account, payment, or auction issue. We prioritize urgent escrow and dispute requests.
            </p>

            <div className="hc-points">
              <div className="hc-point"><b>Fast response:</b> Most tickets are answered within 24 hours.</div>
              <div className="hc-point"><b>Escrow issues:</b> Add order or transaction id for quicker verification.</div>
              <div className="hc-point"><b>Account safety:</b> Report suspicious bids immediately via this form.</div>
            </div>

            <div className="hc-faq">
              <h3>Common questions</h3>
              <ul>
                <li>How do I reset my password? Use Forgot Password on login page and verify OTP.</li>
                <li>When is payment released? After successful delivery confirmation workflow.</li>
                <li>How do disputes work? Our team reviews evidence from both parties before final action.</li>
              </ul>
            </div>
          </section>

          <section className="hc-panel">
            <form className="hc-form" onSubmit={handleSubmit}>
              <div className="hc-row">
                <div>
                  <label className="hc-label" htmlFor="fullName">Full Name</label>
                  <input
                    id="fullName"
                    className="hc-input"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    autoComplete="name"
                  />
                </div>
                <div>
                  <label className="hc-label" htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    className="hc-input"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="hc-row">
                <div>
                  <label className="hc-label" htmlFor="topic">Issue Type</label>
                  <select
                    id="topic"
                    className="hc-select"
                    name="topic"
                    value={formData.topic}
                    onChange={handleChange}
                  >
                    <option value="account">Account Access</option>
                    <option value="payment">Payment / Escrow</option>
                    <option value="auction">Auction Bidding</option>
                    <option value="dispute">Dispute Resolution</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="hc-label" htmlFor="orderId">Order or Transaction ID</label>
                  <input
                    id="orderId"
                    className="hc-input"
                    name="orderId"
                    value={formData.orderId}
                    onChange={handleChange}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div>
                <label className="hc-label" htmlFor="message">Message</label>
                <textarea
                  id="message"
                  className="hc-textarea"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  maxLength={600}
                  placeholder="Describe your issue with as much detail as possible..."
                />
                <div className="hc-char">{formData.message.length}/600</div>
              </div>

              {feedback.text ? <div className={`hc-msg ${feedback.type}`}>{feedback.text}</div> : null}

              <button className="hc-submit" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
