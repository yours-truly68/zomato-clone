import axios from "axios";
import TryCatch from "../middlewares/TryCatch.middleware.js";

export const fetchLocation = TryCatch(async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res
      .status(400)
      .json({ message: "Latitude and longitude are required" });
  }

  const { data } = await axios.get(
    `https://nominatim.openstreetmap.org/reverse`,
    {
      params: {
        lat: lat,
        lon: lon,
        format: "json",
      },
      headers: {
        "User-Agent": "zomatoes-app", // REQUIRED
      },
    },
  );

  res.json({ success: true, location: data });
});
