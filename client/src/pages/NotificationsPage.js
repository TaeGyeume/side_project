import React from "react";
import useNotifications from "../hooks/useNotifications";

const NotificationsPage = ({ currentUserId }) => {
  const { notifications, error, acceptNotification, rejectNotification } =
    useNotifications(currentUserId);

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
            <button onClick={() => acceptNotification(notification._id)}>수락</button>
            <button onClick={() => rejectNotification(notification._id)}>거절</button>
          </li>
        ))}
      </ul>
      {notifications.length === 0 && <p>새로운 알림이 없습니다.</p>}
    </div>
  );
};

export default NotificationsPage;