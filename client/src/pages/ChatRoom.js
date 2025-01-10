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
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!currentUser) return;

    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data || []); // users 데이터가 없을 경우 빈 배열로 초기화
      } catch (error) {
        console.error("Failed to fetch users:", error);
        setUsers([]); // 에러가 발생해도 users를 빈 배열로 설정
      }
    };

    fetchUsers();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || !roomId) return;

    socketRef.current = io("http://localhost:5000");

    // 사용자 ID 설정
    socketRef.current.emit("setUserId", currentUser._id);

    // 방에 참여
    socketRef.current.emit("joinRoom", roomId);
    console.log(`Joining room: ${roomId}`);

    // 메시지 수신 이벤트 처리
    socketRef.current.on("receiveMessage", (message) => {
      console.log("Received message:", message);
      setMessages((prev) => [...prev, message]);
    });

    // 메시지 읽음 상태 업데이트 이벤트 처리
    socketRef.current.on("messageRead", ({ roomId: updatedRoomId, messageId }) => {
      if (updatedRoomId === roomId) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg._id === messageId ? { ...msg, isRead: true } : msg
          )
        );
      }
    });

    // 서버에서 메시지 가져오기
    axios
      .get(`http://localhost:5000/api/messages/${roomId}`)
      .then((res) => {
        setMessages(res.data || []); // 메시지가 없을 경우 빈 배열로 초기화
        markMessagesAsRead(res.data); // 읽지 않은 메시지 읽음 처리 요청
      })
      .catch((err) => {
        console.error("Failed to fetch messages:", err);
        setMessages([]); // 에러 발생 시 빈 배열로 초기화
      });

    return () => {
      console.log("Disconnecting socket...");
      socketRef.current.disconnect();
    };
  }, [currentUser, roomId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = () => {
    if (!currentUser || !newMessage.trim()) return;

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

  const markMessagesAsRead = (messages = []) => {
    if (!currentUser || messages.length === 0) return;

    const unreadMessageIds = messages
      .filter((msg) => msg.senderId !== currentUser._id && !msg.isRead)
      .map((msg) => msg._id);

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
        {messages.length > 0 ? (
          messages.map((msg, index) => (
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
          ))
        ) : (
          <p>Loading messages...</p>
        )}
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
