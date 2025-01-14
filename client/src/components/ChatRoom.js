import React, { useEffect, useState, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import "./styles/ChatRoom.css";

const ChatRoom = ({ currentUser, roomId, onMessagesRead }) => {
  const [messages, setMessages] = useState([]); // 전체 메시지 상태
  const [users, setUsers] = useState([]); // 방 멤버
  const [newMessage, setNewMessage] = useState(""); // 새로운 메시지
  const [page, setPage] = useState(1); // 현재 페이지
  const [hasMore, setHasMore] = useState(true); // 더 불러올 메시지가 있는지 여부
  const [loading, setLoading] = useState(false); // 로딩 상태
  const chatMessagesRef = useRef(null); // 채팅 메시지 컨테이너
  const socketRef = useRef(null); // 소켓 참조
  const messagesEndRef = useRef(null); // 새로운 메시지에 대한 스크롤 참조

  // 방 멤버 데이터 가져오기
  const fetchRoomUsers = useCallback(async () => {
    if (!roomId) return;

    try {
      const response = await axios.get(`http://localhost:5000/api/rooms/${roomId}`);
      const { userIds, usernames } = response.data;

      const roomUsers = userIds.map((id, index) => ({
        _id: id,
        username: usernames[index],
      }));

      setUsers(roomUsers);
    } catch (error) {
      console.error("Failed to fetch room users:", error);
    }
  }, [roomId]);

  // 메시지 읽음 처리
  const markMessagesAsRead = useCallback(
    async (messages) => {
      if (!currentUser || messages.length === 0) return;

      const unreadMessageIds = messages
        .filter((msg) => msg.senderId !== currentUser._id && !msg.isRead)
        .map((msg) => msg._id);

      if (unreadMessageIds.length > 0) {
        try {
          await axios.post("http://localhost:5000/api/messages/mark-as-read", {
            roomId,
            userId: currentUser._id,
          });

          // 소켓 이벤트로 알림
          socketRef.current.emit("messageRead", { roomId });

          if (onMessagesRead) {
            onMessagesRead(); // 부모 컴포넌트에 알림
          }

          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              unreadMessageIds.includes(msg._id) ? { ...msg, isRead: true } : msg
            )
          );
        } catch (error) {
          console.error("Failed to mark messages as read:", error);
        }
      }
    },
    [currentUser, roomId, onMessagesRead]
  );

  // 최신 메시지 불러오기
  const fetchLatestMessages = useCallback(async () => {
    if (!roomId) return;

    try {
      const response = await axios.get(`http://localhost:5000/api/messages/${roomId}`, {
        params: { page: 1, limit: 20 },
      });

      const latestMessages = response.data.messages;

      setMessages(latestMessages.reverse()); // 최신 메시지를 아래로 정렬
      setPage(2); // 다음 페이지는 2번부터 시작
      setHasMore(response.data.messages.length === 20); // 메시지가 20개 미만이면 더 이상 불러올 메시지가 없음

      // 스크롤을 가장 아래로 이동 (최초 로드 시)
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }

      // 읽음 처리
      markMessagesAsRead(latestMessages);
    } catch (error) {
      console.error("Failed to fetch latest messages:", error);
    }
  }, [roomId, markMessagesAsRead]);

  // 과거 메시지 불러오기
  const fetchPreviousMessages = useCallback(async () => {
    if (!roomId || loading || !hasMore) return;
  
    setLoading(true);
  
    try {
      const chatMessages = chatMessagesRef.current; // 로컬 변수에 DOM 참조 저장
      const currentScrollHeight = chatMessages.scrollHeight; // 현재 스크롤 높이 저장
  
      const response = await axios.get(`http://localhost:5000/api/messages/${roomId}`, {
        params: { page, limit: 20 },
      });
  
      const previousMessages = response.data.messages;
  
      if (previousMessages.length > 0) {
        setMessages((prevMessages) => [...previousMessages.reverse(), ...prevMessages]);
        setPage((prevPage) => prevPage + 1);
        setHasMore(previousMessages.length === 20);
      } else {
        setHasMore(false);
      }
  
      // DOM 업데이트 이후 스크롤 위치 유지
      requestAnimationFrame(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight - currentScrollHeight;
      });
    } catch (error) {
      console.error("Failed to fetch previous messages:", error);
    } finally {
      setLoading(false);
    }
  }, [roomId, page, loading, hasMore]);
  
  // 방 나가기
  const leaveRoom = useCallback(async () => {
    if (!currentUser || !roomId) return;

    try {
      await axios.post("http://localhost:5000/api/messages/leaveRoom", {
        roomId,
        userId: currentUser._id,
      });

      // 소켓 연결 해제
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    } catch (error) {
      console.error("Failed to leave the room:", error);
    }
  }, [currentUser, roomId]);

  // 스크롤 이벤트 처리
  const handleScroll = useCallback(() => {
    const chatMessages = chatMessagesRef.current; // useRef 값을 로컬 변수에 복사
    if (chatMessages && chatMessages.scrollTop === 0 && hasMore && !loading) {
      fetchPreviousMessages(); // 스크롤이 최상단에 도달하면 과거 메시지 로드
    }
  }, [fetchPreviousMessages, hasMore, loading]);

  useEffect(() => {
    const chatMessages = chatMessagesRef.current; // useRef 값을 로컬 변수에 복사

    if (chatMessages) {
      chatMessages.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (chatMessages) {
        chatMessages.removeEventListener("scroll", handleScroll);
      }
    };
  }, [handleScroll]);

  // 소켓 및 초기 데이터 설정
  useEffect(() => {
    if (!currentUser || !roomId) return;

    socketRef.current = io("http://localhost:5000");
    socketRef.current.emit("setUserId", currentUser._id);
    socketRef.current.emit("joinRoom", roomId);

    // 메시지 수신 이벤트 처리
    socketRef.current.on("receiveMessage", (message) => {
      setMessages((prev) => [...prev, message]);
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    });

    fetchRoomUsers();
    fetchLatestMessages(); // 초기에는 최신 메시지만 로드

    return () => {
      leaveRoom(); // 방 나가기 처리
    };
  }, [currentUser, roomId, fetchRoomUsers, fetchLatestMessages, leaveRoom]);

  // 메시지 전송
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
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const getUsername = (senderId) => {
    const user = users.find((user) => user._id === senderId);
    return user ? user.username : "Unknown";
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div>
      <h1>Chat Room</h1>
      <div ref={chatMessagesRef} className="chat-messages">
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
