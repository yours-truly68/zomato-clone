import { Navigate, Outlet } from "react-router-dom";
import { useAppData } from "../context/AppContext";

const PublicRoute = () => {
  const { isAuth, loading, user } = useAppData();

  if (loading) return null;

  if (!isAuth) return <Outlet />;

  // 🔥 Role-based redirect
  if (user?.role === "seller") {
    return <Navigate to="/seller" replace />;
  }

  return <Navigate to="/" replace />;
};

export default PublicRoute;
