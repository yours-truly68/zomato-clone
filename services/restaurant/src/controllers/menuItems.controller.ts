import axios from "axios";
import getBuffer from "../config/datauri.config.js";
import { AuthenticatedRequest } from "../middlewares/isAuth.middleware.js";
import TryCatch from "../middlewares/TryCatch.middleware.js";
import Restaurant from "../models/Restaurant.model.js";
import { MenuItem } from "../models/MenuItems.model.js";

export const addMenuItem = TryCatch(async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized - Please Login" });
  }
  const restaurant = await Restaurant.findOne({
    ownerId: req.user._id,
  });
  if (!restaurant) {
    return res.status(404).json({ message: "Restaurant not found" });
  }
  const { name, description, price } = req.body;
  if (!name || !price) {
    return res.status(400).json({ message: "Name and price are required" });
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
  } catch (uploadError) {
    console.error("Error uploading image: ", uploadError);
    return res.status(500).json({ message: "Failed to upload image" });
  }

  const menuItem = await MenuItem.create({
    name,
    description,
    price,
    restaurantId: restaurant._id,
    image: imageUrl,
  });

  res.status(201).json({ message: "Menu item added successfully", menuItem });
});

export const getMenuItems = TryCatch(async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized - Please Login" });
  }
});
