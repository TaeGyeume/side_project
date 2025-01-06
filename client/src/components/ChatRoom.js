import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";
import "./ChatRoom.css";

const ChatRoom = ({ currentUser }) => {
  const { roomId } = useParams();
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null); // 스크롤 이동용 Ref

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/users");
        setUsers(response.data); // 사용자 데이터 저장
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const socket = io("http://localhost:5000");

    console.log("Connecting to socket...");
    socket.emit("joinRoom", roomId);
    console.log(`Joining room: ${roomId}`);

    socket.on("receiveMessage", (message) => {
      console.log("Received message:", message);
      setMessages((prev) => [...prev, message]);
    });

    axios
      .get(`http://localhost:5000/api/messages/${roomId}`)
      .then((res) => {
        console.log("Fetched messages from server:", res.data);
        setMessages(res.data);
      })
      .catch((err) => console.error("Failed to fetch messages:", err));

    return () => {
      console.log("Disconnecting socket...");
      socket.disconnect(); // 소켓 연결 종료
    };
  }, [roomId]); // `socket` 제거

  // 메시지가 변경될 때마다 스크롤 이동
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = () => {
    const messageData = {
      roomId,
      senderId: currentUser._id,
      dtype: "text",
      content: newMessage,
    };

    const socket = io("http://localhost:5000");
    console.log("Sending message:", messageData);
    socket.emit("sendMessage", messageData);
    setNewMessage("");
  };

  // senderId로 username 찾기
  const getUsername = (senderId) => {
    const user = users.find((user) => user._id === senderId);
    return user ? user.username : "Unknown";
  };

  return (
    <div>
      <h1>Chat Room</h1>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index}
          className={`message ${
            msg.senderId === currentUser._id ? "my-message" : "other-message"
          }`}>
            {/* 상대방 메시지일 때만 이름 표시 */}
            {msg.senderId !== currentUser._id && (
              <div className="username">{getUsername(msg.senderId)}</div>
            )}
            <div className="message-content">{msg.content}</div>
          </div>
        ))}
        {/* 스크롤 이동을 위한 더미 요소 */}
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
