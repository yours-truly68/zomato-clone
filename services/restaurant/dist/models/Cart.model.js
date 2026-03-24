import mongoose, { Schema } from "mongoose";
const CartSchema = new Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    restaurantId: {
        type: mongoose.Types.ObjectId,
        ref: "Restaurant",
        required: true,
    },
    itemId: {
        type: mongoose.Types.ObjectId,
        ref: "MenuItem",
        required: true,
    },
    quantity: {
        type: Number,
        default: 1,
        min: 1,
    },
}, {
    timestamps: true,
});
CartSchema.index({ userId: 1, restaurantId: 1, itemId: 1 }, { unique: true });
const Cart = mongoose.model("Cart", CartSchema);
export default Cart;
