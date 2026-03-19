import axios from "axios";
import getBuffer from "../config/datauri.config.js";
import TryCatch from "../middlewares/TryCatch.middleware.js";
import Restaurant from "../models/Restaurant.model.js";
export const addRestaurant = TryCatch(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    // Add restaurant logic here
    const existingRestaurant = await Restaurant.findOne({ ownerId: user?._id });
    if (existingRestaurant) {
        return res.status(400).json({ message: "Restaurant already exists" });
    }
    const { name, formattedAddress, phone, description, image, longitude, latitude, } = req.body;
    if (!name ||
        !formattedAddress ||
        !phone ||
        !description ||
        !image ||
        !longitude ||
        !latitude) {
        return res.status(400).json({ message: "All fields are required" });
    }
    const file = req.file;
    if (!file) {
        return res.status(400).json({ message: "Image file is required" });
    }
    const fileBuffer = getBuffer(file);
    if (!fileBuffer?.content) {
        return res.status(500).json({ message: "Failed to process image file" });
    }
    const { data: uploadResult } = await axios.post(`${process.env.UTILS_URL}/api/upload`, {
        buffer: fileBuffer?.content,
    });
    const restaurant = await Restaurant.create({
        name,
        description,
        phone,
        image: uploadResult.url,
        ownerId: user?._id,
        autoLocation: {
            type: "Point",
            coordinates: [Number(longitude), Number(latitude)],
            formattedAddress,
        },
    });
    res
        .status(201)
        .json({ message: "Restaurant added successfully", restaurant });
});
