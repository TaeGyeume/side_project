import React, { useEffect, useState } from "react";
import axios from "axios";
import axiosInstance from "../api/axios";
import socket from "../socket/socket.js";

const ChatList = ({ currentUser, onRoomSelect }) => {
  const [users, setUsers] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});

  // 채팅 유저 불러오기
  useEffect(() => {
    if (!currentUser || !currentUser._id) return;
    const loadUsers = async () => {
      if (!currentUser || !currentUser._id) {
        console.error("currentUser is null or undefined.");
        return; // currentUser가 없으면 함수 종료
      }

      try {
        const response = await axios.get(
          `http://localhost:5000/api/messages/chatUsers?userId=${currentUser._id}`
        );
        const sortedUsers = response.data
          .map((user) => ({
            ...user,
            lastMessageTime: user.lastMessageTime ? new Date(user.lastMessageTime) : null,
          }))
          .sort((a, b) => {
            // 최신 메시지 시간 순으로 정렬
            if (b.lastMessageTime && a.lastMessageTime) {
              return b.lastMessageTime - a.lastMessageTime;
            } else if (b.lastMessageTime) {
              return 1; // b가 최신
            } else if (a.lastMessageTime) {
              return -1; // a가 최신
            } else {
              return 0; // 둘 다 없음
            }
          });

        setUsers(sortedUsers);
      } catch (error) {
        console.error("Failed to fetch chat users:", error);
      }
    };

    loadUsers();
  }, [currentUser]);

  const handleUserClick = async (userId) => {
    try {
      const response = await axios.post("http://localhost:5000/api/rooms/create", {
        userId1: currentUser._id,
        userId2: userId,
      });
      // 선택된 방 ID 업데이트
      onRoomSelect(response.data._id);
      // 클릭한 방의 읽지 않은 메시지 수를 초기화
      setUnreadCounts((prev) => {
        const updatedCounts = { ...prev };

        Object.entries(prev).forEach(([id, details]) => {
          if (details.roomId === response.data._id) {
            updatedCounts[id] = { ...details, count: 0 };
          }
        });

        return updatedCounts;
      });
    } catch (error) {
      console.error("Failed to create room:", error);
    }
  };

  useEffect(() => {
    const fetchUnreadCounts = async () => {
      try {
        const response = await axiosInstance.get("/messages/unread");
        const userCounts = {};
  
        for (const item of response.data) {
          if (item.lastSenderDetails) {
            userCounts[item.lastSenderDetails._id] = {
              count: item.count,
              roomId: item.roomId,
              username: item.lastSenderDetails.username,
            };
          }
        }
  
        setUnreadCounts(userCounts);
      } catch (error) {
        console.error("Failed to fetch unread message counts:", error);
      }
    };
  
    fetchUnreadCounts();
  
    // 소켓 이벤트 처리
    socket.on("unreadMessageUpdate", ({ roomId, count }) => {
      setUnreadCounts((prev) => {
        const updatedCounts = { ...prev };
        Object.entries(prev).forEach(([userId, details]) => {
          if (details.roomId === roomId) {
            updatedCounts[userId] = {
              ...details,
              count, // 새로운 count로 업데이트
            };
          }
        });
        return updatedCounts;
      });
    });
  
    // 새로운 읽음 이벤트 처리
    socket.on("messageRead", ({ roomId }) => {
      setUnreadCounts((prev) => {
        const updatedCounts = { ...prev };
  
        Object.entries(prev).forEach(([userId, details]) => {
          if (details.roomId === roomId) {
            updatedCounts[userId] = {
              ...details,
              count: 0, // 해당 방의 읽지 않은 메시지 수를 0으로 설정
            };
          }
        });
  
        return updatedCounts;
      });
    });
  
    return () => {
      socket.off("unreadMessageUpdate");
      socket.off("messageRead");
    };
  }, [currentUser]);

  // 새 메시지 수신 시 마지막 메시지와 시간 업데이트
  useEffect(() => {
    socket.on("newMessage", ({ roomId, lastMessage, lastMessageTime }) => {
      setUsers((prevUsers) => {
        const updatedUsers = prevUsers.map((user) =>
          user.roomId === roomId
            ? { ...user, lastMessage, lastMessageTime: new Date(lastMessageTime) }
            : user
        );

        // 최신순으로 정렬
        return updatedUsers.sort((a, b) => {
          if (b.lastMessageTime && a.lastMessageTime) {
            return b.lastMessageTime - a.lastMessageTime;
          } else if (b.lastMessageTime) {
            return 1;
          } else if (a.lastMessageTime) {
            return -1;
          } else {
            return 0;
          }
        });
      });
    });

    return () => {
      socket.off("newMessage");
    };
  }, []);

  if (!currentUser) {
    return <p>Loading...</p>; // currentUser가 없을 경우 로딩 메시지 표시
  }

  return (
    <div>
      <h1>Message Users</h1>
      <ul>
        {users.map((user) => (
          <li key={user._id}>
            <button onClick={() => handleUserClick(user._id)}>
              <div>
                {user.username}
                {unreadCounts[user._id]?.count > 0 && (
                  <span> ({unreadCounts[user._id].count} unread)</span>
                )}
              </div>
              {/* 마지막 메시지 표시 */}
              <p style={{ fontSize: "12px", color: "gray" }}>
                {user.lastMessage}
              </p>
              {/* 마지막 메시지 시간 표시 */}
              <p style={{ fontSize: "10px", color: "lightgray" }}>
                {user.lastMessageTime
                  ? new Date(user.lastMessageTime).toLocaleString()
                  : ""}
              </p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatList;
