import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";
import "./styles/ChatRoom.css";

const ChatRoom = ({ currentUser }) => {
  const { roomId } = useParams();
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null); // 스크롤 이동용 Ref
  const socketRef = useRef(null);

  useEffect(() => {
    if (!currentUser) return;

    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token"); // 토큰 가져오기
        const response = await axios.get("http://localhost:5000/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };

    fetchUsers();
  }, [currentUser]);

  useEffect(() => {
    socketRef.current = io("http://localhost:5000");

    socketRef.current.emit("joinRoom", roomId);
    console.log(`Joining room: ${roomId}`);

    socketRef.current.on("receiveMessage", (message) => {
      console.log("Received message:", message);
      setMessages((prev) => [...prev, message]);
    });

    axios
      .get(`http://localhost:5000/api/messages/${roomId}`)
      .then((res) => setMessages(res.data))
      .catch((err) => console.error("Failed to fetch messages:", err));

    return () => {
      console.log("Disconnecting socket...");
      socketRef.current.disconnect();
    };
  }, [roomId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = () => {
    if (!currentUser) return;

    const messageData = {
      roomId,
      senderId: currentUser._id,
      dtype: "text",
      content: newMessage,
    };

    console.log("Sending message:", messageData);
    socketRef.current.emit("sendMessage", messageData);
    setNewMessage("");
  };

  const getUsername = (senderId) => {
    if (!users || users.length === 0) return "Unknown";
    const user = users.find((user) => user._id === senderId);
    return user ? user.username : "Unknown";
  };

  if (!currentUser) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Chat Room</h1>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${
              msg.senderId === currentUser._id ? "my-message" : "other-message"
            }`}
          >
            {msg.senderId !== currentUser._id && (
              <div className="username">{getUsername(msg.senderId)}</div>
            )}
            <div className="message-content">{msg.content}</div>
          </div>
        ))}
        <div ref={messagesEndRef}></div>
      </div>
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type a message"
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default ChatRoom;
