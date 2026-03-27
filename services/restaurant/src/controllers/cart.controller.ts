import mongoose from "mongoose";
import { AuthenticatedRequest } from "../middlewares/isAuth.middleware.js";
import TryCatch from "../middlewares/TryCatch.middleware.js";
import Cart from "../models/Cart.model.js";

export const addToCart = TryCatch(async (req: AuthenticatedRequest, res) => {
  // Implementation for adding an item to the cart
  if (!req.user) {
    return res.status(401).json({
      message: "Unauthorized - Please Login",
    });
  }

  const userId = req.user._id;

  const { restaurantId, itemId, quantity } = req.body;

  if (
    !mongoose.Types.ObjectId.isValid(restaurantId) ||
    !mongoose.Types.ObjectId.isValid(itemId)
  ) {
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
      message:
        "You have items from a different restaurant in your cart. Please clear your cart before adding items from another restaurant.",
    });
  }

  const exisitingCartItem = await Cart.findOneAndUpdate(
    { userId, restaurantId, itemId },
    {
      $inc: { quantity: quantity || 1 },
      $setOnInsert: { userId, restaurantId, itemId },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  return res.json({
    message: "Item added to cart successfully",
    cartItem: exisitingCartItem,
  });
});

export const fetchMyCart = TryCatch(async (req: AuthenticatedRequest, res) => {
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
    const item: any = cartItem.itemId;

    if (!item || typeof item.price !== "number") continue;

    subTotal += item.price * cartItem.quantity;
    cartLength += cartItem.quantity;
  }

  return res.json({
    success: true,
    message: "Cart fetched successfully",
    subTotal,
    cartLength,
    cart: cartItems,
  });
});

export const incrementCartItem = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const userId = req.user?._id;
    const { itemId } = req.body;

    if (!userId || !itemId) {
      return res.status(400).json({
        message: "User ID and Item ID are required",
      });
    }

    const updatedCartItem = await Cart.findOneAndUpdate(
      {
        userId,
        itemId,
      },
      {
        $inc: { quantity: 1 },
      },
      { new: true },
    );

    if (!updatedCartItem) {
      return res.status(404).json({
        message: "Cart item not found",
      });
    }

    return res.json({
      message: "Cart item quantity updated successfully",
      cartItem: updatedCartItem,
    });
  },
);

export const decrementCartItem = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const userId = req.user?._id;
    const { itemId } = req.body;

    if (!userId || !itemId) {
      return res.status(400).json({
        message: "User ID and Item ID are required",
      });
    }

    const updatedCartItem = await Cart.findOne({ userId, itemId });

    if (!updatedCartItem) {
      return res.status(404).json({
        message: "Cart item not found",
      });
    }

    if (updatedCartItem.quantity <= 1) {
      await Cart.deleteOne({ userId, itemId });

      return res.json({
        message: "Cart item removed successfully",
      });
    }

    updatedCartItem.quantity -= 1;
    await updatedCartItem.save();

    return res.json({
      message: "Cart item quantity updated successfully",
      cartItem: updatedCartItem,
    });
  },
);

export const clearCart = TryCatch(async (req: AuthenticatedRequest, res) => {
  const userId = req.user?._id;

  if (!userId) {
    return res.status(400).json({
      message: "User ID is required",
    });
  }

  await Cart.deleteMany({ userId });

  return res.json({
    message: "Cart cleared successfully",
  });
});
