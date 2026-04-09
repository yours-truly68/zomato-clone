import express from "express";
import { config } from "dotenv";
import cors from "cors";
import { createServer } from "http";
import { initSocket } from "./socket.js";
import internalRoutes from "./routes/internal.routes.js";

config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use("/api/v1/internal", internalRoutes);

const server = createServer(app);

initSocket(server);

const PORT = process.env.PORT || 8004;

server.listen(PORT, () => {
  console.log(`Realtime is listening on port: ${PORT}`);
});
