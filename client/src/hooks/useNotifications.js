import { useState, useEffect } from "react";
import socket from "../socket/socket";
import {
  getIncomingFollowRequests,
  acceptFollowRequest,
  rejectFollowRequest,
} from "../api/followService";

const useNotifications = (currentUserId) => {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState("");
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await getIncomingFollowRequests(currentUserId);
        setNotifications(data || []);
      } catch (err) {
        console.error("Failed to load notifications:", err);
        setError("알림을 불러오는 데 실패했습니다.");
      }
    };

    if (currentUserId) {
      loadNotifications();

      socket.on(`notification:${currentUserId}`, (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        setNotificationCount((prev) => prev + 1);
      });
    }

    return () => {
      socket.off(`notification:${currentUserId}`);
    };
  }, [currentUserId]);

  const acceptNotification = async (followId) => {
    try {
      await acceptFollowRequest(followId);
      setNotifications((prev) => prev.filter((n) => n._id !== followId));
      setNotificationCount((prev) => (prev > 0 ? prev - 1 : 0));
    } catch (err) {
      console.error("Failed to accept follow request:", err);
    }
  };

  const rejectNotification = async (followId) => {
    try {
      await rejectFollowRequest(followId);
      setNotifications((prev) => prev.filter((n) => n._id !== followId));
      setNotificationCount((prev) => (prev > 0 ? prev - 1 : 0));
    } catch (err) {
      console.error("Failed to reject follow request:", err);
    }
  };

  return { notifications, error, notificationCount, acceptNotification, rejectNotification };
};

export default useNotifications;