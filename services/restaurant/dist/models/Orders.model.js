import mongoose, { Schema } from "mongoose";
const OrderSchema = new Schema({
    userId: { type: String, required: true },
    restaurantId: { type: String, required: true },
    restaurantName: { type: String, required: true },
    riderId: { type: String, default: null },
    riderPhone: { type: Number, default: null },
    riderName: { type: String, default: null },
    distance: { type: Number, required: true },
    riderAmount: { type: Number, required: true },
    items: [
        {
            itemId: { type: String, required: true },
            name: { type: String, required: true },
            price: { type: Number, required: true },
            quantity: { type: Number, required: true },
        },
    ],
    subTotal: { type: Number, required: true },
    deliveryCharges: { type: Number, required: true },
    platformCharges: { type: Number, required: true },
    grandTotal: { type: Number, required: true },
    addressId: { type: String, required: true },
    deliveryAddress: {
        formattedAddress: { type: String, required: true },
        phone: { type: Number, required: true },
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
    },
    status: {
        type: String,
        enum: [
            "placed",
            "accepted",
            "preparing",
            "ready_for_pickup",
            "rider_assigned",
            "out_for_delivery",
            "delivered",
            "cancelled",
        ],
        default: "placed",
    },
    paymentMethod: {
        type: String,
        enum: ["razorpay", "stripe"],
        required: true,
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed"],
        default: "pending",
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expireAfterSeconds: 0 },
    },
}, { timestamps: true });
const Order = mongoose.model("Order", OrderSchema);
export default Order;
