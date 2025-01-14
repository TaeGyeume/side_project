import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000"; // 서버 URL
const socket = io(SOCKET_URL, {
  withCredentials: true,
  transports: ["websocket"], // WebSocket 전용
});

export default socket;