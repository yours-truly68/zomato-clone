import { Navigate, Outlet } from "react-router-dom";
import { useAppData } from "../context/AppContext";

const PublicRoute = () => {
  const { isAuth, loading, user } = useAppData();

  if (loading) return null;

  // 🔴 If NOT authenticated → allow public pages
  if (!isAuth) {
    return <Outlet />;
  }

  // 🔴 If authenticated but user not loaded yet → wait

  if (!user) {
    return null;
  }

  // 🔥 Redirect logged-in users away from public pages
  if (user.role === "seller") {
    return <Navigate to="/seller" replace />;
  }

  if (user.role === "rider") {
    return <Navigate to="/rider/dashboard" replace />;
  }

  return <Navigate to="/" replace />;
};
export default PublicRoute;
