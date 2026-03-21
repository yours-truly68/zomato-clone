import express from "express";
import cloudinary from "cloudinary";

const router = express.Router();

router.post("/upload", async (req, res) => {
  try {
    const { buffer } = req.body;

    if (!buffer) {
      return res.status(400).json({
        message: "No image buffer received",
      });
    }

    console.log("Buffer length:", buffer.length);

    const cloud = await cloudinary.v2.uploader.upload(buffer);

    return res.json({
      url: cloud.secure_url,
    });
  } catch (error: any) {
    console.error("UPLOAD ERROR:", error);

    return res.status(500).json({
      message: error.message || "Upload failed",
    });
  }
});

export default router;
