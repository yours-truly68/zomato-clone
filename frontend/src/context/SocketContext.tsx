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

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

const SocketProvider = ({ children }: { children: ReactNode }) => {
  const { isAuth } = useAppData();

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuth) {
      socketRef.current?.disconnect();
      socketRef.current = null;
    }
  });
};
