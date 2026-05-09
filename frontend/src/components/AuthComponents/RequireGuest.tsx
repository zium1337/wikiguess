import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../store/AuthContext";

function RequireGuest() {
  const { isAuthenticated, isReady } = useAuth();

  if (!isReady) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <Outlet />;
}

export default RequireGuest;
