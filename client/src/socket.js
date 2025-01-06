import { io } from "socket.io-client";

// 서버와 연결
const socket = io("http://localhost:5000"); // 서버 주소를 지정합니다.

export default socket;
