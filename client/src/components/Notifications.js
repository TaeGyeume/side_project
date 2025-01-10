import React, { useState, useEffect } from "react";
import socket from "../socket";
import {
  getIncomingFollowRequests,
  acceptFollowRequest,
  rejectFollowRequest,
} from "../api/followService";

const Notifications = ({ currentUserId }) => {
  const [notifications, setNotifications] = useState([]); // 알림 목록
  const [error, setError] = useState(""); // 에러 메시지
  const [notificationCount, setNotificationCount] = useState(0); // 알림 수 관리

  // 알림 데이터 로드
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await getIncomingFollowRequests(currentUserId); // 알림 데이터 가져오기

        console.log("Received notifications data:", data);

        if (Array.isArray(data)) {
          setNotifications(data);
        } else {
          console.error("Unexpected data format:", data);
          setNotifications([]); // 기본값으로 설정
        }

        // setNotificationCount(data.length); // 초기 알림 수 설정
      } catch (err) {
        console.error("알림 가져오기 실패:", err);
        setError("알림을 불러오는 데 실패했습니다.");
      }
    };

    if (currentUserId) {
      loadNotifications();
    }

    // 실시간 알림 수신
    socket.on(`notification:${currentUserId}`, (notification) => {
      setNotifications((prev) => [notification, ...prev]); // 새 알림 추가
      setNotificationCount((prev) => prev + 1); // 알림 수 증가
    });

    // 컴포넌트 언마운트 시 이벤트 제거
    return () => {
      socket.off(`notification:${currentUserId}`);
    };
  }, [currentUserId]);

  // 팔로우 요청 수락 핸들러
  const handleAccept = async (followId) => {
    try {
      await acceptFollowRequest(followId);
      // 알림 목록에서 해당 요청 제거 및 카운트 감소
      setNotifications((prev) => prev.filter((notification) => notification._id !== followId));
      setNotificationCount((prev) => (prev > 0 ? prev - 1 : 0));
    } catch (error) {
      console.error("팔로우 요청 수락 실패:", error);
    }
  };

  // 팔로우 요청 거절 핸들러
  const handleReject = async (followId) => {
    try {
      await rejectFollowRequest(followId);
      // 알림 목록에서 해당 요청 제거 및 카운트 감소
      setNotifications((prev) => prev.filter((notification) => notification._id !== followId));
      setNotificationCount((prev) => (prev > 0 ? prev - 1 : 0));
    } catch (error) {
      console.error("팔로우 요청 거절 실패:", error);
    }
  };

  if (!currentUserId) {
    return <p>사용자 정보가 필요합니다.</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h1>알림 목록 {notifications.length > 0 && `(${notifications.length})`}</h1>
      <ul>
        {notifications.map((notification) => (
          <li key={notification._id}>
            {notification.followerUsername}님이 팔로우 요청을 보냈습니다.
            <button onClick={() => handleAccept(notification._id)}>수락</button>
            <button onClick={() => handleReject(notification._id)}>거절</button>
          </li>
        ))}
      </ul>
      {notifications.length === 0 && <p>새로운 알림이 없습니다.</p>}
    </div>
  );
};

export default Notifications;