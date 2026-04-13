export const ORDER_ACTIONS: Record<string, string[]> = {
  placed: ["accepted", "rejected"],
  accepted: ["preparing", "rejected"],
  preparing: ["ready_for_pickup"],
  ready_for_pickup: ["rider_assigned"],
  rider_assigned: ["out_for_delivery"],
  out_for_delivery: ["delivered"],
};
