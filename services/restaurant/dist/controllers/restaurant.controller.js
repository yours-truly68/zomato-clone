import axios from "axios";
import getBuffer from "../config/datauri.config.js";
import jwt from "jsonwebtoken";
import TryCatch from "../middlewares/TryCatch.middleware.js";
import Restaurant from "../models/Restaurant.model.js";
export const addRestaurant = TryCatch(async (req, res) => {
    console.log("REQ.FILE:", req.file);
    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    // Add restaurant logic here
    const existingRestaurant = await Restaurant.findOne({ ownerId: user._id });
    if (existingRestaurant) {
        return res.status(400).json({ message: "Restaurant already exists" });
    }
    const { name, longitude, latitude, description, formattedAddress, phone } = req.body;
    if (!name || !longitude || !latitude) {
        return res
            .status(400)
            .json({ message: "Name, longitude, and latitude are required" });
    }
    const file = req.file;
    if (!file) {
        return res.status(400).json({ message: "Image file is required" });
    }
    const fileBuffer = getBuffer(file);
    if (!fileBuffer?.content) {
        return res.status(500).json({ message: "Failed to process image file" });
    }
    let imageUrl = "";
    try {
        const { data } = await axios.post(`${process.env.UTILS_URL}/api/upload`, {
            buffer: fileBuffer.content,
        });
        imageUrl = data.url;
    }
    catch (uploadError) {
        console.error("Error uploading image: ", uploadError);
        return res.status(500).json({ message: "Failed to upload image" });
    }
    const restaurant = await Restaurant.create({
        name,
        description,
        phone,
        image: imageUrl,
        ownerId: user?._id,
        autoLocation: {
            type: "Point",
            coordinates: [Number(longitude), Number(latitude)],
            formattedAddress,
        },
        isVerified: false,
    });
    res
        .status(201)
        .json({ message: "Restaurant added successfully", restaurant });
});
export const getRestaurant = TryCatch(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized - Please Login" });
    }
    const restaurant = await Restaurant.findOne({ ownerId: req.user?._id });
    if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
    }
    if (!req.user?.restaurantId) {
        const token = jwt.sign({
            user: {
                ...req.user,
                restaurantId: restaurant._id,
            },
        }, process.env.JWT_SECRET, { expiresIn: "15d" });
        return res.json({ restaurant, token });
    }
    res.status(200).json({ restaurant });
});
