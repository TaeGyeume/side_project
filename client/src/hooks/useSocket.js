import { useEffect } from "react";
import socket from "../socket/socket";

const useSocket = (eventName, callback) => {
  useEffect(() => {
    // 소켓 이벤트 등록
    if (eventName && callback) {
      socket.on(eventName, callback);
    }

    return () => {
      // 소켓 이벤트 제거
      if (eventName && callback) {
        socket.off(eventName, callback);
      }
    };
  }, [eventName, callback]);

  return socket; // 소켓 객체 반환 (필요 시 사용 가능)
};

export default useSocket;