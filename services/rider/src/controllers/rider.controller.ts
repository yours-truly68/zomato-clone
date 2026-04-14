import axios from "axios";
import getBuffer from "../config/datauri.config.js";
import { AuthenticatedRequest } from "../middlewares/isAuth.middleware.js";
import TryCatch from "../middlewares/TryCatch.middleware.js";
import Rider from "../models/Rider.model.js";

export const addRiderProfile = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized - User not found" });
    }
    if (user.role !== "rider") {
      return res
        .status(403)
        .json({ message: "Forbidden - Only riders can add profiles" });
    }

    const file = req.file;

    if (!file) {
      return res
        .status(400)
        .json({ message: "No file uploaded - Rider Image not found!" });
    }

    const fileBuffer = getBuffer(file);

    if (!fileBuffer?.content) {
      return res.status(500).json({
        message: "Failed to process uploaded file - Invalid file buffer",
      });
    }

    let imageUrl = "";

    const { data: uploadResult } = await axios.post(
      `${process.env.UTILS_URL}/api/upload`,
      {
        buffer: fileBuffer.content,
      },
    );

    imageUrl = uploadResult.url;

    const { phone, adharNumber, drivingLicenseNumber, latitude, longitude } =
      req.body;

    if (
      !phone ||
      !adharNumber ||
      !drivingLicenseNumber ||
      !latitude ||
      !longitude
    ) {
      return res.status(400).json({
        message:
          "All fields (phone, Aadhar Number, Driving License Number, latitude, longitude) are required",
      });
    }

    // Check if rider profile already exists

    const existingRider = await Rider.findOne({ userId: user._id });
    if (existingRider) {
      return res.status(400).json({ message: "Rider profile already exists" });
    }

    const rider = await Rider.create({
      userId: user._id,
      picture: imageUrl,
      phone,
      adharNumber,
      drivingLicenseNumber,
      location: {
        type: "Point",
        coordinates: [Number(longitude), Number(latitude)],
      },
      isVerified: false,
      isAvailable: false, // starts as unavailable until verified by admin
    });
    res
      .status(201)
      .json({ message: "Rider profile created successfully", rider });
  },
);
