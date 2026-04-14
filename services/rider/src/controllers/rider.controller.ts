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

    const { phone, adharNumber, drivingLicenseNumber, latitude, longitude } =
      req.body;

    if (
      !phone ||
      !adharNumber ||
      !drivingLicenseNumber ||
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({
        message:
          "All fields (phone, Aadhar Number, Driving License Number, latitude, longitude) are required",
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
      const { data: uploadResult } = await axios.post(
        `${process.env.UTILS_URL}/api/upload`,
        { buffer: fileBuffer.content },
      );

      imageUrl = uploadResult.url;
    } catch (error) {
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
  },
);
