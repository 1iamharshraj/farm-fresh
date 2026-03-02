module.exports = {
  ROLES: {
    CUSTOMER: "customer",
    FARMER: "farmer",
    DELIVERY_AGENT: "delivery_agent",
  },

  ORDER_STATUS: {
    PLACED: "placed",
    FARMER_CONFIRMED: "farmer_confirmed",
    PREPARING: "preparing",
    READY_FOR_PICKUP: "ready_for_pickup",
    PICKED_UP: "picked_up",
    IN_TRANSIT: "in_transit",
    DELIVERED: "delivered",
    CANCELLED: "cancelled",
  },

  PAYMENT_STATUS: {
    PENDING: "pending",
    PAID: "paid",
    FAILED: "failed",
    REFUNDED: "refunded",
  },

  UNITS: ["kg", "gram", "dozen", "piece", "litre", "bundle"],

  GROWING_METHODS: ["organic", "natural", "hydroponic", "conventional"],

  VEHICLE_TYPES: ["bicycle", "motorcycle", "auto", "van"],
};
