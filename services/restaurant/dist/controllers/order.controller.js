import axios from "axios";
import TryCatch from "../middlewares/TryCatch.middleware.js";
import Address from "../models/Address.model.js";
import Cart from "../models/Cart.model.js";
import Order from "../models/Orders.model.js";
import Restaurant from "../models/Restaurant.model.js";
import jwt from "jsonwebtoken";
export const createOrder = TryCatch(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    // Logic to create order goes here
    const { paymentMethod, addressId } = req.body;
    if (!addressId) {
        return res.status(400).json({ message: "Address is required" });
    }
    const address = await Address.findOne({ _id: addressId, userId: user._id });
    if (!address) {
        return res.status(404).json({ message: "Address not found" });
    }
    const getDistance = (lat1, lon1, lat2, lon2) => {
        //haversine formula to calculate distance between two lat/lon points in km
        const toRad = (value) => (value * Math.PI) / 180;
        const R = 6371; // Earth radius in km
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) *
                Math.cos(toRad(lat2)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return +(R * c).toFixed(2); // Distance in km rounded to 2 decimal places
    };
    const cartItems = await Cart.find({ userId: user._id })
        .populate("itemId")
        .populate("restaurantId");
    if (cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
    }
    const firstCartItem = cartItems[0];
    if (!firstCartItem || !firstCartItem.restaurantId) {
        return res
            .status(400)
            .json({ message: "Invalid cart item: missing restaurant" });
    }
    const restaurantId = firstCartItem.restaurantId._id;
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
        return res
            .status(404)
            .json({ message: "Restaurant not found: No restaurant with this ID" });
    }
    if (!restaurant.isOpen) {
        return res.status(400).json({ message: "Restaurant is currently closed" });
    }
    const distance = getDistance(address.location.coordinates[1], address.location.coordinates[0], restaurant.autoLocation.coordinates[1], restaurant.autoLocation.coordinates[0]);
    // Additional validation to ensure all cart items belong to the same restaurant
    for (const cartItem of cartItems) {
        if (!cartItem.restaurantId ||
            cartItem.restaurantId._id.toString() !== restaurantId.toString()) {
            return res
                .status(400)
                .json({ message: "All cart items must belong to the same restaurant" });
        }
    }
    // Proceed with order creation logic here (calculating totals, saving order, etc.)
    let subTotal = 0;
    const orderItems = cartItems.map((cart) => {
        const item = cart.itemId;
        if (!item) {
            throw new Error("Invalid cart item: missing item details");
        }
        const itemTotal = item.price * cart.quantity;
        subTotal += itemTotal;
        return {
            itemId: item._id.toString(),
            name: item.name,
            price: item.price,
            quantity: cart.quantity,
        };
    });
    const deliveryCharges = subTotal < 250 ? 49 : 0;
    const platformCharges = subTotal < 500 ? 7 : 0 + 0.015 * subTotal;
    const grandTotal = subTotal + deliveryCharges + platformCharges;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // Order expiers in 15 minutes;
    const [longitude, latitude] = address.location.coordinates;
    const riderAmount = Math.ceil(distance) * 12; // Assuming a rate of 12 per km
    const order = await Order.create({
        userId: user._id,
        restaurantId: restaurantId.toString(),
        restaurantName: restaurant.name,
        riderId: null,
        distance,
        riderAmount,
        items: orderItems,
        subTotal,
        deliveryCharges,
        platformCharges,
        grandTotal,
        addressId: address._id.toString(),
        deliveryAddress: {
            formattedAddress: address.formattedAddress,
            phone: address.phone,
            latitude,
            longitude,
        },
        status: "placed",
        paymentMethod,
        paymentStatus: "pending",
        expiresAt,
    });
    // Save the order to the database (not implemented here)
    // Clear the user's cart after creating the order (not implemented here)
    await Cart.deleteMany({ userId: user._id });
    res.status(201).json({
        message: "Order created successfully",
        orderId: order._id.toString(),
        amount: grandTotal,
    });
});
// export const fetchOrderForPayment = TryCatch(
//   async (req: AuthenticatedRequest, res) => {
//     if (req.headers["x-internal-key"] !== process.env.INTERNAL_SERVICE_KEY) {
//       return res.status(403).json({ message: "Forbidden" });
//     }
//     const order = await Order.findById(req.params.id);
//     if (!order) {
//       return res.status(404).json({ message: "Order not found" });
//     }
//     if (order.paymentStatus !== "pending") {
//       return res
//         .status(400)
//         .json({ message: "Payment already processed for this order" });
//     }
//     if (req.headers["x-internal-key"] === process.env.INTERNAL_SERVICE_KEY) {
//       // internal service → allow
//     } else if (req.headers.authorization) {
//       // user request → verify JWT
//     } else {
//       return res.status(401).json({ message: "Unauthorized" });
//     }
//     res.json({
//       orderId: order._id.toString(),
//       amount: order.grandTotal,
//       currency: "INR",
//     });
//   },
// );
export const fetchOrderForPayment = TryCatch(async (req, res) => {
    const internalKey = req.headers["x-internal-key"];
    const authHeader = req.headers.authorization;
    // ✅ INTERNAL SERVICE
    if (internalKey === process.env.INTERNAL_SERVICE_KEY) {
        // allow
    }
    // ✅ USER REQUEST (JWT)
    else if (authHeader) {
        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
        }
        catch {
            return res.status(401).json({ message: "Invalid token" });
        }
    }
    // ❌ NO AUTH
    else {
        return res.status(401).json({ message: "Unauthorized" });
    }
    // ✅ ACTUAL LOGIC (runs after auth passes)
    const order = await Order.findById(req.params.id);
    if (!order) {
        return res.status(404).json({ message: "Order not found" });
    }
    if (order.paymentStatus !== "pending") {
        return res
            .status(400)
            .json({ message: "Payment already processed for this order" });
    }
    res.json({
        orderId: order._id.toString(),
        amount: order.grandTotal,
        currency: "INR",
    });
});
export const fetchRestaurantOrders = TryCatch(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: "Unauthorized - User not found" });
    }
    const { restaurantId } = req.params;
    console.log("Fetching orders for restaurant ID:", restaurantId);
    if (!restaurantId) {
        return res.status(400).json({ message: "Restaurant ID is required" });
    }
    const { limit } = req.query;
    const orders = await Order.find({
        restaurantId,
        paymentStatus: "paid",
    })
        .sort({ createdAt: -1 })
        .limit(Number(limit));
    // console.log(
    //   `Found ${orders.length} orders for restaurant ID ${restaurantId} and order IDs ${orders.map((o) => o._id).join(", ")}`,
    // );
    res.json({
        success: true,
        count: orders.length,
        orders,
    });
});
const validStatuses = ["accepted", "preparing", "ready for pickup"];
export const updateOrderStatus = TryCatch(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: "Unauthorized - User not found" });
    }
    const { orderId } = req.params;
    if (!orderId) {
        return res.status(400).json({ message: "Order ID is required" });
    }
    const { status } = req.body;
    if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({
            message: `Status is required and must be one of: ${validStatuses.join(", ")}`,
        });
    }
    const order = await Order.findById(orderId);
    if (!order) {
        return res.status(404).json({ message: "Order not found" });
    }
    if (order.paymentStatus !== "paid") {
        return res
            .status(400)
            .json({ message: "Cannot update status of an unpaid order" });
    }
    const restaurant = await Restaurant.findById(order.restaurantId);
    if (!restaurant) {
        return res
            .status(404)
            .json({ message: "Associated restaurant not found" });
    }
    if (restaurant.ownerId.toString() !== user._id.toString()) {
        return res
            .status(403)
            .json({ message: "Forbidden: You do not own this restaurant" });
    }
    order.status = status;
    await order.save({ validateBeforeSave: false });
    axios.post(`${process.env.REALTIME_URL}/api/v1/internal/emit`, {
        event: "order:updated",
        room: `user:${order.userId}`,
        payload: {
            orderId: order._id,
            status: order.status,
        },
    }, {
        headers: {
            "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
        },
    });
    // Emit real-time update to the user about order status change (not implemented here)
    // You can use WebSockets or a service like Pusher to notify the user in real-time
    res.json({ message: "Order status updated successfully", order });
});
export const getMyOrders = TryCatch(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const orders = await Order.find({
        userId: user._id.toString(),
        paymentStatus: "paid",
    }).sort({ createdAt: -1 });
    res.json({
        success: true,
        count: orders.length,
        orders,
    });
});
export const getSingleOrder = TryCatch(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: "Unauthorized - User not found" });
    }
    const { orderId } = req.params;
    if (!orderId) {
        return res.status(400).json({ message: "Order ID is required" });
    }
    const order = await Order.findById(orderId);
    if (!order) {
        return res.status(404).json({ message: "Order not found" });
    }
    if (order.userId.toString() !== user._id.toString()) {
        return res
            .status(403)
            .json({ message: "Forbidden: You do not own this order" });
    }
    res.json({
        success: true,
        order,
    });
});
