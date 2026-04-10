import axios from "axios";
import getBuffer from "../config/datauri.config.js";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest } from "../middlewares/isAuth.middleware.js";
import TryCatch from "../middlewares/TryCatch.middleware.js";
import Restaurant from "../models/Restaurant.model.js";

export const addRestaurant = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    // console.log("REQ.FILE:", req.file);
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Add restaurant logic here
    const existingRestaurant = await Restaurant.findOne({ ownerId: user._id });

    if (existingRestaurant) {
      return res.status(400).json({ message: "Restaurant already exists" });
    }

    const { name, longitude, latitude, description, formattedAddress, phone } =
      req.body;

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
    } catch (uploadError) {
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
  },
);

export const getRestaurant = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized - Please Login" });
    }

    const restaurant = await Restaurant.findOne({ ownerId: req.user?._id });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    if (!req.user?.restaurantId) {
      const token = jwt.sign(
        {
          user: {
            ...req.user,
            restaurantId: restaurant._id,
          },
        },
        process.env.JWT_SECRET as string,
        { expiresIn: "15d" },
      );

      return res.json({ restaurant, token });
    }

    res.status(200).json({ restaurant });
  },
);

export const updateRestaurantStatus = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      res.status(403).json({ message: "Unauthorized - Please Login" });
      return;
    }

    const { status } = req.body;

    if (typeof status !== "boolean") {
      return res
        .status(400)
        .json({ message: "Status must be a boolean value" });
    }

    const restaurant = await Restaurant.findOneAndUpdate(
      {
        ownerId: req.user._id,
      },
      { isOpen: status },
      { returnDocument: "after" },
    );

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    res
      .status(200)
      .json({ message: "Restaurant status updated successfully", restaurant });
  },
);

export const updateRestaurantDetails = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(403).json({ message: "Unauthorized - Please Login" });
    }

    const { name, description } = req.body;

    // Get existing restaurant
    const restaurant = await Restaurant.findOne({
      ownerId: req.user._id,
    });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    let imageUrl = restaurant.image;

    // ✅ Handle image upload
    if (req.file) {
      console.log("Image received:", req.file.originalname);

      // TEMP (testing only)
      imageUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    }

    // ✅ Update fields
    restaurant.name = name || restaurant.name;
    restaurant.description = description || restaurant.description;
    restaurant.image = imageUrl;

    await restaurant.save();

    res.status(200).json({
      message: "Restaurant details updated successfully",
      restaurant,
    });
  },
);

export const getNearbyRestaurants = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const { latitude, longitude, radius = 5000, search = "" } = req.query;
    if (!latitude || !longitude) {
      return res
        .status(400)
        .json({ message: "Latitude and longitude are required" });
    }

    const latNum = Number(latitude);
    const lonNum = Number(longitude);

    if (isNaN(latNum) || isNaN(lonNum)) {
      return res.status(400).json({ message: "Invalid coordinates" });
    }
    const radiusInMeters = Number(radius);

    const query: any = {
      isVerified: true,
    };

    if (search && typeof search === "string") {
      query.name = { $regex: search, $options: "i" };
    }

    const restaurants = await Restaurant.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [lonNum, latNum],
          },
          distanceField: "distance",
          maxDistance: radiusInMeters,
          spherical: true,
          query,
        },
      },
      { $sort: { isOpen: -1, distance: 1 } },
      {
        $addFields: {
          distanceKm: {
            $round: [{ $divide: ["$distance", 1000] }, 2],
          },
        },
      },
      { $limit: 20 },
    ]);

    res
      .json({ success: true, count: restaurants.length, restaurants });
  },
);

export const fetchSingleRestaurant = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Restaurant ID is required" });
    }

    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    res.status(200).json({ success: true, restaurant });
  },
);

