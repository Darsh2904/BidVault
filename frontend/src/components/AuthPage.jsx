import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  loginUser,
  requestForgotPasswordOtp,
  requestSignupOtp,
  resetForgotPassword,
  verifySignupOtp,
} from "../utils/authApi";
import { useAuth } from "../context/AuthContext";

const pageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

  .auth-page {
    min-height: 100vh;
    display: grid;
    place-items: center;
    padding: 2rem 1rem;
    background:
      radial-gradient(circle at 20% 20%, rgba(108, 92, 231, 0.22), transparent 45%),
      radial-gradient(circle at 80% 15%, rgba(240, 180, 41, 0.16), transparent 40%),
      linear-gradient(140deg, #0a0a10 0%, #10101a 55%, #17142b 100%);
    color: #fff;
    font-family: 'DM Sans', sans-serif;
  }

  .auth-card {
    width: min(100%, 520px);
    background: rgba(17, 17, 28, 0.93);
    border: 1px solid rgba(139, 124, 248, 0.24);
    border-radius: 18px;
    padding: 1.8rem;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(6px);
  }

  .auth-brand {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1.8rem;
    margin-bottom: 1.25rem;
    background: linear-gradient(135deg, #8b7cf8, #f0b429);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .auth-tabs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
    background: #1a1a28;
    border: 1px solid rgba(108, 92, 231, 0.25);
    border-radius: 12px;
    padding: 0.35rem;
    margin-bottom: 1rem;
  }

  .auth-tab {
    border: none;
    border-radius: 9px;
    padding: 0.55rem 0.65rem;
    background: transparent;
    color: #9b9bc8;
    cursor: pointer;
    font-weight: 600;
  }

  .auth-tab.active {
    color: #fff;
    background: linear-gradient(135deg, #6c5ce7, #7f70f0);
  }

  .auth-title {
    font-family: 'Syne', sans-serif;
    font-size: 1.35rem;
    margin: 0.5rem 0 0.3rem;
  }

  .auth-sub {
    color: #aaaacd;
    margin-bottom: 1.1rem;
    font-size: 0.92rem;
  }

  .auth-grid {
    display: grid;
    gap: 0.85rem;
  }

  .auth-label {
    display: block;
    margin-bottom: 0.35rem;
    color: #b9b9db;
    font-size: 0.8rem;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    font-weight: 600;
  }

  .auth-input,
  .auth-select {
    width: 100%;
    border: 1px solid rgba(108, 92, 231, 0.32);
    border-radius: 10px;
    background: #1b1b2a;
    color: #fff;
    padding: 0.75rem 0.85rem;
    outline: none;
    font-size: 0.95rem;
  }

  .auth-input:focus,
  .auth-select:focus {
    border-color: #8b7cf8;
    box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.25);
  }

  .auth-btn {
    margin-top: 0.35rem;
    width: 100%;
    border: none;
    border-radius: 10px;
    background: linear-gradient(135deg, #6c5ce7, #5845e3);
    color: #fff;
    font-weight: 700;
    cursor: pointer;
    padding: 0.8rem;
    font-size: 0.94rem;
  }

  .auth-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .auth-inline-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: -0.3rem;
  }

  .auth-link-btn {
    background: transparent;
    border: none;
    color: #b8a8ff;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    padding: 0;
  }

  .auth-link-btn:hover {
    color: #d6cdff;
  }

  .auth-msg {
    margin-top: 0.8rem;
    border-radius: 9px;
    padding: 0.65rem 0.75rem;
    font-size: 0.86rem;
  }

  .auth-msg.error {
    background: rgba(255, 80, 80, 0.12);
    color: #ff9e9e;
    border: 1px solid rgba(255, 68, 68, 0.3);
  }

  .auth-msg.success {
    background: rgba(0, 196, 140, 0.12);
    color: #8ff0cc;
    border: 1px solid rgba(0, 196, 140, 0.3);
  }

  .forgot-overlay {
    position: fixed;
    inset: 0;
    background: rgba(7, 7, 13, 0.78);
    display: grid;
    place-items: center;
    z-index: 1200;
    padding: 1rem;
  }

  .forgot-modal {
    width: min(100%, 470px);
    background: rgba(17, 17, 28, 0.97);
    border: 1px solid rgba(139, 124, 248, 0.35);
    border-radius: 14px;
    padding: 1rem;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.45);
  }

  .forgot-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.75rem;
  }

  .forgot-title {
    margin: 0;
    font-family: 'Syne', sans-serif;
    font-size: 1.12rem;
  }

  .forgot-close {
    border: 1px solid rgba(139, 124, 248, 0.3);
    background: #23233a;
    color: #dcdcff;
    border-radius: 8px;
    cursor: pointer;
    padding: 0.24rem 0.5rem;
    font-size: 0.9rem;
  }

  .forgot-sub {
    color: #a7a7ce;
    font-size: 0.86rem;
    margin: 0 0 0.75rem;
  }

  @media (max-width: 640px) {
    .auth-page { padding: 1.25rem 0.8rem; }
    .auth-card { border-radius: 14px; padding: 1.1rem; }
    .auth-brand { font-size: 1.45rem; margin-bottom: 1rem; }
    .auth-title { font-size: 1.15rem; }
    .auth-sub { font-size: 0.84rem; margin-bottom: 0.85rem; }
    .auth-tab { padding: 0.5rem 0.55rem; font-size: 0.85rem; }
    .auth-input,
    .auth-select,
    .auth-btn { font-size: 0.9rem; }
  }
`;

const initialSignup = {
  name: "",
  email: "",
  password: "",
  role: "buyer_seller",
};

export default function AuthPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [signupData, setSignupData] = useState(initialSignup);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState("request");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotData, setForgotData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [forgotMessage, setForgotMessage] = useState({ type: "", text: "" });

  const isAdminRole = useMemo(() => signupData.role === "admin", [signupData.role]);

  const showMessage = (type, text) => setMessage({ type, text });
  const showForgotMessage = (type, text) => setForgotMessage({ type, text });

  const closeForgotModal = () => {
    setShowForgotModal(false);
    setForgotStep("request");
    setForgotLoading(false);
    setForgotMessage({ type: "", text: "" });
    setForgotData({
      email: "",
      otp: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const openForgotModal = () => {
    setShowForgotModal(true);
    setForgotStep("request");
    setForgotMessage({ type: "", text: "" });
    setForgotData({
      email: loginData.email || "",
      otp: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleSignupRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await requestSignupOtp(signupData);
      setOtpSent(true);
      showMessage("success", "OTP sent to your email. Please verify to complete signup.");
    } catch (error) {
      showMessage("error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const result = await verifySignupOtp({ email: signupData.email, otp });

      showMessage(
        "success",
        result.requiresAdminApproval
          ? "Signup successful. Your admin account is pending approval by an existing admin."
          : "Signup successful. You can now log in."
      );

      setMode("login");
      setLoginData({ email: signupData.email, password: signupData.password });
      setOtp("");
      setOtpSent(false);
      setSignupData(initialSignup);
    } catch (error) {
      showMessage("error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const data = await loginUser(loginData);
      login(data.user, data.token);
      showMessage("success", "Login successful");
      if (data.user.role === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      showMessage("error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotRequestOtp = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMessage({ type: "", text: "" });

    try {
      await requestForgotPasswordOtp({ email: forgotData.email });
      setForgotStep("verify");
      showForgotMessage("success", "OTP sent to your email. Enter OTP and set a new password.");
    } catch (error) {
      showForgotMessage("error", error.message);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotResetPassword = async (e) => {
    e.preventDefault();

    if (forgotData.newPassword !== forgotData.confirmPassword) {
      showForgotMessage("error", "New password and confirm password do not match.");
      return;
    }

    setForgotLoading(true);
    setForgotMessage({ type: "", text: "" });

    try {
      await resetForgotPassword({
        email: forgotData.email,
        otp: forgotData.otp,
        newPassword: forgotData.newPassword,
      });

      showMessage("success", "Password reset successful. Please login with your new password.");
      setLoginData((prev) => ({ ...prev, email: forgotData.email, password: "" }));
      closeForgotModal();
    } catch (error) {
      showForgotMessage("error", error.message);
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <>
      <style>{pageStyles}</style>
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-brand">BidVault ⚡</div>

          <div className="auth-tabs">
            <button
              className={`auth-tab ${mode === "login" ? "active" : ""}`}
              onClick={() => {
                setMode("login");
                setMessage({ type: "", text: "" });
              }}
              type="button"
            >
              Login
            </button>
            <button
              className={`auth-tab ${mode === "signup" ? "active" : ""}`}
              onClick={() => {
                setMode("signup");
                setMessage({ type: "", text: "" });
              }}
              type="button"
            >
              Signup
            </button>
          </div>

          {mode === "signup" && (
            <>
              <h2 className="auth-title">Create Account</h2>
              <p className="auth-sub">Use email OTP verification before registration is completed.</p>

              {!otpSent ? (
                <form className="auth-grid" onSubmit={handleSignupRequestOtp}>
                  <div>
                    <label className="auth-label">Name</label>
                    <input
                      className="auth-input"
                      placeholder="Enter your name"
                      value={signupData.name}
                      onChange={(e) => setSignupData((p) => ({ ...p, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <label className="auth-label">Email</label>
                    <input
                      className="auth-input"
                      type="email"
                      placeholder="you@example.com"
                      value={signupData.email}
                      onChange={(e) => setSignupData((p) => ({ ...p, email: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <label className="auth-label">Password</label>
                    <input
                      className="auth-input"
                      type="password"
                      placeholder="At least 6 characters"
                      value={signupData.password}
                      onChange={(e) => setSignupData((p) => ({ ...p, password: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <label className="auth-label">Role</label>
                    <select
                      className="auth-select"
                      value={signupData.role}
                      onChange={(e) => setSignupData((p) => ({ ...p, role: e.target.value }))}
                    >
                      <option value="buyer_seller">Buyer/Seller</option>
                      <option value="admin">Admin</option>
                    </select>
                    {isAdminRole && (
                      <p className="auth-sub" style={{ margin: "0.45rem 0 0" }}>
                        Admin signup requires approval from an existing approved admin.
                      </p>
                    )}
                  </div>

                  <button className="auth-btn" disabled={loading} type="submit">
                    {loading ? "Sending OTP..." : "Send OTP"}
                  </button>
                </form>
              ) : (
                <form className="auth-grid" onSubmit={handleVerifyOtp}>
                  <div>
                    <label className="auth-label">Enter OTP</label>
                    <input
                      className="auth-input"
                      placeholder="6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                    />
                  </div>
                  <button className="auth-btn" disabled={loading} type="submit">
                    {loading ? "Verifying..." : "Verify OTP & Complete Signup"}
                  </button>
                </form>
              )}
            </>
          )}

          {mode === "login" && (
            <>
              <h2 className="auth-title">Welcome Back</h2>
              <p className="auth-sub">Login with your verified email and password.</p>
              <form className="auth-grid" onSubmit={handleLogin}>
                <div>
                  <label className="auth-label">Email</label>
                  <input
                    className="auth-input"
                    type="email"
                    placeholder="you@example.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData((p) => ({ ...p, email: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="auth-label">Password</label>
                  <input
                    className="auth-input"
                    type="password"
                    placeholder="Enter password"
                    value={loginData.password}
                    onChange={(e) => setLoginData((p) => ({ ...p, password: e.target.value }))}
                    required
                  />
                </div>

                <div className="auth-inline-actions">
                  <button className="auth-link-btn" onClick={openForgotModal} type="button">
                    Forgot password?
                  </button>
                </div>

                <button className="auth-btn" disabled={loading} type="submit">
                  {loading ? "Logging in..." : "Login"}
                </button>
              </form>
            </>
          )}

          {message.text && <div className={`auth-msg ${message.type}`}>{message.text}</div>}
        </div>
      </div>

      {showForgotModal && (
        <div className="forgot-overlay" role="dialog" aria-modal="true">
          <div className="forgot-modal">
            <div className="forgot-header">
              <h3 className="forgot-title">Reset Password</h3>
              <button className="forgot-close" onClick={closeForgotModal} type="button">
                Close
              </button>
            </div>

            {forgotStep === "request" ? (
              <>
                <p className="forgot-sub">Enter your registered email. We will send a 6-digit OTP.</p>
                <form className="auth-grid" onSubmit={handleForgotRequestOtp}>
                  <div>
                    <label className="auth-label">Email</label>
                    <input
                      className="auth-input"
                      type="email"
                      placeholder="you@example.com"
                      value={forgotData.email}
                      onChange={(e) =>
                        setForgotData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <button className="auth-btn" disabled={forgotLoading} type="submit">
                    {forgotLoading ? "Sending OTP..." : "Send OTP"}
                  </button>
                </form>
              </>
            ) : (
              <>
                <p className="forgot-sub">Enter OTP and set your new password.</p>
                <form className="auth-grid" onSubmit={handleForgotResetPassword}>
                  <div>
                    <label className="auth-label">Email</label>
                    <input className="auth-input" value={forgotData.email} readOnly />
                  </div>
                  <div>
                    <label className="auth-label">OTP</label>
                    <input
                      className="auth-input"
                      placeholder="6-digit OTP"
                      value={forgotData.otp}
                      onChange={(e) =>
                        setForgotData((prev) => ({
                          ...prev,
                          otp: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="auth-label">New Password</label>
                    <input
                      className="auth-input"
                      type="password"
                      placeholder="At least 6 characters"
                      value={forgotData.newPassword}
                      onChange={(e) =>
                        setForgotData((prev) => ({
                          ...prev,
                          newPassword: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="auth-label">Confirm Password</label>
                    <input
                      className="auth-input"
                      type="password"
                      placeholder="Confirm new password"
                      value={forgotData.confirmPassword}
                      onChange={(e) =>
                        setForgotData((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <button className="auth-btn" disabled={forgotLoading} type="submit">
                    {forgotLoading ? "Resetting..." : "Verify OTP & Reset Password"}
                  </button>
                </form>
              </>
            )}

            {forgotMessage.text && <div className={`auth-msg ${forgotMessage.type}`}>{forgotMessage.text}</div>}
          </div>
        </div>
      )}
    </>
  );
}
