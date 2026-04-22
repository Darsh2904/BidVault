import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthNavActions({
  outlineClass = "btn-outline",
  primaryClass = "btn-primary",
  showDashboardButton = true,
}) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate("/");
  };

  if (!isAuthenticated) {
    return (
      <Link to="/auth" style={{ textDecoration: "none" }}>
        <button className={primaryClass}>Login / Signup</button>
      </Link>
    );
  }

  return (
    <>
      <button className={outlineClass} title={user?.email || ""}>{user?.name || "User"}</button>
      {showDashboardButton && user?.role === "admin" && (
        <Link to="/dashboard" style={{ textDecoration: "none" }}>
          <button className={outlineClass}>Admin Dashboard</button>
        </Link>
      )}
      <button className={primaryClass} onClick={onLogout}>Logout</button>
    </>
  );
}
