import type { IOrder } from "../types";

interface OrderCardProps {
  order: IOrder;
  onStatusUpdate: () => void;
}

const OrderCard = ({ order, onStatusUpdate }: OrderCardProps) => {
  return <div>Lageve jab lipistick</div>;
};

export default OrderCard;
