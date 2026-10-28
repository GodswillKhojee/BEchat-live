import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUser } from "../../hooks/useUser";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useUser();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children ?? <Outlet />;
}
