import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUsers } from "../api/userService";
import axios from "axios";
import axiosInstance from "../api/axios";
import socket from "../socket/socket";

const UserList = ({ currentUser }) => {
  const [users, setUsers] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await fetchUsers();
        if (currentUser && currentUser._id) {
          setUsers(data.filter((user) => user._id !== currentUser._id));
        } else {
          setUsers(data);
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
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
      navigate(`/chat/${response.data._id}`);
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
              username: item.lastSenderDetails.username,
            };
          }
        }
  
        console.log("Mapped unreadCounts:", userCounts);
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
        for (const [userId, details] of Object.entries(prev)) {
          if (details.roomId === roomId) {
            updatedCounts[userId] = {
              ...details,
              count, // 새로운 count로 업데이트
            };
          }
        }
        return updatedCounts;
      });
    });

    return () => {
      socket.off("unreadMessageUpdate");
    };
  }, [currentUser]);

  return (
    <div>
      <h1>Message Users</h1>
      <ul>
        {users.map((user) => (
          <li key={user._id}>
            <button onClick={() => handleUserClick(user._id)}>
              {user.username}
              {unreadCounts[user._id]?.count > 0 && (
                <span> ({unreadCounts[user._id].count} unread)</span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
