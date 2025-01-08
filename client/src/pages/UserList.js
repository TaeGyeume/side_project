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

  return (
    <div>
      <h1>Message Users</h1>
      <ul>
        {users.map((user) => (
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
