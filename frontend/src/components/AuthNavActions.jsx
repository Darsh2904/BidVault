import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthNavActions({
  outlineClass = "btn-outline",
  primaryClass = "btn-primary",
  showDashboardButton = true,
}) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const actionGroupStyle = {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    flexWrap: "nowrap",
  };

  const buttonStyle = {
    whiteSpace: "nowrap",
    flexShrink: 0,
  };

  const linkStyle = {
    textDecoration: "none",
    display: "inline-flex",
    flexShrink: 0,
  };

  const onLogout = () => {
    logout();
    navigate("/");
  };

  if (!isAuthenticated) {
    return (
      <div style={actionGroupStyle}>
        <Link to="/auth" style={linkStyle}>
          <button className={primaryClass} style={buttonStyle}>Login / Signup</button>
        </Link>
      </div>
    );
  }

  return (
    <div style={actionGroupStyle}>
      <button className={outlineClass} style={buttonStyle} title={user?.email || ""}>{user?.name || "User"}</button>
      {showDashboardButton && user?.role === "admin" && (
        <Link to="/dashboard" style={linkStyle}>
          <button className={outlineClass} style={buttonStyle}>Admin Dashboard</button>
        </Link>
      )}
      <button className={primaryClass} style={buttonStyle} onClick={onLogout}>Logout</button>
    </div>
  );
}
