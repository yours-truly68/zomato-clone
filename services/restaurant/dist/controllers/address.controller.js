import TryCatch from "../middlewares/TryCatch.middleware.js";
import Address from "../models/Address.model.js";
export const createAddress = TryCatch(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const { mobile, formattedAddress, latitude, longitude } = req.body;
    if (!mobile || !formattedAddress || !latitude || !longitude) {
        return res.status(400).json({ message: "All fields are required" });
    }
    const numLong = Number(longitude);
    const numLat = Number(latitude);
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(mobile)) {
        return res.status(400).json({ message: "Invalid mobile number format" });
    }
    const address = await Address.create({
        userId: user._id.toString(),
        phone: mobile,
        formattedAddress,
        location: {
            type: "Point",
            coordinates: [numLong, numLat],
        },
    });
    return res
        .status(201)
        .json({ message: "Address created successfully", address });
});
export const deleteAddress = TryCatch(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: "Address ID is required" });
    }
    const address = await Address.findOne({
        _id: id,
        userId: user._id.toString(),
    });
    if (!address) {
        return res.status(404).json({ message: "Address not found" });
    }
    await address.deleteOne();
    return res.status(200).json({ message: "Address deleted successfully" });
});
export const getMyAddresses = TryCatch(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const addresses = await Address.find({
        userId: user._id.toString(),
    }).sort({ createdAt: -1 });
    return res
        .status(200)
        .json({ message: "Addresses retrieved successfully", addresses });
});
