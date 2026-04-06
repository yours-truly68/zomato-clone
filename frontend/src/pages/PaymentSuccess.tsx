import { useParams } from "react-router-dom";

const PaymentSuccess = () => {
  const { paymentId } = useParams<{ paymentId: string }>();
  return (
    <div>
      <h1>Payment Successful</h1>
      <p>Thank you for your payment!</p>
    </div>
  );
};

export default PaymentSuccess;
