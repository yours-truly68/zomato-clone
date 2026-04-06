import { useNavigate, useParams } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useEffect } from "react";
import { BiCheckCircle } from "react-icons/bi";
import { BsArrowRight } from "react-icons/bs";

const PageSuccess = () => {
  const { paymentId } = useParams<{ paymentId: string }>();
  const navigate = useNavigate();
  const { fetchCart } = useAppData();

  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-sm p-6 space-y-4 text-center">
        <BiCheckCircle size={64} className="text-green-500 mx-auto" />
        <h2 className="text-2xl font-bold text-gray-800">
          Payment Successful!
        </h2>
        <p className="text-gray-500 text-sm ">
          Your Order has been successfully placed
        </p>
        {paymentId && (
          <div className="rounded-lg bg-gray-100 flex flex-col items-center p-4 space-y-1">
            <span className="text-gray-500 text-sm ">Payment ID:</span>
            <p className="font-mono break-all">{paymentId}</p>
          </div>
        )}

        <div className="space-y-2 pt-2">
          <button
            onClick={() => navigate("/")}
            className="bg-[#e23744] hover:bg-red-600 transition text-white font-semibold py-3 px-4 rounded-lg flex w-full items-center justify-center gap-2"
          >
            Order More <BsArrowRight size={18} className="hover:right-1"/>
          </button>
          <button
            onClick={() => navigate("/orders")}
            className="bg-[#e23744] hover:bg-red-600 transition text-white font-semibold py-3 px-4 rounded-lg flex w-full items-center justify-center gap-2"
          >
            My Orders <BsArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PageSuccess;
