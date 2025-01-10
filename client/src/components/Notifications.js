import React, { useState, useEffect } from "react";
import { getIncomingFollowRequests } from "../api/followService";

const Notifications = ({ currentUserId }) => {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await getIncomingFollowRequests(currentUserId);
        setNotifications(data);
      } catch (err) {
        console.error("알림 가져오기 실패:", err);
        setError("알림을 불러오는 데 실패했습니다.");
      }
    };

    if (currentUserId) {
      loadNotifications();
    }
  }, [currentUserId]);

  if (!currentUserId) {
    return <p>사용자 정보가 필요합니다.</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h1>알림 목록</h1>
      <ul>
        {notifications.map((notification) => (
          <li key={notification._id}>
            {notification.followerUsername}님이 팔로우 요청을 보냈습니다.
            <button onClick={() => console.log("수락")}>수락</button>
            <button onClick={() => console.log("거절")}>거절</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notifications;