import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUsers } from "../api/userService";
import axios from "axios";

const UserList = ({ currentUser }) => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await fetchUsers();
        setUsers(data.filter(user => user._id !== currentUser._id)); // 현재 유저 제외
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };

    loadUsers();
    console.log("Current User:", currentUser);
  }, [currentUser]);

  console.log("Current User:", currentUser);
  console.log("Current User ID:", currentUser?._id);

  const handleUserClick = async (userId) => {
    console.log("Current User ID:", currentUser._id); // 디버깅 로그
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
        {users.map(user => (
          <li key={user._id}>
            <button onClick={() => handleUserClick(user._id)}>
              {user.username}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
