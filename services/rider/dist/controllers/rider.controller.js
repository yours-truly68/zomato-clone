import TryCatch from "../middlewares/TryCatch.middleware.js";
export const addRiderProfile = TryCatch(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: "Unauthorized - User not found" });
    }
    if (user.role !== "rider") {
        return res.status(403).json({ message: "Forbidden - Only riders can add profiles" });
    }
    const file = req.file;
    if (!file) {
        return res.status(400).json({ message: "No file uploaded - Rider Image not found!" });
    }
    // Check if rider profile already exists
});
