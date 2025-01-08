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

    // 방에 참여
    socketRef.current.emit("joinRoom", roomId);
    console.log(`Joining room: ${roomId}`);

    // 메시지 수신 이벤트 처리
    socketRef.current.on("receiveMessage", (message) => {
      console.log("Received message:", message);
      setMessages((prev) => [...prev, message]);
    });

    // 서버에서 메시지 가져오기
    axios
      .get(`http://localhost:5000/api/messages/${roomId}`)
      .then((res) => {
        setMessages(res.data);
        // 읽지 않은 메시지 읽음 처리 요청
        markMessagesAsRead(res.data);
      })
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

  const markMessagesAsRead = (messages) => {
    if (!currentUser) return;

    const unreadMessageIds = messages
      .filter((msg) => msg.senderId !== currentUser._id && !msg.isRead) // 내가 보낸 메시지가 아니고 읽지 않은 메시지
      .map((msg) => msg._id); // 읽지 않은 메시지 ID만 추출

    if (unreadMessageIds.length > 0) {
      console.log("Marking messages as read:", unreadMessageIds);
      axios
        .post("http://localhost:5000/api/messages/mark-as-read", {
          roomId,
          userId: currentUser._id,
        })
        .then((res) => {
          console.log("Messages marked as read:", res.data);
        })
        .catch((err) => {
          console.error("Failed to mark messages as read:", err);
        });
    }
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
