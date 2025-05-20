import { createContext, useState, useEffect, useContext } from "react";
import { useAuthContext } from "./AuthContext";
import io from "socket.io-client";

const SocketContext = createContext();

export const useSocketContext = () => {
  return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { authUser } = useAuthContext();

  useEffect(() => {
    const ENDPOINT = import.meta.env.DEV
      ? "http://localhost:3030"
      : "https://chatapp-application-api.onrender.com";

    if (!authUser) {
      socket?.close();
      setSocket(null);
      setOnlineUsers([]);
      return;
    }

    const newSocket = io(ENDPOINT, {
      query: { userId: authUser._id },
      transports: ["websocket"],
    });

    newSocket.on("connect", () => {
      console.log("Socket connected with id:", newSocket.id);
      console.log("User ID sent:", authUser._id);
    });

    newSocket.on("getOnlineUsers", setOnlineUsers);

    setSocket(newSocket);

    return () => newSocket.close();
  }, [authUser]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
