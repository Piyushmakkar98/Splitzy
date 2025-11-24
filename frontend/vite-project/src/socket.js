import { io } from "socket.io-client";

export const socket = io("https://splitzy-1.onrender.com", {
  autoConnect: false,
  withCredentials: true
});
