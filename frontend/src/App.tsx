import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { SelectRole } from "./pages/SelectRole";
import Navbar from "./components/Navbar";
import Account from "./pages/Account";
import { useAppData } from "./context/AppContext";
import Restaurant from "./pages/Restaurant";
import RestaurantPage from "./pages/RestaurantPage";
import Cart from "./pages/Cart";
import Address from "./pages/Address";
import Checkout from "./pages/Checkout";
import PageSuccess from "./pages/PageSuccess";
import Orders from "./pages/Orders";
import OrderPage from "./pages/OrderPage";
import RiderDashboard from "./pages/RiderDashboard";
import Admin from "./pages/Admin";
import PublicRoute from "./components/PublicRoute";

const App = () => {
  const { user, loading } = useAppData();

  if (loading) {
    return (
      <div className="text-2xl font-bold flex justify-center items-center min-h-screen text-blue-600">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} /> {/* ✅ FIX */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
          </Route>
        </Routes>
      </BrowserRouter>
    );
  }
  if (user.role === "admin") {
    return <Admin />;
  }
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* Public */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderPage />} />
          <Route path="/restaurant/:id" element={<RestaurantPage />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/select-role" element={<SelectRole />} />
          <Route path="/account" element={<Account />} />
          <Route path="/address" element={<Address />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/paymentsuccess/:paymentId" element={<PageSuccess />} />

          {/* 🔥 ROLE BASED ROUTES */}
          <Route path="/rider/dashboard" element={<RiderDashboard />} />
          <Route path="/seller" element={<Restaurant />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
