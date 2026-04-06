import mongoose, { Schema } from "mongoose";
const MenuItemSchema = new Schema({
    restaurantId: {
        type: Schema.Types.ObjectId,
        ref: "Restaurant",
        required: true,
        index: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
    },
    image: {
        type: String,
    },
    isAvailable: {
        type: Boolean,
        default: true,
        required: true,
    },
    isVeg: {
        type: Boolean,
        default: false,
        required: true,
    },
}, { timestamps: true });
export const MenuItem = mongoose.model("MenuItem", MenuItemSchema);
