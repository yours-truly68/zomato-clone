import axios from "axios";
import getBuffer from "../config/datauri.config.js";
import TryCatch from "../middlewares/TryCatch.middleware.js";
import Rider from "../models/Rider.model.js";
export const addRiderProfile = TryCatch(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: "Unauthorized - User not found" });
    }
    if (user.role !== "rider") {
        return res
            .status(403)
            .json({ message: "Forbidden - Only riders can add profiles" });
    }
    const { phone, adharNumber, drivingLicenseNumber, latitude, longitude } = req.body;
    if (!phone ||
        !adharNumber ||
        !drivingLicenseNumber ||
        latitude === undefined ||
        longitude === undefined) {
        return res.status(400).json({
            message: "All fields (phone, Aadhar Number, Driving License Number, latitude, longitude) are required",
        });
    }
    // Validate Aadhaar and Driving License formats
    const aadhaarRegex = /^\d{12}$/;
    const licenseRegex = /^[A-Z0-9-]{8,20}$/;
    if (!aadhaarRegex.test(adharNumber)) {
        return res
            .status(400)
            .json({ success: false, message: "Invalid Aadhaar number" });
    }
    if (!licenseRegex.test(drivingLicenseNumber)) {
        return res
            .status(400)
            .json({ success: false, message: "Invalid Driving License number" });
    }
    // Validate latitude and longitude
    const lat = Number(latitude);
    const lng = Number(longitude);
    if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({
            success: false,
            message: "Invalid latitude or longitude",
        });
    }
    //
    const file = req.file;
    if (!file) {
        return res
            .status(400)
            .json({ message: "No file uploaded - Rider Image not found!" });
    }
    if (!file.mimetype.startsWith("image/")) {
        return res.status(400).json({
            message: "Only image files are allowed",
        });
    }
    // Check if rider profile already exists for this user
    const existingRider = await Rider.findOne({ userId: user._id });
    if (existingRider) {
        return res.status(400).json({ message: "Rider profile already exists" });
    }
    // Validate latitude and longitude ranges
    const fileBuffer = getBuffer(file);
    if (!fileBuffer?.content) {
        return res.status(500).json({
            message: "Failed to process uploaded file - Invalid file buffer",
        });
    }
    let imageUrl = "";
    try {
        const { data: uploadResult } = await axios.post(`${process.env.UTILS_URL}/api/upload`, { buffer: fileBuffer.content });
        imageUrl = uploadResult.url;
    }
    catch (error) {
        return res.status(502).json({
            message: "Image upload failed",
        });
    }
    const rider = await Rider.create({
        userId: user._id,
        picture: imageUrl,
        phone,
        adharNumber,
        drivingLicenseNumber,
        location: {
            type: "Point",
            coordinates: [lng, lat], // GeoJSON format is [longitude, latitude]
        },
        isVerified: false,
        isAvailable: false, // starts as unavailable until verified by admin
    });
    res
        .status(201)
        .json({ message: "Rider profile created successfully", rider });
});
export const getRiderProfile = TryCatch(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: "Unauthorized - User not found" });
    }
    if (user.role !== "rider") {
        return res
            .status(403)
            .json({ message: "Forbidden - Only riders can access their profile" });
    }
    const riderAccount = await Rider.findOne({ userId: user._id });
    if (!riderAccount) {
        return res.status(404).json({ message: "Rider profile not found" });
    }
    res.status(200).json({ rider: riderAccount });
});
export const toggleRiderAvailability = TryCatch(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: "Unauthorized - User not found" });
    }
    if (user.role !== "rider") {
        return res
            .status(403)
            .json({ message: "Forbidden - Only riders can toggle availability" });
    }
    const { isAvailable, latitude, longitude } = req.body;
    if (typeof isAvailable !== "boolean") {
        return res
            .status(400)
            .json({ message: "isAvailable must be a boolean value" });
    }
    if (latitude === undefined || longitude === undefined) {
        return res.status(400).json({
            message: "Latitude and longitude are required to update location",
        });
    }
    const lat = Number(latitude);
    const lng = Number(longitude);
    const riderAccount = await Rider.findOne({ userId: user._id });
    if (!riderAccount) {
        return res.status(404).json({ message: "Rider profile not found" });
    }
    if (isAvailable && !riderAccount.isVerified) {
        return res.status(400).json({ message: "Rider is not verified" });
    }
    // if (!riderAccount.isVerified) {
    //   return res
    //     .status(403)
    //     .json({ message: "Forbidden - Rider profile not verified by admin" });
    // }
    riderAccount.isAvailable = isAvailable;
    riderAccount.location = {
        type: "Point",
        coordinates: [lng, lat],
    };
    riderAccount.lastActiveAt = new Date();
    await riderAccount.save();
    res.status(200).json({
        message: `Rider is now ${isAvailable ? "available" : "unavailable"}`,
    });
});
export const acceptOrderByRider = TryCatch(async (req, res) => {
    const riderUserId = req.user?._id;
    const { orderId } = req.params;
    if (!riderUserId) {
        return res.status(401).json({ message: "Unauthorized - User not found" });
    }
    if (req.user?.role !== "rider") {
        return res
            .status(403)
            .json({ message: "Forbidden - Only riders can accept orders" });
    }
    const rider = await Rider.findOne({
        userId: riderUserId,
        isAvailable: true,
        isVerified: true,
    });
    if (!rider) {
        return res.status(404).json({
            message: "Rider profile not found or not available/verified",
        });
    }
    try {
        const { data } = await axios.put(`${process.env.RESTAURANT_URL}/api/order/assign/rider`, {
            orderId,
            riderId: rider._id,
            riderUserId: rider.userId,
            riderPhone: rider.phone,
            picture: rider.picture,
        }, {
            headers: {
                "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
            },
        });
        if (data.success) {
            await Rider.findOneAndUpdate({
                userId: riderUserId,
                isAvailable: true,
                isVerified: true,
            }, { isAvailable: false }, { new: true });
        }
        res.status(200).json({
            message: "Order accepted successfully",
        });
    }
    catch (error) {
        await Rider.findByIdAndUpdate(rider._id, { isAvailable: true });
        console.error("Error accepting order:", error);
        return res.status(500).json({ message: "Failed to accept order" });
    }
});
export const fetchMyCurrentOrder = TryCatch(async (req, res) => {
    // This function can be implemented to allow riders to fetch their current active order details.
    // It would involve making a request to the restaurant service to get the order assigned to the rider.
    const riderUserId = req.user?._id;
    if (!riderUserId) {
        return res.status(401).json({ message: "Unauthorized - User not found" });
    }
    if (req.user?.role !== "rider") {
        return res.status(403).json({
            message: "Forbidden - Only riders can access their current order",
        });
    }
    const rider = await Rider.findOne({
        userId: riderUserId,
        isVerified: true, // Only fetch current order if rider is currently unavailable (i.e., has an active order)
    });
    if (!rider) {
        return res
            .status(404)
            .json({ message: "Rider profile not found or not verified/available" });
    }
    try {
        const { data } = await axios.get(`${process.env.RESTAURANT_URL}/api/order/rider/current/${rider._id}`, {
            headers: {
                "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
            },
        });
        res.status(200).json({ order: data.order });
    }
    catch (error) {
        console.error("Error fetching current order:", error);
        return res.status(500).json({ message: "Failed to fetch current order" });
    }
});
export const updateOrderStatus = TryCatch(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized - User not found" });
    }
    if (req.user?.role !== "rider") {
        return res
            .status(403)
            .json({ message: "Forbidden - Only riders can update order status" });
    }
    const rider = await Rider.findOne({ userId, isVerified: true });
    if (!rider) {
        return res.status(404).json({
            message: "Rider profile not found or not verified",
        });
    }
    const { orderId } = req.params;
    try {
        const { data } = await axios.put(`${process.env.RESTAURANT_URL}/api/order/update/rider/status`, {
            orderId,
            riderId: rider._id,
        }, {
            headers: {
                "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
            },
        });
        res.status(200).json({ message: "Order status updated successfully" });
    }
    catch (error) {
        console.error("Error updating order status:", error);
        return res.status(500).json({ message: "Failed to update order status" });
    }
});
