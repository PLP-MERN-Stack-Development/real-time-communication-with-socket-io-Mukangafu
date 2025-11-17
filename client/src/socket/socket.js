import { io } from "socket.io-client";

// Production-safe backend URL
const backendURL = import.meta.env.VITE_SOCKET_URL;

const socket = io(backendURL, {
  withCredentials: true,
  transports: ["websocket"],
  auth: {
    token: localStorage.getItem("token"),
  },
});

export default socket;
