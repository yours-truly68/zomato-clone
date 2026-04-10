import { Server } from "socket.io";
import http from "http";
import jwt from "jsonwebtoken";

let io: Server;

export const initSocket = (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(
          new Error(
            "Authentication error: No token provided - Socket handshake auth token is missing",
          ),
        );
      }
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET! as string,
      ) as any;

      if (!decoded || !decoded.user) {
        return next(
          new Error(
            "Authentication error: Invalid token - Socket handshake auth token is invalid",
          ),
        );
      }

      // Attach user info to socket object for later use
      socket.data.user = decoded.user;

      next();
    } catch (error) {
      console.error("Socket authentication error:", error);
      next(
        new Error(
          "Authentication error - Socket handshake auth token is invalid",
        ),
      );
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.data.user.name}`);
    const user = socket.data.user;

    if (!user) {
      socket.disconnect();
      return;
    }

    const userId = user._id;
    socket.join(`user_${userId}`);

    if (user.restaurantId) {
      socket.join(`restaurant_${user.restaurantId}`);
    }

    console.log(`User ${user.name}`);
    console.log(`Socket: `, [...socket.rooms]);

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.data.user.name}`);
    });
  });

  console.log("Socket.io initialized");
  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};
