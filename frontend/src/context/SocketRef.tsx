import { createContext, useContext, useEffect, useRef } from "react";
import { initializeSocket } from "@/api/chatService";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const SocketContext = createContext<any>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAuth();
  const socketRef = useRef<any>(null);

  useEffect(() => {
    if (token) {
      const socket = initializeSocket(token);
      socketRef.current = socket;

      socket.on("connect", () => {
        console.log("🔌 Global socket connected");
      });

      socket.on("notification", (data: { message: string }) => {
        console.log("🔔 Notification received:", data.message);
        toast.success(data.message, {
          description: new Date().toLocaleTimeString(),
        });
      });

      return () => {
        socket.off("connect");
        socket.off("notification");
        socket.disconnect();
      };
    }
  }, [token]);

  return (
    <SocketContext.Provider value={socketRef}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
