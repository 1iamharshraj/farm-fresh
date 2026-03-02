import { createContext, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../hooks/useAuth";

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef(null);

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem("token");
      if (!token) return;

      const newSocket = io(
        import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000",
        {
          auth: { token },
          transports: ["websocket", "polling"],
        }
      );

      newSocket.on("connect", () => {
        console.log("Socket connected");
      });

      newSocket.on("notification:new", (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      });

      newSocket.on("order:statusUpdate", (data) => {
        // Dispatch custom event for components to listen to
        window.dispatchEvent(
          new CustomEvent("orderStatusUpdate", { detail: data })
        );
      });

      newSocket.on("delivery:locationUpdate", (data) => {
        window.dispatchEvent(
          new CustomEvent("deliveryLocationUpdate", { detail: data })
        );
      });

      newSocket.on("disconnect", () => {
        console.log("Socket disconnected");
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
        socketRef.current = null;
        setSocket(null);
      };
    } else {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
    }
  }, [user]);

  const trackOrder = (orderId) => {
    if (socketRef.current) {
      socketRef.current.emit("order:track", orderId);
    }
  };

  const untrackOrder = (orderId) => {
    if (socketRef.current) {
      socketRef.current.emit("order:untrack", orderId);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        notifications,
        setNotifications,
        unreadCount,
        setUnreadCount,
        trackOrder,
        untrackOrder,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
