import {
  createContext,
  useContext,
  useState,
  useRef,
  type ReactNode,
  useEffect,
} from "react";

import { io, Socket } from "socket.io-client";
import { useAppData } from "./AppContext";
import { realtimeService } from "../main";

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const { isAuth } = useAppData();

  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!isAuth) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    if (socketRef.current) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const socket = io(realtimeService, {
      auth: {
        token,
      },
      transports: ["websocket"],
    });
    socketRef.current = socket;
    setSocket(socket);

    socket.on("connect", () => {
      console.log("Connected to WebSocket server: ", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket server: ", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("WebSocket connection error: ", err.message);
    });

    socket.on("connect", () => {
      console.log("✅ Connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket error:", err.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setSocket(null);
    };
  }, [isAuth]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
