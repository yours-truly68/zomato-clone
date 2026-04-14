import { Navigate, Outlet } from "react-router-dom";
import { useAppData } from "../context/AppContext";

const PublicRoute = () => {
  const { isAuth, loading, user } = useAppData();

  if (loading) return null;

  if (!isAuth) return <Outlet />;

  // 🔥 Role-based redirect
  if (user?.role === "seller") {
    return <Navigate to="/seller" replace />;
  } else if (user?.role === "rider") {
    return <Navigate to="/rider" replace />;
  }

  return <Navigate to="/" replace />;
};

export default PublicRoute;
