import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/publicRoute";
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

const App = () => {
  const { user } = useAppData();

  if (user && user.role === "seller") {
    return <Restaurant />;
  }

  return (
    <>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path={"/login"} element={<Login />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path={"/"} element={<Home />} />
            <Route path={"/restaurant/:id"} element={<RestaurantPage />} />
            <Route path={"/cart"} element={<Cart />} />
            <Route path={"/select-role"} element={<SelectRole />} />
            <Route path={"/account"} element={<Account />} />
            <Route path={"/address"} element={<Address />} />
            <Route path={"/checkout"} element={<Checkout />} />
            <Route
              path={"/paymentsuccess/:paymentId"}
              element={<PageSuccess />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
