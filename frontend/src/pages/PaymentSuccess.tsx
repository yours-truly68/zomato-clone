import { useParams } from "react-router-dom";

const PaymentSuccess = () => {
  const { paymentId } = useParams<{ paymentId: string }>();
  return (
    <div>
      <h1>Payment Successful</h1>
      <p>Thank you for your payment!</p>
      <p>Payment ID: {paymentId}</p>
    </div>
  );
};

export default PaymentSuccess;
