export const ORDER_ACTIONS: Record<string, string[]> = {
  placed: ["accepted"],
  accepted: ["preparing"],
  preparing: ["ready_for_pickup"],
//   ready_for_pickup: ["rider_assigned"],
//   rider_assigned: ["out_for_delivery"],
//   out_for_delivery: ["delivered"],
};
