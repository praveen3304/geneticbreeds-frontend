import { io } from "socket.io-client";

const socket = io("https://genetic-breeds-backend.onrender.com", {
  autoConnect: true,
  transports: ["websocket"],
});

export default socket;
