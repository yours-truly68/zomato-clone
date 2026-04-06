import axios from "axios";
import getBuffer from "../config/datauri.config.js";
import TryCatch from "../middlewares/TryCatch.middleware.js";
import Restaurant from "../models/Restaurant.model.js";
import { MenuItem } from "../models/MenuItems.model.js";
export const addMenuItem = TryCatch(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized - Please Login" });
    }
    const restaurant = await Restaurant.findOne({
        ownerId: req.user._id,
    });
    if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
    }
    const { name, description, price, isVeg } = req.body;
    if (!name || !price || isVeg === undefined) {
        return res
            .status(400)
            .json({ message: "Name, price, and isVeg are required" });
    }
    const file = req.file;
    if (!file) {
        return res.status(400).json({ message: "Image is required" });
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
    const menuItem = await MenuItem.create({
        name,
        description,
        price,
        restaurantId: restaurant._id,
        image: imageUrl,
        isVeg,
    });
    res.status(201).json({ message: "Menu item added successfully", menuItem });
});
export const getMenuItems = TryCatch(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: "Restaurant ID is required" });
    }
    const menuItems = await MenuItem.find({ restaurantId: id });
    res.status(200).json(menuItems);
});
export const deleteMenuItem = TryCatch(async (req, res) => {
    const { itemId } = req.params;
    if (!itemId) {
        return res.status(400).json({ message: "Menu item ID is required" });
    }
    const menuItem = await MenuItem.findById(itemId);
    if (!menuItem) {
        return res.status(404).json({ message: "Menu item not found" });
    }
    const restaurant = await Restaurant.findById(menuItem.restaurantId);
    if (!restaurant) {
        return res.status(403).json({
            message: "Forbidden - You do not have permission to delete this menu item",
        });
    }
    await menuItem.deleteOne(); //deletes the item from the database
    return res.status(200).json({
        message: "Menu item deleted successfully",
    });
});
export const toggleMenuItemAvailability = TryCatch(async (req, res) => {
    const { itemId } = req.params;
    if (!itemId) {
        return res.status(400).json({ message: "Menu item ID is required" });
    }
    const menuItem = await MenuItem.findById(itemId);
    if (!menuItem) {
        return res.status(404).json({ message: "Menu item not found" });
    }
    const restaurant = await Restaurant.findById({
        _id: menuItem.restaurantId,
    });
    if (!restaurant) {
        return res.status(403).json({
            message: "Forbidden - You do not have permission to modify this menu item",
        });
    }
    menuItem.isAvailable = !menuItem.isAvailable;
    await menuItem.save();
    return res.status(200).json({
        message: `Menu item is now ${menuItem.isAvailable ? "available" : "unavailable"}`,
        menuItem,
    });
});
