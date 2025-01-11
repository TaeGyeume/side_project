import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";
import "./styles/ChatRoom.css";

const ChatRoom = ({ currentUser }) => {
  const { roomId } = useParams();
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]); // 방 멤버 데이터 저장
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  // 방 멤버 데이터를 가져오는 함수
  const fetchRoomUsers = useCallback(async () => {
    if (!roomId) return;

    try {
      const response = await axios.get(`http://localhost:5000/api/rooms/${roomId}`);
      const { userIds, usernames } = response.data;

      // 사용자 ID와 이름을 매핑하여 객체 배열 생성
      const roomUsers = userIds.map((id, index) => ({
        _id: id,
        username: usernames[index],
      }));

      setUsers(roomUsers);
      console.log("Fetched room users:", roomUsers); // 디버깅용
    } catch (error) {
      console.error("Failed to fetch room users:", error);
      setUsers([]);
    }
  }, [roomId]);

  // 메시지 읽음 처리 함수
  const markMessagesAsRead = useCallback(
    (messages = []) => {
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
    },
    [currentUser, roomId]
  );

  // 방 나가기 함수
  const leaveRoom = useCallback(async () => {
    if (!currentUser || !roomId) return;

    try {
      const response = await axios.post("http://localhost:5000/api/messages/leaveRoom", {
        roomId,
        userId: currentUser._id,
      });
      console.log(response.data.message);

      // 소켓 연결 해제
      socketRef.current.disconnect();

      // 메인 페이지로 리디렉션
      window.location.href = "/messages";
    } catch (error) {
      console.error("Failed to leave the room:", error.response?.data?.error || error.message);
    }
  }, [currentUser, roomId]);

  // 메시지 및 소켓 설정
  useEffect(() => {
    if (!currentUser || !roomId) return;

    // 소켓 설정
    socketRef.current = io("http://localhost:5000");

    socketRef.current.emit("setUserId", currentUser._id);
    socketRef.current.emit("joinRoom", roomId);

    // 메시지 수신 이벤트 처리
    socketRef.current.on("receiveMessage", (message) => {
      setMessages((prev) => [...prev, message]);
    });

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
        setMessages(res.data || []);
        markMessagesAsRead(res.data);
      })
      .catch((err) => {
        console.error("Failed to fetch messages:", err);
        setMessages([]);
      });

    // 방 멤버 데이터 가져오기
    fetchRoomUsers();

    return () => {
      leaveRoom();
      socketRef.current.disconnect();
    };
  }, [currentUser, roomId, leaveRoom, markMessagesAsRead, fetchRoomUsers]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // 메시지 전송 함수
  const sendMessage = () => {
    if (!currentUser || !newMessage.trim()) return;

    const messageData = {
      roomId,
      senderId: currentUser._id,
      dtype: "text",
      content: newMessage,
    };

    socketRef.current.emit("sendMessage", messageData);
    setNewMessage("");
  };

  // 발신자 이름 가져오기
  const getUsername = (senderId) => {
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
