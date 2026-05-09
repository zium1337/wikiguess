import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../store/AuthContext";

function RequireAuth() {
  const { isAuthenticated, isReady } = useAuth();

  if (!isReady) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export default RequireAuth;
