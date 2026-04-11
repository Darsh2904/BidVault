import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function PublicOnlyRoute({ children }) {
  const { loading, isAuthenticated, user } = useAuth();

  if (loading) return null;
  if (!isAuthenticated) return children;

  const destination = user?.role === "admin" ? "/dashboard" : "/";
  return <Navigate to={destination} replace />;
}

export function PrivateRoute({ children, allowedRoles }) {
  const { loading, isAuthenticated, user } = useAuth();

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/auth" replace />;

  if (allowedRoles?.length && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
