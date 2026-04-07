import express from "express";
import { config } from "dotenv";
import cors from "cors";
import { createServer } from "http";
import { initSocket } from "./socket.js";
config();
const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
const server = createServer(app);
initSocket(server);
const PORT = process.env.PORT || 8003;
app.listen(PORT, () => {
    console.log(`Realtime is listenting on port: ${PORT}`);
});
