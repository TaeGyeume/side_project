import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUsers } from "../api/userService";
import axios from "axios";

const UserList = ({ currentUser }) => {
  const [users, setUsers] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await fetchUsers();
        // currentUser가 null이 아닐 경우에만 필터링
        if (currentUser && currentUser._id) {
          setUsers(data.filter(user => user._id !== currentUser._id));
        } else {
          setUsers(data); // currentUser가 없을 경우 전체 사용자 목록 설정
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };

    const loadUnreadCounts = async () => {
      try {
        if (currentUser && currentUser._id) {
          const response = await axios.get("http://localhost:5000/api/messages/unread-count", {
            params: { userId: currentUser._id },
          });
          console.log("Unread counts API response:", response.data); // API 응답 확인
          const counts = response.data.reduce((acc, item) => {
            acc[item._id] = item.count; // roomId를 키로 사용
            return acc;
          }, {});
          setUnreadCounts(counts); // 읽지 않은 메시지 상태 설정
        }
      } catch (error) {
        console.error("Failed to fetch unread message counts:", error);
      }
    };

    loadUsers();
    loadUnreadCounts();
  }, [currentUser]);

  const handleUserClick = async (userId) => {
    console.log("Current User ID:", currentUser?._id); // 디버깅 로그
    console.log("Target User ID:", userId); // 디버깅 로그
    try {
      const response = await axios.post("http://localhost:5000/api/rooms/create", {
        userId1: currentUser._id,
        userId2: userId,
      });
      console.log("Room Response:", response.data); // 서버 응답 확인
      navigate(`/chat/${response.data._id}`);
    } catch (error) {
      console.error("Failed to create room:", error);
    }
  };

  return (
    <div>
      <h1>Message Users</h1>
      <ul>
        {users.map((user) => (
          <li key={user._id}>
            <button onClick={() => handleUserClick(user._id)}>
              {user.username}
              {unreadCounts[user._id] > 0 && ( // 읽지 않은 메시지 수가 있을 때만 표시
                <span className="unread-count"> ({unreadCounts[user._id]})</span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
