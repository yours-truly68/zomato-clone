import mongoose from "mongoose";
import TryCatch from "../middlewares/TryCatch.middleware.js";
import Cart from "../models/Cart.model.js";
export const addToCart = TryCatch(async (req, res) => {
    // Implementation for adding an item to the cart
    if (!req.user) {
        return res.status(401).json({
            message: "Unauthorized - Please Login",
        });
    }
    const userId = req.user._id;
    const { restaurantId, itemId, quantity } = req.body;
    if (!mongoose.Types.ObjectId.isValid(restaurantId) ||
        !mongoose.Types.ObjectId.isValid(itemId)) {
        return res.status(400).json({
            message: "Invalid restaurant or item ID",
        });
    }
    const cartFromDifferentRestaurant = await Cart.findOne({
        userId,
        restaurantId: { $ne: restaurantId },
    });
    if (cartFromDifferentRestaurant) {
        return res.status(400).json({
            message: "You have items from a different restaurant in your cart. Please clear your cart before adding items from another restaurant.",
        });
    }
    const exisitingCartItem = await Cart.findOneAndUpdate({ userId, restaurantId, itemId }, {
        $inc: { quantity: quantity || 1 },
        $setOnInsert: { userId, restaurantId, itemId },
    }, { new: true, upsert: true, setDefaultsOnInsert: true });
    return res.json({
        message: "Item added to cart successfully",
        cartItem: exisitingCartItem,
    });
});
export const fetchMyCart = TryCatch(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            message: "Unauthorized - Please Login",
        });
    }
    const userId = req.user._id;
    const cartItems = await Cart.find({ userId })
        .populate("itemId")
        .populate("restaurantId");
    let subTotal = 0;
    let cartLength = 0;
    for (const cartItem of cartItems) {
        const item = cartItem.itemId;
        subTotal += item.price * cartItem.quantity;
        cartLength += cartItem.quantity;
    }
    return res.json({
        success: true,
        subTotal,
        cartLength,
        cart: cartItems,
    });
});
